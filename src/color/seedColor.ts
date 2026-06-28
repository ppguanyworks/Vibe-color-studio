import { parse, converter, formatHex } from 'culori'
import type { OKLCH } from './oklch'

const toHsl = converter('hsl')
const toOklch = converter('oklch')

export interface AnchorHsl {
  h: number
  s: number
  l: number
}

export interface SeedFromHex {
  /** HSL hue — matches Figma / Sketch / design-tool sliders */
  h: number
  /** OKLCH chroma from the input */
  c: number
  /** Full OKLCH of the input hex — used for the locked primary blob */
  anchor: OKLCH
  /** HSL of the input — hue offsets for companion blobs stay on this wheel */
  anchorHsl: AnchorHsl
}

export function oklchFromHsl(h: number, s: number, l: number): OKLCH | null {
  const o = toOklch({ mode: 'hsl', h, s, l })
  if (!o) return null
  return {
    l: o.l ?? l,
    c: Math.max(o.c ?? 0, 0.02),
    h: Number.isNaN(o.h as number) ? h : (o.h ?? h),
  }
}

/** Map an HSL hue (design-tool wheel) to the OKLCH hue used by the gradient engine. */
export function oklchHueFromHsl(hslH: number, ref: AnchorHsl): number {
  const o = toOklch({ mode: 'hsl', h: hslH, s: ref.s, l: ref.l })
  if (!o || Number.isNaN(o.h as number)) return hslH
  return o.h ?? hslH
}

export function anchorHslFromOklch(o: OKLCH): AnchorHsl {
  const hsl = toHsl({ mode: 'oklch', l: o.l, c: o.c, h: o.h })
  return {
    h: Number.isNaN(hsl?.h as number) ? 0 : (hsl?.h ?? 0),
    s: hsl?.s ?? 0,
    l: hsl?.l ?? 0.5,
  }
}

export function seedFromHex(hex: string): SeedFromHex | null {
  const parsed = parse(hex)
  if (!parsed) return null
  const hsl = toHsl(parsed)
  const oklch = toOklch(parsed)
  if (!hsl || !oklch) return null

  const h = Number.isNaN(hsl.h as number) ? 0 : (hsl.h ?? 0)
  const anchorH = Number.isNaN(oklch.h as number) ? 0 : (oklch.h ?? 0)

  return {
    h,
    c: Math.max(oklch.c ?? 0.04, 0.04),
    anchor: {
      l: oklch.l ?? 0.5,
      c: Math.max(oklch.c ?? 0.04, 0.04),
      h: anchorH,
    },
    anchorHsl: {
      h,
      s: hsl.s ?? 0,
      l: hsl.l ?? 0.5,
    },
  }
}

/** HSL hue for display — consistent with design tools. */
export function displayHueFromOklch(o: OKLCH): number {
  const hsl = toHsl({ mode: 'oklch', l: o.l, c: o.c, h: o.h })
  if (!hsl || Number.isNaN(hsl.h as number)) return 0
  return hsl.h ?? 0
}

/** Rotate HSL hue, return new hex + seed fields. */
export function hexWithHslHue(hex: string, hue: number): (SeedFromHex & { hex: string }) | null {
  const parsed = parse(hex)
  if (!parsed) return null
  const hsl = toHsl(parsed)
  if (!hsl) return null
  const rotated = { mode: 'hsl' as const, h: hue, s: hsl.s ?? 0, l: hsl.l ?? 0.5 }
  const nextHex = formatHex(rotated)
  if (!nextHex) return null
  const seed = seedFromHex(nextHex)
  if (!seed) return null
  return { ...seed, hex: nextHex.toUpperCase() }
}
