const CONFIG_KEY = 'finanzas_sync_config_v1'

export function getSyncConfig() {
  try { return JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}') } catch { return {} }
}

export function setSyncConfig({ token, gistId }) {
  const cfg = { token: token || '', gistId: gistId || '' }
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg))
  return cfg
}

export async function pullEntries() {
  const { token, gistId } = getSyncConfig()
  if (!token || !gistId) throw new Error('Config incompleta')
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  const data = await res.json()
  const file = data.files?.['finanzas.json']
  const content = file?.content || '[]'
  return JSON.parse(content)
}

export async function pushEntries(entries) {
  const { token, gistId } = getSyncConfig()
  if (!token || !gistId) throw new Error('Config incompleta')
  const body = {
    files: {
      'finanzas.json': { content: JSON.stringify(entries, null, 2) }
    }
  }
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return true
}

export function mergeEntries(local, remote) {
  const byId = new Map()
  const put = e => byId.set(e.id, e)
  ;(local||[]).forEach(put)
  ;(remote||[]).forEach(e => {
    const a = byId.get(e.id)
    if (!a) return put(e)
    const au = a.updatedAt || 0
    const bu = e.updatedAt || 0
    put(bu >= au ? e : a)
  })
  return Array.from(byId.values())
}
