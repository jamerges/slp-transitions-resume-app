import { useRef } from 'react'
import type { ProbeItem } from '../engine/types'
import type { AnalysisResult } from '../engine/analyze'
import { AlignmentChips } from './AlignmentChips'

const PALETTE_CONSONANTS = ['θ', 'ð', 'ʃ', 'ʒ', 'tʃ', 'dʒ', 'ŋ', 'j', 'ʔ', 'ɲ', 'x', 'ɾ', 'ɬ']
const PALETTE_VOWELS = ['æ', 'ɑ', 'ɔ', 'ə', 'ɚ', 'ɝ', 'ɛ', 'ɪ', 'ʊ', 'ʌ', 'eɪ', 'oʊ', 'aɪ', 'aʊ', 'ɔɪ']
const PALETTE_DIACRITICS = ['ʰ', 'ʷ', 'ː', '̪', '̃', '̥', '̬', '̴', '˞']

interface Props {
  items: ProbeItem[]
  analysis: AnalysisResult
  onChange: (items: ProbeItem[]) => void
  onAddRow: () => void
}

export function ProbeEntry({ items, analysis, onChange, onAddRow }: Props) {
  // Track the last focused IPA input so palette clicks insert at the cursor
  const focusRef = useRef<{ el: HTMLInputElement; itemId: string; field: 'targetIpa' | 'actualIpa' } | null>(null)

  const update = (id: string, patch: Partial<ProbeItem>) =>
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)))

  const remove = (id: string) => onChange(items.filter((it) => it.id !== id))

  const insertChar = (ch: string) => {
    const focus = focusRef.current
    if (!focus) return
    const { el, itemId, field } = focus
    const item = items.find((it) => it.id === itemId)
    if (!item) return
    const start = el.selectionStart ?? item[field].length
    const end = el.selectionEnd ?? start
    const next = item[field].slice(0, start) + ch + item[field].slice(end)
    update(itemId, { [field]: next })
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + ch.length, start + ch.length)
    })
  }

  const resultFor = (id: string) => analysis.itemResults.find((r) => r.item.id === id)

  return (
    <section className="panel">
      <h2>Single-word probe — target vs. actual production</h2>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 8px' }}>
        Enter each probe word with its target IPA and the IPA of what the client actually said.
        Leave “actual” blank for no-responses. In Phase 1 the actual column arrives pre-filled by the
        phone recognizer and you correct it here.
      </p>

      <div className="palette ipa">
        <span className="hint">IPA palette — click to insert into the last-focused field</span>
        {PALETTE_CONSONANTS.map((c) => (
          <button key={c} onClick={() => insertChar(c)}>{c}</button>
        ))}
        {PALETTE_VOWELS.map((c) => (
          <button key={c} onClick={() => insertChar(c)}>{c}</button>
        ))}
        {PALETTE_DIACRITICS.map((c) => (
          <button key={c} onClick={() => insertChar(c)} title="diacritic">{'◌' + c}</button>
        ))}
      </div>

      <table className="probe">
        <thead>
          <tr>
            <th style={{ width: '16%' }}>Word</th>
            <th style={{ width: '20%' }}>Target IPA</th>
            <th style={{ width: '20%' }}>Actual IPA</th>
            <th>Alignment</th>
            <th className="row-del"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => {
            const res = resultFor(it.id)
            return (
              <tr key={it.id}>
                <td>
                  <input
                    value={it.word}
                    placeholder="word"
                    onChange={(e) => update(it.id, { word: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="ipa"
                    value={it.targetIpa}
                    placeholder="tɑrgət"
                    onChange={(e) => update(it.id, { targetIpa: e.target.value })}
                    onFocus={(e) => (focusRef.current = { el: e.currentTarget, itemId: it.id, field: 'targetIpa' })}
                  />
                </td>
                <td>
                  <input
                    className="ipa"
                    value={it.actualIpa}
                    placeholder="ætʃuəl"
                    onChange={(e) => update(it.id, { actualIpa: e.target.value })}
                    onFocus={(e) => (focusRef.current = { el: e.currentTarget, itemId: it.id, field: 'actualIpa' })}
                  />
                </td>
                <td className="ipa">{res ? <AlignmentChips alignment={res.alignment} /> : <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>}</td>
                <td className="row-del">
                  <button className="del" title="Remove row" onClick={() => remove(it.id)}>×</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="legend">
        <span><span className="seg correct">correct</span></span>
        <span><span className="seg substitution">substitution</span></span>
        <span><span className="seg omission">omission</span></span>
        <span><span className="seg addition">addition</span></span>
        <span><span className="seg distortion">distortion (diacritic mismatch)</span></span>
      </div>

      <button className="primary" onClick={onAddRow}>+ Add word</button>
    </section>
  )
}
