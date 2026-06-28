import { useCallback, useMemo, useRef, useState } from 'react'
import type { AuroraResult } from '../color/aurora'
import { BLOB_COUNT, clampAnchor } from '../color/blobLayout'
import { useStudio } from '../store/useStudio'
import { SectionLabel } from './ui'

const BLOB_LABELS = ['主色', '右上', '左下', '右下', '上中'] as const

interface BlobLayoutEditorProps {
  a: AuroraResult
}

export function BlobLayoutEditor({ a }: BlobLayoutEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragIndex = useRef<number | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const blobAnchors = useStudio((s) => s.blobAnchors)
  const setBlobAnchor = useStudio((s) => s.setBlobAnchor)
  const resetBlobAnchors = useStudio((s) => s.resetBlobAnchors)

  const blobsByProfile = useMemo(() => {
    const map = new Map<number, (typeof a.blobs)[0]>()
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
    <section className="rounded-[14px] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <SectionLabel>光斑布局</SectionLabel>
          <p className="text-[11px] text-white/45 leading-snug -mt-1">拖动控制点，预览区保持真实效果</p>
        </div>
        <button
          type="button"
          onClick={resetBlobAnchors}
          className="shrink-0 rounded-[8px] px-2.5 py-1 text-[11px] font-semibold border border-white/12 bg-white/[0.04] text-white/55 hover:text-white/85 hover:bg-white/[0.08] transition-colors"
        >
          重置
        </button>
      </div>

      <div
        ref={canvasRef}
        className="relative mx-auto w-full max-w-[168px] aspect-[268/552] rounded-[12px] border border-white/12 overflow-hidden touch-none select-none bg-black/40"
        onPointerMove={onCanvasPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="application"
        aria-label="光斑布局编辑器"
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

        <svg className="absolute inset-0 pointer-events-none text-white/10" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.35" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.35" vectorEffect="non-scaling-stroke" />
        </svg>

        {blobAnchors.map(([x, y], i) => {
          const selected = activeIndex === i
          return (
            <button
              key={i}
              type="button"
              aria-label={`${BLOB_LABELS[i]} 光斑`}
              aria-pressed={selected}
              onPointerDown={startDrag(i)}
              className={`absolute z-[2] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 touch-none outline-none transition-[transform,box-shadow] duration-150 ease-out ${
                selected
                  ? 'w-[14px] h-[14px] border-white shadow-[0_0_0_3px_rgba(255,255,255,0.18)] scale-110'
                  : 'w-3 h-3 border-white/85 hover:scale-110'
              } cursor-grab active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-white/60`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                background: handleColors[i] ?? '#fff',
              }}
            />
          )
        })}
      </div>

      {activeAnchor && activeIndex !== null && (
        <p className="mt-2 text-center text-[10px] font-mono text-white/45 tabular-nums">
          {BLOB_LABELS[activeIndex]} · {Math.round(activeAnchor[0])}%, {Math.round(activeAnchor[1])}%
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {BLOB_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[10px] font-medium border transition-colors ${
              activeIndex === i
                ? 'border-white/25 bg-white/[0.10] text-white/85'
                : 'border-white/10 bg-white/[0.02] text-white/45 hover:text-white/65 hover:bg-white/[0.05]'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/25 shrink-0"
              style={{ background: handleColors[i] }}
            />
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}
