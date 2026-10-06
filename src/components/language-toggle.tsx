import { Languages } from 'lucide-react'
import { useI18n } from '@/i18n/language-context'
import { translations, type Language } from '@/i18n/translations'
import { cn } from '@/lib/utils'

const LANGUAGES: Language[] = ['en', 'bn']

export function LanguageToggle() {
  const { language, setLanguage, t } = useI18n()

  return (
    <div role="group" aria-label={t.app.languageToggle} className="flex items-center gap-1 rounded-lg border bg-background p-0.5">
      <Languages className="mx-1 size-3.5 text-muted-foreground" aria-hidden="true" />
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={language === code}
          onClick={() => setLanguage(code)}
          className={cn(
            'rounded-md px-2 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
            language === code ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {translations[code].languageName}
        </button>
      ))}
    </div>
  )
}
