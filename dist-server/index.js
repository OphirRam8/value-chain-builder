// server/index.ts
import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import { resolve as resolve2 } from "node:path";

// server/db.ts
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
var dbPath = process.env.DB_PATH ?? resolve("data/canvases.db");
mkdirSync(dirname(dbPath), { recursive: true });
var db = new Database(dbPath);
db.pragma("journal_mode = WAL");
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
`);
function rowToCanvas(r) {
  return {
    id: r.id,
    name: r.name,
    outcome: r.outcome,
    nodes: JSON.parse(r.nodes),
    edges: JSON.parse(r.edges),
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

// server/index.ts
var app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/canvases", (_req, res) => {
  const rows = db.prepare("SELECT * FROM canvases ORDER BY updated_at DESC").all();
  res.json(rows.map(rowToCanvas));
});
app.put("/api/canvases/:id", (req, res) => {
  const { id } = req.params;
  const { name = "", outcome = "", nodes = [], edges = [], createdAt } = req.body ?? {};
  const now = Date.now();
  const existing = db.prepare("SELECT id FROM canvases WHERE id = ?").get(id);
  if (existing) {
    db.prepare(
      "UPDATE canvases SET name = ?, outcome = ?, nodes = ?, edges = ?, updated_at = ? WHERE id = ?"
    ).run(name, outcome, JSON.stringify(nodes), JSON.stringify(edges), now, id);
  } else {
    db.prepare(
      "INSERT INTO canvases (id, name, outcome, nodes, edges, created_at, updated_at) VALUES (?,?,?,?,?,?,?)"
    ).run(id, name, outcome, JSON.stringify(nodes), JSON.stringify(edges), createdAt ?? now, now);
  }
  const row = db.prepare("SELECT * FROM canvases WHERE id = ?").get(id);
  res.json(rowToCanvas(row));
});
app.delete("/api/canvases/:id", (req, res) => {
  db.prepare("DELETE FROM canvases WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});
var clientDir = resolve2("dist");
if (existsSync(clientDir)) {
  app.use(express.static(clientDir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(resolve2(clientDir, "index.html"));
  });
}
var port = Number(process.env.PORT ?? 3300);
app.listen(port, () => {
  console.log(`value-chain-builder listening on http://localhost:${port}`);
});
