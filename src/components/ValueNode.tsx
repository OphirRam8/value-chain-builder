import { Handle, Position, type NodeProps, useReactFlow } from 'reactflow'
import type { ValueNodeData } from '../types'

export default function ValueNode({ id, data, selected }: NodeProps<ValueNodeData>) {
  const { setNodes, setEdges } = useReactFlow()

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
      <Handle type="target" position={Position.Left} />
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
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
