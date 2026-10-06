import { FlaskConical, Route } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/language-context'

interface EmptyStateProps {
  onLoadSample: () => void
}

export function EmptyState({ onLoadSample }: EmptyStateProps) {
  const { t } = useI18n()
  return (
    <div className="flex h-full min-h-[420px] items-center justify-center rounded-lg border border-dashed bg-map-bg p-6">
      <div className="fade-in-up max-w-md text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-route/30 bg-route/10 text-route">
          <Route className="size-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-balance">{t.empty.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">{t.empty.description}</p>
        <ol className="mt-5 flex flex-col gap-2 text-left">
          {t.empty.steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3 rounded-lg border bg-card px-3 py-2.5 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <Button className="mt-5" onClick={onLoadSample}>
          <FlaskConical data-icon="inline-start" />
          {t.importer.loadSample}
        </Button>
      </div>
    </div>
  )
}
