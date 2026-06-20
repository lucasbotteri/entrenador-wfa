import { getAllNodes } from '@/modules/learn/content/selectors'
import type { ChainPhase, ChainNode } from '@/modules/learn/domain/chainModel'

export function findPrevNext(
  model: ChainPhase[],
  currentId: string,
): { prev?: ChainNode; next?: ChainNode } {
  const nodes = getAllNodes(model)
  const i = nodes.findIndex(n => n.id === currentId)
  if (i === -1) return {}
  return {
    ...(i > 0 ? { prev: nodes[i - 1] } : {}),
    ...(i < nodes.length - 1 ? { next: nodes[i + 1] } : {}),
  }
}
