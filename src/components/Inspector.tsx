import type { Edge, Node } from 'reactflow'
import type { SupplyKind, ValueEdgeData, ValueNodeData } from '../types'
import { SUPPLY_LABELS } from '../types'

type Props = {
  selectedNode: Node<ValueNodeData> | null
  selectedEdge: Edge<ValueEdgeData> | null
  onUpdateNode: (id: string, patch: Partial<ValueNodeData>) => void
  onUpdateEdge: (id: string, patch: Partial<ValueEdgeData>) => void
  onDeleteNode: (id: string) => void
  onDeleteEdge: (id: string) => void
}

const KINDS: SupplyKind[] = ['I', 'R', 'E', 'N', 'M', 'D']

export default function Inspector({
  selectedNode,
  selectedEdge,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
}: Props) {
  if (selectedNode) {
    return (
      <div className="inspector">
        <div className="inspector-header">
          <span>Position</span>
          <button className="btn-danger" onClick={() => onDeleteNode(selectedNode.id)}>
            Delete
          </button>
        </div>
        <label className="field">
          <span>Role</span>
          <input
            value={selectedNode.data.role}
            onChange={(e) => onUpdateNode(selectedNode.id, { role: e.target.value })}
            placeholder="e.g. Sales Manager"
          />
        </label>
        <label className="field">
          <span>Added Value</span>
          <textarea
            value={selectedNode.data.addedValue}
            onChange={(e) => onUpdateNode(selectedNode.id, { addedValue: e.target.value })}
            placeholder="What this position contributes…"
            rows={6}
          />
        </label>
      </div>
    )
  }
  if (selectedEdge) {
    const supplies = selectedEdge.data?.supplies ?? []
    const toggle = (k: SupplyKind) => {
      const next = supplies.includes(k) ? supplies.filter((s) => s !== k) : [...supplies, k]
      onUpdateEdge(selectedEdge.id, { supplies: next })
    }
    return (
      <div className="inspector">
        <div className="inspector-header">
          <span>Connection</span>
          <button className="btn-danger" onClick={() => onDeleteEdge(selectedEdge.id)}>
            Delete
          </button>
        </div>
        <div className="field">
          <span>Supplies / Receives</span>
          <div className="chips">
            {KINDS.map((k) => (
              <button
                key={k}
                className={`chip ${supplies.includes(k) ? 'active' : ''}`}
                onClick={() => toggle(k)}
                title={SUPPLY_LABELS[k]}
              >
                <strong>{k}</strong> {SUPPLY_LABELS[k]}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="inspector inspector-empty">
      <p>Select a circle or an arrow to edit it.</p>
      <p className="hint">Tip: drag from the right of one circle to the left of another to connect them.</p>
    </div>
  )
}
