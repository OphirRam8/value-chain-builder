import express from 'express'
import cors from 'cors'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { db, rowToCanvas, type CanvasRow } from './db.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.get('/api/canvases', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM canvases ORDER BY updated_at DESC')
    .all() as CanvasRow[]
  res.json(rows.map(rowToCanvas))
})

app.put('/api/canvases/:id', (req, res) => {
  const { id } = req.params
  const { name = '', outcome = '', nodes = [], edges = [], createdAt } = req.body ?? {}
  const now = Date.now()
  const existing = db.prepare('SELECT id FROM canvases WHERE id = ?').get(id)
  if (existing) {
    db.prepare(
      'UPDATE canvases SET name = ?, outcome = ?, nodes = ?, edges = ?, updated_at = ? WHERE id = ?',
    ).run(name, outcome, JSON.stringify(nodes), JSON.stringify(edges), now, id)
  } else {
    db.prepare(
      'INSERT INTO canvases (id, name, outcome, nodes, edges, created_at, updated_at) VALUES (?,?,?,?,?,?,?)',
    ).run(id, name, outcome, JSON.stringify(nodes), JSON.stringify(edges), createdAt ?? now, now)
  }
  const row = db.prepare('SELECT * FROM canvases WHERE id = ?').get(id) as CanvasRow
  res.json(rowToCanvas(row))
})

app.delete('/api/canvases/:id', (req, res) => {
  db.prepare('DELETE FROM canvases WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// Serve the built client.
const clientDir = resolve('dist')
if (existsSync(clientDir)) {
  app.use(express.static(clientDir))
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(resolve(clientDir, 'index.html'))
  })
}

const port = Number(process.env.PORT ?? 3300)
app.listen(port, () => {
  console.log(`value-chain-builder listening on http://localhost:${port}`)
})
