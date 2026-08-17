import { toBlob } from 'html-to-image'
import type { AuroraResult } from '../color/aurora'
import { defaultGradientStops, softGradientStops } from '../color/blobGradient'

/** Phone preview inner content size (268×552 frame, 8px border, border-box). */
export const PHONE_INNER_W = 252
export const PHONE_INNER_H = 536

const BLUR_PX = 34

/** Canvas fallback — static snapshot at animation t=0; may differ from live preview. */
export function renderBackgroundCanvas(
  a: AuroraResult,
  width = PHONE_INNER_W,
  height = PHONE_INNER_H,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  ctx.fillStyle = a.base.hex
  ctx.fillRect(0, 0, width, height)

  const blend: GlobalCompositeOperation = a.blend === 'screen' ? 'screen' : 'multiply'
  const blur = BLUR_PX * (width / PHONE_INNER_W)

  for (const b of a.blobs) {
    const sizeRatio = b.size / 100
    const blobW = width * sizeRatio
    const blobH = height * sizeRatio
    const x = (b.pos[0] / 100) * width
    const y = (b.pos[1] / 100) * height
    const cx = x + blobW * (b.gradOrigin[0] / 100)
    const cy = y + blobH * (b.gradOrigin[1] / 100)
    const stops = b.softEdge ? softGradientStops(b.hex) : defaultGradientStops(b.hex)
    const r = Math.max(blobW, blobH) * (stops[stops.length - 2]?.offset ?? 0.7) * 0.5

    ctx.save()
    ctx.globalCompositeOperation = blend
    ctx.filter = `blur(${blur * (b.blurPx / BLUR_PX)}px)`

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    for (const stop of stops) {
      grad.addColorStop(stop.offset, stop.color)
    }

    ctx.fillStyle = grad
    ctx.fillRect(x, y, blobW, blobH)
    ctx.restore()
  }

  return canvas
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('PNG encode failed'))
    }, 'image/png')
  })
}

/**
 * Capture the live `.aurora-bg` layer from the phone preview — same CSS blur,
 * blend mode, and current animation frame as on screen.
 */
export async function captureBackgroundFromPreview(scale = 3): Promise<Blob> {
  const root = document.querySelector('[data-aurora-export-root]') as HTMLElement | null
  if (!root) throw new Error('Preview background not found')

  const rect = root.getBoundingClientRect()
  const blob = await toBlob(root, {
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    pixelRatio: scale,
    cacheBust: true,
    skipFonts: true,
  })
  if (!blob) throw new Error('DOM capture failed')
  return blob
}

export async function exportBackgroundPng(a: AuroraResult, scale = 3): Promise<Blob> {
  try {
    return await captureBackgroundFromPreview(scale)
  } catch {
    const canvas = renderBackgroundCanvas(a, PHONE_INNER_W * scale, PHONE_INNER_H * scale)
    return canvasToPngBlob(canvas)
  }
}

export async function downloadBackgroundPng(a: AuroraResult, scale = 3): Promise<void> {
  const blob = await exportBackgroundPng(a, scale)
  triggerPngDownload(blob)
}

export async function downloadSolidBackgroundPng(hex: string, scale = 3): Promise<void> {
  let blob: Blob
  try {
    blob = await captureBackgroundFromPreview(scale)
  } catch {
    const canvas = document.createElement('canvas')
    canvas.width = PHONE_INNER_W * scale
    canvas.height = PHONE_INNER_H * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not supported')
    ctx.fillStyle = hex
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    blob = await canvasToPngBlob(canvas)
  }
  triggerPngDownload(blob)
}

function triggerPngDownload(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `vibe-background-${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
