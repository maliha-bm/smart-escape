import { TriangleAlert, X } from 'lucide-react'
import { useI18n } from '@/i18n/language-context'
import type { ValidationIssue } from '@/types/building'

const MAX_VISIBLE = 8

interface ValidationErrorsProps {
  issues: ValidationIssue[]
  /** Optional extra message that is not a schema issue (e.g. the sample could not be fetched). */
  message?: string | null
  onDismiss: () => void
}

export function ValidationErrors({ issues, message, onDismiss }: ValidationErrorsProps) {
  const { t } = useI18n()
  if (issues.length === 0 && !message) return null

  const visible = issues.slice(0, MAX_VISIBLE)
  const hidden = issues.length - visible.length

  return (
    <div role="alert" className="fade-in-up m-4 mb-0 rounded-lg border border-hazard/40 bg-hazard/10 p-3">
      <div className="flex items-start gap-2">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-hazard" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-hazard">{t.errors.title}</p>
          {issues.length > 0 && <p className="mt-0.5 text-xs text-foreground/80">{t.errors.description}</p>}
          {message && <p className="mt-0.5 text-xs text-foreground/80">{message}</p>}
          {visible.length > 0 && (
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-xs text-foreground">
              {visible.map((issue, index) => (
                <li key={`${issue.code}-${index}`} className="break-words">
                  {t.errors.codes[issue.code](issue.params)}
                </li>
              ))}
            </ul>
          )}
          {hidden > 0 && <p className="mt-1 text-xs text-muted-foreground">{t.errors.more(hidden)}</p>}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t.errors.dismiss}
          className="rounded-md p-1 text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
