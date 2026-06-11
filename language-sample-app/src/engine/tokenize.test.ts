import { describe, expect, it } from 'vitest'
import { tokenizeIpa, phonesToString } from './tokenize'

describe('tokenizeIpa', () => {
  it('tokenizes simple CVC', () => {
    const phones = tokenizeIpa('kæt')
    expect(phones.map((p) => p.base)).toEqual(['k', 'æ', 't'])
    expect(phones.map((p) => p.kind)).toEqual(['consonant', 'vowel', 'consonant'])
  })

  it('merges affricates with and without tie bar, and ligatures', () => {
    expect(tokenizeIpa('tʃɪp').map((p) => p.base)).toEqual(['tʃ', 'ɪ', 'p'])
    expect(tokenizeIpa('t͡ʃɪp').map((p) => p.base)).toEqual(['tʃ', 'ɪ', 'p'])
    expect(tokenizeIpa('ʤʌmp').map((p) => p.base)).toEqual(['dʒ', 'ʌ', 'm', 'p'])
  })

  it('attaches diacritics to the preceding phone', () => {
    const phones = tokenizeIpa('s̪ʌn')
    expect(phones[0].base).toBe('s')
    expect(phones[0].diacritics.length).toBe(1)
    const aspirated = tokenizeIpa('pʰæt')
    expect(aspirated[0].base).toBe('p')
    expect(aspirated[0].diacritics).toContain('ʰ')
  })

  it('ignores slashes, brackets, stress marks', () => {
    expect(tokenizeIpa('/ˈspun/').map((p) => p.base)).toEqual(['s', 'p', 'u', 'n'])
  })

  it('normalizes ɹ→r and ɡ→g', () => {
    expect(tokenizeIpa('ɹɛd').map((p) => p.base)).toEqual(['r', 'ɛ', 'd'])
    expect(tokenizeIpa('ɡoʊ').map((p) => p.base)).toEqual(['g', 'o', 'ʊ'])
  })

  it('round-trips with diacritics', () => {
    expect(phonesToString(tokenizeIpa('pʰæt'))).toBe('pʰæt')
  })
})
