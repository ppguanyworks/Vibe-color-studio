import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { parse, formatHex } from 'culori'
import { resolve } from '../color/oklch'
import { useStudio } from '../store/useStudio'
import { Panel, SectionDivider, SectionLabel, SegmentControl, Slider } from './ui'

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
    <Panel>
      <SectionLabel>输入</SectionLabel>

      <SegmentControl
        value={inputMode}
        onChange={setInputMode}
        options={[
          { id: 'image', label: '上传图片' },
          { id: 'hex', label: '色值 HEX' },
        ]}
      />

      <div className="mt-3">
        {inputMode === 'hex' ? (
          <div className="flex items-center gap-2">
            <span
              className="w-9 h-9 rounded-[8px] border border-white/15 shrink-0"
              style={{ background: parsedDraft ? hexMainColor : '#000' }}
            />
            <input
              value={draft}
              onChange={(e) => commitHex(e.target.value.trim())}
              placeholder="#4A6CF7"
              spellCheck={false}
              className="flex-1 min-w-0 bg-white/[0.04] border border-white/10 rounded-[8px] px-3 py-2 text-[13px] font-mono text-white/90 outline-none focus:border-white/25"
            />
          </div>
        ) : (
          <>
            <div
              tabIndex={0}
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
              className={`rounded-[10px] border border-dashed cursor-pointer transition-colors outline-none focus-visible:border-white/35 focus-visible:bg-white/[0.04] ${
                dragOver ? 'border-white/35 bg-white/[0.05]' : 'border-white/12 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="source" className="w-full h-auto block rounded-[8px]" />
              ) : (
                <div className="h-24 flex items-center justify-center text-[12px] text-white/40 px-4 text-center">
                  拖拽、点击或 ⌘V 粘贴图片
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFiles(e.target.files)} />

            <div className="mt-3">
              <Slider
                label="合并相似色"
                value={mergeSimilar}
                min={0}
                max={1}
                step={0.02}
                onChange={setMerge}
                display={Math.round(mergeSimilar * 10).toString()}
                leftHint="容差 0 · 保留更多色"
                rightHint="容差 10 · 主色更稳"
              />
              <p className="mt-1 text-[10px] text-white/40 leading-snug">
                Fly colorMergingTolerance · 当前 {Math.round(mergeSimilar * 10)}
              </p>
            </div>

            <div className="mt-4 rounded-[10px] border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[11px] font-medium text-white/70">提取主色</span>
                {hasImageExtract && lastExtraction && (
                  <span className="text-[10px] font-mono text-white/40 tabular-nums">
                    容差 {lastExtraction.meta.colorMergingTolerance}
                  </span>
                )}
              </div>

              {hasImageExtract ? (
                <>
                  <div className="flex items-center gap-3">
                    <span
                      className="w-11 h-11 rounded-[10px] border border-white/15 shrink-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]"
                      style={{ background: displayMainHex }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-mono font-medium text-white/90 tracking-wide truncate">
                        {displayMainHex}
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/50 tabular-nums">
                        HSL H {Math.round(seedH)}° · C {seedC.toFixed(3)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/8">
                    <p className="text-[10px] text-white/45 mb-2">色板 · {palette.length} 色</p>
                    <div className="flex gap-1">
                      {palette.map((s, i) => (
                        <button
                          key={s.hex}
                          type="button"
                          title={`${s.hex} · ${Math.round(s.weight * 100)}%`}
                          aria-label={i === 0 ? `主色 ${s.hex}` : `色板 ${i + 1} ${s.hex}`}
                          aria-current={i === 0 ? 'true' : undefined}
                          className={`relative flex-1 h-6 rounded-[6px] border transition-opacity ${
                            i === 0 ? 'border-white/30 ring-1 ring-white/15' : 'border-white/10 hover:opacity-90'
                          }`}
                          style={{ background: s.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-[11px] text-white/40 leading-snug py-1">
                  上传图片后，Fly 管线会在此显示提取主色与色板
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {inputMode === 'hex' && (
        <div className="mt-3 rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2.5">
          <div className="flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-[8px] border border-white/15 shrink-0"
              style={{ background: parsedDraft ? displayMainHex : '#000' }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-white/70">输入主色</p>
              <p className="mt-0.5 text-[11px] font-mono text-white/85 truncate">{displayMainHex}</p>
            </div>
            <p className="text-[11px] font-mono text-white/45 tabular-nums shrink-0">
              H {Math.round(seedH)}° · C {seedC.toFixed(3)}
            </p>
          </div>
        </div>
      )}

      <SectionDivider />

      <SectionLabel>渐变参数</SectionLabel>

      <div className="flex flex-col gap-4">
        <Slider
          label="丰富度"
          value={richness}
          min={0}
          max={1}
          step={0.01}
          onChange={setRichness}
          display={Math.round(richness * 100) + '%'}
          leftHint="同色系"
          rightHint="色相+纯度拉开"
        />

        <Slider
          label="整体明度"
          value={luminance}
          min={-1}
          max={1}
          step={0.02}
          onChange={setLuminance}
          display={luminance === 0 ? '0' : (luminance > 0 ? '+' : '') + luminance.toFixed(2).replace(/0$/, '').replace(/\.$/, '')}
          leftHint="−1 更暗"
          rightHint="+1 更亮"
        />

        <Slider
          label="流动速度"
          value={speed}
          min={0.25}
          max={2.5}
          step={0.05}
          onChange={setSpeed}
          display={speed.toFixed(2).replace(/0$/, '') + '×'}
          leftHint="慢"
          rightHint="快"
        />

        {inputMode === 'hex' && (
          <Slider
            label="主色相 H (HSL)"
            value={seedH}
            min={0}
            max={360}
            step={1}
            onChange={setSeedH}
            display={Math.round(seedH) + '°'}
            hue
          />
        )}
      </div>
    </Panel>
  )
}
