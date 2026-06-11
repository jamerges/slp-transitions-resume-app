import type { TraceLine } from '../engine/types'

export function TraceList({ trace }: { trace: TraceLine[] }) {
  return (
    <ol className="trace">
      {trace.map((t, i) => (
        <li key={i}>
          <span className="step">{t.step}</span>
          <span className="ipa">
            <span className="rule">{t.rule}.</span> {t.detail}
          </span>
        </li>
      ))}
    </ol>
  )
}
