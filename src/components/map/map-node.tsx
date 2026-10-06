import { memo, type KeyboardEvent } from 'react'
import type { Point } from '@/lib/map-layout'
import type { NodeType } from '@/types/building'

export type NodeVisualState = 'normal' | 'blocked' | 'closed'

interface MapNodeProps {
  id: string
  label: string
  type: NodeType
  position: Point
  radius: number
  state: NodeVisualState
  isStart: boolean
  isOnRoute: boolean
  isDestination: boolean
  showLabel: boolean
  ariaLabel: string
  startText: string
  interactive: boolean
  onActivate: (id: string) => void
}

/** Outline path for each node type — shape (not only colour) identifies the type. */
function shapePath(type: NodeType, x: number, y: number, r: number): string {
  if (type === 'junction') {
    const jr = r * 0.72
    return `M${x - jr} ${y} a${jr} ${jr} 0 1 0 ${jr * 2} 0 a${jr} ${jr} 0 1 0 ${-jr * 2} 0Z`
  }
  if (type === 'exit') {
    // Hexagon
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i
      return `${x + r * 1.08 * Math.cos(a)},${y + r * 1.08 * Math.sin(a)}`
    })
    return `M${pts.join(' L')}Z`
  }
  // Room: rounded square
  const s = r * 0.92
  const c = r * 0.3
  return `M${x - s + c} ${y - s} H${x + s - c} Q${x + s} ${y - s} ${x + s} ${y - s + c} V${y + s - c} Q${x + s} ${y + s} ${x + s - c} ${y + s} H${x - s + c} Q${x - s} ${y + s} ${x - s} ${y + s - c} V${y - s + c} Q${x - s} ${y - s} ${x - s + c} ${y - s}Z`
}

const FILL: Record<NodeType, string> = {
  room: '#1b2a3d',
  junction: '#1a2330',
  exit: '#0d2a1f',
}

function MapNodeComponent({
  id,
  label,
  type,
  position,
  radius,
  state,
  isStart,
  isOnRoute,
  isDestination,
  showLabel,
  ariaLabel,
  startText,
  interactive,
  onActivate,
}: MapNodeProps) {
  const { x, y } = position
  const d = shapePath(type, x, y, radius)
  const impassable = state !== 'normal'

  let stroke = type === 'exit' ? 'var(--exit)' : '#5b6f88'
  let fill = FILL[type]
  if (state === 'blocked') {
    stroke = 'var(--hazard)'
    fill = '#2a1214'
  } else if (state === 'closed') {
    stroke = '#6b7787'
    fill = '#161c24'
  } else if (isStart) {
    stroke = 'var(--start)'
  } else if (isOnRoute) {
    stroke = 'var(--route)'
  }

  const fontSize = Math.max(8, radius * (id.length > 3 ? 0.5 : 0.62))
  const cross = radius * 0.55

  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onActivate(id)
    }
  }

  return (
    <g
      className="map-node cursor-pointer"
      role="button"
      tabIndex={interactive ? 0 : -1}
      aria-label={ariaLabel}
      aria-pressed={type === 'exit' ? undefined : isStart}
      onClick={() => onActivate(id)}
      onKeyDown={handleKeyDown}
      data-node={id}
    >
      <title>{ariaLabel}</title>
      {/* Focus ring (shown via CSS on :focus-visible) */}
      <circle className="focus-ring" cx={x} cy={y} r={radius * 1.45} fill="none" stroke="transparent" opacity={0} />

      {isDestination && (
        <circle
          key={`dest-${id}`}
          className="ring-expand"
          cx={x}
          cy={y}
          r={radius * 1.2}
          fill="none"
          stroke="var(--route)"
          strokeWidth={2}
        />
      )}

      {isStart && (
        <circle cx={x} cy={y} r={radius * 1.35} fill="none" stroke="var(--start)" strokeWidth={1.5} strokeDasharray="3 3" />
      )}

      <path
        key={`${state}-${isStart}`}
        className="map-transition node-pop"
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={isStart || isOnRoute || impassable ? 2.5 : 1.75}
        strokeDasharray={state === 'closed' ? '4 3' : undefined}
      />

      {impassable ? (
        <path
          d={`M${x - cross} ${y - cross} L${x + cross} ${y + cross} M${x + cross} ${y - cross} L${x - cross} ${y + cross}`}
          stroke={state === 'blocked' ? 'var(--hazard)' : '#8a96a6'}
          strokeWidth={2.25}
          strokeLinecap="round"
        />
      ) : (
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight={700}
          fill={type === 'exit' ? 'var(--exit)' : '#e6edf3'}
          className="pointer-events-none select-none"
        >
          {id}
        </text>
      )}

      {showLabel && (
        <text
          x={x}
          y={y + radius * 1.55 + 6}
          textAnchor="middle"
          fontSize={Math.max(9, radius * 0.6)}
          fill={impassable ? '#8a96a6' : '#a9b6c6'}
          className="pointer-events-none select-none"
          paintOrder="stroke"
          stroke="var(--map-bg)"
          strokeWidth={3}
        >
          {impassable ? `${id} · ${label}` : label}
        </text>
      )}

      {isStart && (
        <g className="pointer-events-none">
          <rect
            x={x - radius * 1.5}
            y={y - radius * 2.55}
            width={radius * 3}
            height={radius * 0.95}
            rx={radius * 0.3}
            fill="var(--start)"
          />
          <text
            x={x}
            y={y - radius * 2.075}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.max(7, radius * 0.5)}
            fontWeight={700}
            fill="#1a1204"
            className="select-none"
          >
            {startText}
          </text>
        </g>
      )}
    </g>
  )
}

export const MapNode = memo(MapNodeComponent)
