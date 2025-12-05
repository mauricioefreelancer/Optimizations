import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { v4 as uuid } from 'uuid'
import * as storage from './storage.js'
import XLSX from 'xlsx'
import { pullFromGist, pushToGist } from './sync.js'

dotenv.config()
const app = express()
const port = process.env.PORT || 3000
const origin = process.env.CORS_ORIGIN || '*'

app.use(cors({ origin }))
app.use(express.json())

await storage.init()

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.get('/api/entries', async (req, res) => {
  const list = await storage.all()
  res.json(list)
})

app.post('/api/entries', async (req, res) => {
  const e = req.body || {}
  if (!e.amount || !e.type || !e.date) return res.status(400).json({ error: 'Campos requeridos: type, amount, date' })
  const entry = { id: e.id || uuid(), type: e.type, amount: Number(e.amount), principal: e.principal ? Number(e.principal) : null, date: e.date, dueDate: e.dueDate, note: e.note, who: e.who, category: e.category, account: e.account, tags: e.tags, updatedAt: Date.now() }
  await storage.upsert(entry)
  res.json(entry)
})

app.delete('/api/entries/:id', async (req, res) => {
  await storage.remove(req.params.id)
  res.json({ ok: true })
})

app.get('/api/export/csv', async (req, res) => {
  const list = await storage.all()
  const headers = ['id','type','amount','principal','date','dueDate','note','who','category','account','tags','updatedAt']
  const rows = [headers.join(',')].concat(list.map(e => headers.map(h => JSON.stringify(e[h] ?? '')).join(',')))
  const csv = rows.join('\n')
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="finanzas.csv"')
  res.send(csv)
})

app.get('/api/export/xlsx', async (req, res) => {
  const list = await storage.all()
  const ws = XLSX.utils.json_to_sheet(list)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Finanzas')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename="finanzas.xlsx"')
  res.send(buf)
})

app.post('/api/sync/pull', async (req, res) => {
  try {
    const token = process.env.GITHUB_TOKEN
    const gistId = process.env.GIST_ID
    const remote = await pullFromGist(token, gistId)
    const local = await storage.all()
    const byId = new Map()
    const put = e => byId.set(e.id, e)
    local.forEach(put)
    remote.forEach(e => {
      const a = byId.get(e.id)
      const au = a?.updatedAt || 0
      const bu = e?.updatedAt || 0
      put(bu >= au ? e : a)
    })
    const merged = Array.from(byId.values())
    for (const e of merged) await storage.upsert(e)
    res.json({ ok: true, merged: merged.length })
  } catch (e) {
    res.status(400).json({ error: String(e.message || e) })
  }
})

app.post('/api/sync/push', async (req, res) => {
  try {
    const token = process.env.GITHUB_TOKEN
    const gistId = process.env.GIST_ID
    const list = await storage.all()
    await pushToGist(token, gistId, list)
    res.json({ ok: true })
  } catch (e) {
    res.status(400).json({ error: String(e.message || e) })
  }
})

app.post('/api/sync/sheets/pull', async (req, res) => {
  try {
    const url = (req.body && req.body.url) || process.env.SHEETS_CSV_URL
    if (!url) return res.status(400).json({ error: 'Falta SHEETS_CSV_URL' })
    const r = await fetch(url)
    if (!r.ok) throw new Error(`Sheets ${r.status}`)
    const text = await r.text()
    const wb = XLSX.read(text, { type: 'string' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
    const normType = t => String(t||'').toLowerCase().trim()
    let imported = 0
    for (const row of rows) {
      const entry = {
        id: row.id || uuid(),
        type: (() => {
          const t = normType(row.type || row.tipo)
          if (t.startsWith('ing')) return 'ingreso'
          if (t.startsWith('pag')) return 'pago'
          if (t.startsWith('deu')) return 'deuda'
          if (t.startsWith('cob')) return 'cobro'
          return 'pago'
        })(),
        amount: Number(row.amount || row.monto || 0),
        principal: row.principal ? Number(row.principal) : null,
        date: String(row.date || row.fecha || new Date().toISOString().slice(0,10)),
        dueDate: row.dueDate || row.vencer || '',
        note: row.note || row.nota || '',
        who: row.who || row.quien || row['quién'] || '',
        category: row.category || row.categoria || '',
        account: row.account || row.cuenta || '',
        tags: null,
        updatedAt: Date.now()
      }
      await storage.upsert(entry)
      imported += 1
    }
    res.json({ ok: true, imported })
  } catch (e) {
    res.status(400).json({ error: String(e.message || e) })
  }
})

// Push current entries to Google Sheets via Apps Script Web App
app.post('/api/sync/sheets/push', async (req, res) => {
  try {
    const url = (req.body && req.body.url) || process.env.SHEETS_WEBAPP_URL
    if (!url) return res.status(400).json({ error: 'Falta SHEETS_WEBAPP_URL' })
    const mode = (req.body && req.body.mode) || 'upsert'
    const list = await storage.all()
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: list, mode })
    })
    if (!r.ok) throw new Error(`Sheets push ${r.status}`)
    const text = await r.text()
    let json
    try { json = JSON.parse(text) } catch { json = { ok: true } }
    res.json({ ok: true, result: json })
  } catch (e) {
    res.status(400).json({ error: String(e.message || e) })
  }
})

app.listen(port, '0.0.0.0', () => {
  console.log(`API escuchando en http://localhost:${port}`)
})
