import { create } from 'zustand'
import type { LightnessId } from '../presets/lightness'
import type { OKLCH } from '../color/oklch'
import { DEFAULT_BLOB_ANCHORS } from '../color/blobLayout'
import { hexWithHslHue, oklchHueFromHsl, seedFromHex, type AnchorHsl } from '../color/seedColor'
import { extractPosterColor, type PosterExtractResult } from '../color/posterExtract'
import { titleFromFilename } from '../color/imageTitle'
import type { Locale } from '../i18n'

const DEFAULT_HEX = '#4A6CF7'
const defaultSeed = seedFromHex(DEFAULT_HEX)
const LOCALE_KEY = 'vibe-locale'

function readLocale(): Locale {
  try {
    const v = localStorage.getItem(LOCALE_KEY)
    if (v === 'en' || v === 'zh') return v
  } catch {
    /* ignore */
  }
  return 'zh'
}

export interface StudioState {
  locale: Locale
  inputMode: 'hex' | 'image'

  hex: string
  seedH: number
  seedC: number
  anchorOklch: OKLCH
  anchorHsl: AnchorHsl
  lightnessId: LightnessId
  richness: number
  speed: number
  luminance: number
  blobAnchors: [number, number][]
  showOverlay: boolean

  imageUrl: string | null
  imageFile: File | null
  imageTitle: string | null
  posterColor: PosterExtractResult | null
  extracting: boolean

  setLocale: (locale: Locale) => void
  toggleOverlay: () => void
  setInputMode: (mode: 'hex' | 'image') => void
  setHex: (hex: string) => void
  setSeedH: (h: number) => void
  setLightness: (id: LightnessId) => void
  setRichness: (v: number) => void
  setSpeed: (v: number) => void
  setLuminance: (v: number) => void
  setBlobAnchor: (index: number, x: number, y: number) => void
  resetBlobAnchors: () => void
  loadImage: (file: File) => Promise<void>
}

export const useStudio = create<StudioState>((set, get) => ({
  locale: readLocale(),
  inputMode: 'hex',

  hex: DEFAULT_HEX,
  seedH: defaultSeed?.h ?? 255,
  seedC: defaultSeed?.c ?? 0.13,
  anchorOklch: defaultSeed?.anchor ?? { l: 0.5, c: 0.13, h: 255 },
  anchorHsl: defaultSeed?.anchorHsl ?? { h: 255, s: 0.5, l: 0.5 },
  lightnessId: 'dark',
  richness: 0.4,
  speed: 1,
  luminance: 0,
  blobAnchors: DEFAULT_BLOB_ANCHORS.map((a) => [...a] as [number, number]),
  showOverlay: true,

  imageUrl: null,
  imageFile: null,
  imageTitle: null,
  posterColor: null,
  extracting: false,

  setLocale: (locale) => {
    try {
      localStorage.setItem(LOCALE_KEY, locale)
    } catch {
      /* ignore */
    }
    set({ locale })
  },

  toggleOverlay: () => set((s) => ({ showOverlay: !s.showOverlay })),

  setInputMode: (mode) => set({ inputMode: mode }),

  setHex: (hex) => {
    const s = seedFromHex(hex)
    if (!s) {
      set({ hex })
      return
    }
    set({ hex, seedH: s.h, seedC: s.c, anchorOklch: s.anchor, anchorHsl: s.anchorHsl })
  },

  setSeedH: (h) => {
    const { hex, anchorOklch, anchorHsl } = get()
    const next = hexWithHslHue(hex, h)
    if (!next) {
      set({
        seedH: h,
        anchorHsl: { ...anchorHsl, h },
        anchorOklch: { ...anchorOklch, h: oklchHueFromHsl(h, { ...anchorHsl, h }) },
      })
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

  loadImage: async (file) => {
    const prev = get().imageUrl
    if (prev) URL.revokeObjectURL(prev)
    const url = URL.createObjectURL(file)
    set({
      imageUrl: url,
      imageFile: file,
      imageTitle: titleFromFilename(file.name),
      extracting: true,
    })
    try {
      const posterColor = await extractPosterColor(file)
      if (get().imageFile !== file) return
      set({ posterColor, extracting: false })
    } catch {
      if (get().imageFile !== file) return
      set({ posterColor: null, extracting: false })
    }
  },
}))
