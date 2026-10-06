import { useRef, useState, type ChangeEvent } from 'react'
import { Download, FileJson, FlaskConical, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PanelSection } from '@/components/panel-section'
import { useI18n } from '@/i18n/language-context'
import { SAMPLE_URL } from '@/lib/sample'

interface FileImporterProps {
  fileName: string | null
  onImport: (text: string, fileName: string) => void
  onLoadSample: () => Promise<void>
}

export function FileImporter({ fileName, onImport, onLoadSample }: FileImporterProps) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Clear the value so re-importing the same file still triggers onChange.
    event.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      onImport(await file.text(), file.name)
    } catch {
      // Unreadable file: feed empty text so validation reports a parse error instead of crashing.
      onImport('', file.name)
    } finally {
      setBusy(false)
    }
  }

  const handleSample = async () => {
    setBusy(true)
    try {
      await onLoadSample()
    } finally {
      setBusy(false)
    }
  }

  return (
    <PanelSection title={t.importer.heading} icon={<FileJson />}>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleFile}
      />
      <Button className="h-9 w-full font-semibold" onClick={() => inputRef.current?.click()} disabled={busy}>
        <Upload data-icon="inline-start" />
        {busy ? t.importer.loading : t.importer.button}
      </Button>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={handleSample} disabled={busy}>
          <FlaskConical data-icon="inline-start" />
          {t.importer.loadSample}
        </Button>
        <a
          href={SAMPLE_URL}
          download="building.json"
          className="inline-flex h-7 items-center justify-center gap-1 rounded-md border border-border bg-background px-2 text-[0.8rem] font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
          title={t.importer.downloadSample}
        >
          <Download className="size-3.5 shrink-0" aria-hidden="true" />
          <span aria-hidden="true">JSON</span>
          <span className="sr-only">{t.importer.downloadSample}</span>
        </a>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {fileName ? <span className="font-medium text-foreground">{t.importer.loaded(fileName)}</span> : t.importer.hint}
      </p>
    </PanelSection>
  )
}
