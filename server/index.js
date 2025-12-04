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
  const entry = { id: e.id || uuid(), type: e.type, amount: Number(e.amount), date: e.date, note: e.note, who: e.who, category: e.category, tags: e.tags, updatedAt: Date.now() }
  await storage.upsert(entry)
  res.json(entry)
})

app.delete('/api/entries/:id', async (req, res) => {
  await storage.remove(req.params.id)
  res.json({ ok: true })
})

app.get('/api/export/csv', async (req, res) => {
  const list = await storage.all()
  const headers = ['id','type','amount','date','note','who','category','tags','updatedAt']
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

app.listen(port, '0.0.0.0', () => {
  console.log(`API escuchando en http://localhost:${port}`)
})
