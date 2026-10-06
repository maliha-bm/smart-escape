import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { translations, type Language, type Translation } from '@/i18n/translations'

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: Translation
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(
    () => ({ language, setLanguage, t: translations[language] }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useI18n(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useI18n must be used within a LanguageProvider')
  return context
}
