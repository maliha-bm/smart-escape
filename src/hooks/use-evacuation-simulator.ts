import { useCallback, useMemo, useRef, useState } from 'react'
import { buildGraph, type Graph } from '@/lib/graph'
import {
  EMPTY_HAZARDS,
  hazardsFromInitialState,
  matchesInitialState,
  toggleInSet,
} from '@/lib/initial-state'
import { computeEvacuationRoute } from '@/lib/routing'
import { parseAndValidateBuilding } from '@/lib/validation'
import type {
  AppEvent,
  AppEventKind,
  Building,
  HazardState,
  RouteResult,
  ValidationIssue,
} from '@/types/building'

const MAX_EVENTS = 20

export interface EvacuationSimulator {
  building: Building | null
  graph: Graph | null
  fileName: string | null
  startId: string | null
  hazards: HazardState
  route: RouteResult
  validationIssues: ValidationIssue[]
  events: AppEvent[]
  isInitialState: boolean
  importText: (text: string, fileName: string) => boolean
  dismissIssues: () => void
  selectStart: (id: string | null) => void
  toggleNode: (id: string) => void
  toggleEdge: (id: string) => void
  toggleExit: (id: string) => void
  reset: () => void
}

/**
 * Owns all simulator state. The route is NEVER stored — it is derived from
 * (graph, hazards, startId) on every change, so it can never go stale.
 */
export function useEvacuationSimulator(): EvacuationSimulator {
  const [building, setBuilding] = useState<Building | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [startId, setStartId] = useState<string | null>(null)
  const [blockedNodes, setBlockedNodes] = useState<ReadonlySet<string>>(EMPTY_HAZARDS.blockedNodes)
  const [blockedEdges, setBlockedEdges] = useState<ReadonlySet<string>>(EMPTY_HAZARDS.blockedEdges)
  const [closedExits, setClosedExits] = useState<ReadonlySet<string>>(EMPTY_HAZARDS.closedExits)
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const [events, setEvents] = useState<AppEvent[]>([])
  const eventId = useRef(0)

  const log = useCallback((kind: AppEventKind, target = '') => {
    eventId.current += 1
    const entry: AppEvent = { id: eventId.current, kind, target, time: Date.now() }
    setEvents((previous) => [entry, ...previous].slice(0, MAX_EVENTS))
  }, [])

  const graph = useMemo(() => (building ? buildGraph(building) : null), [building])

  const hazards = useMemo<HazardState>(
    () => ({ blockedNodes, blockedEdges, closedExits }),
    [blockedNodes, blockedEdges, closedExits],
  )

  const route = useMemo<RouteResult>(
    () => (graph ? computeEvacuationRoute(graph, hazards, startId) : { status: 'no-building' }),
    [graph, hazards, startId],
  )

  const applyHazards = useCallback((next: HazardState) => {
    setBlockedNodes(next.blockedNodes)
    setBlockedEdges(next.blockedEdges)
    setClosedExits(next.closedExits)
  }, [])

  const importText = useCallback(
    (text: string, name: string) => {
      const result = parseAndValidateBuilding(text)
      if (!result.ok) {
        // Keep any previously loaded building intact; only surface the errors.
        setValidationIssues(result.issues)
        log('import-failed', name)
        return false
      }
      setBuilding(result.building)
      setFileName(name)
      setStartId(null)
      applyHazards(hazardsFromInitialState(result.building))
      setValidationIssues([])
      log('imported', name)
      return true
    },
    [applyHazards, log],
  )

  const selectStart = useCallback(
    (id: string | null) => {
      if (id !== null) {
        const node = graph?.nodeById.get(id)
        // Guard: only unblocked rooms/junctions may become the active start.
        if (!node || node.type === 'exit' || blockedNodes.has(id)) return
      }
      setStartId(id)
      if (id !== null) log('start-selected', id)
    },
    [graph, blockedNodes, log],
  )

  const toggleNode = useCallback(
    (id: string) => {
      const node = graph?.nodeById.get(id)
      if (!node || node.type === 'exit') return
      log(blockedNodes.has(id) ? 'node-unblocked' : 'node-blocked', id)
      setBlockedNodes(toggleInSet(blockedNodes, id))
    },
    [graph, blockedNodes, log],
  )

  const toggleEdge = useCallback(
    (id: string) => {
      if (!graph?.edgeById.has(id)) return
      log(blockedEdges.has(id) ? 'edge-unblocked' : 'edge-blocked', id)
      setBlockedEdges(toggleInSet(blockedEdges, id))
    },
    [graph, blockedEdges, log],
  )

  const toggleExit = useCallback(
    (id: string) => {
      if (graph?.nodeById.get(id)?.type !== 'exit') return
      log(closedExits.has(id) ? 'exit-opened' : 'exit-closed', id)
      setClosedExits(toggleInSet(closedExits, id))
    },
    [graph, closedExits, log],
  )

  const reset = useCallback(() => {
    if (!building) return
    // The start is kept; the derived route then reflects the restored hazards
    // (including "Starting location blocked" if initial_state blocks it).
    applyHazards(hazardsFromInitialState(building))
    log('reset')
  }, [building, applyHazards, log])

  const dismissIssues = useCallback(() => setValidationIssues([]), [])

  const isInitialState = building ? matchesInitialState(building, hazards) : true

  return {
    building,
    graph,
    fileName,
    startId,
    hazards,
    route,
    validationIssues,
    events,
    isInitialState,
    importText,
    dismissIssues,
    selectStart,
    toggleNode,
    toggleEdge,
    toggleExit,
    reset,
  }
}
