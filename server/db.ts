import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const dbPath = process.env.DB_PATH ?? resolve('data/canvases.db')
mkdirSync(dirname(dbPath), { recursive: true })

export const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

db.exec(`
CREATE TABLE IF NOT EXISTS canvases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  outcome TEXT NOT NULL DEFAULT '',
  nodes TEXT NOT NULL DEFAULT '[]',
  edges TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
`)

export type CanvasRow = {
  id: string
  name: string
  outcome: string
  nodes: string
  edges: string
  created_at: number
  updated_at: number
}

export function rowToCanvas(r: CanvasRow) {
  return {
    id: r.id,
    name: r.name,
    outcome: r.outcome,
    nodes: JSON.parse(r.nodes),
    edges: JSON.parse(r.edges),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}
