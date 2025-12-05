exports.handler = async (event) => {
  const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycby_iyaqDlvEq76GperwHaExuzT23sKnyk1RzAA1_bNtaM0Ik_6OwYJfLjzNzpXCl7L7/exec'
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  }
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors, body: '' }
  }
  try {
    if (event.httpMethod === 'GET') {
      const r = await fetch(WEBAPP_URL)
      const text = await r.text()
      return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: text }
    }
    if (event.httpMethod === 'POST') {
      const body = event.body || '{}'
      const r = await fetch(WEBAPP_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
      const text = await r.text()
      return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: text }
    }
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method Not Allowed' }) }
  } catch (e) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: String(e.message || e) }) }
  }
}

