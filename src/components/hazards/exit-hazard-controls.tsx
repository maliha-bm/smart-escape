import { DoorOpen } from 'lucide-react'
import { HazardRow } from '@/components/hazards/hazard-row'
import { useI18n } from '@/i18n/language-context'
import type { BuildingNode } from '@/types/building'

interface ExitHazardControlsProps {
  exits: readonly BuildingNode[]
  closedExits: ReadonlySet<string>
  destination: string | null
  onToggle: (id: string) => void
}

export function ExitHazardControls({ exits, closedExits, destination, onToggle }: ExitHazardControlsProps) {
  const { t } = useI18n()
  return (
    <>
      {exits.map((exit) => {
        const closed = closedExits.has(exit.id)
        return (
          <HazardRow
            key={exit.id}
            id={exit.id}
            primary={
              <>
                <span className="font-mono">{exit.id}</span>
                <span className="text-muted-foreground"> · {exit.label}</span>
              </>
            }
            secondary={exit.id === destination ? `${t.types.exit} · ${t.states.route}` : t.types.exit}
            icon={<DoorOpen />}
            active={closed}
            variant="closed"
            stateLabel={closed ? t.states.closed : t.states.open}
            actionLabel={closed ? t.hazards.reopen : t.hazards.close}
            actionAria={closed ? t.hazards.reopenAria(exit.id) : t.hazards.closeAria(exit.id)}
            highlight={exit.id === destination}
            onToggle={onToggle}
          />
        )
      })}
    </>
  )
}
