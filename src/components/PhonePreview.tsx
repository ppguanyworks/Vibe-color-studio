import type { AuroraResult } from '../color/aurora'
import { PLACEHOLDER_TITLE } from '../color/imageTitle'
import { PHONE_INNER_W } from '../export/renderBackgroundImage'
import { MusicFeedMock } from './MusicFeedMock'

const IMAGE_MAX = PHONE_INNER_W / 2
export const IMAGE_FALLBACK_HEX = '#61030C'

interface PhonePreviewProps {
  a: AuroraResult
  inputMode: 'hex' | 'image'
  imageUrl: string | null
  imageTitle?: string | null
  imageRatio?: string | null
  showOverlay: boolean
  solidHex?: string | null
}

export function PhonePreview({
  a,
  inputMode,
  imageUrl,
  imageTitle,
  imageRatio,
  showOverlay,
  solidHex,
}: PhonePreviewProps) {
  const isImage = inputMode === 'image'
  const bg = isImage ? (solidHex ?? IMAGE_FALLBACK_HEX) : a.base.hex
  const hexLabel = (solidHex ?? IMAGE_FALLBACK_HEX).toUpperCase()
  const showPoster = showOverlay && isImage && imageUrl
  const showMockUi = showOverlay && !isImage

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
      <div className="aurora-bg" data-aurora-export-root style={{ background: bg }}>
        {!isImage &&
          a.blobs.map((b) => (
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

      {showPoster ? (
        <div data-preview-overlay className="phone-mock relative z-[2] h-full">
          <div
            className="absolute left-1/2 flex flex-col items-center"
            style={{ top: 68, transform: 'translateX(-50%)', width: '100%' }}
          >
            <div
              className="flex items-center justify-center"
              style={{ width: IMAGE_MAX, height: IMAGE_MAX }}
            >
              <img
                src={imageUrl}
                alt=""
                className="block object-contain smooth-r"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  borderRadius: 10,
                }}
              />
            </div>
            <p
              className="px-5 max-w-[88%] text-center text-[16px] font-bold leading-snug text-white m-0"
              style={{ fontFamily: 'var(--tiktok)', marginTop: 16 }}
            >
              {imageTitle ?? PLACEHOLDER_TITLE}
            </p>
            {imageRatio ? (
              <p
                className="mt-1.5 m-0 text-center text-[11px] font-medium tracking-[0.02em] text-white/40"
                style={{ fontFamily: 'var(--sans)' }}
              >
                Ratio: {imageRatio}
              </p>
            ) : null}
          </div>
        </div>
      ) : showMockUi ? (
        <div data-preview-overlay className="relative z-[2] h-full">
          <MusicFeedMock />
        </div>
      ) : null}

      {isImage && (
        <div className="phone-mock pointer-events-none absolute inset-x-0 bottom-7 z-[3] flex justify-center">
          <span
            className="num inline-flex items-center h-7 px-3.5 rounded-full text-[11px] font-medium tracking-[0.02em] text-white/40"
            style={{
              fontFamily: 'var(--sans)',
              background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.20)',
            }}
          >
            {hexLabel}
          </span>
        </div>
      )}
    </div>
  )
}
