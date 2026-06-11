import type { AnalysisResult } from '../engine/analyze'
import type { LanguageConfig } from '../engine/language'
import type { Place, Manner } from '../engine/types'
import { CONSONANTS } from '../engine/phones'
import { TraceList } from './TraceList'

const PLACES: Place[] = ['bilabial', 'labiodental', 'dental', 'alveolar', 'postalveolar', 'palatal', 'velar', 'glottal']
const MANNERS: Manner[] = ['stop', 'affricate', 'fricative', 'nasal', 'liquid', 'glide']

export function Results({ analysis, language }: { analysis: AnalysisResult; language: LanguageConfig }) {
  const { pcc, recommendation, clusters, flags } = analysis
  const scorable = analysis.itemResults.length

  if (scorable === 0) {
    return (
      <section className="panel">
        <h2>Analysis</h2>
        <p style={{ fontSize: 13 }}>No scorable items yet — enter probe words with target and actual IPA, or load the demo case.</p>
      </section>
    )
  }

  return (
    <>
      <section className="panel">
        <h2>Severity &amp; accuracy</h2>
        <div className="cards">
          <div className="stat-card">
            <div className="big">{pcc.pcc.toFixed(1)}%</div>
            <div className="label">PCC (strict — distortions count as errors)</div>
          </div>
          <div className="stat-card">
            <div className="big">{pcc.pccR.toFixed(1)}%</div>
            <div className="label">PCC-R (distortions count as correct)</div>
          </div>
          <div className="stat-card">
            <div className="big">{pcc.correctStrict}/{pcc.totalConsonants}</div>
            <div className="label">consonants correct / consonant targets</div>
          </div>
          <div className="stat-card">
            <div className="label" style={{ marginBottom: 6 }}>Severity band (Shriberg, from strict PCC)</div>
            {pcc.severity && <span className={`severity ${pcc.severity}`}>{pcc.severity}</span>}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Phonetic &amp; phonemic inventories — place × manner</h2>
        <div className="legend">
          <span><span className="ph phonemic">x</span> phonemic (≥2 minimal pairs)</span>
          <span><span className="ph phonetic">x</span> phonetic only (≥2 productions)</span>
          <span><span className="ph out">x</span> OUT (absent from inventory)</span>
        </div>
        <table className="grid ipa">
          <thead>
            <tr>
              <th></th>
              {PLACES.map((p) => (
                <th key={p}>{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MANNERS.map((m) => (
              <tr key={m}>
                <th className="row-head">{m}</th>
                {PLACES.map((p) => {
                  const phones = language.consonants.filter(
                    (c) => CONSONANTS[c]?.place === p && CONSONANTS[c]?.manner === m,
                  )
                  return (
                    <td key={p}>
                      {phones.map((c) => {
                        const cls = analysis.phonemicInventory.has(c)
                          ? 'phonemic'
                          : analysis.phoneticInventory.has(c)
                            ? 'phonetic'
                            : 'out'
                        const count = analysis.consonantCounts.get(c) ?? 0
                        return (
                          <span key={c} className={`ph ${cls}`} title={`${count} production(s)`}>
                            {c}
                          </span>
                        )
                      })}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <h3>OUT phones</h3>
        <p className="ipa">
          {analysis.outPhones.length ? analysis.outPhones.map((p) => `/${p}/`).join('  ') : 'none — full consonant coverage'}
        </p>
        <details>
          <summary>Minimal pairs found ({analysis.minimalPairs.length})</summary>
          <table className="simple ipa">
            <thead>
              <tr><th>Word A</th><th>Form A</th><th>Word B</th><th>Form B</th><th>Contrast</th></tr>
            </thead>
            <tbody>
              {analysis.minimalPairs.map((mp, i) => (
                <tr key={i}>
                  <td>{mp.wordA}</td>
                  <td>[{mp.formA}]</td>
                  <td>{mp.wordB}</td>
                  <td>[{mp.formB}]</td>
                  <td>/{mp.phoneA}/ ~ /{mp.phoneB}/</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>

      <section className="panel">
        <h2>Cluster inventory (word-initial, by sonority distance)</h2>
        {clusters.length === 0 ? (
          <p style={{ fontSize: 13 }}>No word-initial clusters produced in this sample.</p>
        ) : (
          <table className="simple ipa">
            <thead>
              <tr><th>Cluster</th><th>SD</th><th>Productions</th><th>Status</th></tr>
            </thead>
            <tbody>
              {clusters.map((c) => (
                <tr key={c.cluster}>
                  <td>/{c.cluster}/</td>
                  <td>{c.sonorityDistance ?? '— (3-element)'}{c.isAdjunct ? ' (adjunct)' : ''}</td>
                  <td>{c.count}</td>
                  <td>{c.inInventory ? 'IN (≥2×)' : 'observed once'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {flags.length > 0 && (
        <section className="panel">
          <h2>Screening flags — for clinician confirmation</h2>
          {flags.map((f) => (
            <div className="flag" key={f.id}>
              <b>{f.label}</b>
              {f.detail}
            </div>
          ))}
        </section>
      )}

      <section className="panel">
        <h2>Complexity-approach target recommendation</h2>
        <div className="rec-card">
          {recommendation.target ? (
            <>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                {recommendation.kind === '3-element-sCC' && 'Step 1 — 3-element /s/CC cluster'}
                {recommendation.kind === '2-element-cluster' && 'Step 2 — 2-element cluster'}
                {recommendation.kind === 'singleton' && 'Step 3 — singleton'}
              </div>
              <div className="target ipa">/{recommendation.target}/</div>
              {recommendation.alternates.length > 0 && (
                <div style={{ fontSize: 13 }} className="ipa">
                  Equally supported alternates: {recommendation.alternates.map((a) => `/${a}/`).join(', ')}
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 14 }}>No target selected by the algorithm — see trace.</div>
          )}
        </div>
        <h3>Rule trace (why this target)</h3>
        <TraceList trace={recommendation.trace} />
        {analysis.untestedStimulability.length > 0 && (
          <p style={{ fontSize: 12, color: 'var(--muted)' }} className="ipa">
            Note: stimulability untested for {analysis.untestedStimulability.map((p) => `/${p}/`).join(' ')} —
            Step 3a treats untested sounds as nonstimulable. Test them to refine the recommendation.
          </p>
        )}
      </section>
    </>
  )
}
