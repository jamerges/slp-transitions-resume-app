import type {
  ClusterEntry,
  ItemResult,
  MinimalPair,
  PccResult,
  ProbeItem,
  StimulabilityMap,
  TargetRecommendation,
} from './types'
import type { LanguageConfig } from './language'
import { tokenizeIpa } from './tokenize'
import { alignPhones } from './align'
import {
  clusterInventory,
  consonantCounts,
  outPhones,
  phonemicInventory,
  phoneticInventory,
  type ProductionForm,
} from './inventory'
import { computePcc } from './pcc'
import { selectTarget, STIMULABILITY_THRESHOLD } from './targets'

export interface ScreeningFlag {
  id: string
  label: string
  detail: string
}

export interface AnalysisResult {
  itemResults: ItemResult[]
  /** consonant base → production count (all counts, incl. <2) */
  consonantCounts: Map<string, number>
  phoneticInventory: Map<string, number>
  phonemicInventory: Set<string>
  minimalPairs: MinimalPair[]
  clusters: ClusterEntry[]
  outPhones: string[]
  stimulable: string[]
  nonstimulable: string[]
  untestedStimulability: string[]
  pcc: PccResult
  recommendation: TargetRecommendation
  flags: ScreeningFlag[]
}

export interface AnalysisInput {
  items: ProbeItem[]
  stimulability: StimulabilityMap
  language: LanguageConfig
  /** age in months, if known — drives age-conditional screening flags */
  ageMonths?: number
}

export function analyze(input: AnalysisInput): AnalysisResult {
  const { language, stimulability } = input

  const scorable = input.items.filter((it) => it.targetIpa.trim() && it.actualIpa.trim())

  const itemResults: ItemResult[] = scorable.map((item) => {
    const target = tokenizeIpa(item.targetIpa)
    const actual = tokenizeIpa(item.actualIpa)
    return { item, target, actual, alignment: alignPhones(target, actual) }
  })

  const forms: ProductionForm[] = itemResults.map((r) => ({ word: r.item.word, phones: r.actual }))

  const phonetic = phoneticInventory(forms)
  const counts = consonantCounts(forms)
  const phonemic = phonemicInventory(forms)
  const clusters = clusterInventory(forms)
  const out = outPhones(language.consonants, phonetic)
  const pcc = computePcc(itemResults.map((r) => r.alignment))

  const stimulable = out.filter((p) => (stimulability[p] ?? -1) >= STIMULABILITY_THRESHOLD)
  const nonstimulable = out.filter(
    (p) => stimulability[p] != null && stimulability[p]! < STIMULABILITY_THRESHOLD,
  )
  const untestedStimulability = out.filter((p) => stimulability[p] == null)

  const recommendation = selectTarget({
    language,
    phonemic: phonemic.inventory,
    phonetic: new Set(phonetic.keys()),
    out,
    clusters,
    stimulability,
  })

  return {
    itemResults,
    consonantCounts: counts,
    phoneticInventory: phonetic,
    phonemicInventory: phonemic.inventory,
    minimalPairs: phonemic.pairs,
    clusters,
    outPhones: out,
    stimulable,
    nonstimulable,
    untestedStimulability,
    pcc,
    recommendation,
    flags: screeningFlags(itemResults, input.ageMonths),
  }
}

/**
 * Screening flags (spec §6.4). These are *candidates for the clinician to confirm* —
 * never diagnoses. Conservative by design.
 */
function screeningFlags(itemResults: ItemResult[], ageMonths?: number): ScreeningFlag[] {
  const flags: ScreeningFlag[] = []

  // Lateral lisp: lateralized sibilants (ɬ, or lateral-fricative diacritic on s/z) — flag at ANY age
  const lateralized = itemResults.some((r) =>
    r.alignment.some(
      (seg) =>
        seg.actual &&
        (seg.actual.base === 'ɬ' ||
          (['s', 'z', 'ʃ', 'ʒ'].includes(seg.target?.base ?? '') &&
            (seg.actual.base === 'l' || seg.actual.diacritics.includes('̴')))),
    ),
  )
  if (lateralized) {
    flags.push({
      id: 'lateral-lisp',
      label: 'Possible lateral lisp',
      detail: 'Lateralized sibilant productions detected. Lateral lisps are not developmental at any age — recommend direct probe.',
    })
  }

  // Frontal lisp: s/z → θ/ð substitutions; developmental to ~age 7
  const frontal = itemResults.some((r) =>
    r.alignment.some(
      (seg) => ['s', 'z'].includes(seg.target?.base ?? '') && ['θ', 'ð'].includes(seg.actual?.base ?? ''),
    ),
  )
  if (frontal && ageMonths != null && ageMonths >= 84) {
    flags.push({
      id: 'frontal-lisp',
      label: 'Frontal lisp past developmental window',
      detail: 'Interdental /s z/ productions at age ≥7;0 — typically developmental only to ~7. Recommend probe.',
    })
  }

  // Vowel errors: a CAS hallmark worth surfacing (alongside inconsistency)
  const vowelErrors = itemResults.reduce(
    (n, r) =>
      n +
      r.alignment.filter((s) => s.target?.kind === 'vowel' && s.status !== 'correct' && s.status !== 'addition').length,
    0,
  )
  const vowelTargets = itemResults.reduce(
    (n, r) => n + r.alignment.filter((s) => s.target?.kind === 'vowel').length,
    0,
  )
  if (vowelTargets > 0 && vowelErrors / vowelTargets > 0.15) {
    flags.push({
      id: 'vowel-errors',
      label: 'Elevated vowel error rate',
      detail: `${vowelErrors}/${vowelTargets} vowel targets in error (${Math.round((vowelErrors / vowelTargets) * 100)}%). Vowel distortions are a CAS hallmark — recommend deeper CAS probe (inconsistency, prosody).`,
    })
  }

  // Inconsistent errors on repeated words: another CAS hallmark
  const byWord = new Map<string, Set<string>>()
  for (const r of itemResults) {
    const key = r.item.word.toLowerCase()
    if (!byWord.has(key)) byWord.set(key, new Set())
    byWord.get(key)!.add(r.actual.map((p) => p.base).join(''))
  }
  const inconsistent = [...byWord.entries()].filter(([, formsSet]) => formsSet.size > 1)
  if (inconsistent.length >= 2) {
    flags.push({
      id: 'inconsistency',
      label: 'Inconsistent productions on repeated words',
      detail: `${inconsistent.length} word(s) produced differently across attempts (${inconsistent.map(([w]) => `"${w}"`).join(', ')}). Inconsistency is a CAS hallmark — recommend deeper CAS probe.`,
    })
  }

  return flags
}
