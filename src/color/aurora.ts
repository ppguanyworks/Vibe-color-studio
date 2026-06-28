import { ok, resolve, contrastHex, apca, wcagBadge, type OKLCH } from './oklch'
import { getPreset, type LightnessId } from '../presets/lightness'
import { anchorToPos, BLOB_COUNT, DEFAULT_BLOB_ANCHORS, DEFAULT_BLOB_SIZE } from './blobLayout'
import {
  ANCHOR_BLOB_BLUR,
  ANCHOR_BLOB_BLUR_PEAK,
  buildBlobGradient,
  DEFAULT_BLOB_BLUR,
  DEFAULT_BLOB_BLUR_PEAK,
} from './blobGradient'
import { oklchHueFromHsl, type AnchorHsl } from './seedColor'

/** Per-slot profile: position, gradient origin, lightness tier, hue/chroma multipliers. */
interface BlobProfile {
  pos: [number, number]
  /** Radial-gradient center within the blob element (%). Aims bright cores into the frame. */
  gradOrigin: [number, number]
  /** Blob element width/height as % of frame */
  size: number
  /** Softer multi-stop gradient for smoother screen-blend edges */
  softEdge?: boolean
  /** CSS blur radius (px) */
  blurPx?: number
  /** 0 = darkest blob in range, 1 = brightest — not tied to slot index */
  lT: number
  hueK: number
  chromaK: number
  keyframe: string
  durationMs: number
}

/**
 * Vertical bias: bright blobs sit high, bottom corners stay deep for tab-bar blend.
 * gradOrigin pulls each blob's hot spot toward the visible corner.
 */
const BLOB_PROFILES: BlobProfile[] = [
  { pos: [-38, -42], gradOrigin: [82, 82], size: 125, softEdge: true, blurPx: ANCHOR_BLOB_BLUR, lT: 1, hueK: 0, chromaK: 0.45, keyframe: 'float1', durationMs: 9000 }, // TL · 主色 anchor
  { pos: [68, -22], gradOrigin: [28, 78], size: DEFAULT_BLOB_SIZE, lT: 0.56, hueK: -0.95, chromaK: -0.55, keyframe: 'float2', durationMs: 14000 }, // TR
  { pos: [-22, 78], gradOrigin: [78, 22], size: DEFAULT_BLOB_SIZE, lT: 0.12, hueK: 0.55, chromaK: -0.65, keyframe: 'float3', durationMs: 18000 }, // BL
  { pos: [72, 82], gradOrigin: [18, 18], size: DEFAULT_BLOB_SIZE, lT: 0, hueK: 0.3, chromaK: -0.9, keyframe: 'float4', durationMs: 23000 }, // BR
  { pos: [28, -8], gradOrigin: [50, 65], size: 125, lT: 0.48, hueK: -0.4, chromaK: 0.35, keyframe: 'float5', durationMs: 27000 }, // upper-center
]

/** Slider 1.0× ≈ previous 0.8× animation pace */
const SPEED_BASE = 0.8

/** Stagger start phases so blobs never move in sync */
const BLOB_DELAY_MS = [-800, -3200, -5600, -2100, -4400]

/** Which profile slots to use — always 5 blobs. */
const BLOB_SLOTS = [0, 1, 2, 3, 4] as const

export interface AuroraParams {
  seedH: number
  seedC: number
  anchorOklch: OKLCH
  anchorHsl: AnchorHsl
  lightnessId: LightnessId
  richness: number // 0..1
  speed: number // 0.25..2.5
  /** Overall OKLCH L shift — −1 darker … 0 … +1 brighter */
  luminance: number
  blobAnchors: [number, number][]
}

export interface Blob {
  profileId: number
  oklch: OKLCH
  hex: string
  oklchCss: string
  clamped: boolean
  pos: [number, number]
  gradOrigin: [number, number]
  anchor: [number, number]
  size: number
  gradCss: string
  blurPx: number
  blurPeakPx: number
  softEdge: boolean
  durationMs: number
  delayMs: number
  keyframe: string
}

export interface AuroraResult {
  base: { oklch: OKLCH; hex: string; oklchCss: string; clamped: boolean }
  blobs: Blob[]
  blend: 'screen' | 'multiply'
  text: { oklch: OKLCH; hex: string; oklchCss: string; isLight: boolean }
  contrast: { wcag: number; apca: number; badgeCls: string; badgeTxt: string }
  params: AuroraParams
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)

const CONTRAST_TARGET = 4.6
/** Max OKLCH L delta when luminance is ±1 */
const LUMINANCE_L_DELTA = 0.38

function shiftL(l: number, luminance: number): number {
  return clamp(l + luminance * LUMINANCE_L_DELTA, 0.03, 0.99)
}

function enforceContrast(stops: OKLCH[], text: OKLCH, textIsLight: boolean) {
  const textHex = resolve(text).hex
  for (const s of stops) {
    let guard = 0
    while (guard++ < 80) {
      if (contrastHex(textHex, resolve(s).hex) >= CONTRAST_TARGET) break
      if (textIsLight) {
        if (s.l <= 0.08) break
        s.l = Math.max(0.08, s.l - 0.01)
      } else {
        if (s.l >= 0.99) break
        s.l = Math.min(0.99, s.l + 0.01)
      }
    }
  }
}

