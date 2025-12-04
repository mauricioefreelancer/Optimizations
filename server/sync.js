export async function pullFromGist(token, gistId) {
  if (!token || !gistId) throw new Error('Missing token or gistId')
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
  })
  if (!res.ok) throw new Error(`Gist ${res.status}`)
  const data = await res.json()
  const file = data.files?.['finanzas.json']
  const content = file?.content || '[]'
  return JSON.parse(content)
}

export async function pushToGist(token, gistId, entries) {
  if (!token || !gistId) throw new Error('Missing token or gistId')
  const body = { files: { 'finanzas.json': { content: JSON.stringify(entries, null, 2) } } }
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`Gist ${res.status}`)
  return true
}
