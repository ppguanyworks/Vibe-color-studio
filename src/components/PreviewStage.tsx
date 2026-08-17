import type { ReactNode } from 'react'
import type { AuroraResult } from '../color/aurora'
import { PhonePreview } from './PhonePreview'

interface PreviewStageProps {
  a: AuroraResult
  inputMode: 'hex' | 'image'
  imageUrl: string | null
  showOverlay: boolean
  toolbar: ReactNode
}

export function PreviewStage({ a, inputMode, imageUrl, showOverlay, toolbar }: PreviewStageProps) {
  return (
    <div className="relative flex-1 min-w-0 h-full overflow-hidden">
      {/* safe centering keeps the frame fully visible on short viewports instead of clipping it */}
      <div className="h-full flex flex-col items-center justify-center-safe overflow-y-auto scroll-thin px-8 pt-8 pb-28">
        <div className="anim-rise phone-fit">
          <PhonePreview a={a} inputMode={inputMode} imageUrl={imageUrl} showOverlay={showOverlay} />
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-10">{toolbar}</div>
    </div>
  )
}
