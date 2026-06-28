import type { AuroraResult } from '../color/aurora'
import { LightnessTabs } from './LightnessTabs'
import { PhonePreview } from './PhonePreview'
import { PreviewStatusBar } from './PreviewStatusBar'

interface PreviewStageProps {
  a: AuroraResult
  inputMode: 'hex' | 'image'
  imageUrl: string | null
}

export function PreviewStage({ a, inputMode, imageUrl }: PreviewStageProps) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 h-full">
      <div className="flex flex-col items-center gap-2.5">
        <LightnessTabs />
        <PhonePreview a={a} inputMode={inputMode} imageUrl={imageUrl} />
      </div>
      <PreviewStatusBar a={a} />
    </div>
  )
}
