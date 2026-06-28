/** FlyMainColor-aligned defaults (subset — see FlyMainColor.md). */
export const FLY_EXTRACT_DEFAULTS = {
  colorMergingTolerance: 4,
  lightnessAddition: 0,
  chromaFrom: 0,
  chromaTo: 0.4,
  lightnessFrom: 0,
  lightnessTo: 1,
  strategyThreshold: 0.2,
  maxColors: 16,
  /** UI mergeSimilar (0..1) × scale → Fly tolerance (0..10). */
  toleranceScale: 10,
} as const

export interface FlyExtractConfig {
  colorMergingTolerance: number
  lightnessAddition: number
  chromaFrom: number
  chromaTo: number
  lightnessFrom: number
  lightnessTo: number
  strategyThreshold: number
  maxColors: number
}

export function defaultFlyExtractConfig(): FlyExtractConfig {
  const d = FLY_EXTRACT_DEFAULTS
  return {
    colorMergingTolerance: d.colorMergingTolerance,
    lightnessAddition: d.lightnessAddition,
    chromaFrom: d.chromaFrom,
    chromaTo: d.chromaTo,
    lightnessFrom: d.lightnessFrom,
    lightnessTo: d.lightnessTo,
    strategyThreshold: d.strategyThreshold,
    maxColors: d.maxColors,
  }
}

/** Map UI slider mergeSimilar (0..1) to Fly colorMergingTolerance (0..10). */
export function mergeSimilarToTolerance(mergeSimilar: number): number {
  return mergeSimilar * FLY_EXTRACT_DEFAULTS.toleranceScale
}

/** Calibrated OKLab ΔE merge threshold from Fly tolerance. */
export function toleranceToMergeThreshold(tolerance: number): number {
  const t = Math.max(0, Math.min(FLY_EXTRACT_DEFAULTS.toleranceScale, tolerance))
  return 0.02 + (t / FLY_EXTRACT_DEFAULTS.toleranceScale) * 0.18
}

export function configFromMergeSimilar(mergeSimilar: number): FlyExtractConfig {
  return {
    ...defaultFlyExtractConfig(),
    colorMergingTolerance: mergeSimilarToTolerance(mergeSimilar),
  }
}
