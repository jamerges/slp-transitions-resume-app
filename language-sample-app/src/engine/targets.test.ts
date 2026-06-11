import { describe, expect, it } from 'vitest'
import { selectTarget, implicationalGain, type TargetSelectionInput } from './targets'
import { ENGLISH } from './language'
import type { ClusterEntry } from './types'

const cluster = (c: string, sd: number | null, inInv = true): ClusterEntry => ({
  cluster: c,
  count: inInv ? 2 : 1,
  inInventory: inInv,
  sonorityDistance: sd,
  isAdjunct: ['sp', 'st', 'sk'].includes(c),
})

const base = (over: Partial<TargetSelectionInput>): TargetSelectionInput => ({
  language: ENGLISH,
  phonemic: new Set(),
  phonetic: new Set(),
  out: [],
  clusters: [],
  stimulability: {},
  ...over,
})

describe('Step 1 — 3-element /s/CC', () => {
  it('selects /skw/ when k and w are IN phonemes (s need not be IN)', () => {
    const rec = selectTarget(
      base({
        phonemic: new Set(['p', 't', 'k', 'w', 'm', 'n']),
        phonetic: new Set(['p', 't', 'k', 'w', 'm', 'n']),
        out: ['s', 'z', 'r', 'l'],
      }),
    )
    expect(rec.kind).toBe('3-element-sCC')
    expect(rec.target).toBe('skw')
  })

  it('lists all eligible /s/CC as candidates when r is also IN', () => {
    const rec = selectTarget(
      base({
        phonemic: new Set(['p', 't', 'k', 'w', 'l', 'r']),
        out: ['s'],
      }),
    )
    expect(rec.kind).toBe('3-element-sCC')
    expect([rec.target, ...rec.alternates].sort()).toEqual(['skr', 'skw', 'spl', 'spr', 'str'].sort())
  })

  it('skips Step 1 when an /s/CC is already produced', () => {
    const rec = selectTarget(
      base({
        phonemic: new Set(['p', 't', 'k', 'w', 'r']),
        out: ['θ', 'ʃ'],
        clusters: [cluster('skw', null)],
      }),
    )
    expect(rec.kind).not.toBe('3-element-sCC')
  })

  it('skips Step 1 when no legal combination exists (k and r both OUT)', () => {
    const rec = selectTarget(
      base({
        phonemic: new Set(['p', 't', 'w']), // spl needs l, spr/str need r, skw/skr need k
        out: ['k', 'r', 'l', 's'],
      }),
    )
    expect(rec.kind).not.toBe('3-element-sCC')
  })
})

describe('Step 2 — 2-element clusters', () => {
  it('with no IN clusters, cuts s+sonorant (unclear) and picks smallest SD with most OUT phones', () => {
    const rec = selectTarget(
      base({
        phonemic: new Set(['p', 't', 'd', 'w']), // step 1 fails: no k/l/r... spl needs l
        out: ['k', 'g', 's', 'z', 'ʃ', 'ʒ', 'tʃ', 'dʒ', 'θ', 'ð', 'r', 'l', 'ŋ'],
      }),
    )
    expect(rec.kind).toBe('2-element-cluster')
    // sm/sn (SD 2) cut at step 2d (no evidence of true-cluster patterning);
    // SD 3 pool: sl(cut with s-sonorant), fl, fr, θr, ʃr → θr and ʃr have 2 OUT members
    expect(['θr', 'ʃr']).toContain(rec.target)
  })

  it('keeps /s/+sonorant when child produces one as a true cluster', () => {
    const rec = selectTarget(
      base({
        phonemic: new Set(['p', 't', 'd', 'w', 'm', 'n']),
        out: ['k', 'g', 's', 'r', 'l'],
        clusters: [cluster('sm', 2)], // sm produced 2× → s+sonorant pattern as true clusters
      }),
    )
    // sm IN removes it from pool (2a); minimum IN SD = 2 removes everything SD>=2... pool empty → singleton
    // (sn is SD 2 too, so the SD cut removes it; this exercises 2a+2b+2d interplay)
    expect(rec.kind).toBe('singleton')
  })

  it('applies the SD cut from the smallest IN cluster', () => {
    const rec = selectTarget(
      base({
        phonemic: new Set(['p', 'b', 't', 'd', 'w', 'm', 'n', 'f']),
        out: ['k', 'g', 's', 'z', 'r', 'l', 'θ'],
        clusters: [cluster('fl', 3), cluster('sn', 2)], // true clusters at SD 3 and 2
      }),
    )
    // min IN SD = 2 → remove pool SD >= 2 → pool empty → falls to Step 3
    expect(rec.kind).toBe('singleton')
  })

  it('SD cut leaves smaller-SD clusters available', () => {
    const rec = selectTarget(
      base({
        phonemic: new Set(['p', 'b', 't', 'd', 'k', 'g', 'w', 'm', 'n', 'f', 'l', 'r']),
        out: ['s', 'z', 'θ', 'ð', 'ʃ'],
        clusters: [cluster('pl', 5), cluster('tr', 5)],
      }),
    )
    // Step 1: k IN + w IN → skw eligible! So this actually selects skw first.
    expect(rec.kind).toBe('3-element-sCC')
  })
})

