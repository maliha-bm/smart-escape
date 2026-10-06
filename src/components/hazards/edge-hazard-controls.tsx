import { Waypoints } from 'lucide-react'
import { HazardRow } from '@/components/hazards/hazard-row'
import { useI18n } from '@/i18n/language-context'
import type { BuildingEdge } from '@/types/building'

interface EdgeHazardControlsProps {
  edges: readonly BuildingEdge[]
  blockedEdges: ReadonlySet<string>
  routeEdges: ReadonlySet<string>
  onToggle: (id: string) => void
}

export function EdgeHazardControls({ edges, blockedEdges, routeEdges, onToggle }: EdgeHazardControlsProps) {
  const { t } = useI18n()
  return (
    <>
      {edges.map((edge) => {
        const blocked = blockedEdges.has(edge.id)
        return (
          <HazardRow
            key={edge.id}
            id={edge.id}
            primary={
              <span className="font-mono">
                {edge.id}
                <span className="text-muted-foreground">
                  {' '}
                  · {edge.from} ↔ {edge.to}
                </span>
              </span>
            }
            secondary={`${t.types.corridor} · ${t.map.cost} ${edge.cost}`}
            icon={<Waypoints />}
            active={blocked}
            variant="blocked"
            stateLabel={blocked ? t.states.blocked : t.states.open}
            actionLabel={blocked ? t.hazards.unblock : t.hazards.block}
            actionAria={blocked ? t.hazards.unblockAria(edge.id) : t.hazards.blockAria(edge.id)}
            highlight={routeEdges.has(edge.id)}
            onToggle={onToggle}
          />
        )
      })}
    </>
  )
}
