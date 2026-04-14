import { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from 'reactflow'
import 'reactflow/dist/style.css'
import ValueNode from './ValueNode'
import type { Canvas, SupplyKind, ValueEdgeData, ValueNodeData } from '../types'
import { SUPPLY_LABELS } from '../types'
import { newId } from '../storage'

const nodeTypes = { value: ValueNode }
const KINDS: SupplyKind[] = ['I', 'R', 'E', 'N', 'M', 'D']

type Props = {
  canvas: Canvas
  onChange: (patch: Partial<Canvas>) => void
}

function edgeLabel(supplies: string[] = []) {
  return supplies.length ? supplies.join(' · ') : '+'
}

function Editor({ canvas, onChange }: Props) {
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)

  const nodes = canvas.nodes
  const edges = useMemo(
    () =>
      canvas.edges.map((e) => ({
        ...e,
        label: edgeLabel(e.data?.supplies),
        labelStyle: { fontSize: 11, fontWeight: 600 },
        labelBgStyle: { fill: '#fff' },
        labelBgPadding: [6, 4] as [number, number],
        labelBgBorderRadius: 6,
      })),
    [canvas.edges],
  )

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onChange({ nodes: applyNodeChanges(changes, nodes) as Node<ValueNodeData>[] })
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
      const edge: Edge<ValueEdgeData> = {
        id: newId(),
        source: conn.source!,
        target: conn.target!,
        data: { supplies: ['I', 'R'] },
        type: 'default',
      }
      onChange({ edges: addEdge(edge, canvas.edges) as Edge<ValueEdgeData>[] })
    },
    [canvas.edges, onChange],
  )

  const addNode = () => {
    const count = nodes.length
    const node: Node<ValueNodeData> = {
      id: newId(),
      type: 'value',
      position: { x: 80 + count * 240, y: 160 + (count % 2) * 40 },
      data: { role: '', addedValue: '' },
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
      </div>
      <div className="flow-wrap">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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
