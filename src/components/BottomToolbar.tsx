import type { ReactNode } from 'react'
import type { AuroraResult } from '../color/aurora'
import { LIGHTNESS_PRESETS, type LightnessId } from '../presets/lightness'
import { useStudio } from '../store/useStudio'
import { ContrastChip } from './ContrastChip'
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
      className="inline-flex shrink-0 items-center gap-2 h-8 px-2.5 rounded-[var(--r-sm)] text-[12px] font-medium whitespace-nowrap text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-white/[0.07] disabled:opacity-40 disabled:cursor-wait transition-colors"
    >
      <span className="text-[var(--ink-3)]">{icon}</span>
      <span className="hidden lg:inline">{label}</span>
    </button>
  )
}

function IconToggle({
  on,
  onClick,
  title,
}: {
  on: boolean
  onClick: () => void
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={!on}
      className={`grid shrink-0 place-items-center w-8 h-8 rounded-[var(--r-sm)] transition-colors ${
        on
          ? 'text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-white/[0.07]'
          : 'text-[var(--ink)] bg-white/[0.10]'
      }`}
    >
      {on ? <Eye size={15} /> : <EyeOff size={15} />}
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
  const lightnessId = useStudio((s) => s.lightnessId)
  const setLightness = useStudio((s) => s.setLightness)
  const showOverlay = useStudio((s) => s.showOverlay)
  const toggleOverlay = useStudio((s) => s.toggleOverlay)

  const index = LIGHTNESS_PRESETS.findIndex((p) => p.id === lightnessId)
  const preset = LIGHTNESS_PRESETS[index] ?? LIGHTNESS_PRESETS[0]

  const step = (dir: 1 | -1) => {
    const next = (index + dir + LIGHTNESS_PRESETS.length) % LIGHTNESS_PRESETS.length
    setLightness(LIGHTNESS_PRESETS[next].id as LightnessId)
  }

  return (
    <div className="flex items-center gap-1.5 h-13 pl-2 pr-2 py-2 rounded-full glass border border-[var(--line-2)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)]">
      <button
        type="button"
        onClick={() => step(-1)}
        title="上一个模式（←）"
        className="grid shrink-0 place-items-center w-8 h-8 rounded-full text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-white/[0.07] transition-colors"
      >
        <ChevronLeft size={15} />
      </button>

      <span className="shrink-0 w-[84px] text-center text-[12.5px] font-semibold tracking-[-0.01em] text-[var(--ink)] whitespace-nowrap select-none">
        {preset.label.replace(' mode', '')}
      </span>

      <button
        type="button"
        onClick={() => step(1)}
        title="下一个模式（→）"
        className="grid shrink-0 place-items-center w-8 h-8 rounded-full text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-white/[0.07] transition-colors"
      >
        <ChevronRight size={15} />
      </button>

      <Sep />

      <ToolButton
        icon={<Download size={15} />}
        label={downloading ? '生成中' : '当前帧'}
        onClick={onDownloadFrame}
        title="下载当前一帧 PNG"
        disabled={downloading}
      />

      <ToolButton
        icon={<Code size={15} />}
        label="导出代码"
        onClick={onExportCode}
        title="导出 CSS / JSON（⌘E）"
      />

      <span className="hidden md:flex shrink-0 items-center gap-1.5">
        <Sep />
        <div className="px-1.5">
          <ContrastChip a={a} />
        </div>
      </span>

      <Sep />

      <IconToggle
        on={showOverlay}
        onClick={toggleOverlay}
        title={showOverlay ? '隐藏预览内容' : '显示预览内容'}
      />
    </div>
  )
}
