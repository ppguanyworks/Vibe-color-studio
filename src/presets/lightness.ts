export type LightnessId = 'light' | 'dark'

export interface LightnessPreset {
  id: LightnessId
  label: string
  desc: string
  /** base (deepest) backdrop lightness */
  baseL: number
  /** multiplier applied to the seed chroma for the base */
  baseCScale: number
  /** lightness range for blobs — individual blobs pick within via lT */
  blobL: [number, number]
  /** multiplier applied to the seed chroma for the blobs */
  blobCScale: number
  /** fixed text color (h is filled from the seed hue at runtime) */
  text: { l: number; c: number }
  /** whether the text is light (white-ish) — drives the contrast-enforcement direction */
  textIsLight: boolean
  /** how blobs composite over the base */
  blend: 'screen' | 'multiply'
}

export const LIGHTNESS_PRESETS: LightnessPreset[] = [
  {
    id: 'light',
    label: 'Light mode',
    desc: '亮色模式 · 适用于黑色文字',
    baseL: 0.94,
    baseCScale: 0.3,
    blobL: [0.78, 0.9],
    blobCScale: 1.0,
    text: { l: 0.2, c: 0.02 },
    textIsLight: false,
    blend: 'multiply',
  },
  {
    id: 'dark',
    label: 'Dark mode',
    desc: '深色模式 · 适用于白色文字',
    baseL: 0.18,
    baseCScale: 0.5,
    blobL: [0.17, 0.44],
    blobCScale: 1.0,
    text: { l: 0.98, c: 0.005 },
    textIsLight: true,
    blend: 'screen',
  },
]

export function getPreset(id: LightnessId): LightnessPreset {
  return LIGHTNESS_PRESETS.find((p) => p.id === id) ?? LIGHTNESS_PRESETS[1]
}
