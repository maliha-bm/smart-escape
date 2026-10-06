import { useId } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import { PanelSection } from '@/components/panel-section'
import { useI18n } from '@/i18n/language-context'
import { compareIds } from '@/lib/tie-breaking'
import type { BuildingNode } from '@/types/building'

interface StartSelectorProps {
  nodes: readonly BuildingNode[]
  blockedNodes: ReadonlySet<string>
  startId: string | null
  onSelect: (id: string | null) => void
}

export function StartSelector({ nodes, blockedNodes, startId, onSelect }: StartSelectorProps) {
  const { t } = useI18n()
  const selectId = useId()
  const hintId = useId()

  const candidates = nodes
    .filter((node) => node.type !== 'exit')
    .sort((a, b) => (a.type === b.type ? compareIds(a.id, b.id) : a.type === 'room' ? -1 : 1))
  const rooms = candidates.filter((node) => node.type === 'room')
  const junctions = candidates.filter((node) => node.type === 'junction')

  const renderOption = (node: BuildingNode) => {
    const blocked = blockedNodes.has(node.id)
    // A currently-selected start that became blocked stays visible (so the select reflects state),
    // but blocked options can never be newly chosen.
    return (
      <option key={node.id} value={node.id} disabled={blocked && node.id !== startId}>
        {node.id} — {node.label}
        {blocked ? ` (${t.start.blockedSuffix})` : ''}
      </option>
    )
  }

  return (
    <PanelSection title={t.start.heading} icon={<MapPin />}>
      <label htmlFor={selectId} className="sr-only">
        {t.start.heading}
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-describedby={hintId}
          value={startId ?? ''}
          onChange={(event) => onSelect(event.target.value === '' ? null : event.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-input bg-background pr-8 pl-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">{t.start.placeholder}</option>
          {rooms.length > 0 && <optgroup label={t.types.room}>{rooms.map(renderOption)}</optgroup>}
          {junctions.length > 0 && <optgroup label={t.types.junction}>{junctions.map(renderOption)}</optgroup>}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      </div>
      <p id={hintId} className="mt-2 text-xs text-muted-foreground">
        {t.start.hint} {t.start.mapHint}
      </p>
    </PanelSection>
  )
}
