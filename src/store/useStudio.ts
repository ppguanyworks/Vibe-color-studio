import { create } from 'zustand'
import type { LightnessId } from '../presets/lightness'
import type { OKLCH } from '../color/oklch'
import { DEFAULT_BLOB_ANCHORS } from '../color/blobLayout'
import { anchorHslFromOklch, displayHueFromOklch, hexWithHslHue, oklchHueFromHsl, seedFromHex, type AnchorHsl } from '../color/seedColor'
import { extractFromImage, type Extraction, type Swatch } from '../color/quantize'

const DEFAULT_HEX = '#4A6CF7'
const defaultSeed = seedFromHex(DEFAULT_HEX)

function applyExtractedMain(main: OKLCH) {
  return {
    seedH: displayHueFromOklch(main),
    seedC: Math.max(main.c, 0.05),
    anchorOklch: { l: main.l, c: Math.max(main.c, 0.05), h: main.h },
    anchorHsl: anchorHslFromOklch(main),
  }
}

export interface StudioState {
  inputMode: 'hex' | 'image'
  hex: string
  /** HSL hue — matches Figma / design-tool H sliders */
  seedH: number
  seedC: number
  anchorOklch: OKLCH
  anchorHsl: AnchorHsl
  palette: Swatch[]
  imageUrl: string | null
  imageFile: File | null
  mergeSimilar: number
  lastExtraction: Extraction | null
  lightnessId: LightnessId
  richness: number
  speed: number
  luminance: number
  blobAnchors: [number, number][]

  setInputMode: (mode: 'hex' | 'image') => void
  setHex: (hex: string) => void
  setSeedH: (h: number) => void
  setMerge: (v: number) => void
  setLightness: (id: LightnessId) => void
  setRichness: (v: number) => void
  setSpeed: (v: number) => void
  setLuminance: (v: number) => void
  setBlobAnchor: (index: number, x: number, y: number) => void
  resetBlobAnchors: () => void
  loadImage: (file: File) => Promise<void>
}

export const useStudio = create<StudioState>((set, get) => ({
  inputMode: 'image',
  hex: DEFAULT_HEX,
  seedH: defaultSeed?.h ?? 255,
  seedC: defaultSeed?.c ?? 0.13,
  anchorOklch: defaultSeed?.anchor ?? { l: 0.5, c: 0.13, h: 255 },
  anchorHsl: defaultSeed?.anchorHsl ?? { h: 255, s: 0.5, l: 0.5 },
  palette: [],
  imageUrl: null,
  imageFile: null,
  mergeSimilar: 0.4,
  lastExtraction: null,
  lightnessId: 'dark',
  richness: 0.4,
  speed: 1,
  luminance: 0,
  blobAnchors: DEFAULT_BLOB_ANCHORS.map((a) => [...a] as [number, number]),

  setInputMode: (mode) => set({ inputMode: mode, ...(mode === 'hex' ? { lastExtraction: null } : {}) }),

  setHex: (hex) => {
    const s = seedFromHex(hex)
    if (!s) {
      set({ hex })
      return
    }
    set({ hex, seedH: s.h, seedC: s.c, anchorOklch: s.anchor, anchorHsl: s.anchorHsl })
  },

  setSeedH: (h) => {
    const { hex, inputMode, anchorOklch, anchorHsl } = get()
    if (inputMode !== 'hex') {
      set({
        seedH: h,
        anchorHsl: { ...anchorHsl, h },
        anchorOklch: { ...anchorOklch, h: oklchHueFromHsl(h, { ...anchorHsl, h }) },
      })
      return
    }
    const next = hexWithHslHue(hex, h)
    if (!next) {
      set({ seedH: h })
      return
    }
    set({
      hex: next.hex,
      seedH: next.h,
      seedC: next.c,
      anchorOklch: next.anchor,
      anchorHsl: next.anchorHsl,
    })
  },

  setLightness: (id) => set({ lightnessId: id }),
  setRichness: (v) => set({ richness: v }),
  setSpeed: (v) => set({ speed: v }),
  setLuminance: (v) => set({ luminance: v }),

  setBlobAnchor: (index, x, y) =>
    set((s) => ({
      blobAnchors: s.blobAnchors.map((pt, i) => (i === index ? [x, y] : pt)),
    })),

  resetBlobAnchors: () =>
    set({ blobAnchors: DEFAULT_BLOB_ANCHORS.map((a) => [...a] as [number, number]) }),

  setMerge: async (v) => {
    set({ mergeSimilar: v })
    const f = get().imageFile
    if (f) {
      const ex = await extractFromImage(f, v)
      set({
        palette: ex.palette,
        ...applyExtractedMain(ex.main),
        lastExtraction: ex,
      })
    }
  },

  loadImage: async (file) => {
    const prev = get().imageUrl
    if (prev) URL.revokeObjectURL(prev)
    const url = URL.createObjectURL(file)
    const ex = await extractFromImage(file, get().mergeSimilar)
    set({
      imageUrl: url,
      imageFile: file,
      palette: ex.palette,
      ...applyExtractedMain(ex.main),
      lastExtraction: ex,
    })
  },
}))
