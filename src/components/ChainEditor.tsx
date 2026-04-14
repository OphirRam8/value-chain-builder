import { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
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
import Inspector from './Inspector'
import type { Canvas, ValueEdgeData, ValueNodeData } from '../types'
import { newId } from '../storage'

const nodeTypes = { value: ValueNode }

type Props = {
  canvas: Canvas
  onChange: (patch: Partial<Canvas>) => void
}

function edgeLabel(supplies: string[] = []) {
  return supplies.length ? supplies.join(' · ') : ''
}

export default function ChainEditor({ canvas, onChange }: Props) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)

  const nodes = canvas.nodes
  const edges = useMemo(
    () =>
      canvas.edges.map((e) => ({
        ...e,
        label: edgeLabel(e.data?.supplies),
        labelStyle: { fontSize: 11, fontWeight: 600 },
        labelBgStyle: { fill: '#fff' },
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

  const updateNode = (id: string, patch: Partial<ValueNodeData>) => {
    onChange({
      nodes: nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
    })
  }
  const updateEdge = (id: string, patch: Partial<ValueEdgeData>) => {
    onChange({
      edges: canvas.edges.map((e) =>
        e.id === id ? { ...e, data: { ...(e.data ?? { supplies: [] }), ...patch } } : e,
      ),
    })
  }
  const deleteNode = (id: string) => {
    onChange({
      nodes: nodes.filter((n) => n.id !== id),
      edges: canvas.edges.filter((e) => e.source !== id && e.target !== id),
    })
    setSelectedNodeId(null)
  }
  const deleteEdge = (id: string) => {
    onChange({ edges: canvas.edges.filter((e) => e.id !== id) })
    setSelectedEdgeId(null)
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null
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
      <div className="editor-main">
        <div className="flow-wrap">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, n) => {
              setSelectedNodeId(n.id)
              setSelectedEdgeId(null)
            }}
            onEdgeClick={(_, e) => {
              setSelectedEdgeId(e.id)
              setSelectedNodeId(null)
            }}
            onPaneClick={() => {
              setSelectedNodeId(null)
              setSelectedEdgeId(null)
            }}
            fitView
            fitViewOptions={{ padding: 0.3 }}
          >
            <Background gap={20} color="#eee" />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>
        <Inspector
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onUpdateNode={updateNode}
          onUpdateEdge={updateEdge}
          onDeleteNode={deleteNode}
          onDeleteEdge={deleteEdge}
        />
      </div>
    </div>
  )
}
