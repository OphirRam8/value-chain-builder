export type SupplyKind = 'I' | 'R' | 'E' | 'N' | 'M' | 'D'

export const SUPPLY_LABELS: Record<SupplyKind, string> = {
  I: 'Information',
  R: 'Request',
  E: 'Emotion',
  N: 'Needs',
  M: 'Materials',
  D: 'Decisions/Deadlines',
}

export type ValueNodeData = {
  role: string
  addedValue: string
}

export type TextNodeData = {
  text: string
}

export type ValueEdgeData = {
  supplies: SupplyKind[]
  text?: string
}

export type Canvas = {
  id: string
  name: string
  outcome: string
  nodes: import('reactflow').Node[]
  edges: import('reactflow').Edge<ValueEdgeData>[]
  createdAt: number
  updatedAt: number
}
