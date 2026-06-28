import { useMemo, useState, useCallback } from 'react'
import type { AuroraResult } from '../color/aurora'
import type { Extraction } from '../color/quantize'
import { generateExport, type ExportFormat } from '../export/generators'
import { downloadBackgroundPng } from '../export/renderBackgroundImage'

const TABS: { id: ExportFormat; label: string }[] = [
  { id: 'css', label: 'CSS' },
  { id: 'static', label: '静态' },
  { id: 'json', label: 'JSON' },
]

export function ExportDrawer({ a, extraction }: { a: AuroraResult; extraction?: Extraction | null }) {
  const [open, setOpen] = useState(true)
  const [format, setFormat] = useState<ExportFormat>('css')
  const [copied, setCopied] = useState(false)
  const [exportingBg, setExportingBg] = useState(false)

  const code = useMemo(() => generateExport(format, a, extraction), [format, a, extraction])

  const exportBackground = useCallback(async () => {
    setExportingBg(true)
    try {
      await downloadBackgroundPng(a)
    } finally {
      setExportingBg(false)
    }
  }, [a])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard unavailable */
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 w-10 h-full min-h-[200px] rounded-[14px] border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-white/50 hover:text-white/75 hover:bg-white/[0.06] transition-colors flex items-center justify-center [writing-mode:vertical-rl]"
        aria-label="打开导出面板"
      >
        导出代码
      </button>
    )
  }

  return (
    <aside className="shrink-0 w-[min(380px,38vw)] flex flex-col max-h-[calc(100vh-96px)] rounded-[14px] border border-white/10 bg-white/[0.04] overflow-hidden max-lg:w-full max-lg:max-h-[min(420px,calc(100vh-120px))] lg:sticky lg:top-4">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 shrink-0">
        <span className="text-[13px] font-semibold text-white/85">导出</span>
        <div className="flex gap-1 ml-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setFormat(t.id)}
              className={`rounded-[6px] px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                format === t.id
                  ? 'bg-white/[0.12] text-white'
                  : 'text-white/45 hover:text-white/65'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={copy}
          className="ml-auto rounded-[6px] px-2.5 py-1 text-[11px] font-semibold border border-white/12 bg-white/[0.05] text-white/80 hover:bg-white/[0.10] transition-colors"
        >
          {copied ? '已复制' : '复制'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-[6px] p-1 text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
          aria-label="收起导出面板"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="px-4 py-3 border-b border-white/8 shrink-0">
        <button
          type="button"
          onClick={exportBackground}
          disabled={exportingBg}
          className="w-full rounded-[8px] py-2 text-[12px] font-semibold border border-white/14 bg-white/[0.06] text-white/85 hover:bg-white/[0.10] disabled:opacity-50 disabled:cursor-wait transition-colors"
        >
          {exportingBg ? '生成中…' : '导出背景 PNG'}
        </button>
        <p className="mt-1.5 text-[10px] text-white/35 leading-snug">
          截取预览内渐变背景当前帧，与屏幕所见一致
        </p>
      </div>
      <pre className="codeblock flex-1 min-h-0 p-4 text-white/75 overflow-auto">{code}</pre>
    </aside>
  )
}
