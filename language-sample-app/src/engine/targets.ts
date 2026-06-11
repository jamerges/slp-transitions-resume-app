import type { ClusterEntry, StimulabilityMap, TargetRecommendation, TraceLine } from './types'
import type { LanguageConfig } from './language'
import { CONSONANTS, STRIDENTS, VOICING_COGNATES } from './phones'
import { ADJUNCT_CLUSTERS, splitCluster } from './inventory'

// Complexity-approach target selection — direct port of the Barlow/Taps/Storkel
// worksheet algorithm (spec §6.3). Deterministic, with a full rule trace so the
// clinician (and the regulator) can see exactly why a target was chosen.

export const STIMULABILITY_THRESHOLD = 30 // >=30% accuracy with support = stimulable

export interface TargetSelectionInput {
  language: LanguageConfig
  /** Phonemic inventory (worksheet Step 1 consults IN *phonemes*) */
  phonemic: Set<string>
  /** Phonetic inventory bases (>=2 productions) */
  phonetic: Set<string>
  /** OUT phones (language consonants not in phonetic inventory) */
  out: string[]
  /** Produced word-initial clusters with counts */
  clusters: ClusterEntry[]
  stimulability: StimulabilityMap
}

export function selectTarget(input: TargetSelectionInput): TargetRecommendation {
  const trace: TraceLine[] = []
  const { language } = input

  const step1 = tryThreeElement(input, trace)
  if (step1) return { kind: '3-element-sCC', target: step1.target, alternates: step1.alternates, trace }

  const step2 = tryTwoElement(input, trace)
  if (step2) return { kind: '2-element-cluster', target: step2.target, alternates: step2.alternates, trace }

  const step3 = trySingleton(input, trace)
  if (step3) return { kind: 'singleton', target: step3.target, alternates: step3.alternates, trace }

  trace.push({
    step: 'Done',
    rule: 'No target selected',
    detail: `No eligible 3-element cluster, 2-element cluster, or singleton target remains for ${language.name}. The system may be complete for this sample, or the probe may need broader coverage.`,
  })
  return { kind: 'none', target: null, alternates: [], trace }
}

// ---------------------------------------------------------------------------
// Step 1 — 3-element /s/CC clusters
// ---------------------------------------------------------------------------

function tryThreeElement(
  input: TargetSelectionInput,
  trace: TraceLine[],
): { target: string; alternates: string[] } | null {
  const { language, phonemic, clusters } = input

  if (language.threeElementClusters.length === 0) {
    trace.push({ step: 'Step 1', rule: '3-element /s/CC', detail: `${language.name} has no 3-element /s/CC onsets — skipping to Step 2.` })
    return null
  }

  const inSCC = clusters.filter((c) => c.inInventory && splitCluster(c.cluster).length === 3 && c.cluster.startsWith('s'))
  if (inSCC.length > 0) {
    trace.push({
      step: 'Step 1',
      rule: '/s/CC already IN',
      detail: `Child already produces ${inSCC.map((c) => '/' + c.cluster + '/').join(', ')} — 3-element clusters are in the system. Proceed to Step 2.`,
    })
    return null
  }

  // Eligibility: a /p t k/ IN phoneme as C2 AND a /w l r/ IN phoneme as C3,
  // combining to one of the five legal /s/CC clusters. /s/ itself need not be IN.
  const candidates = language.threeElementClusters.filter(
    (c) => phonemic.has(c.c2) && phonemic.has(c.c3),
  )

  const inStops = ['p', 't', 'k'].filter((p) => phonemic.has(p))
  const inSonorants = ['w', 'l', 'r'].filter((p) => phonemic.has(p))
  trace.push({
    step: 'Step 1',
    rule: 'Eligibility check',
    detail: `IN stops /p t k/: ${fmtSet(inStops)}; IN sonorants /w l r/: ${fmtSet(inSonorants)}. (/s/ itself need not be IN.) Legal combinations: ${candidates.length ? candidates.map((c) => '/' + c.cluster + '/').join(', ') : 'none'}.`,
  })

  if (candidates.length === 0) {
    trace.push({ step: 'Step 1', rule: 'Not eligible', detail: 'No IN C2+C3 combination forms a legal /s/CC cluster. Proceed to Step 2.' })
    return null
  }

  const target = candidates[0].cluster
  trace.push({
    step: 'Step 1',
    rule: 'Target selected',
    detail: `Select 3-element cluster /${target}/ — treating the most marked structure; implicational laws predict generalization to 2-element clusters and singletons.`,
  })
  return { target, alternates: candidates.slice(1).map((c) => c.cluster) }
}

