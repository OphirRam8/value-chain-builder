import { useCallback, useMemo, useRef, useState, type MouseEvent as RMouseEvent, type TouchEvent as RTouchEvent } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from 'reactflow'
import 'reactflow/dist/style.css'
import ValueNode from './ValueNode'
import TextNode from './TextNode'
import type { Canvas, SupplyKind, ValueEdgeData, ValueNodeData } from '../types'
import { SUPPLY_LABELS } from '../types'
import { newId } from '../storage'

const nodeTypes = { value: ValueNode, text: TextNode }
const KINDS: SupplyKind[] = ['I', 'R', 'E', 'N', 'M', 'D']

type Props = {
  canvas: Canvas
  onChange: (patch: Partial<Canvas>) => void
}

function edgeLabel(supplies: string[] = []) {
  return supplies.length ? supplies.join(' · ') : '+'
}

function getClientXY(e: MouseEvent | TouchEvent) {
  if ('clientX' in e) return { x: e.clientX, y: e.clientY }
  const t = e.changedTouches[0]
  return { x: t.clientX, y: t.clientY }
}

function Editor({ canvas, onChange }: Props) {
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const { screenToFlowPosition } = useReactFlow()
  const connectingRef = useRef<
    { nodeId: string; handleType: 'source' | 'target'; startX: number; startY: number } | null
  >(null)
  const didConnectRef = useRef(false)

  const nodes = canvas.nodes
  const edges = useMemo(
    () =>
      canvas.edges.map((e) => ({
        ...e,
        label: edgeLabel(e.data?.supplies),
        labelStyle: { fontSize: 12, fontWeight: 600 },
        labelBgStyle: { fill: '#fff' },
        labelBgPadding: [6, 4] as [number, number],
        labelBgBorderRadius: 6,
      })),
    [canvas.edges],
  )

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onChange({ nodes: applyNodeChanges(changes, nodes) })
    },
    [nodes, onChange],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onChange({ edges: applyEdgeChanges(changes, canvas.edges) as Edge<ValueEdgeData>[] })
    },
    [canvas.edges, onChange],
  )

  const onConnect = useCallback(
    (conn: Connection) => {
      didConnectRef.current = true
      const edge: Edge<ValueEdgeData> = {
        id: newId(),
        source: conn.source!,
        target: conn.target!,
        data: { supplies: [] },
        type: 'default',
      }
      onChange({ edges: addEdge(edge, canvas.edges) as Edge<ValueEdgeData>[] })
    },
    [canvas.edges, onChange],
  )

  const onConnectStart = useCallback(
    (
      event: RMouseEvent | RTouchEvent,
      params: { nodeId: string | null; handleType: 'source' | 'target' | null },
    ) => {
      didConnectRef.current = false
      if (params.nodeId && params.handleType) {
        const start = 'clientX' in event
          ? { x: event.clientX, y: event.clientY }
          : { x: event.touches[0].clientX, y: event.touches[0].clientY }
        connectingRef.current = {
          nodeId: params.nodeId,
          handleType: params.handleType,
          startX: start.x,
          startY: start.y,
        }
      }
    },
    [],
  )

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const info = connectingRef.current
      connectingRef.current = null
      if (!info || didConnectRef.current) return

      const source = nodes.find((n) => n.id === info.nodeId)
      if (!source) return

      const { x: cx, y: cy } = getClientXY(event)
      const movedPx = Math.hypot(cx - info.startX, cy - info.startY)
      const isClick = movedPx < 8
      const NODE_SIZE = 240
      const GAP = 100
      const dropFlow = screenToFlowPosition({ x: cx, y: cy })
      const pos = isClick
        ? {
            x:
              source.position.x +
              (info.handleType === 'source' ? NODE_SIZE + GAP : -(NODE_SIZE + GAP)),
            y: source.position.y,
          }
        : { x: dropFlow.x - NODE_SIZE / 2, y: dropFlow.y - NODE_SIZE / 2 }

      const newNode: Node<ValueNodeData> = {
        id: newId(),
        type: 'value',
        position: pos,
        data: { role: '', addedValue: '' },
      }
      const newEdge: Edge<ValueEdgeData> =
        info.handleType === 'source'
          ? {
              id: newId(),
              source: info.nodeId,
              target: newNode.id,
              data: { supplies: [] },
              type: 'default',
            }
          : {
              id: newId(),
              source: newNode.id,
              target: info.nodeId,
              data: { supplies: [] },
              type: 'default',
            }

      onChange({ nodes: [...nodes, newNode], edges: [...canvas.edges, newEdge] })
    },
    [nodes, canvas.edges, onChange, screenToFlowPosition],
  )

  const addNode = () => {
    const count = nodes.length
    const node: Node<ValueNodeData> = {
      id: newId(),
      type: 'value',
      position: { x: 80 + count * 260, y: 160 + (count % 2) * 40 },
      data: { role: '', addedValue: '' },
    }
    onChange({ nodes: [...nodes, node] })
  }

  const addTextNode = () => {
    const node: Node = {
      id: newId(),
      type: 'text',
      position: { x: 80, y: 40 },
      data: { text: '' },
    }
    onChange({ nodes: [...nodes, node] })
  }

  const toggleEdgeSupply = (edgeId: string, k: SupplyKind) => {
    onChange({
      edges: canvas.edges.map((e) => {
        if (e.id !== edgeId) return e
        const supplies = e.data?.supplies ?? []
        const next = supplies.includes(k) ? supplies.filter((s) => s !== k) : [...supplies, k]
        return { ...e, data: { ...(e.data ?? { supplies: [] }), supplies: next } }
      }),
    })
  }

  const deleteEdge = (id: string) => {
    onChange({ edges: canvas.edges.filter((e) => e.id !== id) })
    setSelectedEdgeId(null)
  }

  const selectedEdge = canvas.edges.find((e) => e.id === selectedEdgeId) ?? null

  return (
    <div className="editor">
      <div className="editor-topbar">
        <input
          className="canvas-name"
          value={canvas.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Canvas name"
        />
        <input
          className="canvas-outcome"
          value={canvas.outcome}
          onChange={(e) => onChange({ outcome: e.target.value })}
          placeholder="Outcome (e.g. Deliver product to customer)"
        />
        <button className="btn-primary" onClick={addNode}>
          + Add Position
        </button>
        <button onClick={addTextNode}>+ Add Text</button>
      </div>
      <div className="flow-wrap">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onEdgeClick={(_, e) => setSelectedEdgeId(e.id)}
          onPaneClick={() => setSelectedEdgeId(null)}
          fitView
          fitViewOptions={{ padding: 0.3 }}
        >
          <Background gap={20} color="#eee" />
          <Controls />
          <MiniMap pannable zoomable />
        </ReactFlow>
        {selectedEdge && (
          <div className="edge-popover">
            <div className="edge-popover-header">
              <span>Supplies / Receives</span>
              <button className="btn-danger" onClick={() => deleteEdge(selectedEdge.id)}>
                Delete
              </button>
            </div>
            <div className="chips">
              {KINDS.map((k) => {
                const active = selectedEdge.data?.supplies?.includes(k) ?? false
                return (
                  <button
                    key={k}
                    className={`chip ${active ? 'active' : ''}`}
                    onClick={() => toggleEdgeSupply(selectedEdge.id, k)}
                    title={SUPPLY_LABELS[k]}
                  >
                    <strong>{k}</strong> {SUPPLY_LABELS[k]}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChainEditor(props: Props) {
  return (
    <ReactFlowProvider>
      <Editor {...props} />
    </ReactFlowProvider>
  )
}
