import type { Phone } from './types'
import { isConsonant, isVowel } from './phones'

// IPA tokenizer: splits a transcription string into Phone objects.
// - Affricates tʃ / dʒ (with or without tie bar, or as ligatures ʧ ʤ) become one phone.
// - Diacritics and modifier letters attach to the preceding base phone (extIPA passes through).
// - Slashes/brackets/whitespace/stress marks are ignored.

const NORMALIZE: Record<string, string> = {
  'ʧ': 'tʃ',
  'ʤ': 'dʒ',
  'ɡ': 'g', // U+0261 → ascii g
  'ɹ': 'r',
  'ʀ': 'r',
  'ɫ': 'l̴', // dark l → l + velarized diacritic
  'ɱ': 'm̺',
  'ǝ': 'ə',
}

const IGNORED = new Set(['/', '[', ']', '(', ')', ' ', '\t', 'ˈ', 'ˌ', '.', ',', "'"])

// Modifier letters / spacing diacritics that attach to the previous phone
const SPACING_DIACRITICS = new Set([
  'ʰ', 'ʷ', 'ʲ', 'ˠ', 'ˤ', 'ⁿ', 'ˡ', '˞', 'ː', 'ˑ', '˺', 'ʼ', '˞',
])

function isCombining(ch: string): boolean {
  const code = ch.codePointAt(0)!
  return (
    (code >= 0x0300 && code <= 0x036f) || // combining diacritics
    (code >= 0x1dc0 && code <= 0x1dff) ||
    (code >= 0x20d0 && code <= 0x20ff) ||
    code === 0x0361 || // tie bar (covered above, listed for clarity)
    SPACING_DIACRITICS.has(ch)
  )
}

export function tokenizeIpa(input: string): Phone[] {
  // Apply single-char normalizations (may expand to base+diacritic)
  let s = ''
  for (const ch of input.normalize('NFD')) {
    s += NORMALIZE[ch] ?? ch
  }

  const phones: Phone[] = []
  const chars = Array.from(s)
  let i = 0
  let pendingTie = false

  while (i < chars.length) {
    const ch = chars[i]

    if (IGNORED.has(ch)) {
      i++
      continue
    }

    if (ch === '͡' || ch === '͜') {
      // tie bar: join next base into current phone (affricate)
      pendingTie = true
      i++
      continue
    }

    if (isCombining(ch)) {
      if (phones.length > 0) phones[phones.length - 1].diacritics.push(ch)
      i++
      continue
    }

    // Affricate digraphs: t+ʃ, d+ʒ (tie bar between them may have set pendingTie,
    // but we also merge bare sequences — clinically these are affricates)
    if (pendingTie && phones.length > 0) {
      const prev = phones[phones.length - 1]
      const joined = prev.base + ch
      prev.base = joined
      prev.kind = isConsonant(joined) ? 'consonant' : isVowel(joined) ? 'vowel' : 'unknown'
      pendingTie = false
      i++
      continue
    }

    if ((ch === 'ʃ' || ch === 'ʒ') && phones.length > 0) {
      const prev = phones[phones.length - 1]
      if (
        prev.diacritics.length === 0 &&
        ((ch === 'ʃ' && prev.base === 't') || (ch === 'ʒ' && prev.base === 'd'))
      ) {
        prev.base = prev.base + ch
        i++
        continue
      }
    }

    phones.push({
      base: ch,
      diacritics: [],
      kind: isConsonant(ch) ? 'consonant' : isVowel(ch) ? 'vowel' : 'unknown',
    })
    i++
  }

  return phones
}

export function phoneToString(p: Phone): string {
  return p.base + p.diacritics.join('')
}

export function phonesToString(ps: Phone[]): string {
  return ps.map(phoneToString).join('')
}