// ---------------------------------------------------------------------------
// Step 2 — 2-element clusters
// ---------------------------------------------------------------------------

function tryTwoElement(
  input: TargetSelectionInput,
  trace: TraceLine[],
): { target: string; alternates: string[] } | null {
  const { language, clusters, out } = input
  let pool = [...language.clusterPool]

  // (a) remove IN clusters
  const inClusters = clusters.filter((c) => c.inInventory && splitCluster(c.cluster).length === 2)
  const inSet = new Set(inClusters.map((c) => c.cluster))
  const removedIn = pool.filter((p) => inSet.has(p.cluster))
  pool = pool.filter((p) => !inSet.has(p.cluster))
  trace.push({
    step: 'Step 2a',
    rule: 'Remove IN clusters',
    detail: removedIn.length
      ? `Removed (already produced ≥2×): ${removedIn.map((p) => '/' + p.cluster + '/').join(', ')}.`
      : 'No 2-element clusters in inventory — nothing removed.',
  })
  if (pool.length === 0) {
    trace.push({ step: 'Step 2', rule: 'Pool empty', detail: 'All pool clusters are IN. Proceed to Step 3.' })
    return null
  }

  // (b) remove clusters with SD >= child's minimum IN-cluster SD
  // (adjuncts and C+/j/ excluded from the minimum — they pattern differently)
  const trueInClusters = inClusters.filter(
    (c) => !c.isAdjunct && c.sonorityDistance != null && !c.cluster.endsWith('j'),
  )
  if (trueInClusters.length > 0) {
    const minSd = Math.min(...trueInClusters.map((c) => c.sonorityDistance!))
    const removed = pool.filter((p) => p.sd >= minSd)
    pool = pool.filter((p) => p.sd < minSd)
    trace.push({
      step: 'Step 2b',
      rule: 'SD cut',
      detail: `Child's smallest IN-cluster SD is ${minSd} (${trueInClusters.map((c) => '/' + c.cluster + '/').join(', ')}). Removed pool clusters with SD ≥ ${minSd}: ${removed.length ? removed.map((p) => '/' + p.cluster + '/').join(', ') : 'none'}.`,
    })
  } else {
    trace.push({ step: 'Step 2b', rule: 'SD cut skipped', detail: 'No true IN clusters — SD cut does not apply.' })
  }

  // (c) remove SD=-2 adjuncts and C+/j/ (defensive: pool should not contain them)
  pool = pool.filter((p) => !ADJUNCT_CLUSTERS.has(p.cluster) && !p.cluster.endsWith('j'))
  trace.push({
    step: 'Step 2c',
    rule: 'Adjuncts & C+/j/ excluded',
    detail: '/sp st sk/ (SD −2 adjuncts) and consonant+/j/ sequences are excluded — they pattern differently and inhibit generalization.',
  })

  // (d) /sw sl sm sn/: keep only if their error pattern differs from the adjunct
  // /sp st sk/ pattern; if unclear, cut.
  const sSonorant = new Set(['sw', 'sl', 'sm', 'sn'])
  const inPool = pool.filter((p) => sSonorant.has(p.cluster))
  if (inPool.length > 0) {
    const verdict = sClusterPatternsLikeAdjunct(input)
    if (verdict.cut) {
      pool = pool.filter((p) => !sSonorant.has(p.cluster))
      trace.push({ step: 'Step 2d', rule: '/s/+sonorant cut', detail: verdict.reason })
    } else {
      trace.push({ step: 'Step 2d', rule: '/s/+sonorant kept', detail: verdict.reason })
    }
  }

  if (pool.length === 0) {
    trace.push({ step: 'Step 2', rule: 'Pool empty', detail: 'No eligible 2-element clusters remain. Proceed to Step 3.' })
    return null
  }

  // (e) smallest SD; ties → prefer clusters containing OUT phones (more OUT members first)
  const minSd = Math.min(...pool.map((p) => p.sd))
  const smallest = pool.filter((p) => p.sd === minSd)
  const outSet = new Set(out)
  const scored = smallest
    .map((p) => ({
      cluster: p.cluster,
      outMembers: splitCluster(p.cluster).filter((m) => outSet.has(m)),
    }))
    .sort((a, b) => b.outMembers.length - a.outMembers.length)

  const target = scored[0]
  // Alternates are only true ties: same SD and same OUT-phone count
  const alternates = scored.slice(1).filter((s) => s.outMembers.length === target.outMembers.length)
  trace.push({
    step: 'Step 2e',
    rule: 'Target selected',
    detail: `Smallest remaining SD is ${minSd}: ${smallest.map((p) => '/' + p.cluster + '/').join(', ')}. ` +
      (scored.length > 1
        ? `Tie broken by OUT-phone content — /${target.cluster}/ contains ${target.outMembers.length ? target.outMembers.map((m) => '/' + m + '/').join(', ') : 'no OUT phones'}.`
        : `Selected /${target.cluster}/.`),
  })
  return { target: target.cluster, alternates: alternates.map((s) => s.cluster) }
}

