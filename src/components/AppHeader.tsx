import type { ReactNode } from 'react'

function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className="inline-grid place-items-center min-w-[18px] h-[18px] px-1 rounded-[5px] border border-[var(--line)] bg-white/[0.03] text-[10px] font-semibold text-[var(--ink-3)] leading-none">
      {children}
    </span>
  )
}

export function AppHeader() {
  return (
    <header className="shrink-0 h-14 border-b border-[var(--line)] bg-[var(--bg)]">
      <div className="h-full pl-6 pr-5 flex items-center gap-4">
        <span className="w-[5px] h-[5px] rounded-full bg-white shrink-0" aria-hidden />
        <h1 className="text-[14.5px] font-bold tracking-[-0.02em] text-[var(--ink)] m-0 leading-none whitespace-nowrap">
          Vibe Color Studio
        </h1>
        <span className="w-px h-3.5 bg-[var(--line-2)] shrink-0" aria-hidden />
        <p className="micro m-0 whitespace-nowrap">动态渐变背景生成器</p>

        <div className="ml-auto hidden md:flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[10.5px] text-[var(--ink-4)]">
            <Kbd>←</Kbd>
            <Kbd>→</Kbd>
            切换模式
          </span>
          <span className="flex items-center gap-1.5 text-[10.5px] text-[var(--ink-4)]">
            <Kbd>⌘</Kbd>
            <Kbd>E</Kbd>
            导出
          </span>
        </div>
      </div>
    </header>
  )
}
