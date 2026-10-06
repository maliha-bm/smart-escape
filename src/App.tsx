import { useCallback, useState } from 'react'
import { EmptyState } from '@/components/empty-state'
import { FileImporter } from '@/components/file-importer'
import { Header } from '@/components/header'
import { HazardPanel } from '@/components/hazards/hazard-panel'
import { BuildingMap } from '@/components/map/building-map'
import { RoutePanel } from '@/components/route-panel'
import { StartSelector } from '@/components/start-selector'
import { StatusBar } from '@/components/status-bar'
import { ValidationErrors } from '@/components/validation-errors'
import { useEvacuationSimulator } from '@/hooks/use-evacuation-simulator'
import { useI18n } from '@/i18n/language-context'
import { fetchSampleText } from '@/lib/sample'

export default function App() {
  const { t } = useI18n()
  const sim = useEvacuationSimulator()
  const [sampleFailed, setSampleFailed] = useState(false)

  const { building, graph, hazards, route, startId } = sim
  const { importText, dismissIssues, selectStart, toggleExit } = sim

  const handleImport = useCallback(
    (text: string, fileName: string) => {
      setSampleFailed(false)
      importText(text, fileName)
    },
    [importText],
  )

  const loadSample = useCallback(async () => {
    try {
      handleImport(await fetchSampleText(), 'building.json')
    } catch {
      setSampleFailed(true)
    }
  }, [handleImport])

  // Map interaction: rooms/junctions set the start, exits toggle open/closed.
  const handleNodeActivate = useCallback(
    (id: string) => {
      const node = graph?.nodeById.get(id)
      if (!node) return
      if (node.type === 'exit') toggleExit(id)
      else selectStart(id)
    },
    [graph, selectStart, toggleExit],
  )

  const dismissErrors = useCallback(() => {
    setSampleFailed(false)
    dismissIssues()
  }, [dismissIssues])

  return (
    <div className="flex h-dvh flex-col overflow-hidden max-lg:h-auto max-lg:min-h-dvh max-lg:overflow-visible">
      <Header
        buildingName={building?.building ?? null}
        canReset={building !== null}
        isInitialState={sim.isInitialState}
        onReset={sim.reset}
      />

      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)_340px]">
        <aside className="flex min-h-0 flex-col overflow-y-auto border-b bg-card lg:border-r lg:border-b-0" aria-label={t.route.heading}>
          <FileImporter fileName={sim.fileName} onImport={handleImport} onLoadSample={loadSample} />
          {building && (
            <>
              <StartSelector
                nodes={building.nodes}
                blockedNodes={hazards.blockedNodes}
                startId={startId}
                onSelect={selectStart}
              />
              <RoutePanel route={route} />
            </>
          )}
        </aside>

        <div className="flex min-h-0 flex-col max-lg:min-h-[70vh]">
          <ValidationErrors
            issues={sim.validationIssues}
            message={sampleFailed ? t.importer.sampleFailed : null}
            onDismiss={dismissErrors}
          />
          <div className="min-h-0 flex-1 p-4">
            {building && graph ? (
              <BuildingMap
                key={building.building + building.nodes.length + building.edges.length}
                building={building}
                graph={graph}
                hazards={hazards}
                route={route}
                startId={startId}
                onNodeActivate={handleNodeActivate}
                onEdgeToggle={sim.toggleEdge}
              />
            ) : (
              <EmptyState onLoadSample={loadSample} />
            )}
          </div>
        </div>

        <aside className="flex min-h-0 flex-col border-t bg-card max-lg:max-h-[80vh] lg:border-t-0 lg:border-l" aria-label={t.hazards.heading}>
          {building ? (
            <HazardPanel
              building={building}
              hazards={hazards}
              route={route}
              onToggleNode={sim.toggleNode}
              onToggleEdge={sim.toggleEdge}
              onToggleExit={toggleExit}
            />
          ) : (
            <div className="p-4">
              <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t.hazards.heading}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t.empty.steps[0]}</p>
            </div>
          )}
        </aside>
      </main>

      <StatusBar route={route} hasBuilding={building !== null} issueCount={sim.validationIssues.length} events={sim.events} />
    </div>
  )
}
