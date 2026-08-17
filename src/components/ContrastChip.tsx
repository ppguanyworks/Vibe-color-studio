import type { AuroraResult } from '../color/aurora'
import { wcagBadge } from '../color/oklch'

const BADGE: Record<string, string> = {
  aaa: 'text-emerald-300/90 border-emerald-300/25 bg-emerald-400/10',
  aa: 'text-sky-300/90 border-sky-300/25 bg-sky-400/10',
  large: 'text-amber-200/90 border-amber-200/25 bg-amber-300/10',
  fail: 'text-rose-300/90 border-rose-300/25 bg-rose-400/10',
}

function Chip({
  ratio,
  title,
  badgeOverride,
}: {
  ratio: number
  title: string
  badgeOverride?: string
}) {
  const badge = wcagBadge(ratio)
  return (
    <div className="flex items-center gap-2 whitespace-nowrap" title={title}>
      <span className="num text-[12px] font-semibold text-[var(--ink)] leading-none">
        {ratio.toFixed(1)}:1
      </span>
      <span
        className={`px-1.5 py-[3px] rounded-[var(--r-xs)] smooth-r border text-[9px] font-bold leading-none tracking-[0.04em] ${
          BADGE[badge.cls] ?? BADGE.fail
        }`}
      >
        {badgeOverride ?? badge.txt}
      </span>
    </div>
  )
}

export function ContrastChip({ a }: { a: AuroraResult }) {
  const { wcag, apca, badgeTxt } = a.contrast
  return (
    <Chip
      ratio={wcag}
      badgeOverride={badgeTxt}
      title={`最差对比度 ${wcag.toFixed(2)}:1 · APCA Lc ${apca.toFixed(0)} · 文字 ${a.text.hex}`}
    />
  )
}

export function WhiteContrastChip({ ratio, label }: { ratio: number; label: string }) {
  return <Chip ratio={ratio} title={`${label} ${ratio.toFixed(2)}:1`} />
}
