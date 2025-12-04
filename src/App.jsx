import React, { useEffect, useMemo, useState } from 'react'
import { getSyncConfig, setSyncConfig, pullEntries, pushEntries, mergeEntries } from './sync.js'

const STORAGE_KEY = 'finanzas_entries_v1'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const types = [
  { key:'ingreso', label:'Ingresos' },
  { key:'gasto', label:'Gastos' },
  { key:'hormiga', label:'Gastos hormiga' },
  { key:'pago', label:'Pagos' },
  { key:'deuda', label:'Deudas' },
]

function useEntries() {
  const [entries, setEntries] = useState([])
  useEffect(() => {
    const load = async () => {
      if (API_BASE_URL) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/entries`)
          if (res.ok) { setEntries(await res.json()); return }
        } catch {}
      }
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) setEntries(JSON.parse(raw))
      } catch {}
    }
    load()
  }, [])
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)) } catch {}
  }, [entries])
  const add = async e => {
    const entry = { id:crypto.randomUUID(), ...e }
    setEntries(prev => [entry, ...prev])
    if (API_BASE_URL) { try { await fetch(`${API_BASE_URL}/api/entries`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(entry) }) } catch {} }
  }
  const remove = async id => {
    setEntries(prev => prev.filter(x => x.id !== id))
    if (API_BASE_URL) { try { await fetch(`${API_BASE_URL}/api/entries/${id}`, { method:'DELETE' }) } catch {} }
  }
  const clear = () => setEntries([])
  return { entries, add, remove, clear }
}

function formatCurrency(n) { return new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(Number(n||0)) }
function todayStr() { return new Date().toISOString().slice(0,10) }

export default function App() {
  const { entries, add, remove, clear } = useEntries()
  const [tab, setTab] = useState('ingreso')
  const [form, setForm] = useState({ amount:'', date:todayStr(), note:'', who:'', category:'' })
  const [reportPeriod, setReportPeriod] = useState('mensual')
  const [syncStatus, setSyncStatus] = useState('')

  const summary = useMemo(() => {
    const sum = k => entries.filter(e => e.type === k).reduce((a,b) => a + Number(b.amount||0), 0)
    const ingresos = sum('ingreso')
    const gastos = sum('gasto') + sum('hormiga') + sum('pago')
    const deudas = sum('deuda')
    const saldo = ingresos - gastos
    return { ingresos, gastos, deudas, saldo }
  }, [entries])

  const filtered = useMemo(() => entries.filter(e => e.type === tab), [entries, tab])

  const reportRows = useMemo(() => {
    const toDate = s => new Date(s + 'T00:00:00')
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
      const s = startFor(d).getTime()
      if (!agg.has(k)) agg.set(k, { key:k, start:s, ingresos:0, gastos:0, deudas:0, count:0 })
      const row = agg.get(k)
      if (e.type === 'ingreso') row.ingresos += Number(e.amount||0)
      else if (e.type === 'deuda') row.deudas += Number(e.amount||0)
      else row.gastos += Number(e.amount||0)
      row.count += 1
    })
    const rows = Array.from(agg.values()).map(r => ({ ...r, saldo: r.ingresos - r.gastos }))
    rows.sort((a,b) => b.start - a.start)
    return rows
  }, [entries, reportPeriod])

  const submit = () => {
    if (!form.amount || Number(form.amount) <= 0) return
    add({ type:tab, amount:Number(form.amount), date:form.date, note:form.note, who:form.who, category:form.category, updatedAt: Date.now() })
    setForm({ amount:'', date:todayStr(), note:'', who:'', category:'' })
  }

  const doSyncNow = async () => {
    try {
      setSyncStatus('Sincronizando...')
      if (API_BASE_URL) {
        await fetch(`${API_BASE_URL}/api/sync/pull`, { method:'POST' })
        await fetch(`${API_BASE_URL}/api/sync/push`, { method:'POST' })
        const res = await fetch(`${API_BASE_URL}/api/entries`)
        if (res.ok) setEntries(await res.json())
      }
      setSyncStatus('OK')
    } catch (e) { setSyncStatus(`Error: ${e.message}`) } finally { setTimeout(()=>setSyncStatus(''), 1500) }
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

      <div className="card" style={{marginTop:8}}>
        <h3 style={{marginTop:0}}>Sincronización</h3>
        <div className="row" style={{marginTop:10}}>
          <button className="btn" onClick={doSyncNow}>Sincronizar ahora</button>
          {syncStatus && <span className="label">{syncStatus}</span>}
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="row">
            <div style={{flex:1}}>
              <div className="label">Monto</div>
              <input className="input" type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount:e.target.value}))} placeholder="0" />
            </div>
            <div style={{width:160}}>
              <div className="label">Fecha</div>
              <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({...f, date:e.target.value}))} />
            </div>
          </div>

          {tab === 'ingreso' && (
            <div className="row" style={{marginTop:10}}>
              <div style={{flex:1}}>
                <div className="label">Quién pagó</div>
                <input className="input" value={form.who} onChange={e => setForm(f => ({...f, who:e.target.value}))} placeholder="Nombre" />
              </div>
            </div>
          )}

          {(tab === 'gasto' || tab === 'hormiga' || tab === 'pago') && (
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
                  <option value="Otros">Otros</option>
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
            <button className="btn danger" onClick={clear}>Limpiar todo</button>
          </div>
        </div>

        <div className="card">
          <h3 style={{marginTop:0}}>Resumen</h3>
          <div className="summary">
            <div className="card"><div className="label">Ingresos</div><div className="mono">{formatCurrency(summary.ingresos)}</div></div>
            <div className="card"><div className="label">Gastos</div><div className="mono">{formatCurrency(summary.gastos)}</div></div>
            <div className="card"><div className="label">Deudas</div><div className="mono">{formatCurrency(summary.deudas)}</div></div>
            <div className="card"><div className="label">Saldo</div><div className="mono">{formatCurrency(summary.saldo)}</div></div>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:16}}>
        <h3 style={{marginTop:0}}>Movimientos</h3>
        <div className="list">
          {filtered.length === 0 && <div className="label">Sin registros</div>}
          {filtered.map(e => (
            <div key={e.id} className="item">
              <div>
                <div className="mono">{formatCurrency(e.amount)}</div>
                <div className="label">{e.date}</div>
              </div>
              <div style={{flex:1, marginLeft:10}}>
                <div>{e.note || '-'}</div>
                <div className="label">{e.who || e.category || e.type}</div>
              </div>
              <button className="btn danger" onClick={() => remove(e.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{marginTop:16}}>
        <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
          <h3 style={{marginTop:0}}>Reportes</h3>
          <select className="select" style={{maxWidth:220}} value={reportPeriod} onChange={e => setReportPeriod(e.target.value)}>
            <option value="diario">Diarios</option>
            <option value="semanal">Semanales</option>
            <option value="mensual">Mensuales</option>
            <option value="trimestral">Trimestrales</option>
          </select>
        </div>
        <div className="list">
          {reportRows.length === 0 && <div className="label">Sin datos</div>}
          {reportRows.map(r => (
            <div key={r.key} className="item">
              <div style={{minWidth:140}}>
                <div className="mono">{r.key}</div>
                <div className="label">{new Date(r.start).toISOString().slice(0,10)}</div>
              </div>
              <div className="row" style={{gap:16, flex:1}}>
                <div>
                  <div className="label">Ingresos</div>
                  <div className="mono">{formatCurrency(r.ingresos)}</div>
                </div>
                <div>
                  <div className="label">Gastos</div>
                  <div className="mono">{formatCurrency(r.gastos)}</div>
                </div>
                <div>
                  <div className="label">Deudas</div>
                  <div className="mono">{formatCurrency(r.deudas)}</div>
                </div>
                <div>
                  <div className="label">Saldo</div>
                  <div className="mono">{formatCurrency(r.saldo)}</div>
                </div>
              </div>
              <div style={{minWidth:60, textAlign:'right'}}>
                <div className="label">Movs</div>
                <div className="mono">{r.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="footer">Datos guardados en tu navegador</div>
    </div>
  )
}
