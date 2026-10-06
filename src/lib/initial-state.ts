import type { Building, HazardState } from '@/types/building'

export const EMPTY_HAZARDS: HazardState = {
  blockedNodes: new Set(),
  blockedEdges: new Set(),
  closedExits: new Set(),
}

/**
 * Creates a fresh hazard state from the building's original `initial_state`.
 * New Set instances are created every time so later toggles can never mutate the source data —
 * this is what makes Reset restore the EXACT imported state.
 */
export function hazardsFromInitialState(building: Building): HazardState {
  return {
    blockedNodes: new Set(building.initial_state.blocked_nodes),
    blockedEdges: new Set(building.initial_state.blocked_edges),
    closedExits: new Set(building.initial_state.closed_exits),
  }
}

/** Returns a new set with `id` toggled; the input set is never mutated. */
export function toggleInSet(set: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(set)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

/** True when the current hazards exactly equal the building's initial_state. */
export function matchesInitialState(building: Building, hazards: HazardState): boolean {
  const same = (a: ReadonlySet<string>, b: readonly string[]) =>
    a.size === b.length && b.every((id) => a.has(id))
  return (
    same(hazards.blockedNodes, building.initial_state.blocked_nodes) &&
    same(hazards.blockedEdges, building.initial_state.blocked_edges) &&
    same(hazards.closedExits, building.initial_state.closed_exits)
  )
}
