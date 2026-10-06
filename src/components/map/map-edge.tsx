import { memo } from 'react'
import type { Point } from '@/lib/map-layout'

export type EdgeVisualState = 'normal' | 'route' | 'blocked' | 'unusable'

interface MapEdgeProps {
  id: string
  cost: number
  from: Point
  to: Point
  state: EdgeVisualState
  radius: number
  showCost: boolean
  title: string
  onToggle: (id: string) => void
}

const STROKE: Record<EdgeVisualState, string> = {
  normal: 'var(--corridor)',
  route: 'var(--route)',
  blocked: 'var(--hazard)',
  unusable: 'var(--corridor)',
}

function MapEdgeComponent({ id, cost, from, to, state, radius, showCost, title, onToggle }: MapEdgeProps) {
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  const fontSize = Math.max(9, radius * 0.62)
  const labelWidth = Math.max(fontSize * 1.9, String(cost).length * fontSize * 0.62 + fontSize)
  const labelHeight = fontSize * 1.5
  const isBlocked = state === 'blocked'
  const cross = fontSize * 0.45

  return (
    <g
      className="cursor-pointer"
      onClick={() => onToggle(id)}
      data-edge={id}
      opacity={state === 'unusable' ? 0.35 : 1}
    >
      <title>{title}</title>
      {/* Wide invisible hit target */}
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="transparent" strokeWidth={14} />
      <line
        className="map-transition"
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={STROKE[state]}
        strokeWidth={state === 'route' ? 2 : 2.5}
        strokeOpacity={state === 'route' ? 0.35 : 1}
        strokeDasharray={isBlocked ? '7 6' : state === 'unusable' ? '3 5' : undefined}
        strokeLinecap="round"
      />
      {showCost && (
        <g className="map-transition">
          <rect
            x={mx - labelWidth / 2}
            y={my - labelHeight / 2}
            width={labelWidth}
            height={labelHeight}
            rx={labelHeight / 2}
            fill={isBlocked ? '#2a1214' : state === 'route' ? '#0c2416' : '#111821'}
            stroke={STROKE[state]}
            strokeWidth={1}
          />
          {isBlocked ? (
            <path
              d={`M${mx - cross} ${my - cross} L${mx + cross} ${my + cross} M${mx + cross} ${my - cross} L${mx - cross} ${my + cross}`}
              stroke="var(--hazard)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          ) : (
            <text
              x={mx}
              y={my}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize}
              fontWeight={600}
              fill={state === 'route' ? 'var(--route)' : '#c3cedb'}
              className="select-none font-mono"
            >
              {cost}
            </text>
          )}
        </g>
      )}
    </g>
  )
}

export const MapEdge = memo(MapEdgeComponent)
