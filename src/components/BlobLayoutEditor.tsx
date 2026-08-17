import { useCallback, useMemo, useRef, useState } from 'react'
import type { AuroraResult, Blob as AuroraBlob } from '../color/aurora'
import { BLOB_COUNT, clampAnchor } from '../color/blobLayout'
import { useT, type MessageKey } from '../i18n'
import { useStudio } from '../store/useStudio'

const BLOB_LABEL_KEYS = ['blobMain', 'blobTR', 'blobBL', 'blobBR', 'blobTop'] as const satisfies MessageKey[]

export function BlobLayoutEditor({ a }: { a: AuroraResult }) {
  const t = useT()
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragIndex = useRef<number | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const blobLabels = BLOB_LABEL_KEYS.map((key) => t(key))

  const blobAnchors = useStudio((s) => s.blobAnchors)
  const setBlobAnchor = useStudio((s) => s.setBlobAnchor)

  const blobsByProfile = useMemo(() => {
    const map = new Map<number, AuroraBlob>()
    for (const b of a.blobs) map.set(b.profileId, b)
    return map
  }, [a.blobs])

  const handleColors = useMemo(() => {
    const colors = Array.from({ length: BLOB_COUNT }, () => '#ffffff')
    for (const b of a.blobs) colors[b.profileId] = b.hex
    return colors
  }, [a.blobs])

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = canvasRef.current
      if (!el || dragIndex.current === null) return
      const rect = el.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return
      const x = ((clientX - rect.left) / rect.width) * 100
      const y = ((clientY - rect.top) / rect.height) * 100
      const [cx, cy] = clampAnchor(x, y, 8)
      setBlobAnchor(dragIndex.current, cx, cy)
    },
    [setBlobAnchor],
  )

  const onCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragIndex.current === null) return
    updateFromPointer(e.clientX, e.clientY)
  }

  const endDrag = (e: React.PointerEvent) => {
    if (dragIndex.current === null) return
    dragIndex.current = null
    canvasRef.current?.releasePointerCapture(e.pointerId)
  }

  const startDrag = (index: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragIndex.current = index
    setActiveIndex(index)
    canvasRef.current?.setPointerCapture(e.pointerId)
    updateFromPointer(e.clientX, e.clientY)
  }

  const activeAnchor = activeIndex !== null ? blobAnchors[activeIndex] : null

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={canvasRef}
        className="relative mx-auto w-full max-w-[152px] aspect-[268/552] rounded-[var(--r-md)] border border-[var(--line-2)] overflow-hidden touch-none select-none bg-black/40"
        onPointerMove={onCanvasPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="application"
        aria-label={t('blobEditorAria')}
      >
        <div className="absolute inset-0" style={{ background: a.base.hex }} aria-hidden>
          {Array.from({ length: BLOB_COUNT }, (_, id) => {
            const b = blobsByProfile.get(id)
            if (!b) return null
            return (
              <span
                key={id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${b.pos[0]}%`,
                  top: `${b.pos[1]}%`,
                  width: `${b.size}%`,
                  height: `${b.size}%`,
                  background: b.gradCss,
                  mixBlendMode: a.blend,
                  filter: `blur(${Math.round(b.blurPx * 0.3)}px)`,
                }}
              />
            )
          })}
        </div>

        <svg
          className="absolute inset-0 pointer-events-none text-white/[0.08]"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.35" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.35" vectorEffect="non-scaling-stroke" />
        </svg>

        {blobAnchors.map(([x, y], i) => {
          const selected = activeIndex === i
          return (
            <button
              key={i}
              type="button"
              aria-label={blobLabels[i]}
              aria-pressed={selected}
              onPointerDown={startDrag(i)}
              className={`absolute z-[2] -translate-x-1/2 -translate-y-1/2 rounded-full border touch-none outline-none transition-[scale,box-shadow] duration-150 ease-out cursor-grab active:cursor-grabbing ${
                selected
                  ? 'w-3 h-3 border-white shadow-[0_0_0_3px_rgba(255,255,255,0.16)]'
                  : 'w-2.5 h-2.5 border-white/70 hover:scale-115'
              }`}
              style={{ left: `${x}%`, top: `${y}%`, background: handleColors[i] ?? '#fff' }}
            />
          )
        })}
      </div>

      <div className="flex flex-wrap gap-1">
        {blobLabels.map((label, i) => (
          <button
            key={BLOB_LABEL_KEYS[i]}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`inline-flex items-center gap-1.5 h-6 px-2 rounded-[var(--r-xs)] text-[10.5px] font-medium border transition-colors ${
              activeIndex === i
                ? 'border-[var(--line-3)] bg-white/[0.08] text-[var(--ink)]'
                : 'border-[var(--line)] bg-transparent text-[var(--ink-3)] hover:text-[var(--ink-2)] hover:bg-white/[0.04]'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full border border-white/20 shrink-0"
              style={{ background: handleColors[i] }}
            />
            {label}
          </button>
        ))}
      </div>

      <p className="num h-3 text-[10px] text-[var(--ink-4)] leading-none m-0">
        {activeAnchor && activeIndex !== null
          ? `${blobLabels[activeIndex]} · ${Math.round(activeAnchor[0])}% ${Math.round(activeAnchor[1])}%`
          : t('blobDragHint')}
      </p>
    </div>
  )
}
