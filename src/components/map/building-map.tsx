import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { Maximize2, Tag, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MapEdge, type EdgeVisualState } from '@/components/map/map-edge'
import { MapNode, type NodeVisualState } from '@/components/map/map-node'
import { MapLegend } from '@/components/map/map-legend'
import { useI18n } from '@/i18n/language-context'
import { isEdgeUsable, isNodeImpassable, type Graph } from '@/lib/graph'
import { computeMapLayout } from '@/lib/map-layout'
import type { Building, HazardState, RouteResult } from '@/types/building'

interface BuildingMapProps {
  building: Building
  graph: Graph
  hazards: HazardState
  route: RouteResult
  startId: string | null
  onNodeActivate: (id: string) => void
  onEdgeToggle: (id: string) => void
}

interface View {
  k: number
  x: number
  y: number
}

const IDENTITY: View = { k: 1, x: 0, y: 0 }
const MIN_ZOOM = 0.5
const MAX_ZOOM = 4

const clampZoom = (k: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k))

export function BuildingMap({
  building,
  graph,
  hazards,
  route,
  startId,
  onNodeActivate,
  onEdgeToggle,
}: BuildingMapProps) {
  const { t } = useI18n()
  const svgRef = useRef<SVGSVGElement>(null)
  const [view, setView] = useState<View>(IDENTITY)
  const [showLabels, setShowLabels] = useState(true)
  const drag = useRef<{ id: number; x: number; y: number } | null>(null)

  const layout = useMemo(() => computeMapLayout(building.nodes), [building.nodes])
  const { width, height, positions, radius } = layout

  const routeNodes = useMemo(
    () => new Set(route.status === 'found' ? route.path : []),
    [route],
  )
  const routeEdges = useMemo(
    () => new Set(route.status === 'found' ? route.edgeIds : []),
    [route],
  )

  /** Converts client pixels to viewBox units (accounts for SVG letterboxing). */
  const toSvgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return { x: 0, y: 0, unit: 1 }
    const point = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse())
    return { x: point.x, y: point.y, unit: 1 / ctm.a }
  }, [])

  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    setView((v) => {
      const k = clampZoom(v.k * factor)
      const ratio = k / v.k
      return { k, x: cx - (cx - v.x) * ratio, y: cy - (cy - v.y) * ratio }
    })
  }, [])

  // Non-passive wheel listener so the page does not scroll while zooming the map.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const p = toSvgPoint(event.clientX, event.clientY)
      zoomAt(event.deltaY < 0 ? 1.12 : 1 / 1.12, p.x, p.y)
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [toSvgPoint, zoomAt])

  const onPointerDown = (event: PointerEvent<SVGRectElement>) => {
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: PointerEvent<SVGRectElement>) => {
    const current = drag.current
    if (!current || current.id !== event.pointerId) return
    const { unit } = toSvgPoint(event.clientX, event.clientY)
    const dx = (event.clientX - current.x) * unit
    const dy = (event.clientY - current.y) * unit
    drag.current = { ...current, x: event.clientX, y: event.clientY }
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }))
  }
  const endDrag = () => {
    drag.current = null
  }

  const zoomCenter = (factor: number) => zoomAt(factor, width / 2, height / 2)

  const routeSignature = route.status === 'found' ? route.path.join('>') : ''
  const routePoints =
    route.status === 'found'
      ? route.path
          .map((id) => positions.get(id))
          .filter((p): p is { x: number; y: number } => p !== undefined)
          .map((p) => `${p.x},${p.y}`)
          .join(' ')
      : ''

  const stateText = (state: NodeVisualState, isStart: boolean, onRoute: boolean): string => {
    if (state === 'blocked') return t.states.blocked
    if (state === 'closed') return t.states.closed
    if (isStart) return t.states.start
    if (onRoute) return t.states.route
    return t.states.open
  }

  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-lg border bg-map-bg">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full touch-none select-none"
        role="group"
        aria-label={`${t.map.aria}: ${building.building}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="var(--map-grid)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect
          x={-width * 4}
          y={-height * 4}
          width={width * 9}
          height={height * 9}
          fill="url(#map-grid)"
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />

        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          <g aria-hidden="true">
            {building.edges.map((edge) => {
              const from = positions.get(edge.from)
              const to = positions.get(edge.to)
              if (!from || !to) return null
              const blocked = hazards.blockedEdges.has(edge.id)
              const state: EdgeVisualState = routeEdges.has(edge.id)
                ? 'route'
                : blocked
                  ? 'blocked'
                  : isEdgeUsable(edge, graph, hazards)
                    ? 'normal'
                    : 'unusable'
              const stateLabel =
                state === 'blocked'
                  ? t.states.blocked
                  : state === 'unusable'
                    ? t.states.unusable
                    : state === 'route'
                      ? t.states.route
                      : t.states.open
              return (
                <MapEdge
                  key={edge.id}
                  id={edge.id}
                  cost={edge.cost}
                  from={from}
                  to={to}
                  state={state}
                  radius={radius}
                  showCost
                  title={`${t.types.corridor} ${edge.id}: ${edge.from} ↔ ${edge.to} · ${t.map.cost} ${edge.cost} · ${stateLabel}`}
                  onToggle={onEdgeToggle}
                />
              )
            })}
          </g>

          {routePoints && (
            <g key={routeSignature} className="pointer-events-none" aria-hidden="true">
              <polyline
                points={routePoints}
                fill="none"
                stroke="var(--route)"
                strokeOpacity={0.18}
                strokeWidth={radius * 0.9}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                className="route-draw"
                pathLength={1}
                points={routePoints}
                fill="none"
                stroke="var(--route)"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          <g>
            {building.nodes.map((node) => {
              const position = positions.get(node.id)
              if (!position) return null
              const impassable = isNodeImpassable(node, hazards)
              const state: NodeVisualState = impassable
                ? node.type === 'exit'
                  ? 'closed'
                  : 'blocked'
                : 'normal'
              const isStart = node.id === startId
              const onRoute = routeNodes.has(node.id)
              return (
                <MapNode
                  key={node.id}
                  id={node.id}
                  label={node.label}
                  type={node.type}
                  position={position}
                  radius={radius}
                  state={state}
                  isStart={isStart}
                  isOnRoute={onRoute}
                  isDestination={route.status === 'found' && route.exit === node.id}
                  showLabel={showLabels}
                  ariaLabel={t.map.nodeAria(node.label, node.id, t.types[node.type], stateText(state, isStart, onRoute))}
                  startText={t.states.start.toUpperCase()}
                  interactive={node.type === 'exit' || !impassable}
                  onActivate={onNodeActivate}
                />
              )
            })}
          </g>
        </g>
      </svg>

      <div className="absolute top-3 right-3 flex flex-col gap-1 rounded-lg border bg-card/90 p-1 backdrop-blur">
        <Button variant="ghost" size="icon-sm" onClick={() => zoomCenter(1.25)} aria-label={t.map.zoomIn} title={t.map.zoomIn}>
          <ZoomIn />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => zoomCenter(1 / 1.25)} aria-label={t.map.zoomOut} title={t.map.zoomOut}>
          <ZoomOut />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => setView(IDENTITY)} aria-label={t.map.fit} title={t.map.fit}>
          <Maximize2 />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowLabels((value) => !value)}
          aria-label={t.map.labels}
          aria-pressed={showLabels}
          title={t.map.labels}
          className={showLabels ? 'text-foreground' : 'text-muted-foreground'}
        >
          <Tag />
        </Button>
      </div>

      <MapLegend />
    </div>
  )
}
