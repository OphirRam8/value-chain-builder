import { type NodeProps, useReactFlow } from 'reactflow'

type ArrowData = {
  width: number
  height: number
  fromX: number
  fromY: number
  toX: number
  toY: number
}

export default function ArrowNode({ id, data, selected }: NodeProps<ArrowData>) {
  const { setNodes } = useReactFlow()
  const remove = () => setNodes((nds) => nds.filter((n) => n.id !== id))

  const w = Math.max(data.width, 2)
  const h = Math.max(data.height, 2)

  return (
    <div
      className={`arrow-node ${selected ? 'selected' : ''}`}
      style={{ width: w, height: h }}
    >
      <svg width={w} height={h} style={{ overflow: 'visible' }}>
        <defs>
          <marker
            id={`arrowhead-${id}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2b2b2b" />
          </marker>
        </defs>
        <line
          x1={data.fromX}
          y1={data.fromY}
          x2={data.toX}
          y2={data.toY}
          stroke={selected ? '#e85c3c' : '#2b2b2b'}
          strokeWidth={2}
          strokeLinecap="round"
          markerEnd={`url(#arrowhead-${id})`}
        />
      </svg>
      <button
        className="node-delete nodrag arrow-delete"
        title="Delete"
        onClick={(e) => {
          e.stopPropagation()
          remove()
        }}
        style={{
          left: (data.fromX + data.toX) / 2 - 11,
          top: (data.fromY + data.toY) / 2 - 11,
        }}
      >
        ×
      </button>
    </div>
  )
}
