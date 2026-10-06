export type NodeType = 'room' | 'junction' | 'exit'

export const NODE_TYPES: readonly NodeType[] = ['room', 'junction', 'exit']

export interface BuildingNode {
  id: string
  label: string
  type: NodeType
  x: number
  y: number
}

export interface BuildingEdge {
  id: string
  from: string
  to: string
  cost: number
}

export interface InitialState {
  blocked_nodes: string[]
  blocked_edges: string[]
  closed_exits: string[]
}

export interface Building {
  building: string
  nodes: BuildingNode[]
  edges: BuildingEdge[]
  initial_state: InitialState
}

/** Live, mutable-by-replacement hazard state derived from (and resettable to) `initial_state`. */
export interface HazardState {
  blockedNodes: ReadonlySet<string>
  blockedEdges: ReadonlySet<string>
  closedExits: ReadonlySet<string>
}

export type NoRouteReason = 'no-exits' | 'all-exits-closed' | 'unreachable'

export type RouteResult =
  | { status: 'no-building' }
  | { status: 'no-start' }
  | { status: 'start-blocked'; start: string }
  | { status: 'no-route'; start: string; reason: NoRouteReason }
  | {
      status: 'found'
      start: string
      exit: string
      /** Ordered node IDs from start to exit (inclusive). */
      path: string[]
      /** Ordered edge IDs traversed; `edgeIds[i]` connects `path[i]` and `path[i + 1]`. */
      edgeIds: string[]
      cost: number
    }

export type RouteStatus = RouteResult['status']

export type AppEventKind =
  | 'imported'
  | 'import-failed'
  | 'reset'
  | 'start-selected'
  | 'node-blocked'
  | 'node-unblocked'
  | 'edge-blocked'
  | 'edge-unblocked'
  | 'exit-closed'
  | 'exit-opened'

export interface AppEvent {
  id: number
  kind: AppEventKind
  target?: string
  time: number
}

export interface ApplicationState {
  building: Building | null
  fileName: string | null
  startId: string | null
  hazards: HazardState
  validationIssues: ValidationIssue[]
  events: AppEvent[]
}

export type ValidationCode =
  | 'parse_error'
  | 'root_not_object'
  | 'building_missing'
  | 'nodes_not_array'
  | 'nodes_limit'
  | 'node_not_object'
  | 'node_id_invalid'
  | 'node_id_duplicate'
  | 'node_label_invalid'
  | 'node_type_invalid'
  | 'node_coord_invalid'
  | 'edges_not_array'
  | 'edges_limit'
  | 'edge_not_object'
  | 'edge_id_invalid'
  | 'edge_id_duplicate'
  | 'edge_endpoint_missing'
  | 'edge_cost_invalid'
  | 'edge_self_loop'
  | 'edge_duplicate_pair'
  | 'initial_state_invalid'
  | 'initial_list_invalid'
  | 'initial_ref_unknown'
  | 'blocked_node_wrong_type'
  | 'closed_exit_wrong_type'

export type ValidationParams = Readonly<Record<string, string | number>>

export interface ValidationIssue {
  code: ValidationCode
  params: ValidationParams
}

export type ValidationResult =
  | { ok: true; building: Building }
  | { ok: false; issues: ValidationIssue[] }
