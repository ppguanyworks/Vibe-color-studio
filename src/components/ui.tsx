import type { ReactNode } from 'react'

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[14px] border border-white/10 bg-white/[0.04] p-5 ${className}`}
    >
      {children}
    </section>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[12px] font-semibold text-white/55 uppercase tracking-[0.06em] mb-3">{children}</h2>
  )
}

export function SectionDivider() {
  return <div className="my-5 border-t border-white/8" />
}

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  display?: string
  leftHint?: string
  rightHint?: string
  hue?: boolean
}

export function Slider({ label, value, min, max, step, onChange, display, leftHint, rightHint, hue }: SliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <span className="text-[12px] font-medium text-white/70">{label}</span>
        {display !== undefined && <span className="text-[11px] font-mono text-white/85 tabular-nums">{display}</span>}
      </div>
      <input
        type="range"
        className={`slider${hue ? ' hue-track' : ''}`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      {(leftHint || rightHint) && (
        <div className="flex justify-between text-[10px] text-white/35">
          <span>{leftHint}</span>
          <span>{rightHint}</span>
        </div>
      )}
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
    <div className="flex rounded-[10px] border border-white/10 p-0.5 bg-white/[0.03]">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`flex-1 rounded-[8px] py-2 text-[12px] font-semibold transition-colors ${
            value === o.id ? 'bg-white/[0.12] text-white' : 'text-white/45 hover:text-white/65'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