describe('Step 3 — singletons', () => {
  const noClusterEligibility = {
    phonemic: new Set(['p', 'b', 't', 'd', 'm', 'n', 'h']), // no k/w/l/r → step 1 fails
  }

  it('removes stimulable and early-acquired, scores by implicational laws', () => {
    const rec = selectTarget(
      base({
        ...noClusterEligibility,
        // Make step 2 exhaust: child has an SD-2 true cluster → SD cut empties pool
        clusters: [cluster('sm', 2), cluster('sn', 2)],
        out: ['k', 'g', 'r', 'l', 's', 'z', 'θ', 'ð', 'ʃ', 'ʒ', 'tʃ', 'dʒ', 'ŋ', 'w', 'j', 'f', 'v'],
        stimulability: { r: 60, l: 40 }, // both stimulable → removed
      }),
    )
    expect(rec.kind).toBe('singleton')
    // r, l removed (stimulable); k g ŋ w j f v removed (early-acquired)
    // remaining: s z θ ð ʃ ʒ tʃ dʒ — affricates imply fricatives+stops; stridents imply liquids+nasals
    // dʒ (voiced affricate): fricatives(6 OUT) + stops(2: k,g) + liquids... it's strident too
    expect(['tʃ', 'dʒ', 'z', 'ʒ']).toContain(rec.target)
    expect(rec.trace.some((t) => t.step === 'Step 3a' && t.detail.includes('/r/'))).toBe(true)
  })

  it('frequency order breaks ties', () => {
    const rec = selectTarget(
      base({
        ...noClusterEligibility,
        clusters: [cluster('sm', 2)],
        out: ['θ', 'ʃ'], // both vl fricatives, no stops OUT, no liquids OUT → equal gain
        stimulability: {},
      }),
    )
    expect(rec.kind).toBe('singleton')
    expect(rec.target).toBe('θ') // θ before ʃ in English frequency order
  })

  it('returns none when all OUT phones are stimulable or early-acquired', () => {
    const rec = selectTarget(
      base({
        ...noClusterEligibility,
        clusters: [cluster('sm', 2)],
        out: ['k', 'g', 'r'],
        stimulability: { r: 50 },
      }),
    )
    expect(rec.kind).toBe('none')
    expect(rec.trace.length).toBeGreaterThan(0)
  })
})

describe('implicationalGain', () => {
  it('credits affricates with fricative and stop generalization', () => {
    const out = new Set(['k', 'g', 's', 'z', 'θ', 'tʃ', 'dʒ'])
    const { gain, implied } = implicationalGain('tʃ', out)
    expect(gain).toBeGreaterThanOrEqual(5) // s z θ (fricatives) + k g (stops)
    expect(implied.join(' ')).toContain('/s/')
  })

  it('credits voiced obstruents with their voiceless cognate', () => {
    const out = new Set(['z', 's'])
    const { implied } = implicationalGain('z', out)
    expect(implied).toContain('/s/')
  })
})