/**
 * Step 2(d) heuristic: do /sw sl sm sn/ pattern like the /sp st sk/ adjuncts?
 * We compare reduction patterns (which member survives when the cluster is
 * reduced). If there is no evidence either way, the worksheet says cut.
 */
function sClusterPatternsLikeAdjunct(input: TargetSelectionInput): { cut: boolean; reason: string } {
  const sClusters = input.clusters.filter((c) => ['sw', 'sl', 'sm', 'sn'].includes(c.cluster))
  const produced = sClusters.filter((c) => c.inInventory)
  if (produced.length > 0) {
    return {
      cut: false,
      reason: `Child produces ${produced.map((c) => '/' + c.cluster + '/').join(', ')} as true clusters — keeping /s/+sonorant clusters in the pool.`,
    }
  }
  return {
    cut: true,
    reason: 'No evidence that /sw sl sm sn/ pattern as true clusters for this child (worksheet: if unclear, cut). Removed from pool.',
  }
}

// ---------------------------------------------------------------------------
// Step 3 — Singleton target
// ---------------------------------------------------------------------------

function trySingleton(
  input: TargetSelectionInput,
  trace: TraceLine[],
): { target: string; alternates: string[] } | null {
  const { language, out, stimulability } = input

  if (out.length === 0) {
    trace.push({ step: 'Step 3', rule: 'No OUT phones', detail: 'All language consonants are in the phonetic inventory — no singleton targets.' })
    return null
  }
  trace.push({ step: 'Step 3', rule: 'OUT phones', detail: `Candidates (absent from phonetic inventory): ${fmtSet(out)}.` })

  // (a) remove stimulable sounds (>=30% with support → likely to emerge untreated)
  const stimulable = out.filter((p) => (stimulability[p] ?? -1) >= STIMULABILITY_THRESHOLD)
  let candidates = out.filter((p) => !stimulable.includes(p))
  trace.push({
    step: 'Step 3a',
    rule: 'Remove stimulable',
    detail: stimulable.length
      ? `Removed (≥${STIMULABILITY_THRESHOLD}% with support — likely to emerge without treatment): ${fmtSet(stimulable)}.`
      : 'No OUT phones are stimulable (or stimulability untested) — nothing removed.',
  })

  // (b) remove early-acquired sounds
  const earlySet = new Set(language.earlyAcquired)
  const removedEarly = candidates.filter((p) => earlySet.has(p))
  candidates = candidates.filter((p) => !earlySet.has(p))
  trace.push({
    step: 'Step 3b',
    rule: 'Remove early-acquired',
    detail: removedEarly.length
      ? `Removed early-acquired ${language.name} sounds: ${fmtSet(removedEarly)}.`
      : 'No early-acquired sounds among remaining candidates.',
  })

  if (candidates.length === 0) {
    // Fall back: if everything was cut, the worksheet leaves target choice to
    // clinical judgment; surface the stimulable/early sets rather than forcing one.
    trace.push({
      step: 'Step 3',
      rule: 'No candidates remain',
      detail: 'All OUT phones are stimulable or early-acquired. Clinical judgment: consider monitoring stimulable sounds and treating early-acquired OUT sounds directly.',
    })
    return null
  }

  // (c) prefer sounds that maximize system-wide change per the implicational laws
  const outSet = new Set(out)
  const scored = candidates.map((p) => ({ phone: p, ...implicationalGain(p, outSet) }))
  const maxGain = Math.max(...scored.map((s) => s.gain))
  const best = scored.filter((s) => s.gain === maxGain)
  trace.push({
    step: 'Step 3c',
    rule: 'Implicational-law scoring',
    detail: scored
      .map((s) => `/${s.phone}/ → ${s.gain} implied OUT sound(s)${s.implied.length ? ` (${s.implied.join(' ')})` : ''}`)
      .join('; '),
  })

  // (d) tie-break by language frequency
  const freqRank = new Map(language.frequencyOrder.map((p, i) => [p, i]))
  best.sort((a, b) => (freqRank.get(a.phone) ?? 99) - (freqRank.get(b.phone) ?? 99))
  const target = best[0].phone
  trace.push({
    step: 'Step 3d',
    rule: 'Target selected',
    detail: best.length > 1
      ? `Tie among ${fmtSet(best.map((b) => b.phone))} broken by ${language.name} consonant frequency → /${target}/.`
      : `/${target}/ maximizes predicted system-wide change.`,
  })
  return { target, alternates: best.slice(1).map((b) => b.phone) }
}

