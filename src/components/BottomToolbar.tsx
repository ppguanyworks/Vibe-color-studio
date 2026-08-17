import type { ReactNode } from 'react'
import type { AuroraResult } from '../color/aurora'
import { LIGHTNESS_PRESETS, type LightnessId } from '../presets/lightness'
import { useStudio } from '../store/useStudio'
import { useT } from '../i18n'
import { ContrastChip, WhiteContrastChip } from './ContrastChip'
import { ChevronLeft, ChevronRight, Code, Download, Eye, EyeOff } from './icons'

function Sep() {
  return <span className="w-px h-5 bg-[var(--line-2)] shrink-0" aria-hidden />
}

function ToolButton({
  icon,
  label,
  onClick,
  title,
  disabled,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  title?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={label}
      disabled={disabled}
      className="inline-flex shrink-0 items-center gap-2 h-8 px-2.5 rounded-[var(--r-sm)] smooth-r text-[12px] font-medium whitespace-nowrap text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-white/[0.07] disabled:opacity-40 disabled:cursor-wait transition-colors"
    >
      <span className="text-[var(--ink-3)]">{icon}</span>
      <span className="hidden lg:inline">{label}</span>
    </button>
  )
}

interface BottomToolbarProps {
  a: AuroraResult
  downloading: boolean
  onDownloadFrame: () => void
  onExportCode: () => void
}

export function BottomToolbar({ a, downloading, onDownloadFrame, onExportCode }: BottomToolbarProps) {
  const t = useT()
  const inputMode = useStudio((s) => s.inputMode)
  const lightnessId = useStudio((s) => s.lightnessId)
  const setLightness = useStudio((s) => s.setLightness)
  const showOverlay = useStudio((s) => s.showOverlay)
  const toggleOverlay = useStudio((s) => s.toggleOverlay)
  const posterColor = useStudio((s) => s.posterColor)
  const isHex = inputMode === 'hex'

  const index = LIGHTNESS_PRESETS.findIndex((p) => p.id === lightnessId)
  const preset = LIGHTNESS_PRESETS[index] ?? LIGHTNESS_PRESETS[0]

  const step = (dir: 1 | -1) => {
    const next = (index + dir + LIGHTNESS_PRESETS.length) % LIGHTNESS_PRESETS.length
    setLightness(LIGHTNESS_PRESETS[next].id as LightnessId)
  }

  return (
    <div className="flex items-center gap-1.5 h-13 pl-2 pr-2 py-2 rounded-full glass border border-[var(--line-2)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)]">
      {isHex && (
        <>
          <button
            type="button"
            onClick={() => step(-1)}
            title={t('prevMode')}
            className="grid shrink-0 place-items-center w-8 h-8 rounded-full text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-white/[0.07] transition-colors"
          >
            <ChevronLeft size={15} />
          </button>

          <span className="shrink-0 w-[84px] text-center text-[12.5px] font-semibold tracking-[-0.01em] text-[var(--ink)] whitespace-nowrap select-none">
            {preset.id === 'dark' ? t('dark') : t('light')}
          </span>

          <button
            type="button"
            onClick={() => step(1)}
            title={t('nextMode')}
            className="grid shrink-0 place-items-center w-8 h-8 rounded-full text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-white/[0.07] transition-colors"
          >
            <ChevronRight size={15} />
          </button>

          <Sep />
        </>
      )}

      <ToolButton
        icon={<Download size={15} />}
        label={downloading ? t('generating') : t('frame')}
        onClick={onDownloadFrame}
        title={t('frame')}
        disabled={downloading}
      />

      {isHex && (
        <ToolButton
          icon={<Code size={15} />}
          label={t('exportCode')}
          onClick={onExportCode}
          title={`${t('exportCode')} (⌘E)`}
        />
      )}

      <span className="hidden md:flex shrink-0 items-center gap-1.5">
        <Sep />
        <div className="px-1.5">
          {isHex ? (
            <ContrastChip a={a} />
          ) : posterColor ? (
            <WhiteContrastChip ratio={posterColor.contrast} label={t('contrastWhite')} />
          ) : null}
        </div>
      </span>

      <Sep />

      <button
        type="button"
        onClick={toggleOverlay}
        title={showOverlay ? t('hideOverlay') : t('showOverlay')}
        aria-label={showOverlay ? t('hideOverlay') : t('showOverlay')}
        aria-pressed={!showOverlay}
        className={`grid shrink-0 place-items-center w-8 h-8 rounded-[var(--r-sm)] transition-colors ${
          showOverlay
            ? 'text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-white/[0.07]'
            : 'text-[var(--ink)] bg-white/[0.10]'
        }`}
      >
        {showOverlay ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>
    </div>
  )
}
