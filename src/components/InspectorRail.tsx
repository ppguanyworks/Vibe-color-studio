import { useState } from 'react'
import type { AuroraResult } from '../color/aurora'
import { useStudio } from '../store/useStudio'
import { useT } from '../i18n'
import { BlobLayoutEditor } from './BlobLayoutEditor'
import { InspectorPanel } from './InspectorPanel'
import { CollapsibleSection, Divider, GhostButton, PrimaryButton } from './ui'
import { Code, Reset } from './icons'

export function InspectorRail({ a, onExportCode }: { a: AuroraResult; onExportCode: () => void }) {
  const t = useT()
  const inputMode = useStudio((s) => s.inputMode)
  const [layoutOpen, setLayoutOpen] = useState(false)
  const resetBlobAnchors = useStudio((s) => s.resetBlobAnchors)

  return (
    <aside className="shrink-0 w-[320px] h-full flex flex-col border-l border-[var(--line)] bg-[var(--bg-rail)]">
      <div className="flex-1 min-h-0 overflow-y-auto scroll-thin">
        <InspectorPanel />
        {inputMode === 'hex' && (
          <>
            <Divider />
            <CollapsibleSection
              label={t('blobLayout')}
              open={layoutOpen}
              onToggle={() => setLayoutOpen((v) => !v)}
              action={
                <GhostButton onClick={resetBlobAnchors} title={t('reset')}>
                  <Reset size={12} />
                  {t('reset')}
                </GhostButton>
              }
            >
              <BlobLayoutEditor a={a} />
            </CollapsibleSection>
          </>
        )}
      </div>

      {inputMode === 'hex' && (
        <div className="shrink-0 px-4 pt-3.5 pb-4 border-t border-[var(--line)]">
          <PrimaryButton onClick={onExportCode}>
            <Code size={15} />
            {t('exportCode')}
          </PrimaryButton>
          <p className="micro mt-2.5 text-center text-[var(--ink-4)]">{t('exportFormats')}</p>
        </div>
      )}
    </aside>
  )
}
