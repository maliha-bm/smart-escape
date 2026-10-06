import { Activity, History, ShieldCheck } from 'lucide-react'
import { describeRoute, TONE_CLASSES } from '@/components/route-panel'
import { useI18n } from '@/i18n/language-context'
import { cn } from '@/lib/utils'
import type { AppEvent, RouteResult } from '@/types/building'

interface StatusBarProps {
  route: RouteResult
  hasBuilding: boolean
  issueCount: number
  events: AppEvent[]
}

export function StatusBar({ route, hasBuilding, issueCount, events }: StatusBarProps) {
  const { t, language } = useI18n()
  const view = describeRoute(route, t)
  const latest = events[0]

  const validationText =
    issueCount > 0 ? t.statusBar.validationFailed(issueCount) : hasBuilding ? t.statusBar.validationOk : t.statusBar.validationNone

  const time = latest
    ? new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(latest.time)
    : ''

  return (
    <footer className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t bg-card px-4 py-2 text-xs">
      <div className="flex min-w-0 items-center gap-2">
        <Activity className="size-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="text-muted-foreground">{t.statusBar.status}:</span>
        <span className={cn('rounded-full border px-2 py-0.5 font-medium', TONE_CLASSES[view.tone])}>{view.title}</span>
        {route.status === 'found' && (
          <span className="hidden truncate font-mono text-muted-foreground md:inline">
            {view.detail} · {t.route.totalCost} {route.cost}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ShieldCheck className="size-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="text-muted-foreground">{t.statusBar.validation}:</span>
        <span className={cn('font-medium', issueCount > 0 ? 'text-hazard' : hasBuilding ? 'text-route' : 'text-muted-foreground')}>
          {validationText}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2 sm:justify-end" role="log" aria-live="polite" aria-label={t.statusBar.updates}>
        <History className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="text-muted-foreground">{t.statusBar.updates}:</span>
        {latest ? (
          <span key={latest.id} className="fade-in-up truncate">
            <span className="font-mono text-muted-foreground">{time}</span> {t.statusBar.events[latest.kind](latest.target ?? '')}
          </span>
        ) : (
          <span className="text-muted-foreground">{t.statusBar.noUpdates}</span>
        )}
      </div>
    </footer>
  )
}
