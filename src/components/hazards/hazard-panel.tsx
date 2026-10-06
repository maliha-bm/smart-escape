import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Search, ShieldAlert } from 'lucide-react'
import { EdgeHazardControls } from '@/components/hazards/edge-hazard-controls'
import { ExitHazardControls } from '@/components/hazards/exit-hazard-controls'
import { NodeHazardControls } from '@/components/hazards/node-hazard-controls'
import { useI18n } from '@/i18n/language-context'
import { compareIds } from '@/lib/tie-breaking'
import { cn } from '@/lib/utils'
import type { Building, HazardState, RouteResult } from '@/types/building'

type Tab = 'nodes' | 'corridors' | 'exits'
const TABS: Tab[] = ['nodes', 'corridors', 'exits']

interface HazardPanelProps {
  building: Building
  hazards: HazardState
  route: RouteResult
  onToggleNode: (id: string) => void
  onToggleEdge: (id: string) => void
  onToggleExit: (id: string) => void
}

const matches = (query: string, ...fields: string[]) =>
  query === '' || fields.some((field) => field.toLowerCase().includes(query))

export function HazardPanel({ building, hazards, route, onToggleNode, onToggleEdge, onToggleExit }: HazardPanelProps) {
  const { t } = useI18n()
  const baseId = useId()
  const [tab, setTab] = useState<Tab>('nodes')
  const [query, setQuery] = useState('')
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ nodes: null, corridors: null, exits: null })

  const q = query.trim().toLowerCase()

  const sorted = useMemo(() => {
    const byId = <T extends { id: string }>(a: T, b: T) => compareIds(a.id, b.id)
    return {
      nodes: building.nodes.filter((n) => n.type !== 'exit').sort(byId),
      exits: building.nodes.filter((n) => n.type === 'exit').sort(byId),
      edges: [...building.edges].sort(byId),
    }
  }, [building])

  const routeNodes = useMemo(() => new Set(route.status === 'found' ? route.path : []), [route])
  const routeEdges = useMemo(() => new Set(route.status === 'found' ? route.edgeIds : []), [route])

  const counts: Record<Tab, number> = {
    nodes: hazards.blockedNodes.size,
    corridors: hazards.blockedEdges.size,
    exits: hazards.closedExits.size,
  }

  const visibleNodes = sorted.nodes.filter((n) => matches(q, n.id, n.label))
  const visibleEdges = sorted.edges.filter((e) => matches(q, e.id, e.from, e.to))
  const visibleExits = sorted.exits.filter((n) => matches(q, n.id, n.label))
  const visibleCount = tab === 'nodes' ? visibleNodes.length : tab === 'corridors' ? visibleEdges.length : visibleExits.length

  // Roving arrow-key navigation for the tablist (WAI-ARIA tabs pattern).
  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = TABS.indexOf(tab)
    let next: Tab | null = null
    if (event.key === 'ArrowRight') next = TABS[(index + 1) % TABS.length]
    if (event.key === 'ArrowLeft') next = TABS[(index - 1 + TABS.length) % TABS.length]
    if (event.key === 'Home') next = TABS[0]
    if (event.key === 'End') next = TABS[TABS.length - 1]
    if (next) {
      event.preventDefault()
      setTab(next)
      tabRefs.current[next]?.focus()
    }
  }

  return (
    <section aria-labelledby={`${baseId}-heading`} className="flex min-h-0 flex-1 flex-col">
      <div className="border-b p-4 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-hazard" aria-hidden="true" />
          <h2 id={`${baseId}-heading`} className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t.hazards.heading}
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{t.hazards.description}</p>

        <div role="tablist" aria-label={t.hazards.heading} className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-background p-1">
          {TABS.map((key) => (
            <button
              key={key}
              ref={(el) => {
                tabRefs.current[key] = el
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`${baseId}-panel`}
              tabIndex={tab === key ? 0 : -1}
              onClick={() => setTab(key)}
              onKeyDown={onTabKeyDown}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                tab === key ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span className="truncate">{t.hazards.tabs[key]}</span>
              {counts[key] > 0 && (
                <span
                  className="rounded-full bg-hazard/20 px-1.5 text-[10px] font-semibold text-hazard"
                  aria-label={t.hazards.activeCount(counts[key])}
                >
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative mt-2">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.hazards.search}
            aria-label={t.hazards.search}
            className="h-8 w-full rounded-lg border border-input bg-background pr-2 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${tab}`}
        className="min-h-0 flex-1 overflow-y-auto p-2"
      >
        {tab === 'exits' && sorted.exits.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">{t.hazards.noExits}</p>
        ) : visibleCount === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">{t.hazards.noMatches}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {tab === 'nodes' && (
              <NodeHazardControls nodes={visibleNodes} blockedNodes={hazards.blockedNodes} routeNodes={routeNodes} onToggle={onToggleNode} />
            )}
            {tab === 'corridors' && (
              <EdgeHazardControls edges={visibleEdges} blockedEdges={hazards.blockedEdges} routeEdges={routeEdges} onToggle={onToggleEdge} />
            )}
            {tab === 'exits' && (
              <ExitHazardControls
                exits={visibleExits}
                closedExits={hazards.closedExits}
                destination={route.status === 'found' ? route.exit : null}
                onToggle={onToggleExit}
              />
            )}
          </ul>
        )}
      </div>
    </section>
  )
}
