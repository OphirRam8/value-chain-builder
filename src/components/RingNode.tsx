import { NodeResizer, type NodeProps, useReactFlow } from 'reactflow'

type RingData = { text: string }

export default function RingNode({ id, data, selected }: NodeProps<RingData>) {
  const { setNodes } = useReactFlow()

  const update = (text: string) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, text } } : n)),
    )
  }
  const remove = () =>
    setNodes((nds) => nds.filter((n) => n.id !== id))

  return (
    <div className={`ring-node ${selected ? 'selected' : ''}`}>
      <NodeResizer
        color="#e85c3c"
        isVisible={selected}
        minWidth={200}
        minHeight={200}
        keepAspectRatio
      />
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
      <div className="ring-text-wrap">
        <textarea
          className="ring-text nodrag"
          value={data.text}
          placeholder="Label…"
          rows={2}
          onChange={(e) => update(e.target.value)}
        />
      </div>
    </div>
  )
}
