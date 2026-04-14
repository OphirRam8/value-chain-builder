import { Handle, Position, type NodeProps, useReactFlow, useStore } from 'reactflow'
import type { ValueNodeData } from '../types'

export default function ValueNode({ id, data, selected }: NodeProps<ValueNodeData>) {
  const { setNodes, setEdges } = useReactFlow()

  const { hasIncoming, hasOutgoing } = useStore((s) => ({
    hasIncoming: s.edges.some((e) => e.target === id),
    hasOutgoing: s.edges.some((e) => e.source === id),
  }))

  const update = (patch: Partial<ValueNodeData>) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
    )
  }

  const remove = () => {
    setNodes((nds) => nds.filter((n) => n.id !== id))
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
  }

  return (
    <div className={`value-node ${selected ? 'selected' : ''}`}>
      {!hasIncoming && <Handle type="target" position={Position.Left} className="handle-plus" />}
      <button
        className="node-delete nodrag"
        title="Delete"
        onClick={(e) => {
          e.stopPropagation()
          remove()
        }}
      >
        ×
      </button>
      <div className="value-node-inner">
        <input
          className="value-node-role nodrag"
          value={data.role}
          placeholder="Role"
          onChange={(e) => update({ role: e.target.value })}
        />
        <textarea
          className="value-node-added-text nodrag"
          value={data.addedValue}
          placeholder="Added value…"
          rows={4}
          onChange={(e) => update({ addedValue: e.target.value })}
        />
      </div>
      {!hasOutgoing && <Handle type="source" position={Position.Right} className="handle-plus" />}
    </div>
  )
}
