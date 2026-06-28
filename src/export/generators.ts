import { round } from '../color/oklch'
import type { AuroraResult } from '../color/aurora'
import type { Extraction } from '../color/quantize'
import AURORA_KEYFRAMES from '../styles/aurora-keyframes.css?raw'

const KEYFRAMES_CSS = AURORA_KEYFRAMES.replace(/@media[\s\S]*$/, '')
  .replace(/\.aurora-blob/g, '.aurora__blob')
  .trim()

/** Drop-in HTML + CSS that reproduces the animated, flowing aurora. */
export function exportCSS(a: AuroraResult): string {
  const blobRules = a.blobs
    .map((b, i) => {
      return `.aurora__blob--${i + 1}{
  left:${b.pos[0]}%; top:${b.pos[1]}%; width:${b.size}%; height:${b.size}%;
  --blob-blur:${b.blurPx}px; --blob-blur-peak:${b.blurPeakPx}px;
  background:${b.gradCss}; /* ${b.oklchCss} */
  animation:${b.keyframe} ${b.durationMs}ms cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite${b.profileId === 0 ? ', aurora-breathe 14s ease-in-out infinite' : ''};
  animation-delay:${b.delayMs}ms${b.profileId === 0 ? ', -3s' : ''};
}`
    })
    .join('\n')

  const blobDivs = a.blobs.map((_, i) => `    <span class="aurora__blob aurora__blob--${i + 1}"></span>`).join('\n')

  return `<!-- Vibe Color Studio · 动态渐变背景 -->
<div class="aurora">
  <div class="aurora__bg">
${blobDivs}
  </div>
  <div class="aurora__content">
    <!-- 你的内容；文字建议用 ${a.text.isLight ? '浅色' : '深色'}：color: ${a.text.hex}; -->
  </div>
</div>

<style>
.aurora{ position:relative; overflow:hidden; isolation:isolate; background:${a.base.hex}; color:${a.text.hex}; }
.aurora__bg{ position:absolute; inset:0; overflow:hidden; }
.aurora__content{ position:relative; z-index:1; }
.aurora__blob{
  position:absolute; border-radius:50%;
  filter:blur(var(--blob-blur, 34px)); mix-blend-mode:${a.blend}; will-change:transform; transform-origin:center;
}
${blobRules}
${KEYFRAMES_CSS}
@media (prefers-reduced-motion: reduce){ .aurora__blob{ animation:none !important; filter:blur(var(--blob-blur, 34px)) !important; } }
</style>`
}

/** A single static background-image snapshot (no motion). */
export function exportStatic(a: AuroraResult): string {
  // map blob anchors to comfortable in-frame positions for a frozen gradient
  const fixed: [number, number][] = [
    [18, 16],
    [82, 22],
    [12, 84],
    [88, 80],
    [50, 8],
  ]
  const layers = a.blobs
    .map((b, i) => {
      const p = fixed[i] ?? [50, 50]
      return `    radial-gradient(60% 60% at ${p[0]}% ${p[1]}%, ${b.hex} 0%, transparent 62%)`
    })
    .join(',\n')

  return `/* Vibe Color Studio · 静态渐变快照 */
.aurora-static{
  background-color:${a.base.hex};
  background-image:
${layers};
  color:${a.text.hex};
}`
}

/** Machine-readable tokens for design systems / re-editing. */
export function exportJSON(a: AuroraResult, extraction?: Extraction | null): string {
  const obj: Record<string, unknown> = {
    name: 'vibe-aurora',
    params: {
      seedH: round(a.params.seedH, 2),
      seedC: round(a.params.seedC, 4),
      anchorOklch: a.params.anchorOklch,
      anchorHsl: a.params.anchorHsl,
      lightness: a.params.lightnessId,
      richness: round(a.params.richness, 3),
      speed: round(a.params.speed, 2),
      luminance: round(a.params.luminance, 2),
      blobAnchors: a.params.blobAnchors,
    },
    base: { oklch: a.base.oklchCss, hex: a.base.hex },
    text: { oklch: a.text.oklchCss, hex: a.text.hex, isLight: a.text.isLight },
    blend: a.blend,
    blobs: a.blobs.map((b) => ({
      profileId: b.profileId,
      oklch: b.oklchCss,
      hex: b.hex,
      pos: b.pos,
      anchor: b.anchor,
      gradOrigin: b.gradOrigin,
      size: b.size,
      gradCss: b.gradCss,
      blurPx: b.blurPx,
      durationMs: b.durationMs,
      clamped: b.clamped,
    })),
    contrast: {
      wcag: round(a.contrast.wcag, 2),
      apca: round(a.contrast.apca, 0),
      badge: a.contrast.badgeTxt,
    },
  }

  if (extraction) {
    obj.extraction = {
      pipeline: 'fly-main-color-subset',
      colorMergingTolerance: extraction.meta.colorMergingTolerance,
      lightnessAddition: extraction.meta.lightnessAddition,
      resultNum: extraction.meta.resultNum,
      primary: {
        oklch: extraction.main,
        hex: extraction.palette[0]?.hex,
      },
      palette: extraction.palette.map((s) => ({
        hex: s.hex,
        oklch: s.oklch,
        weight: s.weight,
      })),
      colors: extraction.allColors.map((c) => ({
        hex: c.hex,
        oklch: c.oklch,
        histogram: c.histogram,
        compositeWeight: round(c.compositeWeight, 2),
        ratio: round(c.ratio, 4),
        filtered: c.filtered,
        tweaked: c.tweaked,
      })),
    }
  }

  return JSON.stringify(obj, null, 2)
}

export type ExportFormat = 'css' | 'static' | 'json'

export function generateExport(
  format: ExportFormat,
  a: AuroraResult,
  extraction?: Extraction | null,
): string {
  if (format === 'css') return exportCSS(a)
  if (format === 'static') return exportStatic(a)
  return exportJSON(a, extraction)
}
