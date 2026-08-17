import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { parse, formatHex } from 'culori'
import { resolve } from '../color/oklch'
import { useStudio } from '../store/useStudio'
import { Section, SegmentControl, Slider } from './ui'

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
  const {
    inputMode,
    hex,
    seedH,
    seedC,
    palette,
    imageUrl,
    mergeSimilar,
    richness,
    speed,
    luminance,
    anchorOklch,
    lastExtraction,
    setInputMode,
    setHex,
    setMerge,
    loadImage,
    setSeedH,
    setRichness,
    setSpeed,
    setLuminance,
  } = useStudio()

  const fileRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(hex)
  const [dragOver, setDragOver] = useState(false)

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

  const parsedDraft = parse(draft)
  const hexMainColor = parsedDraft ? (formatHex(parsedDraft) ?? '#000000').toUpperCase() : '#000000'

  const extractedMainHex = useMemo(() => {
    if (palette[0]?.hex) return palette[0].hex.toUpperCase()
    return resolve(anchorOklch).hex
  }, [palette, anchorOklch])

  const displayMainHex = inputMode === 'image' ? extractedMainHex : hexMainColor
  const hasImageExtract = inputMode === 'image' && !!imageUrl && palette.length > 0

  return (
    <>
      <Section label="输入">
        <SegmentControl
          value={inputMode}
          onChange={setInputMode}
          options={[
            { id: 'hex', label: '色值 HEX' },
            { id: 'image', label: '图片取色' },
          ]}
        />

        {inputMode === 'hex' ? (
          <div className="mt-3.5 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span
                className="w-9 h-9 rounded-[var(--r-sm)] border border-[var(--line-2)] shrink-0"
                style={{ background: parsedDraft ? hexMainColor : '#000' }}
                aria-hidden
              />
              <input
                value={draft}
                onChange={(e) => commitHex(e.target.value.trim())}
                placeholder="#4A6CF7"
                spellCheck={false}
                aria-label="主色 HEX"
                className="num flex-1 min-w-0 h-9 px-3 rounded-[var(--r-sm)] border border-[var(--line)] bg-white/[0.02] text-[13px] font-semibold tracking-[0.02em] text-[var(--ink)] outline-none transition-colors focus:border-[var(--line-3)] focus:bg-white/[0.04]"
              />
            </div>
            <MetaRow
              items={[
                ['H', `${Math.round(seedH)}°`],
                ['C', seedC.toFixed(3)],
              ]}
            />
          </div>
        ) : (
          <div className="mt-3.5 flex flex-col gap-4">
            <div
              tabIndex={0}
              role="button"
              aria-label="上传图片"
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
              className={`rounded-[var(--r-md)] border border-dashed cursor-pointer overflow-hidden transition-colors ${
                dragOver
                  ? 'border-[var(--line-3)] bg-white/[0.05]'
                  : 'border-[var(--line-2)] bg-white/[0.015] hover:bg-white/[0.04]'
              }`}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="来源图片" className="w-full h-auto block" />
              ) : (
                <div className="h-[88px] grid place-items-center px-4 text-center">
                  <span className="text-[11.5px] text-[var(--ink-3)] leading-relaxed">
                    拖拽 · 点击 · ⌘V 粘贴图片
                  </span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFiles(e.target.files)} />

            <Slider
              label="合并相似色"
              value={mergeSimilar}
              min={0}
              max={1}
              step={0.02}
              onChange={setMerge}
              display={Math.round(mergeSimilar * 10).toString()}
              hint="Fly colorMergingTolerance · 0 保留更多色，10 主色更稳"
            />

            <div className="pt-4 border-t border-[var(--line)]">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="micro">提取结果</span>
                {hasImageExtract && lastExtraction && (
                  <span className="num text-[10px] text-[var(--ink-4)]">
                    容差 {lastExtraction.meta.colorMergingTolerance}
                  </span>
                )}
              </div>

              {hasImageExtract ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-9 h-9 rounded-[var(--r-sm)] border border-[var(--line-2)] shrink-0"
                      style={{ background: displayMainHex }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                      <span className="num text-[13px] font-semibold tracking-[0.02em] text-[var(--ink)] leading-none truncate">
                        {displayMainHex}
                      </span>
                      <MetaRow
                        items={[
                          ['H', `${Math.round(seedH)}°`],
                          ['C', seedC.toFixed(3)],
                        ]}
                      />
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {palette.map((s, i) => (
                      <button
                        key={s.hex}
                        type="button"
                        title={`${s.hex} · ${Math.round(s.weight * 100)}%`}
                        aria-label={i === 0 ? `主色 ${s.hex}` : `色板 ${i + 1} ${s.hex}`}
                        aria-current={i === 0 ? 'true' : undefined}
                        className={`flex-1 h-6 rounded-[var(--r-xs)] border transition-transform hover:scale-y-110 ${
                          i === 0 ? 'border-white/35' : 'border-[var(--line-2)]'
                        }`}
                        style={{ background: s.hex }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[11.5px] text-[var(--ink-4)] leading-relaxed m-0">
                  上传后在此显示主色与 5 色色板
                </p>
              )}
            </div>
          </div>
        )}
      </Section>

      <div className="h-px bg-[var(--line)]" />

      <Section label="渐变">
        <div className="flex flex-col gap-4">
          <Slider
            label="丰富度"
            value={richness}
            min={0}
            max={1}
            step={0.01}
            onChange={setRichness}
            display={Math.round(richness * 100) + '%'}
            hint="0 同色系，100% 色相与纯度拉开"
          />

          <Slider
            label="整体明度"
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
            hint="−1 更暗，+1 更亮"
          />

          <Slider
            label="流动速度"
            value={speed}
            min={0.25}
            max={2.5}
            step={0.05}
            onChange={setSpeed}
            display={speed.toFixed(2).replace(/0$/, '') + '×'}
            hint="动画整体节奏倍率"
          />

          {inputMode === 'hex' && (
            <Slider
              label="主色相"
              value={seedH}
              min={0}
              max={360}
              step={1}
              onChange={setSeedH}
              display={Math.round(seedH) + '°'}
              hint="HSL 色相，与设计工具口径一致"
              hue
            />
          )}
        </div>
      </Section>
    </>
  )
}
