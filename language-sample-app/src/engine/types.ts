// Core engine types. Mirrors PhonBank's Target/Actual/alignment concepts (spec §9).

export type Place =
  | 'bilabial'
  | 'labiodental'
  | 'dental'
  | 'alveolar'
  | 'postalveolar'
  | 'palatal'
  | 'velar'
  | 'glottal'

export type Manner = 'stop' | 'affricate' | 'fricative' | 'nasal' | 'liquid' | 'glide'

export interface ConsonantInfo {
  place: Place
  manner: Manner
  voiced: boolean
  /** Gierut (1999) sonority index: vl stop 1, vd stop 2, vl fric 3, vd fric 4, nasal 5, liquid 6, glide 7 */
  sonority: number
}

export interface Phone {
  /** Base IPA symbol after normalization (affricates are single phones, e.g. "tʃ") */
  base: string
  /** Diacritics / modifiers attached to this phone (extIPA welcome — stored verbatim) */
  diacritics: string[]
  kind: 'consonant' | 'vowel' | 'unknown'
}

export type SegmentStatus = 'correct' | 'distortion' | 'substitution' | 'omission' | 'addition'

export interface AlignedSegment {
  status: SegmentStatus
  target?: Phone
  actual?: Phone
}

export interface ProbeItem {
  id: string
  word: string
  targetIpa: string
  /** Empty string = no response / unscorable */
  actualIpa: string
  notes?: string
}

export interface ItemResult {
  item: ProbeItem
  target: Phone[]
  actual: Phone[]
  alignment: AlignedSegment[]
}

export interface ClusterEntry {
  cluster: string
  count: number
  inInventory: boolean
  sonorityDistance: number | null // null for 3-element clusters
  isAdjunct: boolean
}

export interface MinimalPair {
  wordA: string
  formA: string
  wordB: string
  formB: string
  phoneA: string
  phoneB: string
}

export interface TraceLine {
  step: string
  rule: string
  detail: string
}

export interface TargetRecommendation {
  kind: '3-element-sCC' | '2-element-cluster' | 'singleton' | 'none'
  target: string | null
  alternates: string[]
  trace: TraceLine[]
}

export interface PccResult {
  totalConsonants: number
  correctStrict: number
  correctWithDistortions: number
  pcc: number // strict: distortions count as errors
  pccR: number // PCC-Revised: distortions count as correct
  severity: 'mild' | 'mild-moderate' | 'moderate-severe' | 'severe' | null
}

/** Stimulability: percent accuracy with support per phone; >=30 → stimulable (Glaspey & Stoel-Gammon) */
export type StimulabilityMap = Record<string, number | null>
