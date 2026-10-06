import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
import { LanguageProvider } from '@/i18n/language-context'
import '@/index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

createRoot(root).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
