import { type NodeProps, useReactFlow } from 'reactflow'
import type { TextNodeData } from '../types'

export default function TextNode({ id, data, selected }: NodeProps<TextNodeData>) {
  const { setNodes } = useReactFlow()

  const update = (text: string) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, text } } : n)),
    )
  }
  const remove = () => setNodes((nds) => nds.filter((n) => n.id !== id))

  return (
    <div className={`text-node ${selected ? 'selected' : ''}`}>
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
      <textarea
        className="text-node-textarea nodrag"
        value={data.text}
        placeholder="Text…"
        onChange={(e) => update(e.target.value)}
        rows={3}
      />
    </div>
  )
}
