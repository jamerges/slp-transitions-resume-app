import { describe, expect, it } from 'vitest'
import { analyze } from './analyze'
import { ENGLISH } from './language'
import { DEMO_ITEMS, DEMO_STIMULABILITY } from '../sampleData'

// End-to-end worked example: the demo child (4;6, fronting + stopping + gliding +
// cluster reduction) run through the full pipeline. Pins expected outputs so any
// engine change that alters clinical results fails loudly.

describe('demo case end-to-end', () => {
  const result = analyze({
    items: DEMO_ITEMS,
    stimulability: DEMO_STIMULABILITY,
    language: ENGLISH,
    ageMonths: 54,
  })

  it('scores all demo items', () => {
    expect(result.itemResults.length).toBe(DEMO_ITEMS.length)
  })

  it('builds the expected phonetic inventory', () => {
    // produced ≥2×: early stops/nasals/glides + f, s (from ʃ→s), h
    for (const phone of ['p', 'b', 't', 'd', 'm', 'n', 'f', 's', 'w', 'j', 'h']) {
      expect(result.phoneticInventory.has(phone), `expected /${phone}/ IN`).toBe(true)
    }
    // fronted/stopped/glided sounds are OUT
    for (const phone of ['k', 'g', 'ŋ', 'r', 'l', 'θ', 'ð', 'ʃ', 'ʒ', 'tʃ', 'dʒ', 'v', 'z']) {
      expect(result.outPhones, `expected /${phone}/ OUT`).toContain(phone)
    }
  })

  it('produces a moderate PCC with PCC-R >= PCC', () => {
    expect(result.pcc.pcc).toBeGreaterThan(30)
    expect(result.pcc.pcc).toBeLessThan(75)
    expect(result.pcc.pccR).toBeGreaterThanOrEqual(result.pcc.pcc)
    expect(result.pcc.severity).not.toBe('mild')
  })

  it('recommends a 2-element cluster containing OUT phones (Step 2)', () => {
    // Step 1 fails (k, l, r all OUT → no legal /s/CC combination)
    // Step 2: no IN clusters; s+sonorant cut (no true-cluster evidence);
    // smallest remaining SD = 3 → θr/ʃr carry two OUT members each
    expect(result.recommendation.kind).toBe('2-element-cluster')
    expect(['θr', 'ʃr']).toContain(result.recommendation.target)
    expect(result.recommendation.trace.some((t) => t.step === 'Step 1')).toBe(true)
    expect(result.recommendation.trace.some((t) => t.step === 'Step 2e')).toBe(true)
  })

  it('classifies stimulability from the demo dynamic-probe data', () => {
    expect(result.stimulable).toContain('k') // 60%
    expect(result.stimulable).toContain('v') // 70%
    expect(result.nonstimulable).toContain('r') // 0%
    expect(result.untestedStimulability).toContain('dʒ')
  })
})
