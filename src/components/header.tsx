import { Building2, RotateCcw, Siren } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageToggle } from '@/components/language-toggle'
import { useI18n } from '@/i18n/language-context'

interface HeaderProps {
  buildingName: string | null
  canReset: boolean
  isInitialState: boolean
  onReset: () => void
}

export function Header({ buildingName, canReset, isInitialState, onReset }: HeaderProps) {
  const { t } = useI18n()

  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b bg-card px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-md bg-hazard/15 text-hazard" aria-hidden="true">
          <Siren className="size-5" />
        </div>
        <div className="leading-tight">
          <h1 className="text-base font-semibold tracking-tight">{t.app.title}</h1>
          <p className="text-xs text-muted-foreground">{t.app.subtitle}</p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2 border-l pl-4 max-sm:order-last max-sm:basis-full max-sm:border-l-0 max-sm:pl-0">
        <Building2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="text-xs text-muted-foreground">{t.app.buildingLabel}:</span>
        <span className="truncate text-sm font-medium" title={buildingName ?? undefined}>
          {buildingName ?? <span className="text-muted-foreground">{t.app.noBuilding}</span>}
        </span>
        {buildingName && (
          <span
            className={`ml-1 hidden shrink-0 rounded-full border px-2 py-0.5 text-[11px] sm:inline ${
              isInitialState ? 'text-muted-foreground' : 'border-start/40 text-start'
            }`}
          >
            {isInitialState ? t.app.atInitialState : t.app.modified}
          </span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <LanguageToggle />
        <Button
          variant="destructive"
          onClick={onReset}
          disabled={!canReset}
          aria-label={t.app.resetAria}
          title={t.app.resetAria}
          className="h-8 border-hazard/40 px-3 font-semibold"
        >
          <RotateCcw data-icon="inline-start" />
          {t.app.reset}
        </Button>
      </div>
    </header>
  )
}