/**
 * Implicational gain: how many *currently OUT* phones this candidate's laws imply
 * (transitively). Encodes spec §6.2: affricates→fricatives→stops, stridents→liquids→nasals,
 * liquids→nasals, fricatives→stops, voiced obstruent→voiceless cognate, velar→coronals.
 */
export function implicationalGain(phone: string, outSet: Set<string>): { gain: number; implied: string[] } {
  const info = CONSONANTS[phone]
  if (!info) return { gain: 0, implied: [] }

  const implied = new Set<string>()
  const all = Object.keys(CONSONANTS)

  const addClass = (pred: (p: string) => boolean) => {
    for (const p of all) {
      if (p !== phone && outSet.has(p) && pred(p)) implied.add(p)
    }
  }

  const mannerOf = (p: string) => CONSONANTS[p]?.manner
  const placeOf = (p: string) => CONSONANTS[p]?.place

  if (info.manner === 'affricate') {
    addClass((p) => mannerOf(p) === 'fricative') // affricates → fricatives
    addClass((p) => mannerOf(p) === 'stop') // → (fricatives →) stops
  }
  if (info.manner === 'fricative') {
    addClass((p) => mannerOf(p) === 'stop') // fricatives → stops
  }
  if (STRIDENTS.has(phone)) {
    addClass((p) => mannerOf(p) === 'liquid') // stridency → liquids
    addClass((p) => mannerOf(p) === 'nasal') // → (liquids →) nasals
  }
  if (info.manner === 'liquid') {
    addClass((p) => mannerOf(p) === 'nasal') // liquids → nasals
  }
  if (info.voiced && (info.manner === 'stop' || info.manner === 'fricative' || info.manner === 'affricate')) {
    const cognate = VOICING_COGNATES[phone]
    if (cognate && outSet.has(cognate)) implied.add(cognate) // voiced → voiceless
  }
  if (info.place === 'velar') {
    addClass((p) => (placeOf(p) === 'alveolar' || placeOf(p) === 'dental') && mannerOf(p) === info.manner) // velars → coronals
  }

  const list = [...implied].map((p) => '/' + p + '/')
  return { gain: implied.size, implied: list }
}

function fmtSet(phones: string[]): string {
  return phones.length ? phones.map((p) => '/' + p + '/').join(' ') : 'none'
}
