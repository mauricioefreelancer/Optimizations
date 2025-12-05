import React, { useEffect, useMemo, useRef, useState } from 'react'
 

const STORAGE_KEY = 'finanzas_entries_v1'
const DEFAULT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycby_iyaqDlvEq76GperwHaExuzT23sKnyk1RzAA1_bNtaM0Ik_6OwYJfLjzNzpXCl7L7/exec'
const API_BASE_URL = ''
const types = [
  { key:'ingreso', label:'Ingresos' },
  { key:'pago', label:'Pagos' },
  { key:'deuda', label:'Deudas' },
  { key:'cobro', label:'Cobros' },
]

function useEntries() {
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      if (Array.isArray(v)) setEntries(v)
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)) } catch {}
  }, [entries])
  const reload = async () => {
    try {
      const v = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      if (Array.isArray(v)) setEntries(v)
    } catch {}
  }
  const add = async e => {
    const entry = { id:crypto.randomUUID(), ...e }
    setEntries(prev => [entry, ...prev])
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...entries])) } catch {}
  }
  const remove = async id => {
    setEntries(prev => prev.filter(x => x.id !== id))
  }
  const clear = () => setEntries([])
  const restoreFromCache = async () => {
    let cached = []
    try { cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch {}
    if (!Array.isArray(cached) || cached.length === 0) return
    setEntries(cached)
  }
  const setAll = list => {
    if (!Array.isArray(list)) return
    const normType = t => { const x = String(t||'').toLowerCase().trim(); if (x.startsWith('ing')) return 'ingreso'; if (x.startsWith('pag')||x.startsWith('gas')) return 'pago'; if (x.startsWith('deu')) return 'deuda'; if (x.startsWith('cob')) return 'cobro'; return 'pago' }
    const safe = list.map(e => ({
      id: e.id || crypto.randomUUID(),
      type: normType(e.type),
      amount: Number(e.amount || 0),
      principal: e.principal != null ? Number(e.principal) : null,
      date: validDateStr(e.date || e.dueDate || todayStr()),
      dueDate: e.dueDate ? validDateStr(e.dueDate) : '',
      note: String(e.note||''),
      who: String(e.who||''),
      category: String(e.category||''),
      account: String(e.account||''),
      updatedAt: Number(e.updatedAt || Date.now())
    }))
    setEntries(safe)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(safe)) } catch {}
  }
  return { entries, add, remove, clear, reload, restoreFromCache, error, setAll }
}

