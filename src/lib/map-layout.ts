import type { BuildingNode } from '@/types/building'

export interface Point {
  x: number
  y: number
}

export interface MapLayout {
  width: number
  height: number
  /** Screen-space position for every node, in viewBox units. */
  positions: ReadonlyMap<string, Point>
  /** Base node radius, adapted to node density so 60-node graphs stay readable. */
  radius: number
}

const LAYOUT_WIDTH = 1000
const PADDING = 70

/**
 * Normalises dataset coordinates into a fixed viewBox for DISPLAY ONLY.
 * Coordinates are never used for routing cost.
 */
export function computeMapLayout(nodes: readonly BuildingNode[]): MapLayout {
  if (nodes.length === 0) {
    return { width: LAYOUT_WIDTH, height: 600, positions: new Map(), radius: 16 }
  }

  const xs = nodes.map((n) => n.x)
  const ys = nodes.map((n) => n.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const spanX = maxX - minX
  const spanY = maxY - minY
  const span = Math.max(spanX, spanY, 1)

  const inner = LAYOUT_WIDTH - PADDING * 2
  const scale = inner / span
  const width = LAYOUT_WIDTH
  // Keep aspect ratio but never let the canvas collapse for flat (single-row) layouts.
  const height = Math.max(spanY * scale + PADDING * 2, 360)
  const offsetX = (width - spanX * scale) / 2
  const offsetY = (height - spanY * scale) / 2

  const positions = new Map<string, Point>()
  for (const node of nodes) {
    positions.set(node.id, {
      x: offsetX + (node.x - minX) * scale,
      y: offsetY + (node.y - minY) * scale,
    })
  }

  // Shrink nodes when they are packed closely together.
  let minDistance = Infinity
  const points = [...positions.values()]
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y)
      if (d > 0 && d < minDistance) minDistance = d
    }
  }
  const radius = Number.isFinite(minDistance) ? Math.max(9, Math.min(20, minDistance * 0.32)) : 20

  return { width, height, positions, radius }
}
