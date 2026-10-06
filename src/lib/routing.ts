import type { Graph } from '@/lib/graph'
import { isNodeImpassable } from '@/lib/graph'
import {
  compareExitCandidates,
  comparePathCandidates,
  type ExitCandidate,
  type PathCandidate,
} from '@/lib/tie-breaking'
import type { HazardState, RouteResult } from '@/types/building'

interface Label extends PathCandidate {
  path: string[]
  edgeIds: string[]
}

/**
 * Computes the evacuation route from `startId` using Dijkstra's algorithm with
 * lexicographic tie-breaking.
 *
 * Cost model: the route cost is ONLY the sum of edge `cost` values. Coordinates, visual
 * distance and corridor count are never used.
 *
 * Hazard model:
 *   - A blocked room/junction cannot be entered or crossed (all incident edges are unusable).
 *   - A blocked corridor removes only that edge; its endpoints stay usable.
 *   - A closed exit can be neither a destination nor an intermediate node.
 *   - Exits are terminal: once a route reaches an exit it stops there. (With strictly positive
 *     costs a path through exit A to exit B always costs more than stopping at A, so this
 *     never changes the optimum; it simply keeps exits out of the "crossing" role.)
 *
 * Tie-breaking (deterministic):
 *   Each node keeps a label (cost, full node-ID path). A new label replaces the current one if
 *   it is cheaper, or equally cheap with a lexicographically smaller node sequence.
 *
 *   Why this is correct: with strictly positive edge costs, every predecessor of `v` on a
 *   minimum-cost path has a strictly smaller cost than `v`, so it is settled before `v`. Its
 *   label is already the lexicographically smallest min-cost path to it, and for a fixed
 *   predecessor `u` the order of `P + v` equals the order of `P` (two different simple paths
 *   ending at `u` cannot be prefixes of each other). Hence when `v` is settled, its label is
 *   the lexicographically smallest among all its minimum-cost paths.
 *
 *   After the search, the destination is the reachable open exit with the minimum cost; ties
 *   go to the lexicographically smallest exit ID (see `compareExitCandidates`).
 *
 * Complexity: O(V² + E) using a linear scan instead of a heap — simple, deterministic and
 * far below a millisecond for the expected 60 nodes / 150 edges.
 */
export function computeEvacuationRoute(
  graph: Graph,
  hazards: HazardState,
  startId: string | null,
): RouteResult {
  if (startId === null) return { status: 'no-start' }
  const startNode = graph.nodeById.get(startId)
  if (!startNode || startNode.type === 'exit') return { status: 'no-start' }
  if (hazards.blockedNodes.has(startId)) return { status: 'start-blocked', start: startId }

  const labels = new Map<string, Label>()
  const settled = new Set<string>()
  labels.set(startId, { cost: 0, path: [startId], edgeIds: [] })

  while (true) {
    // Pick the unsettled node with the best label (cost, then lexicographic path).
    let currentId: string | null = null
    let current: Label | null = null
    for (const [id, label] of labels) {
      if (settled.has(id)) continue
      if (current === null || comparePathCandidates(label, current) < 0) {
        currentId = id
        current = label
      }
    }
    if (currentId === null || current === null) break
    settled.add(currentId)

    const node = graph.nodeById.get(currentId)
    // Exits are destinations only; never expand through them.
    if (!node || node.type === 'exit') continue

    for (const { neighbor, edgeId, cost } of graph.adjacency.get(currentId) ?? []) {
      if (settled.has(neighbor)) continue
      if (hazards.blockedEdges.has(edgeId)) continue
      const neighborNode = graph.nodeById.get(neighbor)
      if (!neighborNode || isNodeImpassable(neighborNode, hazards)) continue

      const candidate: Label = {
        cost: current.cost + cost,
        path: [...current.path, neighbor],
        edgeIds: [...current.edgeIds, edgeId],
      }
      const existing = labels.get(neighbor)
      if (!existing || comparePathCandidates(candidate, existing) < 0) {
        labels.set(neighbor, candidate)
      }
    }
  }

  // Choose the best reachable open exit (closed exits are never labelled).
  let best: (ExitCandidate & { edgeIds: string[]; path: string[] }) | null = null
  for (const exit of graph.exits) {
    const label = labels.get(exit.id)
    if (!label) continue
    const candidate = { ...label, exitId: exit.id }
    if (best === null || compareExitCandidates(candidate, best) < 0) best = candidate
  }

  if (best === null) {
    const reason =
      graph.exits.length === 0
        ? 'no-exits'
        : graph.exits.every((exit) => hazards.closedExits.has(exit.id))
          ? 'all-exits-closed'
          : 'unreachable'
    return { status: 'no-route', start: startId, reason }
  }

  return {
    status: 'found',
    start: startId,
    exit: best.exitId,
    path: best.path,
    edgeIds: best.edgeIds,
    cost: best.cost,
  }
}
