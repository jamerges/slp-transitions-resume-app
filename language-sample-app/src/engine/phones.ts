import type { ConsonantInfo } from './types'

// Sonority indices per Gierut (1999), as used in the Barlow/Taps/Storkel worksheets:
// voiceless stop/affricate 1, voiced stop/affricate 2, voiceless fricative 3,
// voiced fricative 4, nasal 5, liquid 6, glide 7.
// This scale is what makes /sp st sk/ adjuncts come out at SD = -2.

const C = (place: ConsonantInfo['place'], manner: ConsonantInfo['manner'], voiced: boolean): ConsonantInfo => ({
  place,
  manner,
  voiced,
  sonority: sonorityOf(manner, voiced),
})

function sonorityOf(manner: ConsonantInfo['manner'], voiced: boolean): number {
  switch (manner) {
    case 'stop':
    case 'affricate':
      return voiced ? 2 : 1
    case 'fricative':
      return voiced ? 4 : 3
    case 'nasal':
      return 5
    case 'liquid':
      return 6
    case 'glide':
      return 7
  }
}

/** English + Spanish consonant feature table (superset; language configs pick their subsets). */
export const CONSONANTS: Record<string, ConsonantInfo> = {
  p: C('bilabial', 'stop', false),
  b: C('bilabial', 'stop', true),
  t: C('alveolar', 'stop', false),
  d: C('alveolar', 'stop', true),
  k: C('velar', 'stop', false),
  g: C('velar', 'stop', true),
  ʔ: C('glottal', 'stop', false),
  m: C('bilabial', 'nasal', true),
  n: C('alveolar', 'nasal', true),
  ŋ: C('velar', 'nasal', true),
  ɲ: C('palatal', 'nasal', true),
  f: C('labiodental', 'fricative', false),
  v: C('labiodental', 'fricative', true),
  θ: C('dental', 'fricative', false),
  ð: C('dental', 'fricative', true),
  s: C('alveolar', 'fricative', false),
  z: C('alveolar', 'fricative', true),
  ʃ: C('postalveolar', 'fricative', false),
  ʒ: C('postalveolar', 'fricative', true),
  x: C('velar', 'fricative', false),
  h: C('glottal', 'fricative', false),
  'tʃ': C('postalveolar', 'affricate', false),
  'dʒ': C('postalveolar', 'affricate', true),
  l: C('alveolar', 'liquid', true),
  r: C('alveolar', 'liquid', true), // English rhotic; ɹ normalized to r
  ɾ: C('alveolar', 'liquid', true), // Spanish tap
  ʎ: C('palatal', 'liquid', true),
  w: C('bilabial', 'glide', true),
  j: C('palatal', 'glide', true),
  ʝ: C('palatal', 'fricative', true),
}

/** Vowel bases recognized by the tokenizer (diphthongs tokenize as vowel sequences). */
export const VOWELS = new Set([
  'i', 'ɪ', 'e', 'ɛ', 'æ', 'a', 'ɑ', 'ɒ', 'ɔ', 'o', 'ʊ', 'u',
  'ʌ', 'ə', 'ɚ', 'ɝ', 'ɜ', 'y', 'ø', 'œ', 'ɐ', 'ɨ', 'ʉ', 'ɯ', 'ɤ',
])

export const STRIDENTS = new Set(['f', 'v', 's', 'z', 'ʃ', 'ʒ', 'tʃ', 'dʒ'])

export function isConsonant(base: string): boolean {
  return base in CONSONANTS
}

export function isVowel(base: string): boolean {
  return VOWELS.has(base)
}

export function sonority(base: string): number | null {
  return CONSONANTS[base]?.sonority ?? null
}

/** Sonority distance of a 2-element onset cluster: son(C2) - son(C1). */
export function sonorityDistance(c1: string, c2: string): number | null {
  const s1 = sonority(c1)
  const s2 = sonority(c2)
  if (s1 == null || s2 == null) return null
  return s2 - s1
}

/** Voiced↔voiceless cognate pairs (for the voiced-obstruent implicational law). */
export const VOICING_COGNATES: Record<string, string> = {
  b: 'p', d: 't', g: 'k', v: 'f', ð: 'θ', z: 's', ʒ: 'ʃ', 'dʒ': 'tʃ',
}
