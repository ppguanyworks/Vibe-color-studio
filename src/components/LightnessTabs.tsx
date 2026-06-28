import { LIGHTNESS_PRESETS } from '../presets/lightness'
import { useStudio } from '../store/useStudio'

export function LightnessTabs() {
  const lightnessId = useStudio((s) => s.lightnessId)
  const setLightness = useStudio((s) => s.setLightness)

  return (
    <div className="w-[268px]">
      <div className="text-[11px] text-white/40 mb-2 text-center">预览明度</div>
      <div className="flex rounded-[10px] border border-white/10 p-0.5 bg-white/[0.03]">
        {LIGHTNESS_PRESETS.map((p) => {
          const active = p.id === lightnessId
          return (
            <button
              key={p.id}
              onClick={() => setLightness(p.id)}
              title={p.desc}
              className={`flex-1 rounded-[8px] py-2 px-1 text-[11px] font-semibold transition-colors leading-tight ${
                active ? 'bg-white/[0.12] text-white' : 'text-white/45 hover:text-white/65'
              }`}
            >
              {p.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
