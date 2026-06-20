import type { ChainPhase, ChainNode } from '@/modules/learn/domain/chainModel'

export function getAllNodes(model: ChainPhase[]): ChainNode[] {
  return model.flatMap(p => p.nodes)
}

export function getNodeById(model: ChainPhase[], id: string): ChainNode | null {
  return getAllNodes(model).find(n => n.id === id) ?? null
}

export function getPhases(model: ChainPhase[]): ChainPhase[] {
  return model
}