/** Profile index that always keeps the seed hue (brightness/chroma may still vary). */
const HUE_ANCHOR_PROFILE = 0
/** Upper-center blob — shares main-anchor perceptual L tuning. */
const UPPER_CENTER_PROFILE = 4

/**
 * Yellow–green hues read brighter than OKLCH L suggests (Helmholtz–Kohlrausch).
 * Returns a negative OKLCH L delta for profile 0 / 4 when seedH sits in that band.
 */
export function yellowGreenLShift(hslH: number): number {
  const YG_LO = 38
  const YG_HI = 152
  const YG_PEAK = 92
  const YG_MAX_DELTA = -0.05

  const h = ((hslH % 360) + 360) % 360
  if (h < YG_LO || h > YG_HI) return 0

  const t =
    h <= YG_PEAK ? (h - YG_LO) / (YG_PEAK - YG_LO) : (YG_HI - h) / (YG_HI - YG_PEAK)
  const s = t * t * (3 - 2 * t)
  return YG_MAX_DELTA * s
}

export function generateAurora(p: AuroraParams): AuroraResult {
  const preset = getPreset(p.lightnessId)
  const dHmax = lerp(3, 56, p.richness)
  const dCmax = lerp(0, 0.14, p.richness)
  const anchors =
    p.blobAnchors.length === BLOB_COUNT ? p.blobAnchors : DEFAULT_BLOB_ANCHORS

  const primaryHue = oklchHueFromHsl(p.seedH, p.anchorHsl)
  const base = ok(preset.baseL, Math.min(p.seedC * preset.baseCScale, 0.2), primaryHue)
  const text = ok(preset.text.l, preset.text.c, primaryHue)
  base.l = shiftL(base.l, p.luminance)
  text.l = shiftL(text.l, p.luminance)

  const brightHueShift = yellowGreenLShift(p.seedH)

  const raw: OKLCH[] = []
  for (let i = 0; i < BLOB_SLOTS.length; i++) {
    const slot = BLOB_SLOTS[i]
    const profile = BLOB_PROFILES[slot]

    if (slot === HUE_ANCHOR_PROFILE) {
      raw.push({
        ...p.anchorOklch,
        l: shiftL(p.anchorOklch.l + brightHueShift, p.luminance),
      })
      continue
    }

    const hslH = p.seedH + profile.hueK * dHmax
    const h = oklchHueFromHsl(hslH, p.anchorHsl)
    const c = clamp(p.seedC * preset.blobCScale + profile.chromaK * dCmax, 0.02, 0.2)
    const profileBrightShift = slot === UPPER_CENTER_PROFILE ? brightHueShift : 0
    const l = shiftL(
      lerp(preset.blobL[0], preset.blobL[1], profile.lT) + profileBrightShift,
      p.luminance,
    )
    raw.push(ok(l, c, h))
  }

  enforceContrast([base], text, preset.textIsLight)

  const blobEntries = raw.map((o, i) => {
    const slot = BLOB_SLOTS[i]
    const profile = BLOB_PROFILES[slot]
    const anchor = anchors[slot] ?? DEFAULT_BLOB_ANCHORS[slot]
    const r = resolve(o)
    const blurPx = profile.blurPx ?? DEFAULT_BLOB_BLUR
    const blurPeakPx =
      profile.blurPx != null
        ? profile.blurPx + (ANCHOR_BLOB_BLUR_PEAK - ANCHOR_BLOB_BLUR)
        : DEFAULT_BLOB_BLUR_PEAK
    const gradOrigin = [50, 50] as [number, number]
    return {
      profileId: slot,
      oklch: o,
      hex: r.hex,
      oklchCss: r.oklchCss,
      clamped: r.clamped,
      pos: anchorToPos(anchor, profile.size),
      gradOrigin,
      anchor,
      size: profile.size,
      gradCss: buildBlobGradient(r.hex, gradOrigin, profile.softEdge),
      blurPx,
      blurPeakPx,
      softEdge: !!profile.softEdge,
      durationMs: Math.round(profile.durationMs / (p.speed * SPEED_BASE)),
      delayMs: BLOB_DELAY_MS[slot] ?? -i * 2000,
      keyframe: profile.keyframe,
    }
  })

  // Darkest first so screen-blended highlights stack on top in bright regions.
  blobEntries.sort((a, b) => a.oklch.l - b.oklch.l)
  const blobs: Blob[] = blobEntries

  const baseRes = resolve(base)
  const textRes = resolve(text)

  const stopsHex = [baseRes.hex, ...blobs.map((b) => b.hex)]
  let worst = Infinity
  let worstHex = stopsHex[0]
  for (const hx of stopsHex) {
    const r = contrastHex(textRes.hex, hx)
    if (r < worst) {
      worst = r
      worstHex = hx
    }
  }
  const lc = Math.abs(apca(textRes.hex, worstHex))
  const b = wcagBadge(worst)

  return {
    base: { oklch: base, hex: baseRes.hex, oklchCss: baseRes.oklchCss, clamped: baseRes.clamped },
    blobs,
    blend: preset.blend,
    text: { oklch: text, hex: textRes.hex, oklchCss: textRes.oklchCss, isLight: preset.textIsLight },
    contrast: { wcag: worst, apca: lc, badgeCls: b.cls, badgeTxt: b.txt },
    params: p,
  }
}
