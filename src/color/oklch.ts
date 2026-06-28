import { formatHex, formatCss, clampChroma, wcagContrast, inGamut } from 'culori'

export interface OKLCH {
  l: number
  c: number
  h: number
}

const isRgbInGamut = inGamut('rgb')

export function ok(l: number, c: number, h: number): OKLCH {
  return { l, c, h }
}

function asColor(o: OKLCH) {
  return { mode: 'oklch' as const, l: o.l, c: o.c, h: o.h }
}

export interface Resolved {
  hex: string
  oklchCss: string
  clamped: boolean
}

/** Resolve an OKLCH value to an in-gamut sRGB hex, flagging if chroma had to be clamped. */
export function resolve(o: OKLCH): Resolved {
  const color = asColor(o)
  const clamped = !isRgbInGamut(color)
  const mapped = clamped ? clampChroma(color, 'oklch') : color
  return {
    hex: (formatHex(mapped) ?? '#000000').toUpperCase(),
    oklchCss: formatCss(color) ?? `oklch(${round(o.l, 4)} ${round(o.c, 4)} ${round(o.h, 2)})`,
    clamped,
  }
}

export function round(n: number, d = 3): number {
  const f = Math.pow(10, d)
  return Math.round(n * f) / f
}

/** WCAG 2.x contrast ratio between two hex colors. */
export function contrastHex(aHex: string, bHex: string): number {
  return wcagContrast(aHex, bHex)
}

export function hexToRgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** APCA-W3 (0.0.98G) lightness contrast, returns Lc (can be negative). */
export function apca(textHex: string, bgHex: string): number {
  const t = hexToRgb(textHex)
  const b = hexToRgb(bgHex)
  const Ys = (c: { r: number; g: number; b: number }) => {
    const f = (v: number) => Math.pow(v / 255, 2.4)
    return 0.2126729 * f(c.r) + 0.7151522 * f(c.g) + 0.072175 * f(c.b)
  }
  const blkThrs = 0.022
  const blkClmp = 1.414
  const soft = (y: number) => (y < blkThrs ? y + Math.pow(blkThrs - y, blkClmp) : y)
  const Yt = soft(Ys(t))
  const Yb = soft(Ys(b))
  if (Math.abs(Yb - Yt) < 0.0005) return 0
  let S: number
  if (Yb > Yt) {
    S = (Math.pow(Yb, 0.56) - Math.pow(Yt, 0.57)) * 1.14
    S = S < 0.1 ? 0 : S - 0.027
  } else {
    S = (Math.pow(Yb, 0.65) - Math.pow(Yt, 0.62)) * 1.14
    S = S > -0.1 ? 0 : S + 0.027
  }
  return S * 100
}

export function wcagBadge(r: number): { cls: string; txt: string } {
  if (r >= 7) return { cls: 'aaa', txt: 'AAA' }
  if (r >= 4.5) return { cls: 'aa', txt: 'AA' }
  if (r >= 3) return { cls: 'large', txt: 'AA 大字' }
  return { cls: 'fail', txt: '未达标' }
}
