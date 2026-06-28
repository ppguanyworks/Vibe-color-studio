import { useMemo } from 'react'
import { useStudio } from './store/useStudio'
import { generateAurora } from './color/aurora'
import { InspectorPanel } from './components/InspectorPanel'
import { BlobLayoutEditor } from './components/BlobLayoutEditor'
import { PreviewStage } from './components/PreviewStage'
import { ExportDrawer } from './components/ExportDrawer'

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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="shrink-0 border-b border-white/8 px-6 py-4">
        <div className="max-w-[1440px] mx-auto flex items-baseline gap-4 flex-wrap">
          <h1 className="text-[15px] font-semibold text-white/90 m-0">Vibe Color Studio</h1>
          <span className="text-[13px] text-white/40">动态渐变背景生成器</span>
        </div>
      </header>

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-4 lg:px-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <div className="shrink-0 w-full lg:w-[300px] flex flex-col gap-4">
            <InspectorPanel />
            <BlobLayoutEditor a={aurora} />
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <PreviewStage a={aurora} inputMode={inputMode} imageUrl={imageUrl} />
          </div>

          <ExportDrawer a={aurora} extraction={inputMode === 'image' ? lastExtraction : null} />
        </div>
      </div>
    </div>
  )
}
