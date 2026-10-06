import type { Building, BuildingEdge, BuildingNode, HazardState } from '@/types/building'

export interface Adjacency {
  neighbor: string
  edgeId: string
  cost: number
}

export interface Graph {
  nodeById: ReadonlyMap<string, BuildingNode>
  edgeById: ReadonlyMap<string, BuildingEdge>
  /** Undirected adjacency: every edge appears in the list of both endpoints. */
  adjacency: ReadonlyMap<string, readonly Adjacency[]>
  exits: readonly BuildingNode[]
}

/** Builds an immutable, undirected graph from a validated building. Built once per import. */
export function buildGraph(building: Building): Graph {
  const nodeById = new Map<string, BuildingNode>()
  const adjacency = new Map<string, Adjacency[]>()
  for (const node of building.nodes) {
    nodeById.set(node.id, node)
    adjacency.set(node.id, [])
  }

  const edgeById = new Map<string, BuildingEdge>()
  for (const edge of building.edges) {
    edgeById.set(edge.id, edge)
    adjacency.get(edge.from)?.push({ neighbor: edge.to, edgeId: edge.id, cost: edge.cost })
    adjacency.get(edge.to)?.push({ neighbor: edge.from, edgeId: edge.id, cost: edge.cost })
  }

  const exits = building.nodes.filter((node) => node.type === 'exit')
  return { nodeById, edgeById, adjacency, exits }
}

/** A node is impassable if it is a blocked room/junction or a closed exit. */
export function isNodeImpassable(node: BuildingNode, hazards: HazardState): boolean {
  return node.type === 'exit' ? hazards.closedExits.has(node.id) : hazards.blockedNodes.has(node.id)
}

/**
 * An edge is usable only if the corridor itself is not blocked AND neither endpoint is impassable.
 * Used for both routing and map rendering so the two can never disagree.
 */
export function isEdgeUsable(edge: BuildingEdge, graph: Graph, hazards: HazardState): boolean {
  if (hazards.blockedEdges.has(edge.id)) return false
  const from = graph.nodeById.get(edge.from)
  const to = graph.nodeById.get(edge.to)
  if (!from || !to) return false
  return !isNodeImpassable(from, hazards) && !isNodeImpassable(to, hazards)
}
