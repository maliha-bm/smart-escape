import { ArrowRight, Ban, CircleCheck, CircleDashed, DoorOpen, Navigation, OctagonX } from 'lucide-react'
import type { ReactNode } from 'react'
import { PanelSection } from '@/components/panel-section'
import { useI18n } from '@/i18n/language-context'
import type { Translation } from '@/i18n/translations'
import { cn } from '@/lib/utils'
import type { RouteResult } from '@/types/building'

interface RoutePanelProps {
  route: RouteResult
}

type Tone = 'ok' | 'danger' | 'warn' | 'idle'

export interface RouteStatusView {
  tone: Tone
  title: string
  detail: string
}

/** Single source of truth for how a RouteResult is described (used by RoutePanel and StatusBar). */
export function describeRoute(route: RouteResult, t: Translation): RouteStatusView {
  switch (route.status) {
    case 'found':
      return { tone: 'ok', title: t.route.statusFound, detail: `${route.path.join(' → ')}` }
    case 'no-route':
      return { tone: 'danger', title: t.route.noRoute, detail: t.route.noRouteReasons[route.reason] }
    case 'start-blocked':
      return { tone: 'warn', title: t.route.startBlocked, detail: t.route.startBlockedDetail(route.start) }
    case 'no-start':
      return { tone: 'idle', title: t.route.statusNoStart, detail: t.route.noStartDetail }
    case 'no-building':
      return { tone: 'idle', title: t.route.statusNoBuilding, detail: '' }
  }
}

export const TONE_CLASSES: Record<Tone, string> = {
  ok: 'border-route/40 bg-route/10 text-route',
  danger: 'border-hazard/40 bg-hazard/10 text-hazard',
  warn: 'border-start/40 bg-start/10 text-start',
  idle: 'border-border bg-muted/40 text-muted-foreground',
}

const TONE_ICONS: Record<Tone, ReactNode> = {
  ok: <CircleCheck />,
  danger: <OctagonX />,
  warn: <Ban />,
  idle: <CircleDashed />,
}

export function RoutePanel({ route }: RoutePanelProps) {
  const { t } = useI18n()
  const view = describeRoute(route, t)

  return (
    <PanelSection title={t.route.heading} icon={<Navigation />}>
      <div
        key={`${route.status}-${route.status === 'found' ? route.path.join('>') : ''}`}
        role="status"
        aria-live="polite"
        className="fade-in-up flex flex-col gap-3"
      >
        <div className={cn('flex items-start gap-2 rounded-lg border px-3 py-2.5', TONE_CLASSES[view.tone])}>
          <span className="mt-0.5 shrink-0 [&_svg]:size-4" aria-hidden="true">
            {TONE_ICONS[view.tone]}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{view.title}</p>
            {route.status !== 'found' && view.detail && (
              <p className="mt-0.5 text-xs text-foreground/80">{view.detail}</p>
            )}
          </div>
        </div>

        {route.status === 'found' && (
          <>
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">{t.route.sequence}</p>
              <ol className="flex flex-wrap items-center gap-1" aria-label={`${t.route.sequence}: ${route.path.join(', ')}`}>
                {route.path.map((id, index) => {
                  const isFirst = index === 0
                  const isLast = index === route.path.length - 1
                  return (
                    <li key={`${id}-${index}`} className="flex items-center gap-1">
                      <span
                        className={cn(
                          'rounded-md border px-1.5 py-0.5 font-mono text-xs font-semibold',
                          isFirst && 'border-start/50 bg-start/10 text-start',
                          isLast && 'border-route/50 bg-route/15 text-route',
                          !isFirst && !isLast && 'bg-secondary text-foreground',
                        )}
                      >
                        {id}
                      </span>
                      {!isLast && <ArrowRight className="size-3 text-muted-foreground" aria-hidden="true" />}
                    </li>
                  )
                })}
              </ol>
            </div>

            <dl className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border bg-background px-3 py-2">
                <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DoorOpen className="size-3.5" aria-hidden="true" />
                  {t.route.exit}
                </dt>
                <dd className="mt-0.5 font-mono text-lg font-semibold text-route">{route.exit}</dd>
              </div>
              <div className="rounded-lg border bg-background px-3 py-2">
                <dt className="text-xs text-muted-foreground">{t.route.totalCost}</dt>
                <dd className="mt-0.5 font-mono text-lg font-semibold">{route.cost}</dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground">{t.route.corridors(route.edgeIds.length)}</p>
          </>
        )}
      </div>
    </PanelSection>
  )
}