function formatCurrency(n) { return new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', currencyDisplay:'symbol', maximumFractionDigits:0 }).format(Number(n||0)) }
function formatThousands(n) { return new Intl.NumberFormat('es-CO', { maximumFractionDigits:0 }).format(Number(n||0)) }
function toDigits(s) { return String(s||'').replace(/\D+/g, '') }
function parseAmount(s) { const d = toDigits(s); return d ? Number(d) : 0 }
function todayStr() { return new Date().toISOString().slice(0,10) }
function parseDateOrToday(s) { const raw = String(s||'').split('T')[0]; const d = new Date(raw + 'T00:00:00'); return isNaN(d.getTime()) ? new Date() : d }
function validDateStr(s) { return parseDateOrToday(s).toISOString().slice(0,10) }
function addMonthsSameDay(s, m) { const d = parseDateOrToday(s); const day = d.getDate(); const x = new Date(d.getFullYear(), d.getMonth()+m, day); if (x.getDate() !== day) { const last = new Date(d.getFullYear(), d.getMonth()+m+1, 0); return last } return x }
function getPendingIds() { try { const v = JSON.parse(localStorage.getItem('finanzas_pending_ids')||'[]'); return Array.isArray(v) ? v : [] } catch { return [] } }
function setPendingIds(ids) { try { localStorage.setItem('finanzas_pending_ids', JSON.stringify(Array.from(new Set(ids)))) } catch {} }

export default function App() {
  const { entries, add, remove, clear, reload, restoreFromCache, error, setAll } = useEntries()
  const [tab, setTab] = useState('ingreso')
  const [form, setForm] = useState({ amount:'', installments:'', date:todayStr(), dueDate:'', note:'', who:'', category:'', account:'' })
  const [reportPeriod, setReportPeriod] = useState('mensual')
  const [syncStatus, setSyncStatus] = useState('')
  const [lastSyncAt, setLastSyncAt] = useState(() => {
    try { const v = localStorage.getItem('finanzas_last_sync'); return v ? Number(v) : 0 } catch { return 0 }
  })
  const [movPeriod, setMovPeriod] = useState('diario')
  const [openKeys, setOpenKeys] = useState(new Set())
  const cacheCount = useMemo(() => {
    try { const v = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(v) ? v.length : 0 } catch { return 0 }
  }, [entries])
  
  const [backupStatus, setBackupStatus] = useState('')
  const [webAppUrl, setWebAppUrl] = useState(() => {
    try {
      const saved = localStorage.getItem('finanzas_sheets_webapp_url') || ''
      return saved || DEFAULT_WEBAPP_URL
    } catch { return DEFAULT_WEBAPP_URL }
  })
  const [autoGoogle, setAutoGoogle] = useState(() => {
    try {
      const v = localStorage.getItem('finanzas_auto_sync_google')
      if (v !== null) return v === '1'
      const w = (localStorage.getItem('finanzas_sheets_webapp_url') || DEFAULT_WEBAPP_URL)
      return !!w
    } catch { return true }
  })

  useEffect(() => {
    try { localStorage.setItem('finanzas_sheets_webapp_url', webAppUrl) } catch {}
  }, [webAppUrl])

  const mergeEntries = (local, remote) => {
    const L = Array.isArray(local) ? local : []
    const R = Array.isArray(remote) ? remote : []
    const byId = new Map()
    const put = e => byId.set(e.id, e)
    L.forEach(put)
    R.forEach(e => {
      const a = byId.get(e.id)
      if (!a) return put(e)
      const au = a.updatedAt || 0
      const bu = e.updatedAt || 0
      put(bu >= au ? e : a)
    })
    const remoteIds = new Set(R.map(e => e.id))
    const pending = new Set(getPendingIds())
    L.filter(e => !remoteIds.has(e.id) && pending.has(e.id)).forEach(e => byId.set(e.id, e))
    return Array.from(byId.values())
  }

  const uploadToSheets = async () => {
    try {
      setBackupStatus('Subiendo a Sheets...')
      const remoteIds = (() => { try { return JSON.parse(localStorage.getItem('finanzas_remote_ids')||'[]') } catch { return [] } })()
      const remoteSet = new Set(Array.isArray(remoteIds)?remoteIds:[])
      const toPush = (entries||[]).filter(e => !remoteSet.has(e.id))
      if (toPush.length === 0) return
      await fetch('/.netlify/functions/sheets', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ entries: toPush, mode:'append' }) })
      setPendingIds(getPendingIds().concat(toPush.map(e => e.id)))
      setBackupStatus('Sheets actualizado')
    } catch (e) {
      setBackupStatus(`Error: ${e.message}`)
    }
  }
  const restoreFromSheets = async () => {
    try {
      setBackupStatus('Restaurando Sheets...')
      const r = await fetch('/.netlify/functions/sheets')
      if (!r.ok) throw new Error('Sheets no disponible')
      const data = await r.json()
      if (!Array.isArray(data)) throw new Error('Formato inválido')
      try { localStorage.setItem('finanzas_remote_ids', JSON.stringify(data.map(e => e.id))) } catch {}
      const rset = new Set(data.map(e => e.id))
      setPendingIds(getPendingIds().filter(id => !rset.has(id)))
      const merged = mergeEntries(entries, data)
      setAll(merged)
      setBackupStatus('Sheets OK')
    } catch (e) {
      setBackupStatus(`Error: ${e.message}`)
    }
  }

  const refreshFromSheetsQuiet = async () => {
    try {
      const r = await fetch('/.netlify/functions/sheets')
      if (!r.ok) return
      const data = await r.json()
      if (!Array.isArray(data)) return
      try { localStorage.setItem('finanzas_remote_ids', JSON.stringify(data.map(e => e.id))) } catch {}
      const rset2 = new Set(data.map(e => e.id))
      setPendingIds(getPendingIds().filter(id => !rset2.has(id)))
      const merged = mergeEntries(entries, data)
      setAll(merged)
    } catch {}
  }

  const pushTimer = useRef(null)
  useEffect(() => {
    if (!autoGoogle) return
    if (!webAppUrl) return
    if (pushTimer.current) clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(async () => {
      try {
        const remoteIds = (() => { try { return JSON.parse(localStorage.getItem('finanzas_remote_ids')||'[]') } catch { return [] } })()
        const remoteSet = new Set(Array.isArray(remoteIds)?remoteIds:[])
        const toPush = (entries||[]).filter(e => !remoteSet.has(e.id))
        if (toPush.length === 0) return
        await fetch('/.netlify/functions/sheets', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ entries: toPush, mode:'append' }) })
        setPendingIds(getPendingIds().concat(toPush.map(e => e.id)))
        const t = Date.now(); try { localStorage.setItem('finanzas_last_sync', String(t)) } catch {}
        setBackupStatus('Sheets actualizado')
      } catch (e) {
        setBackupStatus(`Error: ${e.message}`)
      }
    }, 800)
    return () => { if (pushTimer.current) clearTimeout(pushTimer.current) }
  }, [entries, autoGoogle, webAppUrl])

  useEffect(() => {
    if (!webAppUrl) return
    restoreFromSheets()
  }, [webAppUrl])

  const pollTimer = useRef(null)
  useEffect(() => {
    if (!webAppUrl) return
    if (pollTimer.current) clearInterval(pollTimer.current)
    pollTimer.current = setInterval(() => { refreshFromSheetsQuiet() }, 30000)
    return () => { if (pollTimer.current) clearInterval(pollTimer.current) }
  }, [webAppUrl])

  const summary = useMemo(() => {
    const sum = k => entries.filter(e => e.type === k).reduce((a,b) => a + Number(b.amount||0), 0)
    const ingresos = sum('ingreso')
    const pagos = sum('pago') + sum('gasto')
    const deudas = sum('deuda')
    const saldo = ingresos - pagos
    return { ingresos, pagos, deudas, saldo }
  }, [entries])

  const accountsList = ['Efectivo','Nequi','Daviplata','Banco','Otros']
  const byAccount = useMemo(() => {
    const map = new Map()
    accountsList.forEach(a => map.set(a, 0))
    entries.forEach(e => {
      const acc = e.account || 'Otros'
      if (!map.has(acc)) map.set(acc, 0)
      const val = Number(e.amount||0)
      if (e.type === 'ingreso') map.set(acc, map.get(acc) + val)
      else if (e.type === 'pago' || e.type === 'gasto') map.set(acc, map.get(acc) - val)
    })
    return accountsList.map(a => ({ account:a, saldo: map.get(a) }))
  }, [entries])

  const movGroups = useMemo(() => {
    const toDate = s => parseDateOrToday(s)
    const startOfMonth = d => new Date(d.getFullYear(), d.getMonth(), 1)
    const startOfQuarter = d => new Date(d.getFullYear(), Math.floor(d.getMonth()/3)*3, 1)
    const startOfWeek = d => { const x = new Date(d); const day = (x.getDay()+6)%7; x.setDate(x.getDate()-day); x.setHours(0,0,0,0); return x }
    const keyFor = d => {
      if (movPeriod === 'diario') return d.toISOString().slice(0,10)
      if (movPeriod === 'semanal') { const s = startOfWeek(d); return `W${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,'0')}-${String(s.getDate()).padStart(2,'0')}` }
      if (movPeriod === 'mensual') { const s = startOfMonth(d); return `${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,'0')}` }
      const s = startOfQuarter(d); return `${s.getFullYear()}-Q${Math.floor(s.getMonth()/3)+1}`
    }
    const startFor = d => {
      if (movPeriod === 'diario') { const x = new Date(d); x.setHours(0,0,0,0); return x }
      if (movPeriod === 'semanal') return startOfWeek(d)
      if (movPeriod === 'mensual') return startOfMonth(d)
      return startOfQuarter(d)
    }
    const map = new Map()
    entries.filter(e => e.type === 'ingreso' || e.type === 'pago').forEach(e => {
      const d = toDate(e.date)
      const k = keyFor(d)
      let s = startFor(d).getTime(); if (isNaN(s)) s = Date.now()
      if (!map.has(k)) map.set(k, { key:k, start:s, items:[] })
      map.get(k).items.push(e)
    })
    const rows = Array.from(map.values())
    rows.sort((a,b) => b.start - a.start)
    return rows
  }, [entries, movPeriod])

  const reportRows = useMemo(() => {
    const toDate = s => parseDateOrToday(s)
    const startOfMonth = d => new Date(d.getFullYear(), d.getMonth(), 1)
    const startOfQuarter = d => new Date(d.getFullYear(), Math.floor(d.getMonth()/3)*3, 1)
    const startOfWeek = d => { const x = new Date(d); const day = (x.getDay()+6)%7; x.setDate(x.getDate()-day); x.setHours(0,0,0,0); return x }
    const keyFor = d => {
      if (reportPeriod === 'diario') return d.toISOString().slice(0,10)
      if (reportPeriod === 'semanal') { const s = startOfWeek(d); return `W${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,'0')}-${String(s.getDate()).padStart(2,'0')}` }
      if (reportPeriod === 'mensual') { const s = startOfMonth(d); return `${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,'0')}` }
      const s = startOfQuarter(d); return `${s.getFullYear()}-Q${Math.floor(s.getMonth()/3)+1}`
    }
    const startFor = d => {
      if (reportPeriod === 'diario') { const x = new Date(d); x.setHours(0,0,0,0); return x }
      if (reportPeriod === 'semanal') return startOfWeek(d)
      if (reportPeriod === 'mensual') return startOfMonth(d)
      return startOfQuarter(d)
    }
    const agg = new Map()
    entries.forEach(e => {
      const d = toDate(e.date)
      const k = keyFor(d)
      let s = startFor(d).getTime(); if (isNaN(s)) s = Date.now()
      if (!agg.has(k)) agg.set(k, { key:k, start:s, ingresos:0, pagos:0, deudas:0, count:0 })
      const row = agg.get(k)
      if (e.type === 'ingreso') row.ingresos += Number(e.amount||0)
      else if (e.type === 'deuda') row.deudas += Number(e.amount||0)
      else row.pagos += Number(e.amount||0)
      row.count += 1
    })
    const rows = Array.from(agg.values()).map(r => ({ ...r, saldo: r.ingresos - r.pagos }))
    rows.sort((a,b) => b.start - a.start)
    return rows
  }, [entries, reportPeriod])

  const debts = useMemo(() => {
    return entries.filter(e => e.type === 'deuda').sort((a,b) => {
      const ad = String(a.dueDate || a.date || '')
      const bd = String(b.dueDate || b.date || '')
      return ad.localeCompare(bd)
    })
  }, [entries])

  const toggleGroup = k => {
    setOpenKeys(prev => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k); else next.add(k)
      return next
    })
  }

  const convertDebtToPayment = e => {
    const amt = Number(e.amount||0)
    add({ type:'pago', amount:amt, date:todayStr(), note: e.note ? `Pago deuda: ${e.note}` : 'Pago deuda', who:e.who, category:e.category, account:e.account, updatedAt: Date.now() })
  }

  const submit = () => {
    const amt = parseAmount(form.amount)
    if (tab === 'deuda') {
      const cuotas = Number(form.installments || 0)
      const first = String(form.dueDate || '')
      if (amt <= 0 || cuotas <= 0 || !first) return
      const base = Math.floor(amt / cuotas)
      const rem = amt - base * cuotas
      for (let i = 0; i < cuotas; i++) {
        const part = base + (i === cuotas - 1 ? rem : 0)
        const due = addMonthsSameDay(first, i)
        const dueStr = validDateStr(due.toISOString().slice(0,10))
        add({ type:'deuda', amount:part, date:dueStr, dueDate: dueStr, note:form.note, who:form.who, category:form.category, account:form.account, updatedAt: Date.now() })
      }
    } else if (tab === 'cobro') {
      if (amt <= 0) return
      const dueStr = validDateStr(form.dueDate || todayStr())
      add({ type:'cobro', amount:amt, date:dueStr, dueDate: dueStr, note:form.note, who:form.who, category:form.category, updatedAt: Date.now() })
    } else {
      if (amt <= 0) return
      add({ type:tab, amount:amt, date:form.date, dueDate: form.dueDate || undefined, note:form.note, who:form.who, category:form.category, account:form.account, updatedAt: Date.now() })
    }
    setForm({ amount:'', installments:'', date:todayStr(), dueDate:'', note:'', who:'', category:'', account:'' })
  }

  

  return (
    <div className="container">
      <div className="header">
        <h1>Mis Finanzas</h1>
      </div>

      <div className="tabs">
        {types.map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active':''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="card" style={{marginTop:8}}>
          <div className="label">{error}</div>
        </div>
      )}

      <div className="card" style={{marginTop:8}}>
        <h3 style={{marginTop:0}}>Sincronización</h3>
        <div className="row" style={{marginTop:10}}>
          {entries.length === 0 && cacheCount > 0 && <button className="btn" onClick={restoreFromCache}>Restaurar desde caché</button>}
          {syncStatus && <span className="label">{syncStatus}</span>}
          {!syncStatus && lastSyncAt > 0 && <span className="label">Última sincronización: {new Date(lastSyncAt).toLocaleString('es-CO')}</span>}
        </div>
      </div>

      

      <div className="grid">
        <div className="card">
          <div className="row">
            <div style={{flex:1}}>
              <div className="label">Monto</div>
              <input className="input" type="text" value={form.amount} onChange={e => {
                const digits = toDigits(e.target.value)
                setForm(f => ({...f, amount: digits ? formatThousands(digits) : ''}))
              }} placeholder="0" />
            </div>
            {(tab === 'ingreso' || tab === 'pago') && (
              <div style={{width:160}}>
                <div className="label">Fecha</div>
                <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({...f, date:e.target.value}))} />
              </div>
            )}
          </div>

          {tab === 'ingreso' && (
            <div className="row" style={{marginTop:10}}>
              <div style={{flex:1}}>
                <div className="label">Quién pagó</div>
                <input className="input" value={form.who} onChange={e => setForm(f => ({...f, who:e.target.value}))} placeholder="Nombre" />
              </div>
            </div>
          )}

          {(tab === 'pago') && (
            <div className="row" style={{marginTop:10}}>
              <div style={{flex:1}}>
                <div className="label">Categoría</div>
                <select className="select" value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))}>
                  <option value="">Selecciona</option>
                  <option value="Mercado">Mercado</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Entretenimiento">Entretenimiento</option>
                  <option value="Hormiga">Hormiga</option>
                  <option value="Bebé">Bebé</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
            </div>
          )}

          {tab === 'deuda' && (
            <div className="row" style={{marginTop:10}}>
              <div style={{width:160}}>
                <div className="label">Número de cuotas</div>
                <input className="input" type="number" min="1" value={form.installments} onChange={e => setForm(f => ({...f, installments:e.target.value}))} placeholder="1" />
              </div>
              <div style={{width:200}}>
                <div className="label">Fecha de pago</div>
                <input className="input" type="date" value={form.dueDate} onChange={e => setForm(f => ({...f, dueDate:e.target.value}))} />
              </div>
            </div>
          )}

          {tab === 'cobro' && (
            <div className="row" style={{marginTop:10}}>
              <div style={{flex:1}}>
                <div className="label">Quién pagará</div>
                <input className="input" value={form.who} onChange={e => setForm(f => ({...f, who:e.target.value}))} placeholder="Nombre" />
              </div>
              <div style={{width:200}}>
                <div className="label">Fecha de cobro</div>
                <input className="input" type="date" value={form.dueDate} onChange={e => setForm(f => ({...f, dueDate:e.target.value}))} />
              </div>
            </div>
          )}

          {(tab === 'ingreso' || tab === 'pago') && (
            <div className="row" style={{marginTop:10}}>
              <div style={{flex:1}}>
                <div className="label">Cuenta</div>
                <select className="select" value={form.account} onChange={e => setForm(f => ({...f, account:e.target.value}))}>
                  <option value="">Selecciona</option>
                  {accountsList.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
          )}

          <div style={{marginTop:10}}>
            <div className="label">Descripción</div>
            <input className="input" value={form.note} onChange={e => setForm(f => ({...f, note:e.target.value}))} placeholder="Detalle" />
          </div>

          <div style={{marginTop:12}} className="row">
            <button className="btn" onClick={submit}>Guardar</button>
          </div>
        </div>

        <div className="card">
          <h3 style={{marginTop:0}}>Resumen</h3>
          <div className="summary">
            <div className="card"><div className="label">Ingresos</div><div className="mono">{formatCurrency(summary.ingresos)}</div></div>
            <div className="card"><div className="label">Pagos</div><div className="mono">{formatCurrency(summary.pagos)}</div></div>
            <div className="card"><div className="label">Deudas</div><div className="mono">{formatCurrency(summary.deudas)}</div></div>
            <div className="card"><div className="label">Saldo</div><div className="mono">{formatCurrency(summary.saldo)}</div></div>
          </div>
          <div className="list" style={{marginTop:10}}>
            {byAccount.map(x => (
              <div key={x.account} className="item">
                <div className="label">{x.account}</div>
                <div className="mono">{formatCurrency(x.saldo)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:16}}>
        <div className="row" style={{justifyContent:'space-between', alignItems:'center'}} onClick={() => toggleGroup('DEUDAS')}>
          <h3 style={{marginTop:0}}>Deudas</h3>
        </div>
        {openKeys.has('DEUDAS') && (
          <div className="list">
            {debts.length === 0 && <div className="label">Sin deudas</div>}
            {debts.map(e => (
              <div key={e.id} className="item">
                <div>
                  <div className="mono">{formatCurrency(e.amount)}</div>
                  <div className="label">{e.dueDate ? `Pagar: ${e.dueDate}` : e.date}</div>
                </div>
                <div style={{flex:1, marginLeft:10}}>
                  <div>{e.note || '-'}</div>
                  <div className="label">{e.who || e.category || 'Deuda'}</div>
                </div>
                <div className="row" style={{gap:8}}>
                  <button className="btn" onClick={() => convertDebtToPayment(e)}>Convertir a pago</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{marginTop:16}}>
        <div className="row" style={{justifyContent:'space-between', alignItems:'center'}} onClick={() => toggleGroup('COBROS')}>
          <h3 style={{marginTop:0}}>Cobros</h3>
        </div>
        {openKeys.has('COBROS') && (
          <div className="list">
            {entries.filter(e => e.type==='cobro').length === 0 && <div className="label">Sin cobros</div>}
            {entries.filter(e => e.type==='cobro').sort((a,b) => {
              const ad = a.dueDate || a.date; const bd = b.dueDate || b.date; return String(ad).localeCompare(String(bd))
            }).map(e => (
              <div key={e.id} className="item">
                <div>
                  <div className="mono">{formatCurrency(e.amount)}</div>
                  <div className="label">{e.dueDate ? `Cobrar: ${e.dueDate}` : e.date}</div>
                </div>
                <div style={{flex:1, marginLeft:10}}>
                  <div>{e.note || '-'}</div>
                  <div className="label">{e.who || e.category || 'Cobro'}</div>
                </div>
                <div className="row" style={{gap:8}}>
                  <button className="btn" onClick={() => { const amt = Number(e.amount||0); add({ type:'ingreso', amount:amt, date:todayStr(), note: e.note ? `Cobro: ${e.note}` : 'Cobro', who:e.who, category:e.category, account:e.account, updatedAt: Date.now() }) }}>Convertir a ingreso</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{marginTop:16}}>
        <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
          <h3 style={{marginTop:0}}>Movimientos</h3>
          <div className="row" style={{gap:8}}>
            <select className="select" style={{maxWidth:220}} value={movPeriod} onChange={e => setMovPeriod(e.target.value)}>
              <option value="diario">Diarios</option>
              <option value="semanal">Semanales</option>
              <option value="mensual">Mensuales</option>
              <option value="trimestral">Trimestrales</option>
            </select>
          </div>
        </div>
        <div className="list">
          {movGroups.length === 0 && <div className="label">Sin registros</div>}
          {movGroups.map(g => (
            <div key={g.key}>
              <div className="item" onClick={() => toggleGroup(g.key)}>
                <div className="mono">{g.key}</div>
                <div className="label">{new Date(g.start || Date.now()).toISOString().slice(0,10)}</div>
              </div>
              {openKeys.has(g.key) && g.items.map(e => (
                <div key={e.id} className="item">
                  <div>
                    <div className="mono">{formatCurrency((e.type==='pago' ? -1 : 1) * Number(e.amount||0))}</div>
                    <div className="label">{e.date}</div>
                  </div>
                  <div style={{flex:1, marginLeft:10}}>
                    <div>{e.note || '-'}</div>
                    <div className="label">{e.account || e.who || e.category || e.type}</div>
                  </div>
                  
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>


      <div className="footer">Datos guardados en tu navegador</div>
    </div>
  )
}
