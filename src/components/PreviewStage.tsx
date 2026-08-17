import type { ReactNode } from 'react'
import type { AuroraResult } from '../color/aurora'
import { PhonePreview } from './PhonePreview'

interface PreviewStageProps {
  a: AuroraResult
  inputMode: 'hex' | 'image'
  imageUrl: string | null
  imageTitle?: string | null
  imageRatio?: string | null
  showOverlay: boolean
  solidHex?: string | null
  toolbar: ReactNode
}

export function PreviewStage({
  a,
  inputMode,
  imageUrl,
  imageTitle,
  imageRatio,
  showOverlay,
  solidHex,
  toolbar,
}: PreviewStageProps) {
  return (
    <div className="relative flex-1 min-w-0 h-full overflow-hidden">
      <div className="h-full flex flex-col items-center justify-center-safe overflow-y-auto scroll-thin px-8 pt-8 pb-28">
        <div className="anim-rise phone-fit">
          <PhonePreview
            a={a}
            inputMode={inputMode}
            imageUrl={imageUrl}
            imageTitle={imageTitle}
            imageRatio={imageRatio}
            showOverlay={showOverlay}
            solidHex={solidHex}
          />
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-10">{toolbar}</div>
    </div>
  )
}
