import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStudio } from './store/useStudio'
import { generateAurora } from './color/aurora'
import { LIGHTNESS_PRESETS } from './presets/lightness'
import { downloadBackgroundPng } from './export/renderBackgroundImage'
import { AppHeader } from './components/AppHeader'
import { BottomToolbar } from './components/BottomToolbar'
import { ExportModal } from './components/ExportModal'
import { InspectorRail } from './components/InspectorRail'
import { PreviewStage } from './components/PreviewStage'

function isTypingTarget(el: EventTarget | null) {
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    (el instanceof HTMLElement && el.isContentEditable)
  )
}

export default function App() {
  const seedH = useStudio((s) => s.seedH)
  const seedC = useStudio((s) => s.seedC)
  const anchorOklch = useStudio((s) => s.anchorOklch)
  const anchorHsl = useStudio((s) => s.anchorHsl)
  const inputMode = useStudio((s) => s.inputMode)
  const imageUrl = useStudio((s) => s.imageUrl)
  const lastExtraction = useStudio((s) => s.lastExtraction)
  const lightnessId = useStudio((s) => s.lightnessId)
  const richness = useStudio((s) => s.richness)
  const speed = useStudio((s) => s.speed)
  const luminance = useStudio((s) => s.luminance)
  const blobAnchors = useStudio((s) => s.blobAnchors)
  const showOverlay = useStudio((s) => s.showOverlay)
  const setLightness = useStudio((s) => s.setLightness)

  const [exportOpen, setExportOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const aurora = useMemo(
    () =>
      generateAurora({
        seedH,
        seedC,
        anchorOklch,
        anchorHsl,
        lightnessId,
        richness,
        speed,
        luminance,
        blobAnchors,
      }),
    [seedH, seedC, anchorOklch, anchorHsl, lightnessId, richness, speed, luminance, blobAnchors],
  )

  const downloadFrame = useCallback(async () => {
    setDownloading(true)
    try {
      await downloadBackgroundPng(aurora)
    } finally {
      setDownloading(false)
    }
  }, [aurora])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        setExportOpen(true)
        return
      }

      if (exportOpen) return

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const i = LIGHTNESS_PRESETS.findIndex((p) => p.id === lightnessId)
        const dir = e.key === 'ArrowRight' ? 1 : -1
        const next = (i + dir + LIGHTNESS_PRESETS.length) % LIGHTNESS_PRESETS.length
        setLightness(LIGHTNESS_PRESETS[next].id)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [exportOpen, lightnessId, setLightness])

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AppHeader />

      <main className="flex-1 min-h-0 flex">
        <PreviewStage
          a={aurora}
          inputMode={inputMode}
          imageUrl={imageUrl}
          showOverlay={showOverlay}
          toolbar={
            <BottomToolbar
              a={aurora}
              downloading={downloading}
              onDownloadFrame={downloadFrame}
              onExportCode={() => setExportOpen(true)}
            />
          }
        />

        <InspectorRail a={aurora} onExportCode={() => setExportOpen(true)} />
      </main>

      {exportOpen && (
        <ExportModal
          a={aurora}
          extraction={inputMode === 'image' ? lastExtraction : null}
          onClose={() => setExportOpen(false)}
        />
      )}
    </div>
  )
}
