import { useRef, useState, useEffect, useCallback } from 'react'
import { parse, formatHex } from 'culori'
import { useStudio } from '../store/useStudio'
import { useT } from '../i18n'
import { Section, SegmentControl, Slider, ColorSwatch } from './ui'
import { ChevronDown } from './icons'

function imageFromClipboard(data: DataTransfer | null): File | null {
  if (!data) return null
  const fromList = data.files?.[0]
  if (fromList?.type.startsWith('image/')) return fromList
  for (const item of data.items) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      return item.getAsFile()
    }
  }
  return null
}

function MetaRow({ items }: { items: [string, string][] }) {
  return (
    <div className="flex items-center gap-3">
      {items.map(([k, v]) => (
        <span key={k} className="num text-[10.5px] text-[var(--ink-4)] leading-none">
          <span className="text-[var(--ink-4)]">{k}</span> <span className="text-[var(--ink-3)]">{v}</span>
        </span>
      ))}
    </div>
  )
}

export function InspectorPanel() {
  const t = useT()
  const {
    inputMode,
    hex,
    seedH,
    seedC,
    imageUrl,
    richness,
    speed,
    luminance,
    posterColor,
    extracting,
    setInputMode,
    setHex,
    loadImage,
    setSeedH,
    setRichness,
    setSpeed,
    setLuminance,
  } = useStudio()

  const fileRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(hex)
  const [hexFocused, setHexFocused] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [hueOpen, setHueOpen] = useState(false)

  const shownHex = hexFocused ? draft : hex

  const commitHex = (v: string) => {
    setDraft(v)
    if (parse(v)) setHex(v)
  }

  const onFiles = (files: FileList | null) => {
    const f = files?.[0]
    if (f && f.type.startsWith('image/')) loadImage(f)
  }

  const pasteImage = useCallback(
    (data: DataTransfer | null) => {
      const file = imageFromClipboard(data)
      if (file) loadImage(file)
      return !!file
    },
    [loadImage],
  )

  useEffect(() => {
    if (inputMode !== 'image') return

    const onPaste = (e: ClipboardEvent) => {
      const el = document.activeElement
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return
      }
      if (pasteImage(e.clipboardData)) e.preventDefault()
    }

    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [inputMode, pasteImage])

  const parsedDraft = parse(shownHex)
  const hexMainColor = parsedDraft ? (formatHex(parsedDraft) ?? '#000000').toUpperCase() : '#000000'

  return (
    <>
      <Section label={t('input')}>
        <SegmentControl
          value={inputMode}
          onChange={setInputMode}
          options={[
            { id: 'hex', label: t('tabHex') },
            { id: 'image', label: t('tabImage') },
          ]}
        />

        {inputMode === 'hex' ? (
          <div className="mt-3.5 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <ColorSwatch color={parsedDraft ? hexMainColor : '#000'} />
              <input
                value={shownHex}
                onChange={(e) => commitHex(e.target.value.trim())}
                onFocus={() => {
                  setDraft(hex)
                  setHexFocused(true)
                }}
                onBlur={() => setHexFocused(false)}
                placeholder="#4A6CF7"
                spellCheck={false}
                aria-label={t('hexAria')}
                className="num flex-1 min-w-0 h-9 px-3 rounded-[var(--r-sm)] smooth-r border border-[var(--line)] bg-white/[0.02] text-[13px] font-semibold tracking-[0.02em] text-[var(--ink)] outline-none transition-colors focus:border-[var(--line-3)] focus:bg-white/[0.04]"
              />
            </div>
            <MetaRow
              items={[
                ['H', `${Math.round(seedH)}°`],
                ['C', seedC.toFixed(3)],
              ]}
            />
            <div>
              <button
                type="button"
                aria-expanded={hueOpen}
                onClick={() => setHueOpen((v) => !v)}
                className="group flex items-center gap-1.5 -ml-1 pl-1 pr-1.5 py-1 rounded-[var(--r-xs)] smooth-r hover:bg-white/[0.04] transition-colors"
              >
                <span
                  className="text-[var(--ink-4)] group-hover:text-[var(--ink-2)] transition-[transform,color] duration-200"
                  style={{ transform: hueOpen ? 'none' : 'rotate(-90deg)' }}
                >
                  <ChevronDown size={12} />
                </span>
                <span className="micro group-hover:text-[var(--ink-2)] transition-colors">{t('hue')}</span>
              </button>
              {hueOpen && (
                <div className="mt-2.5 anim-fade">
                  <Slider
                    value={seedH}
                    min={0}
                    max={360}
                    step={1}
                    onChange={setSeedH}
                    display={Math.round(seedH) + '°'}
                    hue
                    hint={t('hue')}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-3.5 flex flex-col gap-4">
            <div
              tabIndex={0}
              role="button"
              aria-label={t('uploadAria')}
              onClick={() => fileRef.current?.click()}
              onPaste={(e) => {
                if (pasteImage(e.clipboardData)) e.preventDefault()
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                onFiles(e.dataTransfer.files)
              }}
              className={`rounded-[var(--r-sm)] smooth-r border border-dashed cursor-pointer overflow-hidden transition-colors ${
                dragOver
                  ? 'border-[var(--line-3)] bg-white/[0.05]'
                  : 'border-[var(--line-2)] bg-white/[0.015] hover:bg-white/[0.04]'
              }`}
            >
              {imageUrl ? (
                <div className="grid place-items-center p-3">
                  <img
                    src={imageUrl}
                    alt={t('sourceImage')}
                    className="max-h-[120px] max-w-full w-auto object-contain rounded-[var(--r-sm)] smooth-r"
                  />
                </div>
              ) : (
                <div className="h-[88px] grid place-items-center px-4 text-center">
                  <span className="text-[11.5px] text-[var(--ink-3)] leading-relaxed">{t('uploadHint')}</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFiles(e.target.files)} />

            <div className="pt-4 border-t border-[var(--line)]">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="micro">{t('result')}</span>
                {extracting && <span className="num text-[10px] text-[var(--ink-4)]">{t('generating')}</span>}
              </div>

              {posterColor ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <ColorSwatch color={posterColor.color} />
                    <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                      <span className="num text-[13px] font-semibold tracking-[0.02em] text-[var(--ink)] leading-none truncate">
                        {posterColor.color}
                      </span>
                      <MetaRow
                        items={[
                          ['L', posterColor.oklch.l.toFixed(2)],
                          ['C', posterColor.oklch.c.toFixed(3)],
                          ['H', `${Math.round(posterColor.oklch.h)}°`],
                        ]}
                      />
                    </div>
                  </div>
                  <MetaRow
                    items={[
                      [t('vsWhite'), `${posterColor.contrast.toFixed(1)}:1`],
                      [t('samples'), String(posterColor.sampleCount)],
                      [t('candidates'), String(posterColor.candidateCount)],
                    ]}
                  />
                </div>
              ) : (
                <p className="text-[11.5px] text-[var(--ink-4)] leading-relaxed m-0">{t('resultEmpty')}</p>
              )}
            </div>
          </div>
        )}
      </Section>

      {inputMode === 'hex' && (
        <>
          <div className="h-px bg-[var(--line)]" />
          <Section label={t('gradient')}>
            <div className="flex flex-col gap-4">
              <Slider
                label={t('richness')}
                value={richness}
                min={0}
                max={1}
                step={0.01}
                onChange={setRichness}
                display={Math.round(richness * 100) + '%'}
              />
              <Slider
                label={t('luminance')}
                value={luminance}
                min={-1}
                max={1}
                step={0.02}
                onChange={setLuminance}
                display={
                  luminance === 0
                    ? '0'
                    : (luminance > 0 ? '+' : '') + luminance.toFixed(2).replace(/0$/, '').replace(/\.$/, '')
                }
              />
              <Slider
                label={t('speed')}
                value={speed}
                min={0.25}
                max={2.5}
                step={0.05}
                onChange={setSpeed}
                display={speed.toFixed(2).replace(/0$/, '') + '×'}
              />
            </div>
          </Section>
        </>
      )}
    </>
  )
}
