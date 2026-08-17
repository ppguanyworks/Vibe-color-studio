import { useMemo, useState } from 'react'
import type { AuroraResult } from '../color/aurora'
import { generateExport, type ExportFormat } from '../export/generators'
import { useT } from '../i18n'
import { Modal } from './ui'
import { Check, Copy } from './icons'

export function ExportModal({ a, onClose }: { a: AuroraResult; onClose: () => void }) {
  const t = useT()
  const [format, setFormat] = useState<ExportFormat>('css')
  const [copied, setCopied] = useState(false)

  const tabs: { id: ExportFormat; label: string; hint: string }[] = [
    { id: 'css', label: 'CSS', hint: t('exportCssHint') },
    { id: 'static', label: t('exportStatic'), hint: t('exportStaticHint') },
    { id: 'json', label: 'JSON', hint: t('exportJsonHint') },
  ]

  const code = useMemo(() => generateExport(format, a), [format, a])
  const active = tabs.find((tab) => tab.id === format) ?? tabs[0]

  const meta = useMemo(() => {
    const lines = code.split('\n').length
    const kb = new Blob([code]).size / 1024
    return `${lines} ${t('lines')} · ${kb.toFixed(1)} KB`
  }, [code, t])

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
      title={t('exportTitle')}
      subtitle={active.hint}
      onClose={onClose}
      toolbar={
        <div className="flex p-0.5 rounded-[var(--r-sm)] smooth-r border border-[var(--line)] bg-white/[0.02]">
          {tabs.map((tab) => {
            const on = tab.id === format
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFormat(tab.id)}
                aria-pressed={on}
                className={`h-7 px-3 rounded-[var(--r-xs)] smooth-r text-[11.5px] font-semibold transition-colors ${
                  on ? 'bg-white/[0.10] text-[var(--ink)]' : 'text-[var(--ink-3)] hover:text-[var(--ink-2)]'
                }`}
              >
                {tab.label}
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
          className="ml-auto inline-flex items-center gap-2 h-9 px-4 rounded-[var(--r-sm)] smooth-r bg-white text-[#0a0a0d] text-[12.5px] font-semibold transition-[background-color,scale] duration-150 hover:bg-white/90 active:scale-[0.99]"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? t('copied') : t('copyCode')}
        </button>
      </footer>
    </Modal>
  )
}
