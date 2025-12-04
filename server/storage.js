import fs from 'fs'
import path from 'path'
import pkg from 'pg'

const { Pool } = pkg

const filePath = path.join(process.cwd(), 'server', 'data', 'entries.json')
const hasPg = !!process.env.DATABASE_URL
let pool = null

export async function init() {
  if (hasPg) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined })
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        principal NUMERIC,
        date DATE NOT NULL,
        due_date DATE,
        note TEXT,
        who TEXT,
        category TEXT,
        account TEXT,
        tags TEXT,
        updated_at BIGINT NOT NULL
      );
    `)
    await pool.query(`ALTER TABLE entries ADD COLUMN IF NOT EXISTS principal NUMERIC`)
    await pool.query(`ALTER TABLE entries ADD COLUMN IF NOT EXISTS due_date DATE`)
    await pool.query(`ALTER TABLE entries ADD COLUMN IF NOT EXISTS account TEXT`)
  } else {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]')
  }
}

export async function all() {
  if (hasPg) {
    const { rows } = await pool.query('SELECT * FROM entries ORDER BY updated_at DESC')
    return rows
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export async function upsert(e) {
  if (hasPg) {
    await pool.query(`
      INSERT INTO entries(id,type,amount,principal,date,due_date,note,who,category,account,tags,updated_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT(id) DO UPDATE SET
        type=EXCLUDED.type,
        amount=EXCLUDED.amount,
        principal=EXCLUDED.principal,
        date=EXCLUDED.date,
        due_date=EXCLUDED.due_date,
        note=EXCLUDED.note,
        who=EXCLUDED.who,
        category=EXCLUDED.category,
        account=EXCLUDED.account,
        tags=EXCLUDED.tags,
        updated_at=EXCLUDED.updated_at
    `, [e.id, e.type, e.amount, e.principal || null, e.date, e.dueDate || null, e.note || null, e.who || null, e.category || null, e.account || null, Array.isArray(e.tags) ? e.tags.join(',') : null, e.updatedAt])
    return e
  }
  const list = await all()
  const i = list.findIndex(x => x.id === e.id)
  if (i >= 0) list[i] = e; else list.unshift(e)
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2))
  return e
}

export async function remove(id) {
  if (hasPg) {
    await pool.query('DELETE FROM entries WHERE id=$1', [id])
    return true
  }
  const list = await all()
  const next = list.filter(x => x.id !== id)
  fs.writeFileSync(filePath, JSON.stringify(next, null, 2))
  return true
}
