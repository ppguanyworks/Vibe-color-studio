import type { AuroraResult } from '../color/aurora'

const BADGE: Record<string, string> = {
  aaa: 'bg-emerald-500/15 text-emerald-300',
  aa: 'bg-sky-500/15 text-sky-300',
  large: 'bg-amber-500/15 text-amber-200',
  fail: 'bg-rose-500/15 text-rose-300',
}

export function PreviewStatusBar({ a }: { a: AuroraResult }) {
  const { wcag, apca, badgeCls, badgeTxt } = a.contrast
  return (
    <div
      className="flex items-center gap-3 flex-wrap px-4 py-2.5 rounded-[10px] border border-white/8 bg-white/[0.03] text-[11px]"
      title="在底色与每个光斑停靠点上分别计算对比度并取最差值"
    >
      <span className="text-white/40">对比度</span>
      <span className="font-mono text-[13px] text-white/90 tabular-nums">{wcag.toFixed(2)}:1</span>
      <span className={`font-semibold px-2 py-0.5 rounded-[6px] text-[10px] ${BADGE[badgeCls]}`}>{badgeTxt}</span>
      <span className="text-white/45 font-mono">
        {a.text.isLight ? '浅色文字' : '深色文字'} · {a.text.hex}
      </span>
      <span className="text-white/40 font-mono ml-auto tabular-nums">APCA Lc {apca.toFixed(0)}</span>
    </div>
  )
}
