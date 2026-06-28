export const DEFAULT_BLOB_BLUR = 34
export const DEFAULT_BLOB_BLUR_PEAK = 40
export const ANCHOR_BLOB_BLUR = 48
export const ANCHOR_BLOB_BLUR_PEAK = 56

/** Multi-stop radial gradient — anchor blob gets a longer, softer falloff. */
export function buildBlobGradient(
  hex: string,
  origin: [number, number],
  soft = false,
): string {
  const [x, y] = origin
  if (soft) {
    return `radial-gradient(circle at ${x}% ${y}%, ${hex} 0%, color-mix(in srgb, ${hex} 36%, transparent) 30%, color-mix(in srgb, ${hex} 12%, transparent) 52%, transparent 92%)`
  }
  return `radial-gradient(circle at ${x}% ${y}%, ${hex} 0%, transparent 70%)`
}

/** Canvas radial-gradient stops approximating the CSS soft falloff. */
export function softGradientStops(hex: string): { offset: number; color: string }[] {
  return [
    { offset: 0, color: hex },
    { offset: 0.3, color: mixHexAlpha(hex, 0.36) },
    { offset: 0.52, color: mixHexAlpha(hex, 0.12) },
    { offset: 0.92, color: mixHexAlpha(hex, 0) },
    { offset: 1, color: mixHexAlpha(hex, 0) },
  ]
}

export function defaultGradientStops(hex: string): { offset: number; color: string }[] {
  return [
    { offset: 0, color: hex },
    { offset: 0.7, color: mixHexAlpha(hex, 0) },
    { offset: 1, color: mixHexAlpha(hex, 0) },
  ]
}

function mixHexAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r},${g},${b},${alpha})`
}
