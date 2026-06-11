import { useEffect, useMemo, useState } from 'react'
import type { ProbeItem, StimulabilityMap } from './engine/types'
import { LANGUAGES } from './engine/language'
import { analyze } from './engine/analyze'
import { ProbeEntry } from './ui/ProbeEntry'
import { Stimulability } from './ui/Stimulability'
import { Results } from './ui/Results'
import { Report } from './ui/Report'
import { DEMO_CLIENT, DEMO_ITEMS, DEMO_STIMULABILITY } from './sampleData'

interface SessionState {
  clientName: string
  ageYears: number | ''
  ageMonths: number | ''
  languageId: 'en' | 'es'
  items: ProbeItem[]
  stimulability: StimulabilityMap
}

const STORAGE_KEY = 'lsa-phonology-session-v1'

const emptyRow = (): ProbeItem => ({
  id: 'row-' + Math.random().toString(36).slice(2, 9),
  word: '',
  targetIpa: '',
  actualIpa: '',
})

function loadSession(): SessionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as SessionState
  } catch {
    /* fall through to default */
  }
  return {
    clientName: '',
    ageYears: '',
    ageMonths: '',
    languageId: 'en',
    items: [emptyRow(), emptyRow(), emptyRow()],
    stimulability: {},
  }
}

type Tab = 'probe' | 'stim' | 'results' | 'report'

export default function App() {
  const [session, setSession] = useState<SessionState>(loadSession)
  const [tab, setTab] = useState<Tab>('probe')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }, [session])

  const language = LANGUAGES[session.languageId]
  const ageMonths =
    session.ageYears === '' ? undefined : Number(session.ageYears) * 12 + (Number(session.ageMonths) || 0)

  const analysis = useMemo(
    () =>
      analyze({
        items: session.items,
        stimulability: session.stimulability,
        language,
        ageMonths,
      }),
    [session.items, session.stimulability, language, ageMonths],
  )

  const loadDemo = () =>
    setSession((s) => ({
      ...s,
      clientName: DEMO_CLIENT.name,
      ageYears: DEMO_CLIENT.ageYears,
      ageMonths: DEMO_CLIENT.ageMonths,
      languageId: 'en',
      items: DEMO_ITEMS.map((it) => ({ ...it })),
      stimulability: { ...DEMO_STIMULABILITY },
    }))

  const clearAll = () => {
    if (!confirm('Clear the whole session? This cannot be undone.')) return
    setSession({
      clientName: '',
      ageYears: '',
      ageMonths: '',
      languageId: session.languageId,
      items: [emptyRow(), emptyRow(), emptyRow()],
      stimulability: {},
    })
  }

  return (
    <>
      <header className="app-header">
        <h1>Phonology Probe — Screening Workbench</h1>
        <span className="subtitle">Phase 0 · deterministic engine · all data stays in this browser</span>
      </header>
      <p className="disclaimer">
        Clinician-assist screening tool. All outputs are first-pass candidates for the SLP to review,
        correct, and confirm — this tool does not diagnose, and recommendations are not clinical decisions.
      </p>

      <div className="client-bar">
        <label>
          Client / identifier
          <input
            value={session.clientName}
            onChange={(e) => setSession((s) => ({ ...s, clientName: e.target.value }))}
            placeholder="initials or ID"
          />
        </label>
        <label>
          Age (years)
          <input
            type="number"
            min={1}
            max={99}
            value={session.ageYears}
            onChange={(e) =>
              setSession((s) => ({ ...s, ageYears: e.target.value === '' ? '' : Number(e.target.value) }))
            }
          />
        </label>
        <label>
          + months
          <input
            type="number"
            min={0}
            max={11}
            value={session.ageMonths}
            onChange={(e) =>
              setSession((s) => ({ ...s, ageMonths: e.target.value === '' ? '' : Number(e.target.value) }))
            }
          />
        </label>
        <label>
          Language
          <select
            value={session.languageId}
            onChange={(e) => setSession((s) => ({ ...s, languageId: e.target.value as 'en' | 'es' }))}
          >
            <option value="en">English</option>
            <option value="es">Spanish (beta)</option>
          </select>
        </label>
        <button className="ghost" onClick={loadDemo}>
          Load demo case
        </button>
        <button className="danger" onClick={clearAll}>
          Clear session
        </button>
      </div>

      <nav className="tabs">
        <button className={tab === 'probe' ? 'active' : ''} onClick={() => setTab('probe')}>
          1 · Probe entry
        </button>
        <button className={tab === 'stim' ? 'active' : ''} onClick={() => setTab('stim')}>
          2 · Stimulability
        </button>
        <button className={tab === 'results' ? 'active' : ''} onClick={() => setTab('results')}>
          3 · Analysis
        </button>
        <button className={tab === 'report' ? 'active' : ''} onClick={() => setTab('report')}>
          4 · Report
        </button>
      </nav>

      {tab === 'probe' && (
        <ProbeEntry
          items={session.items}
          analysis={analysis}
          onChange={(items) => setSession((s) => ({ ...s, items }))}
          onAddRow={() => setSession((s) => ({ ...s, items: [...s.items, emptyRow()] }))}
        />
      )}
      {tab === 'stim' && (
        <Stimulability
          analysis={analysis}
          stimulability={session.stimulability}
          onChange={(stimulability) => setSession((s) => ({ ...s, stimulability }))}
        />
      )}
      {tab === 'results' && <Results analysis={analysis} language={language} />}
      {tab === 'report' && (
        <Report
          analysis={analysis}
          language={language}
          clientName={session.clientName}
          ageYears={session.ageYears === '' ? null : Number(session.ageYears)}
          ageMonths={session.ageMonths === '' ? 0 : Number(session.ageMonths)}
        />
      )}
    </>
  )
}
