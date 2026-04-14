import type { Canvas } from './types'

const KEY = 'vcb:canvases:v1'
const ACTIVE_KEY = 'vcb:active:v1'

export function loadCanvases(): Canvas[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as Canvas[]
  } catch {
    return []
  }
}

export function saveCanvases(canvases: Canvas[]) {
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
