import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from 'reactflow'
import type { ValueEdgeData } from '../types'

export default function ValueEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
  style,
}: EdgeProps<ValueEdgeData>) {
  const { setEdges } = useReactFlow()
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const setText = (text: string) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id === id
          ? { ...e, data: { ...(e.data ?? { supplies: [] }), text } }
          : e,
      ),
    )
  }

  const supplies = data?.supplies ?? []
  const text = data?.text ?? ''

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className={`edge-label ${selected ? 'selected' : ''}`}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
        >
          <input
            className="edge-text nodrag nopan"
            value={text}
            placeholder="Add text…"
            onChange={(e) => setText(e.target.value)}
          />
          {supplies.length > 0 && (
            <div className="edge-supplies">{supplies.join(' · ')}</div>
          )}
          {supplies.length === 0 && !selected && !text && (
            <div className="edge-supplies edge-plus">+</div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
