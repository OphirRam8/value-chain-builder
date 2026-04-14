import type { Canvas } from './types'

const KEY = 'vcb:canvases:v1'
const ACTIVE_KEY = 'vcb:active:v1'

export function loadCanvasesLocal(): Canvas[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as Canvas[]
  } catch {
    return []
  }
}

export function saveCanvasesLocal(canvases: Canvas[]) {
  localStorage.setItem(KEY, JSON.stringify(canvases))
}

export function loadActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY)
}

export function saveActiveId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_KEY, id)
  else localStorage.removeItem(ACTIVE_KEY)
}

export function newId() {
  return Math.random().toString(36).slice(2, 10)
}

// ---- API (server mode) ----

export async function apiAvailable(): Promise<boolean> {
  try {
    const r = await fetch('/api/health', { cache: 'no-store' })
    return r.ok
  } catch {
    return false
  }
}

export async function apiLoadCanvases(): Promise<Canvas[]> {
  const r = await fetch('/api/canvases', { cache: 'no-store' })
  if (!r.ok) throw new Error('load failed')
  return (await r.json()) as Canvas[]
}

export async function apiSaveCanvas(c: Canvas): Promise<void> {
  const r = await fetch(`/api/canvases/${c.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(c),
  })
  if (!r.ok) throw new Error('save failed')
}

export async function apiDeleteCanvas(id: string): Promise<void> {
  await fetch(`/api/canvases/${id}`, { method: 'DELETE' })
}
