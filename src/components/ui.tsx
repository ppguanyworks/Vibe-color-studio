import { useEffect, type ReactNode } from 'react'
import { ChevronDown, Close } from './icons'

/* ---------------- structure ---------------- */

export function Section({
  label,
  action,
  children,
}: {
  label: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="px-5 py-4">
      <div className="flex items-center justify-between gap-3 h-5 mb-3.5">
        <h2 className="micro m-0">{label}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function CollapsibleSection({
  label,
  open,
  onToggle,
  action,
  children,
}: {
  label: string
  open: boolean
  onToggle: () => void
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="px-5 py-4">
      <div className="flex items-center justify-between gap-3 h-5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="group flex items-center gap-1.5 -ml-1 pl-1 pr-1.5 py-1 rounded-[var(--r-xs)] hover:bg-white/[0.04] transition-colors"
        >
          <span
            className="text-[var(--ink-4)] group-hover:text-[var(--ink-2)] transition-[transform,color] duration-200"
            style={{ transform: open ? 'none' : 'rotate(-90deg)' }}
          >
            <ChevronDown size={12} />
          </span>
          <span className="micro group-hover:text-[var(--ink-2)] transition-colors">{label}</span>
        </button>
        {open && action}
      </div>
      {open && <div className="mt-3.5 anim-fade">{children}</div>}
    </section>
  )
}

export function Divider() {
  return <div className="h-px bg-[var(--line)]" />
}

/* ---------------- controls ---------------- */

export function GhostButton({
  children,
  onClick,
  title,
}: {
  children: ReactNode
  onClick?: () => void
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="inline-flex items-center gap-1.5 h-6 px-2 rounded-[var(--r-xs)] text-[11px] font-medium text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-white/[0.06] transition-colors"
    >
      {children}
    </button>
  )
}

export function PrimaryButton({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 h-11 w-full rounded-[var(--r-md)] bg-white text-[#0a0a0d] text-[13px] font-semibold tracking-[-0.01em] transition-[background-color,scale] duration-150 hover:bg-white/90 active:scale-[0.99] ${className}`}
    >
      {children}
    </button>
  )
}

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  display?: string
  hint?: string
  hue?: boolean
}

export function Slider({ label, value, min, max, step, onChange, display, hint, hue }: SliderProps) {
  return (
    <div className="flex flex-col gap-2" title={hint}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium text-[var(--ink-2)] leading-none">{label}</span>
        {display !== undefined && (
          <span className="num text-[11px] font-medium text-[var(--ink)] leading-none">{display}</span>
        )}
      </div>
      <input
        type="range"
        className={`slider${hue ? ' hue-track' : ''}`}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  )
}

export function SegmentControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { id: T; label: string }[]
}) {
  return (
    <div
      role="tablist"
      className="flex p-0.5 rounded-[var(--r-md)] border border-[var(--line)] bg-white/[0.02]"
    >
      {options.map((o) => {
        const active = value === o.id
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={`flex-1 h-8 rounded-[var(--r-sm)] text-[12px] font-semibold tracking-[-0.005em] transition-colors ${
              active
                ? 'bg-white/[0.10] text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'text-[var(--ink-3)] hover:text-[var(--ink-2)]'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/* ---------------- overlay ---------------- */

export function Modal({
  title,
  subtitle,
  onClose,
  toolbar,
  children,
  width = 720,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  toolbar?: ReactNode
  children: ReactNode
  width?: number
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-black/62 backdrop-blur-[3px] anim-fade cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ width: `min(${width}px, 100%)` }}
        className="relative anim-pop flex flex-col max-h-[min(78vh,720px)] rounded-[var(--r-xl)] border border-[var(--line-2)] bg-[var(--bg-elev)] shadow-[0_40px_120px_-24px_rgba(0,0,0,0.9)] overflow-hidden"
      >
        <header className="shrink-0 flex items-center gap-4 h-14 px-5 border-b border-[var(--line)]">
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold tracking-[-0.015em] text-[var(--ink)] m-0 leading-tight">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-[11px] text-[var(--ink-3)] m-0 leading-tight">{subtitle}</p>}
          </div>
          <div className="ml-auto flex items-center gap-2">{toolbar}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="shrink-0 grid place-items-center w-7 h-7 rounded-[var(--r-xs)] text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-white/[0.06] transition-colors"
          >
            <Close size={14} />
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}
