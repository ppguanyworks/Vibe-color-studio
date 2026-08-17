import { useMemo, useState } from 'react'
import type { AuroraResult } from '../color/aurora'
import type { Extraction } from '../color/quantize'
import { generateExport, type ExportFormat } from '../export/generators'
import { Modal } from './ui'
import { Check, Copy } from './icons'

const TABS: { id: ExportFormat; label: string; hint: string }[] = [
  { id: 'css', label: 'CSS', hint: 'HTML + CSS · 含动画' },
  { id: 'static', label: '静态', hint: '单层 background-image 快照' },
  { id: 'json', label: 'JSON', hint: '设计 token · 可回填参数' },
]

export function ExportModal({
  a,
  extraction,
  onClose,
}: {
  a: AuroraResult
  extraction?: Extraction | null
  onClose: () => void
}) {
  const [format, setFormat] = useState<ExportFormat>('css')
  const [copied, setCopied] = useState(false)

  const code = useMemo(() => generateExport(format, a, extraction), [format, a, extraction])
  const active = TABS.find((t) => t.id === format) ?? TABS[0]

  const meta = useMemo(() => {
    const lines = code.split('\n').length
    const kb = new Blob([code]).size / 1024
    return `${lines} 行 · ${kb.toFixed(1)} KB`
  }, [code])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <Modal
      title="导出代码"
      subtitle={active.hint}
      onClose={onClose}
      toolbar={
        <div className="flex p-0.5 rounded-[var(--r-sm)] border border-[var(--line)] bg-white/[0.02]">
          {TABS.map((t) => {
            const on = t.id === format
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setFormat(t.id)}
                aria-pressed={on}
                className={`h-7 px-3 rounded-[6px] text-[11.5px] font-semibold transition-colors ${
                  on ? 'bg-white/[0.10] text-[var(--ink)]' : 'text-[var(--ink-3)] hover:text-[var(--ink-2)]'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      }
    >
      <pre className="codeblock scroll-thin flex-1 min-h-0 m-0 px-5 py-4 text-[var(--ink-2)] bg-black/25">
        {code}
      </pre>

      <footer className="shrink-0 flex items-center gap-4 h-14 px-5 border-t border-[var(--line)]">
        <span className="num text-[11px] text-[var(--ink-4)]">{meta}</span>
        <button
          type="button"
          onClick={copy}
          className="ml-auto inline-flex items-center gap-2 h-9 px-4 rounded-[var(--r-sm)] bg-white text-[#0a0a0d] text-[12.5px] font-semibold transition-[background-color,scale] duration-150 hover:bg-white/90 active:scale-[0.99]"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? '已复制' : '复制代码'}
        </button>
      </footer>
    </Modal>
  )
}
