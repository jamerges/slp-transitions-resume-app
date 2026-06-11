import { describe, expect, it } from 'vitest'
import { tokenizeIpa } from './tokenize'
import { alignPhones } from './align'

const align = (target: string, actual: string) =>
  alignPhones(tokenizeIpa(target), tokenizeIpa(actual))

describe('alignPhones', () => {
  it('classifies a clean match as all correct', () => {
    const ops = align('kæt', 'kæt')
    expect(ops.map((o) => o.status)).toEqual(['correct', 'correct', 'correct'])
  })

  it('detects substitution (velar fronting k→t)', () => {
    const ops = align('kæt', 'tæt')
    expect(ops[0].status).toBe('substitution')
    expect(ops[0].target?.base).toBe('k')
    expect(ops[0].actual?.base).toBe('t')
  })

  it('detects omission (cluster reduction sp→p)', () => {
    const ops = align('spun', 'pun')
    expect(ops[0].status).toBe('omission')
    expect(ops[0].target?.base).toBe('s')
    expect(ops.slice(1).map((o) => o.status)).toEqual(['correct', 'correct', 'correct'])
  })

  it('detects addition (epenthesis)', () => {
    const ops = align('blu', 'bəlu')
    const added = ops.find((o) => o.status === 'addition')
    expect(added?.actual?.base).toBe('ə')
  })

  it('detects distortion via diacritic mismatch (dentalized s)', () => {
    const ops = align('sʌn', 's̪ʌn')
    expect(ops[0].status).toBe('distortion')
  })

  it('handles multiple errors (snake → neɪt: s omitted, k→t)', () => {
    const ops = align('sneɪk', 'neɪt')
    expect(ops[0].status).toBe('omission')
    expect(ops[0].target?.base).toBe('s')
    const last = ops[ops.length - 1]
    expect(last.status).toBe('substitution')
    expect(last.target?.base).toBe('k')
    expect(last.actual?.base).toBe('t')
  })

  it('aligns gliding (r→w) as substitution, not indel pair', () => {
    const ops = align('rɛd', 'wɛd')
    expect(ops.map((o) => o.status)).toEqual(['substitution', 'correct', 'correct'])
  })
})
