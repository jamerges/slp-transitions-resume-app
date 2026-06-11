import type { StimulabilityMap } from '../engine/types'
import type { AnalysisResult } from '../engine/analyze'
import { STIMULABILITY_THRESHOLD } from '../engine/targets'

interface Props {
  analysis: AnalysisResult
  stimulability: StimulabilityMap
  onChange: (s: StimulabilityMap) => void
}

export function Stimulability({ analysis, stimulability, onChange }: Props) {
  const out = analysis.outPhones

  return (
    <section className="panel">
      <h2>Stimulability — dynamic probe results for OUT sounds</h2>
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        For each sound absent from the phonetic inventory, run the dynamic stimulability task
        (Glaspey &amp; Stoel-Gammon) and enter percent accuracy <em>with support</em>.
        ≥{STIMULABILITY_THRESHOLD}% = stimulable (likely to emerge without treatment — deprioritized as a target);
        &lt;{STIMULABILITY_THRESHOLD}% = nonstimulable (treatment candidate).
      </p>
      {out.length === 0 && (
        <p style={{ fontSize: 13 }}>
          No OUT phones — every consonant in the language appears ≥2× in the sample. Nothing to test.
        </p>
      )}
      {out.map((phone) => {
        const val = stimulability[phone]
        const verdict =
          val == null ? 'untested' : val >= STIMULABILITY_THRESHOLD ? 'stimulable' : 'nonstimulable'
        return (
          <div className="stim-row" key={phone}>
            <span className="phone ipa">/{phone}/</span>
            <input
              type="number"
              min={0}
              max={100}
              value={val ?? ''}
              placeholder="—"
              onChange={(e) =>
                onChange({
                  ...stimulability,
                  [phone]: e.target.value === '' ? null : Math.max(0, Math.min(100, Number(e.target.value))),
                })
              }
            />
            <span>% with support</span>
            <span className={`verdict ${verdict === 'stimulable' ? 'yes' : verdict === 'nonstimulable' ? 'no' : 'untested'}`}>
              {verdict}
            </span>
          </div>
        )
      })}
    </section>
  )
}
