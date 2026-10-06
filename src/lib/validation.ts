import {
  NODE_TYPES,
  type BuildingEdge,
  type BuildingNode,
  type InitialState,
  type NodeType,
  type ValidationCode,
  type ValidationIssue,
  type ValidationParams,
  type ValidationResult,
} from '@/types/building'

export const GRAPH_LIMITS = {
  minNodes: 2,
  maxNodes: 60,
  minEdges: 1,
  maxEdges: 150,
} as const

type JsonObject = Record<string, unknown>

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function describe(value: unknown): string {
  if (value === undefined) return 'undefined'
  try {
    const text = JSON.stringify(value)
    return text.length > 40 ? `${text.slice(0, 37)}...` : text
  } catch {
    return String(value)
  }
}

/** Canonical key for an undirected node pair, so A–B and B–A collide. */
export function pairKey(a: string, b: string): string {
  return a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`
}

/** Parses raw text and validates it. Never throws. */
export function parseAndValidateBuilding(text: string): ValidationResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, issues: [{ code: 'parse_error', params: { message } }] }
  }
  return validateBuilding(raw)
}

/** Validates an already-parsed value against the building schema. Never throws. */
export function validateBuilding(raw: unknown): ValidationResult {
  const issues: ValidationIssue[] = []
  const add = (code: ValidationCode, params: ValidationParams = {}) => issues.push({ code, params })

  if (!isObject(raw)) {
    add('root_not_object')
    return { ok: false, issues }
  }

  if (!isNonEmptyString(raw.building)) add('building_missing')

  // ---- Nodes ----
  const nodes: BuildingNode[] = []
  const nodeById = new Map<string, BuildingNode>()

  if (!Array.isArray(raw.nodes)) {
    add('nodes_not_array')
  } else {
    const count = raw.nodes.length
    if (count < GRAPH_LIMITS.minNodes || count > GRAPH_LIMITS.maxNodes) {
      add('nodes_limit', { count, min: GRAPH_LIMITS.minNodes, max: GRAPH_LIMITS.maxNodes })
    }

    raw.nodes.forEach((entry, index) => {
      if (!isObject(entry)) {
        add('node_not_object', { index })
        return
      }
      if (!isNonEmptyString(entry.id)) {
        add('node_id_invalid', { index })
        return
      }
      const id = entry.id.trim()
      let valid = true
      if (nodeById.has(id)) {
        add('node_id_duplicate', { id })
        valid = false
      }
      if (!isNonEmptyString(entry.label)) {
        add('node_label_invalid', { id })
        valid = false
      }
      if (typeof entry.type !== 'string' || !NODE_TYPES.includes(entry.type as NodeType)) {
        add('node_type_invalid', { id, value: describe(entry.type) })
        valid = false
      }
      for (const axis of ['x', 'y'] as const) {
        if (!isFiniteNumber(entry[axis])) {
          add('node_coord_invalid', { id, axis, value: describe(entry[axis]) })
          valid = false
        }
      }
      if (!valid) {
        // Still register the ID so edges referencing it do not produce misleading "missing node" errors.
        if (!nodeById.has(id)) nodeById.set(id, { id, label: '', type: 'room', x: 0, y: 0 })
        return
      }
      const node: BuildingNode = {
        id,
        label: (entry.label as string).trim(),
        type: entry.type as NodeType,
        x: entry.x as number,
        y: entry.y as number,
      }
      nodeById.set(id, node)
      nodes.push(node)
    })
  }

  // ---- Edges ----
  const edges: BuildingEdge[] = []
  const edgeIds = new Set<string>()
  const pairs = new Map<string, string>()

  if (!Array.isArray(raw.edges)) {
    add('edges_not_array')
  } else {
    const count = raw.edges.length
    if (count < GRAPH_LIMITS.minEdges || count > GRAPH_LIMITS.maxEdges) {
      add('edges_limit', { count, min: GRAPH_LIMITS.minEdges, max: GRAPH_LIMITS.maxEdges })
    }

    raw.edges.forEach((entry, index) => {
      if (!isObject(entry)) {
        add('edge_not_object', { index })
        return
      }
      if (!isNonEmptyString(entry.id)) {
        add('edge_id_invalid', { index })
        return
      }
      const id = entry.id.trim()
      let valid = true
      if (edgeIds.has(id)) {
        add('edge_id_duplicate', { id })
        valid = false
      }
      edgeIds.add(id)

      const endpoints: Record<'from' | 'to', string | null> = { from: null, to: null }
      for (const end of ['from', 'to'] as const) {
        const value = entry[end]
        if (!isNonEmptyString(value) || !nodeById.has(value.trim())) {
          add('edge_endpoint_missing', { id, endpoint: end, node: describe(value) })
          valid = false
        } else {
          endpoints[end] = value.trim()
        }
      }

      const cost = entry.cost
      if (typeof cost !== 'number' || !Number.isInteger(cost) || cost <= 0) {
        add('edge_cost_invalid', { id, value: describe(cost) })
        valid = false
      }

      const { from, to } = endpoints
      if (from !== null && to !== null) {
        if (from === to) {
          add('edge_self_loop', { id, node: from })
          valid = false
        } else {
          const key = pairKey(from, to)
          const existing = pairs.get(key)
          if (existing !== undefined) {
            add('edge_duplicate_pair', { id, other: existing, a: from, b: to })
            valid = false
          } else {
            pairs.set(key, id)
          }
        }
      }

      if (valid && from !== null && to !== null) {
        edges.push({ id, from, to, cost: cost as number })
      }
    })
  }

  // ---- Initial state ----
  const initialState: InitialState = { blocked_nodes: [], blocked_edges: [], closed_exits: [] }

  if (!isObject(raw.initial_state)) {
    add('initial_state_invalid')
  } else {
    const state = raw.initial_state
    const lists = ['blocked_nodes', 'blocked_edges', 'closed_exits'] as const
    for (const list of lists) {
      const value = state[list]
      if (!Array.isArray(value)) {
        add('initial_list_invalid', { list })
        continue
      }
      const seen = new Set<string>()
      for (const item of value) {
        if (!isNonEmptyString(item)) {
          add('initial_ref_unknown', { list, id: describe(item) })
          continue
        }
        const ref = item.trim()
        if (seen.has(ref)) continue
        seen.add(ref)

        if (list === 'blocked_edges') {
          if (!edgeIds.has(ref)) add('initial_ref_unknown', { list, id: ref })
          else initialState.blocked_edges.push(ref)
          continue
        }

        const node = nodeById.get(ref)
        if (!node) {
          add('initial_ref_unknown', { list, id: ref })
        } else if (list === 'blocked_nodes' && node.type === 'exit') {
          add('blocked_node_wrong_type', { id: ref, type: node.type })
        } else if (list === 'closed_exits' && node.type !== 'exit') {
          add('closed_exit_wrong_type', { id: ref, type: node.type })
        } else {
          initialState[list].push(ref)
        }
      }
    }
  }

  if (issues.length > 0) return { ok: false, issues }

  return {
    ok: true,
    building: {
      building: (raw.building as string).trim(),
      nodes,
      edges,
      initial_state: initialState,
    },
  }
}
