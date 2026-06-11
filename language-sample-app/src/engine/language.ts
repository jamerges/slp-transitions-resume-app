// Language parameterization (spec §6.3 bilingual note): the engine consults
// these tables instead of hardcoding English.

export interface LanguageConfig {
  id: 'en' | 'es'
  name: string
  /** Consonants expected in the language (defines the OUT set) */
  consonants: string[]
  /** Early-acquired sounds removed at singleton Step 3(b) */
  earlyAcquired: string[]
  /** Consonant frequency, most → least frequent (Step 3(d) tie-break) */
  frequencyOrder: string[]
  /** 2-element onset cluster target pool, with sonority distance */
  clusterPool: { cluster: string; sd: number }[]
  /** 3-element /s/CC clusters: C2 and C3 requirements (Step 1) */
  threeElementClusters: { cluster: string; c2: string; c3: string }[]
}

export const ENGLISH: LanguageConfig = {
  id: 'en',
  name: 'English',
  consonants: [
    'p', 'b', 't', 'd', 'k', 'g', 'm', 'n', 'ŋ',
    'f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ', 'h',
    'tʃ', 'dʒ', 'l', 'r', 'w', 'j',
  ],
  earlyAcquired: ['p', 'b', 't', 'd', 'k', 'g', 'f', 'v', 'm', 'n', 'ŋ', 'w', 'j', 'h'],
  frequencyOrder: [
    't', 'n', 'r', 'l', 's', 'd', 'z', 'm', 'ð', 'k', 'w', 'b', 'h',
    'v', 'f', 'p', 'ŋ', 'j', 'g', 'θ', 'ʃ', 'dʒ', 'tʃ', 'ʒ',
  ],
  // Gierut sonority scale: vl stop 1, vd stop 2, vl fric 3, vd fric 4, nasal 5, liquid 6, glide 7
  clusterPool: [
    { cluster: 'sm', sd: 2 },
    { cluster: 'sn', sd: 2 },
    { cluster: 'sl', sd: 3 },
    { cluster: 'fl', sd: 3 },
    { cluster: 'fr', sd: 3 },
    { cluster: 'θr', sd: 3 },
    { cluster: 'ʃr', sd: 3 },
    { cluster: 'sw', sd: 4 },
    { cluster: 'bl', sd: 4 },
    { cluster: 'br', sd: 4 },
    { cluster: 'dr', sd: 4 },
    { cluster: 'gl', sd: 4 },
    { cluster: 'gr', sd: 4 },
    { cluster: 'pl', sd: 5 },
    { cluster: 'pr', sd: 5 },
    { cluster: 'tr', sd: 5 },
    { cluster: 'kl', sd: 5 },
    { cluster: 'kr', sd: 5 },
    { cluster: 'tw', sd: 6 },
    { cluster: 'kw', sd: 6 },
  ],
  threeElementClusters: [
    { cluster: 'spl', c2: 'p', c3: 'l' },
    { cluster: 'spr', c2: 'p', c3: 'r' },
    { cluster: 'str', c2: 't', c3: 'r' },
    { cluster: 'skr', c2: 'k', c3: 'r' },
    { cluster: 'skw', c2: 'k', c3: 'w' },
  ],
}

// Spanish parameterization per the San Diego USD Spanish worksheet
// (early-acquired set and frequency order from spec §6.3 bilingual note).
// Cluster pool: C+liquid clusters only; C+glide sequences pattern differently.
export const SPANISH: LanguageConfig = {
  id: 'es',
  name: 'Spanish',
  consonants: [
    'p', 'b', 't', 'd', 'k', 'g', 'm', 'n', 'ɲ',
    'f', 's', 'x', 'tʃ', 'l', 'r', 'ɾ', 'j', 'w',
  ],
  earlyAcquired: ['p', 't', 'k', 'm', 'n', 'ɲ', 'l', 'j', 'x'],
  // Approximate Spanish consonant frequency (verify against worksheet before clinical use)
  frequencyOrder: [
    's', 'n', 'r', 'd', 't', 'k', 'l', 'm', 'p', 'b', 'ɾ',
    'g', 'f', 'x', 'tʃ', 'ɲ', 'j', 'w',
  ],
  clusterPool: [
    { cluster: 'fl', sd: 3 },
    { cluster: 'fɾ', sd: 3 },
    { cluster: 'bl', sd: 4 },
    { cluster: 'bɾ', sd: 4 },
    { cluster: 'dɾ', sd: 4 },
    { cluster: 'gl', sd: 4 },
    { cluster: 'gɾ', sd: 4 },
    { cluster: 'pl', sd: 5 },
    { cluster: 'pɾ', sd: 5 },
    { cluster: 'tɾ', sd: 5 },
    { cluster: 'kl', sd: 5 },
    { cluster: 'kɾ', sd: 5 },
  ],
  threeElementClusters: [], // Spanish has no /s/CC onsets
}

export const LANGUAGES: Record<string, LanguageConfig> = { en: ENGLISH, es: SPANISH }
