/** TUX semantic tokens — bound from Figma node 380:59109 variable defs. */
export const tuxPreview = {
  pageFlat1: '#000000',
  text1: '#F6F6F6',
  text3: '#FFFFFF99',
  textWhite: '#FFFFFF',
  shapeNeutral4: '#FFFFFF21',
  shapeNeutral3: '#FFFFFF30',
  shapeNeutral: '#FAFAFA',
  textOnNeutral: '#000000',
  imagePlaceholder: 'rgba(255, 255, 255, 0.05)',
  radiusContentCapsule: 999,
  radiusCard: 40,
  radiusImage: 14,
  buttonHeightL: 52,
} as const

/** Typography presets mapped from Figma App/* tokens (390pt base). */
export const tuxType = {
  h1Bold: { size: 24, weight: 700, lineHeight: 1.25 },
  h3Medium: { size: 17, weight: 500, lineHeight: 1.3 },
  h3Bold: { size: 17, weight: 700, lineHeight: 1.3 },
  p2Semibold: { size: 13, weight: 600, lineHeight: 1.3 },
  headlineSemibold: { size: 16, weight: 600, lineHeight: 1.3 },
  smallText2Medium: { size: 10, weight: 500, lineHeight: 1.3, letterSpacing: 0.23 },
} as const

export const PHONE_W = 390
export const PREVIEW_W = 268
export const previewScale = (n: number) => Math.round(n * (PREVIEW_W / PHONE_W))
