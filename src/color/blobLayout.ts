export const BLOB_COUNT = 5

/** Default blob element size as % of the frame. */
export const DEFAULT_BLOB_SIZE = 150

/** Blob element size as % of the frame (matches `.aurora-blob` width/height). */
export const BLOB_SIZE_RATIO = DEFAULT_BLOB_SIZE / 100

/** Default anchor positions (% of preview frame) — mesh-style corners + upper center. */
export const DEFAULT_BLOB_ANCHORS: [number, number][] = [
  [18, 16], // 0 · TL · hue anchor
  [82, 18], // 1 · TR
  [16, 84], // 2 · BL
  [84, 86], // 3 · BR
  [50, 32], // 4 · upper center
]

/** Convert a visible anchor (% of frame) to blob `left`/`top` with centered radial origin. */
export function anchorToPos(anchor: [number, number], sizePct = DEFAULT_BLOB_SIZE): [number, number] {
  const offset = (sizePct / 100) * 50
  return [anchor[0] - offset, anchor[1] - offset]
}

export function clampAnchor(x: number, y: number, pad = 12): [number, number] {
  const lo = -pad
  const hi = 100 + pad
  return [Math.min(hi, Math.max(lo, x)), Math.min(hi, Math.max(lo, y))]
}
