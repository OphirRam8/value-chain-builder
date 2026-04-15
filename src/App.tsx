import { useEffect, useMemo, useRef, useState } from 'react'
import ChainEditor from './components/ChainEditor'
import type { Canvas } from './types'
import {
  apiAvailable,
  apiDeleteCanvas,
  apiLoadCanvases,
  apiSaveCanvas,
  loadActiveId,
  loadCanvasesLocal,
  newId,
  saveActiveId,
  saveCanvasesLocal,
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
  const [canvases, setCanvases] = useState<Canvas[]>(() => loadCanvasesLocal())
  const [activeId, setActiveId] = useState<string | null>(() => loadActiveId())
  const [useApi, setUseApi] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)

  const toggleFocus = () => {
    const next = !focusMode
    setFocusMode(next)
    if (next) {
      setSidebarOpen(false)
      document.documentElement.requestFullscreen?.().catch(() => {})
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {})
    }
  }
  const pendingSaves = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Detect server & load from it if available.
  useEffect(() => {
    ;(async () => {
      const has = await apiAvailable()
      setUseApi(has)
      if (has) {
        try {
          const server = await apiLoadCanvases()
          setCanvases(server)
        } catch {
          // keep local
        }
      }
      setLoaded(true)
    })()
  }, [])

  // Persist locally always.
  useEffect(() => {
    saveCanvasesLocal(canvases)
  }, [canvases])

  useEffect(() => {
    saveActiveId(activeId)
  }, [activeId])

  // Ensure we have a canvas.
  useEffect(() => {
    if (!loaded) return
    if (canvases.length === 0) {
      const c = createCanvas()
      setCanvases([c])
      setActiveId(c.id)
      if (useApi) apiSaveCanvas(c).catch(() => {})
    } else if (!activeId || !canvases.find((c) => c.id === activeId)) {
      setActiveId(canvases[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  const active = useMemo(
    () => canvases.find((c) => c.id === activeId) ?? null,
    [canvases, activeId],
  )

  const scheduleServerSave = (c: Canvas) => {
    if (!useApi) return
    const prev = pendingSaves.current.get(c.id)
    if (prev) clearTimeout(prev)
    const t = setTimeout(() => {
      apiSaveCanvas(c).catch(() => {})
      pendingSaves.current.delete(c.id)
    }, 400)
    pendingSaves.current.set(c.id, t)
  }

  const updateActive = (patch: Partial<Canvas>) => {
    if (!active) return
    setCanvases((prev) => {
      const next = prev.map((c) =>
        c.id === active.id ? { ...c, ...patch, updatedAt: Date.now() } : c,
      )
      const updated = next.find((c) => c.id === active.id)
      if (updated) scheduleServerSave(updated)
      return next
    })
  }

  const addCanvas = () => {
    const c = createCanvas()
    setCanvases((prev) => [c, ...prev])
    setActiveId(c.id)
    if (useApi) apiSaveCanvas(c).catch(() => {})
  }

  const deleteCanvas = (id: string) => {
    if (!confirm('Delete this canvas? This cannot be undone.')) return
    setCanvases((prev) => prev.filter((c) => c.id !== id))
    if (useApi) apiDeleteCanvas(id).catch(() => {})
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
    if (useApi) apiSaveCanvas(copy).catch(() => {})
  }

  return (
    <div className={`app ${sidebarOpen ? 'sidebar-open' : ''} ${focusMode ? 'focus-mode' : ''}`}>
      <button
        className="sidebar-toggle"
        aria-label="Toggle canvases"
        onClick={() => setSidebarOpen((v) => !v)}
      >
        ☰
      </button>
      <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
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
              onClick={() => {
                setActiveId(c.id)
                setSidebarOpen(false)
              }}
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
        <div className="sidebar-footer">
          {useApi ? 'Synced to your Mac.' : 'Saved locally in your browser.'}
        </div>
      </aside>
      <main className="main">
        {active ? (
          <ChainEditor
            key={active.id}
            canvas={active}
            onChange={updateActive}
            focusMode={focusMode}
            onToggleFocus={toggleFocus}
          />
        ) : (
          <div className="empty">Create a canvas to get started.</div>
        )}
      </main>
      {focusMode && (
        <button className="focus-exit" onClick={toggleFocus} title="Exit focus mode">
          ✕
        </button>
      )}
    </div>
  )
}
