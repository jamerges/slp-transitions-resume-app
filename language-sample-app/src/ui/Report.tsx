import type { AnalysisResult } from '../engine/analyze'
import type { LanguageConfig } from '../engine/language'
import { TraceList } from './TraceList'

interface Props {
  analysis: AnalysisResult
  language: LanguageConfig
  clientName: string
  ageYears: number | null
  ageMonths: number
}

export function Report({ analysis, language, clientName, ageYears, ageMonths }: Props) {
  const { pcc, recommendation } = analysis
  const scorable = analysis.itemResults.length

  if (scorable === 0) {
    return (
      <section className="panel">
        <h2>Report</h2>
        <p style={{ fontSize: 13 }}>Nothing to report yet — enter probe data first.</p>
      </section>
    )
  }

  const name = clientName || 'The client'
  const age = ageYears != null ? `${ageYears};${ageMonths}` : 'unknown age'
  const inPhones = [...analysis.phoneticInventory.keys()]
  const date = new Date().toLocaleDateString()

  return (
    <section className="panel report">
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="primary" onClick={() => window.print()}>Print / save PDF</button>
      </div>

      <h2>Phonological screening summary</h2>
      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
        {name} · age {age} · {language.name} · {scorable} scorable probe items · generated {date} ·
        clinician-reviewed screening — not a diagnostic evaluation
      </p>

      <h3>Clinician summary</h3>
      <p className="ipa">
        A single-word phonology probe ({scorable} items) was administered and transcribed in IPA.
        Percentage Consonants Correct was <b>{pcc.pcc.toFixed(1)}%</b> (PCC-R {pcc.pccR.toFixed(1)}%),
        consistent with a <b>{pcc.severity}</b> severity band (Shriberg).
        The phonetic inventory (≥2 productions) comprises {inPhones.map((p) => `/${p}/`).join(' ')}.
        Sounds absent from the inventory: {analysis.outPhones.length ? analysis.outPhones.map((p) => `/${p}/`).join(' ') : 'none'}.
        {analysis.stimulable.length > 0 && (
          <> Stimulable (≥30% with support): {analysis.stimulable.map((p) => `/${p}/`).join(' ')}.</>
        )}
        {analysis.nonstimulable.length > 0 && (
          <> Nonstimulable: {analysis.nonstimulable.map((p) => `/${p}/`).join(' ')}.</>
        )}
      </p>
      {recommendation.target && (
        <p className="ipa">
          Per the complexity approach (Gierut; Barlow, Taps &amp; Storkel worksheet algorithm), the
          suggested treatment target for further probing is <b>/{recommendation.target}/</b>
          {recommendation.alternates.length > 0 && (
            <> (equally supported: {recommendation.alternates.map((a) => `/${a}/`).join(', ')})</>
          )}
          . The full selection rationale is appended below for review.
        </p>
      )}
      {analysis.flags.length > 0 && (
        <>
          <h3>Screening flags to confirm</h3>
          <ul>
            {analysis.flags.map((f) => (
              <li key={f.id}>
                <b>{f.label}:</b> {f.detail}
              </li>
            ))}
          </ul>
        </>
      )}

      <h3>Family-friendly summary</h3>
      <p>
        {name} took part in a picture-naming activity to look at speech sounds. {name} is already
        using many sounds well{inPhones.length > 0 && <>, including sounds like {sample(inPhones, 5).map((p) => `"${friendly(p)}"`).join(', ')}</>}.
        Some sounds are still developing
        {analysis.outPhones.length > 0 && <>, such as {sample(analysis.outPhones, 4).map((p) => `"${friendly(p)}"`).join(', ')}</>}.
        This screening helps the speech-language pathologist decide which sounds to look at more
        closely and, if needed, which sounds would give {name} the biggest boost in therapy. It is a
        first look, not a diagnosis — your SLP will review everything and talk through next steps with you.
      </p>

      <h3>Appendix — target selection rule trace</h3>
      <TraceList trace={recommendation.trace} />
    </section>
  )
}

function sample<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n)
}

/** Parent-friendly sound names for common IPA symbols */
function friendly(phone: string): string {
  const names: Record<string, string> = {
    θ: 'th (as in think)',
    ð: 'th (as in this)',
    ʃ: 'sh',
    ʒ: 'zh (as in measure)',
    'tʃ': 'ch',
    'dʒ': 'j',
    ŋ: 'ng',
    j: 'y',
    r: 'r',
    ɲ: 'ñ',
    x: 'j (Spanish)',
    ɾ: 'soft r',
  }
  return names[phone] ?? phone
}
