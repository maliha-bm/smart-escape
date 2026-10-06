import { CircleDot, Square } from 'lucide-react'
import { HazardRow } from '@/components/hazards/hazard-row'
import { useI18n } from '@/i18n/language-context'
import type { BuildingNode } from '@/types/building'

interface NodeHazardControlsProps {
  nodes: readonly BuildingNode[]
  blockedNodes: ReadonlySet<string>
  routeNodes: ReadonlySet<string>
  onToggle: (id: string) => void
}

export function NodeHazardControls({ nodes, blockedNodes, routeNodes, onToggle }: NodeHazardControlsProps) {
  const { t } = useI18n()
  return (
    <>
      {nodes.map((node) => {
        const blocked = blockedNodes.has(node.id)
        return (
          <HazardRow
            key={node.id}
            id={node.id}
            primary={
              <>
                <span className="font-mono">{node.id}</span>
                <span className="text-muted-foreground"> · {node.label}</span>
              </>
            }
            secondary={t.types[node.type]}
            icon={node.type === 'room' ? <Square /> : <CircleDot />}
            active={blocked}
            variant="blocked"
            stateLabel={blocked ? t.states.blocked : t.states.open}
            actionLabel={blocked ? t.hazards.unblock : t.hazards.block}
            actionAria={blocked ? t.hazards.unblockAria(node.id) : t.hazards.blockAria(node.id)}
            highlight={routeNodes.has(node.id)}
            onToggle={onToggle}
          />
        )
      })}
    </>
  )
}
