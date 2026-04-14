import { Handle, Position, type NodeProps } from 'reactflow'
import type { ValueNodeData } from '../types'

export default function ValueNode({ data, selected }: NodeProps<ValueNodeData>) {
  return (
    <div className={`value-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <div className="value-node-inner">
        <div className="value-node-role">{data.role || 'Untitled'}</div>
        {data.addedValue && (
          <div className="value-node-added">
            <div className="value-node-added-label">Added Value</div>
            <div className="value-node-added-text">{data.addedValue}</div>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
