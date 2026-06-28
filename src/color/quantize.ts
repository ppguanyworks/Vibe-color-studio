import { ok, resolve, type OKLCH } from './oklch'
import { configFromMergeSimilar } from './flyExtractConfig'
import { extractFlyColors, type ClusterResult } from './flyExtract'

export interface Swatch {
  hex: string
  oklch: OKLCH
  weight: number
}

export interface ExtractionMeta {
  colorMergingTolerance: number
  lightnessAddition: number
  resultNum: number
}

export interface Extraction {
  main: OKLCH
  palette: Swatch[]
  allColors: ClusterResult[]
  meta: ExtractionMeta
}

const FALLBACK = ok(0.5, 0.12, 255)

export async function extractFromImage(file: File, mergeSimilar: number): Promise<Extraction> {
  const bitmap = await createImageBitmap(file)
  const MAX = 96
  const scale = Math.min(MAX / bitmap.width, MAX / bitmap.height, 1)
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(bitmap, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)
  bitmap.close?.()
  return quantize(data, mergeSimilar)
}

/** FlyMainColor-aligned quantize: merge → cap 16 → weight → OKLCH filter/tweak. */
export function quantize(data: Uint8ClampedArray, mergeSimilar: number): Extraction {
  const cfg = configFromMergeSimilar(mergeSimilar)
  const result = extractFlyColors(data, cfg)

  const palette = result.kept.slice(0, 6).map((c) => ({
    hex: c.hex,
    oklch: c.oklch,
    weight: c.histogram,
  }))

  const paletteOrFallback =
    palette.length > 0 ? palette : [{ hex: resolve(FALLBACK).hex, oklch: FALLBACK, weight: 0 }]

  return {
    main: result.main,
    palette: paletteOrFallback,
    allColors: result.kept,
    meta: {
      colorMergingTolerance: cfg.colorMergingTolerance,
      lightnessAddition: cfg.lightnessAddition,
      resultNum: result.resultNum,
    },
  }
}
