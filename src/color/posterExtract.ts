import { converter, formatHex, inGamut, wcagContrast } from 'culori'
import { round } from './oklch'

const toOklch = converter('oklch')
const isRgbInGamut = inGamut('rgb')

export const POSTER_EXTRACT = {
  targetSamples: 2400,
  lightnessMin: 0.2,
  lightnessMax: 0.65,
  maxChroma: 0.15,
  targetContrast: 9,
  hueBucketCount: 12,
  neutralChroma: 0.03,
  iterations: 24,
} as const

export interface PosterExtractResult {
  color: string
  sourceColor: string
  oklch: { l: number; c: number; h: number }
  contrast: number
  sampleCount: number
  candidateCount: number
  grid: { columns: number; rows: number }
  width: number
  height: number
  algorithm: 'oklch-v2.3'
}

type Sample = { l: number; c: number; h: number }

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2
}

function circularMeanHue(hues: number[]): number {
  if (hues.length === 0) return 0
  let sin = 0
  let cos = 0
  for (const h of hues) {
    const r = (h * Math.PI) / 180
    sin += Math.sin(r)
    cos += Math.cos(r)
  }
  const n = hues.length
  let deg = (Math.atan2(sin / n, cos / n) * 180) / Math.PI
  if (deg < 0) deg += 360
  return deg
}

function asOklch(l: number, c: number, h: number) {
  return { mode: 'oklch' as const, l, c, h }
}

function toHex(l: number, c: number, h: number): string {
  return (formatHex(asOklch(l, c, h)) ?? '#000000').toUpperCase()
}

/** Keep L/H, binary-search C down until the color is in sRGB. */
function mapToSrgb(l: number, c: number, h: number): Sample {
  const start = asOklch(l, c, h)
  if (isRgbInGamut(start)) return { l, c, h }
  let lo = 0
  let hi = c
  for (let i = 0; i < POSTER_EXTRACT.iterations; i++) {
    const mid = (lo + hi) / 2
    if (isRgbInGamut(asOklch(l, mid, h))) lo = mid
    else hi = mid
  }
  return { l, c: lo, h }
}

/** Maximize L while keeping white-text WCAG contrast ≥ target. */
function ensureWhiteContrast(sample: Sample): Sample {
  const mapped = mapToSrgb(sample.l, sample.c, sample.h)
  const hex = toHex(mapped.l, mapped.c, mapped.h)
  if (wcagContrast('#ffffff', hex) >= POSTER_EXTRACT.targetContrast) return mapped

  let lo = 0
  let hi = mapped.l
  let best = { l: 0, c: mapped.c, h: mapped.h }
  for (let i = 0; i < POSTER_EXTRACT.iterations; i++) {
    const mid = (lo + hi) / 2
    const candidate = mapToSrgb(mid, mapped.c, mapped.h)
    const ratio = wcagContrast('#ffffff', toHex(candidate.l, candidate.c, candidate.h))
    if (ratio >= POSTER_EXTRACT.targetContrast) {
      best = candidate
      lo = mid
    } else {
      hi = mid
    }
  }
  return best
}

function sampleGrid(imageData: ImageData): { samples: Sample[]; columns: number; rows: number } {
  const { width, height, data } = imageData
  const { targetSamples } = POSTER_EXTRACT
  const columns = Math.max(1, Math.round(Math.sqrt((targetSamples * width) / height)))
  const rows = Math.max(1, Math.round(targetSamples / columns))
  const samples: Sample[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = Math.min(width - 1, Math.floor((col + 0.5) * (width / columns)))
      const y = Math.min(height - 1, Math.floor((row + 0.5) * (height / rows)))
      const i = (y * width + x) * 4
      const r = (data[i] ?? 0) / 255
      const g = (data[i + 1] ?? 0) / 255
      const b = (data[i + 2] ?? 0) / 255
      const converted = toOklch({ mode: 'rgb', r, g, b })
      samples.push({
        l: converted?.l ?? 0,
        c: converted?.c ?? 0,
        h: converted?.h ?? 0,
      })
    }
  }

  return { samples, columns, rows }
}

function pickDominantBucket(candidates: Sample[]): Sample[] {
  const { hueBucketCount, neutralChroma } = POSTER_EXTRACT
  const buckets = new Map<string, Sample[]>()

  for (const s of candidates) {
    const key =
      s.c < neutralChroma
        ? `n:${Math.min(8, Math.max(0, Math.floor(s.l * 10)))}`
        : `h:${Math.floor((((s.h % 360) + 360) % 360) / (360 / hueBucketCount)) % hueBucketCount}`
    const list = buckets.get(key)
    if (list) list.push(s)
    else buckets.set(key, [s])
  }

  let best: Sample[] = []
  for (const list of buckets.values()) {
    if (list.length > best.length) best = list
  }
  return best
}

function representBucket(bucket: Sample[]): Sample {
  const l = median(bucket.map((s) => s.l))
  const c = Math.min(median(bucket.map((s) => s.c)), POSTER_EXTRACT.maxChroma)
  const h = circularMeanHue(bucket.map((s) => s.h))
  return { l, c, h }
}

async function pixelsFromFile(file: File): Promise<{ imageData: ImageData; width: number; height: number }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Canvas not supported')
  }
  // Transparent pixels composite onto white, matching V2.3.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return { imageData, width: canvas.width, height: canvas.height }
}

export async function extractPosterColor(file: File): Promise<PosterExtractResult> {
  const { imageData, width, height } = await pixelsFromFile(file)
  const { samples, columns, rows } = sampleGrid(imageData)
  const candidates = samples.filter(
    (s) => s.l >= POSTER_EXTRACT.lightnessMin && s.l <= POSTER_EXTRACT.lightnessMax,
  )

  if (candidates.length === 0) {
    return {
      color: '#000000',
      sourceColor: '#000000',
      oklch: { l: 0, c: 0, h: 0 },
      contrast: wcagContrast('#ffffff', '#000000'),
      sampleCount: samples.length,
      candidateCount: 0,
      grid: { columns, rows },
      width,
      height,
      algorithm: 'oklch-v2.3',
    }
  }

  const bucket = pickDominantBucket(candidates)
  const source = representBucket(bucket)
  const sourceMapped = mapToSrgb(source.l, source.c, source.h)
  const sourceColor = toHex(sourceMapped.l, sourceMapped.c, sourceMapped.h)
  const final = ensureWhiteContrast(sourceMapped)
  const color = toHex(final.l, final.c, final.h)

  return {
    color,
    sourceColor,
    oklch: { l: round(final.l, 4), c: round(final.c, 4), h: round(final.h, 2) },
    contrast: round(wcagContrast('#ffffff', color), 2),
    sampleCount: samples.length,
    candidateCount: candidates.length,
    grid: { columns, rows },
    width,
    height,
    algorithm: 'oklch-v2.3',
  }
}
