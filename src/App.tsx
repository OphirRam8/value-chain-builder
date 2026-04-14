import { useEffect, useMemo, useState } from 'react'
import ChainEditor from './components/ChainEditor'
import type { Canvas } from './types'
import {
  loadActiveId,
  loadCanvases,
  newId,
  saveActiveId,
  saveCanvases,
} from './storage'
import './App.css'

function createCanvas(): Canvas {
  const now = Date.now()
  return {
    id: newId(),
    name: 'Untitled Value Chain',
    outcome: '',
    nodes: [],
    edges: [],
    createdAt: now,
    updatedAt: now,
  }
}

export default function App() {
  const [canvases, setCanvases] = useState<Canvas[]>(() => loadCanvases())
  const [activeId, setActiveId] = useState<string | null>(() => loadActiveId())

  useEffect(() => {
    saveCanvases(canvases)
  }, [canvases])

  useEffect(() => {
    saveActiveId(activeId)
  }, [activeId])

  useEffect(() => {
    if (canvases.length === 0) {
      const c = createCanvas()
      setCanvases([c])
      setActiveId(c.id)
    } else if (!activeId || !canvases.find((c) => c.id === activeId)) {
      setActiveId(canvases[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const active = useMemo(
    () => canvases.find((c) => c.id === activeId) ?? null,
    [canvases, activeId],
  )

  const updateActive = (patch: Partial<Canvas>) => {
    if (!active) return
    setCanvases((prev) =>
      prev.map((c) =>
        c.id === active.id ? { ...c, ...patch, updatedAt: Date.now() } : c,
      ),
    )
  }

  const addCanvas = () => {
    const c = createCanvas()
    setCanvases((prev) => [c, ...prev])
    setActiveId(c.id)
  }

  const deleteCanvas = (id: string) => {
    if (!confirm('Delete this canvas? This cannot be undone.')) return
    setCanvases((prev) => prev.filter((c) => c.id !== id))
    if (activeId === id) {
      const remaining = canvases.filter((c) => c.id !== id)
      setActiveId(remaining[0]?.id ?? null)
    }
  }

  const duplicateCanvas = (id: string) => {
    const src = canvases.find((c) => c.id === id)
    if (!src) return
    const copy: Canvas = {
      ...src,
      id: newId(),
      name: src.name + ' (copy)',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setCanvases((prev) => [copy, ...prev])
    setActiveId(copy.id)
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Value Chains</h1>
          <button className="btn-primary" onClick={addCanvas}>
            + New
          </button>
        </div>
        <ul className="canvas-list">
          {canvases.map((c) => (
            <li
              key={c.id}
              className={c.id === activeId ? 'active' : ''}
              onClick={() => setActiveId(c.id)}
            >
              <div className="canvas-list-main">
                <div className="canvas-list-name">{c.name || 'Untitled'}</div>
                {c.outcome && <div className="canvas-list-outcome">{c.outcome}</div>}
              </div>
              <div className="canvas-list-actions">
                <button
                  title="Duplicate"
                  onClick={(e) => {
                    e.stopPropagation()
                    duplicateCanvas(c.id)
                  }}
                >
                  ⧉
                </button>
                <button
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteCanvas(c.id)
                  }}
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">Saved locally in your browser.</div>
      </aside>
      <main className="main">
        {active ? (
          <ChainEditor key={active.id} canvas={active} onChange={updateActive} />
        ) : (
          <div className="empty">Create a canvas to get started.</div>
        )}
      </main>
    </div>
  )
}
