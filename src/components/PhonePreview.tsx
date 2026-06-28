import type { AuroraResult } from '../color/aurora'
import { MusicFeedMock } from './MusicFeedMock'

interface PhonePreviewProps {
  a: AuroraResult
  inputMode: 'hex' | 'image'
  imageUrl: string | null
}

export function PhonePreview({ a, inputMode, imageUrl }: PhonePreviewProps) {
  const showImage = inputMode === 'image' && imageUrl
  const showMockUi = inputMode === 'hex'

  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{
        width: 268,
        height: 552,
        borderRadius: 40,
        border: '8px solid #14161e',
        background: '#000',
        boxShadow: '0 44px 100px -34px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.05) inset',
      }}
    >
      <div className="aurora-bg" data-aurora-export-root style={{ background: a.base.hex }}>
        {a.blobs.map((b) => (
          <span
            key={b.profileId}
            className="aurora-blob"
            style={{
              left: `${b.pos[0]}%`,
              top: `${b.pos[1]}%`,
              width: `${b.size}%`,
              height: `${b.size}%`,
              background: b.gradCss,
              mixBlendMode: a.blend,
              ['--blob-blur' as string]: `${b.blurPx}px`,
              ['--blob-blur-peak' as string]: `${b.blurPeakPx}px`,
              animation: `${b.keyframe} ${b.durationMs}ms cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite${b.profileId === 0 ? ', aurora-breathe 14s ease-in-out infinite' : ''}`,
              animationDelay: `${b.delayMs}ms${b.profileId === 0 ? ', -3s' : ''}`,
            }}
          />
        ))}
      </div>

      {showImage ? (
        <div data-preview-overlay className="relative z-[2] h-full flex items-center justify-center p-5">
          <img
            src={imageUrl}
            alt="preview"
            className="w-[168px] max-w-[180px] min-w-[140px] h-auto object-contain rounded-xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)]"
          />
        </div>
      ) : showMockUi ? (
        <div data-preview-overlay className="relative z-[2] h-full">
          <MusicFeedMock />
        </div>
      ) : null}
    </div>
  )
}
