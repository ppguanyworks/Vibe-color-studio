const GENERIC_NAME =
  /^(img|image|photo|pic|picture|screenshot|screen[\s_-]?shot|untitled|download|dsc|dcim|微信图片|img_\d+|pxl_\d+|pid_\d+)(\b|[_-]|$)/i

export const PLACEHOLDER_TITLE = 'Lorem Ipsum'

export function formatAspectRatio(width: number, height: number): string {
  const w = Math.round(width)
  const h = Math.round(height)
  if (w <= 0 || h <= 0) return '1:1'
  let a = w
  let b = h
  while (b) {
    const t = b
    b = a % b
    a = t
  }
  return `${w / a}:${h / a}`
}

export function titleFromFilename(name: string): string {
  const base = name.replace(/\.[^.]+$/, '').trim()
  if (!base || GENERIC_NAME.test(base) || /^\d+$/.test(base)) return PLACEHOLDER_TITLE

  const spaced = base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (!spaced) return PLACEHOLDER_TITLE
  if (/[\u4e00-\u9fff]/.test(spaced)) return spaced

  return spaced.replace(/\b([a-z])/g, (ch) => ch.toUpperCase())
}
