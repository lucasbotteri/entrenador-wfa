import type { ChainPhase, ChainNode } from '@/modules/learn/domain/chainModel'

export function getAllNodes(model: ChainPhase[]): ChainNode[] {
  return model.flatMap(p => p.nodes)
}

export function getNodeById(model: ChainPhase[], id: string): ChainNode | null {
  return getAllNodes(model).find(n => n.id === id) ?? null
}

// The link (phase) a node belongs to, with its 0-based index in the chain and
// the node's 0-based position inside it.
export function getPhaseForNode(
  model: ChainPhase[],
  id: string,
): { phase: ChainPhase; phaseIndex: number; position: number } | null {
  for (let i = 0; i < model.length; i++) {
    const phase = model[i]
    if (!phase) continue
    const position = phase.nodes.findIndex(n => n.id === id)
    if (position >= 0) return { phase, phaseIndex: i, position }
  }
  return null
}
