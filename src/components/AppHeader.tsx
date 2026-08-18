import type { ReactNode } from 'react'
import { useStudio } from '../store/useStudio'
import { useT } from '../i18n'

function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className="inline-grid place-items-center min-w-[18px] h-[18px] px-1 rounded-[5px] border border-[var(--line)] bg-white/[0.03] text-[10px] font-semibold text-[var(--ink-3)] leading-none">
      {children}
    </span>
  )
}

function LocaleSwitch() {
  const locale = useStudio((s) => s.locale)
  const setLocale = useStudio((s) => s.setLocale)

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex shrink-0 p-0.5 rounded-[var(--r-sm)] smooth-r border border-[var(--line)] bg-white/[0.02]"
    >
      {([
        { id: 'zh' as const, label: '中文' },
        { id: 'en' as const, label: 'EN' },
      ]).map((o) => {
        const on = locale === o.id
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => setLocale(o.id)}
            aria-pressed={on}
            className={`h-7 min-w-[36px] px-2.5 rounded-[var(--r-xs)] smooth-r text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap transition-colors ${
              on ? 'bg-white/[0.10] text-[var(--ink)]' : 'text-[var(--ink-3)] hover:text-[var(--ink-2)]'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function AppHeader() {
  const t = useT()
  const inputMode = useStudio((s) => s.inputMode)

  return (
    <header className="shrink-0 h-14 border-b border-[var(--line)] bg-[var(--bg)]">
      <div className="h-full pl-6 pr-5 flex items-center gap-4">
        <span className="w-[5px] h-[5px] rounded-full bg-white shrink-0" aria-hidden />
        <h1 className="text-[14.5px] font-bold tracking-[-0.02em] text-[var(--ink)] m-0 leading-none whitespace-nowrap">
          Vibe Color Studio
        </h1>

        <div className="ml-auto flex items-center gap-4">
          {inputMode === 'hex' && (
            <div className="hidden md:flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[10.5px] text-[var(--ink-4)]">
                <Kbd>←</Kbd>
                <Kbd>→</Kbd>
                {t('shortcutMode')}
              </span>
              <span className="flex items-center gap-1.5 text-[10.5px] text-[var(--ink-4)]">
                <Kbd>⌘</Kbd>
                <Kbd>E</Kbd>
                {t('shortcutExport')}
              </span>
            </div>
          )}
          <LocaleSwitch />
        </div>
      </div>
    </header>
  )
}
