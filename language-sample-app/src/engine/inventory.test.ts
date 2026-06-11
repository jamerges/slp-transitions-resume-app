import { describe, expect, it } from 'vitest'
import { tokenizeIpa } from './tokenize'
import { clusterInventory, phonemicInventory, phoneticInventory } from './inventory'
import { computePcc } from './pcc'
import { alignPhones } from './align'

const form = (word: string, ipa: string) => ({ word, phones: tokenizeIpa(ipa) })

describe('phoneticInventory', () => {
  it('requires >=2 productions', () => {
    const inv = phoneticInventory([form('top', 'tap'), form('two', 'tu'), form('pie', 'paɪ')])
    expect(inv.has('t')).toBe(true) // 2×
    expect(inv.has('p')).toBe(true) // tap + pie = 2×
    expect(inv.has('k')).toBe(false)
  })

  it('counts substituted phones (substitution proves producibility)', () => {
    // child says [t] for /k/ twice → t is IN even though never a correct target
    const inv = phoneticInventory([form('key', 'ti'), form('cat', 'tæt')])
    expect(inv.has('t')).toBe(true)
  })
})

describe('phonemicInventory', () => {
  it('finds minimal pairs and requires >=2 pairs per phone', () => {
    const { inventory, pairs } = phonemicInventory([
      form('pat', 'pæt'),
      form('bat', 'bæt'),
      form('pad', 'pæd'),
      form('bad', 'bæd'),
    ])
    // p/b contrast in two pairs (pæt/bæt, pæd/bæd) → both phonemic
    expect(inventory.has('p')).toBe(true)
    expect(inventory.has('b')).toBe(true)
    expect(pairs.length).toBeGreaterThanOrEqual(2)
  })

  it('one pair is not enough', () => {
    const { inventory } = phonemicInventory([form('pat', 'pæt'), form('bat', 'bæt')])
    expect(inventory.has('p')).toBe(false)
  })

  it('repeated identical productions are not pairs', () => {
    const { pairs } = phonemicInventory([form('pat', 'pæt'), form('pat', 'pæt')])
    expect(pairs.length).toBe(0)
  })
})

describe('clusterInventory', () => {
  it('detects word-initial clusters with Gierut sonority distances', () => {
    const entries = clusterInventory([
      form('spoon', 'spun'),
      form('spot', 'spat'),
      form('tree', 'tri'),
      form('truck', 'trʌk'),
      form('smile', 'smaɪl'),
    ])
    const sp = entries.find((e) => e.cluster === 'sp')!
    expect(sp.inInventory).toBe(true)
    expect(sp.sonorityDistance).toBe(-2) // adjunct: p(1) - s(3)
    expect(sp.isAdjunct).toBe(true)
    const tr = entries.find((e) => e.cluster === 'tr')!
    expect(tr.sonorityDistance).toBe(5) // r(6) - t(1)
    const sm = entries.find((e) => e.cluster === 'sm')!
    expect(sm.inInventory).toBe(false) // only 1×
    expect(sm.sonorityDistance).toBe(2) // m(5) - s(3)
  })
})

describe('computePcc', () => {
  it('computes strict PCC and PCC-R', () => {
    const alignments = [
      alignPhones(tokenizeIpa('kæt'), tokenizeIpa('tæt')), // k wrong, t right → 1/2
      alignPhones(tokenizeIpa('sʌn'), tokenizeIpa('s̪ʌn')), // s distorted, n right → strict 1/2, R 2/2
    ]
    const r = computePcc(alignments)
    expect(r.totalConsonants).toBe(4)
    expect(r.correctStrict).toBe(2)
    expect(r.pcc).toBe(50)
    expect(r.pccR).toBe(75)
    expect(r.severity).toBe('moderate-severe')
  })
})
