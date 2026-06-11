import type { ClusterEntry, MinimalPair, Phone } from './types'
import { isConsonant, sonorityDistance } from './phones'
import { phoneToString, phonesToString } from './tokenize'

// Inventories are built from ACTUAL productions (independent analysis):
// a substitution still proves the phone is producible (spec §6.1).

export interface ProductionForm {
  word: string
  phones: Phone[]
}

/** Phonetic inventory: consonant bases produced >= minCount times (default 2). */
export function phoneticInventory(forms: ProductionForm[], minCount = 2): Map<string, number> {
  const counts = new Map<string, number>()
  for (const form of forms) {
    for (const p of form.phones) {
      if (p.kind === 'consonant') counts.set(p.base, (counts.get(p.base) ?? 0) + 1)
    }
  }
  const inv = new Map<string, number>()
  for (const [phone, count] of counts) {
    if (count >= minCount) inv.set(phone, count)
  }
  return inv
}

/** All consonant production counts (including singletons below threshold), for display. */
export function consonantCounts(forms: ProductionForm[]): Map<string, number> {
  return phoneticInventory(forms, 1)
}

/**
 * Phonemic inventory: phones used contrastively — appearing in >= 2 minimal pairs
 * among the child's actual productions. Implements the *intent* of the Phonemic
 * Inventory Worksheet directly over aligned data (exact minimal-pair search),
 * rather than mimicking the manual monosyllable/vowel-grouping shortcut.
 */
export function phonemicInventory(forms: ProductionForm[]): {
  inventory: Set<string>
  pairs: MinimalPair[]
  pairCounts: Map<string, number>
} {
  // Dedupe identical (word, form) productions; a word repeated isn't a pair with itself
  const unique: ProductionForm[] = []
  const seen = new Set<string>()
  for (const f of forms) {
    const key = f.word.toLowerCase() + '|' + phonesToString(f.phones)
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(f)
    }
  }

  const pairs: MinimalPair[] = []
  for (let a = 0; a < unique.length; a++) {
    for (let b = a + 1; b < unique.length; b++) {
      const fa = unique[a]
      const fb = unique[b]
      if (fa.word.toLowerCase() === fb.word.toLowerCase()) continue
      if (fa.phones.length !== fb.phones.length) continue
      let diffIdx = -1
      let diffs = 0
      for (let k = 0; k < fa.phones.length; k++) {
        if (fa.phones[k].base !== fb.phones[k].base) {
          diffs++
          diffIdx = k
          if (diffs > 1) break
        }
      }
      if (diffs !== 1) continue
      const pa = fa.phones[diffIdx]
      const pb = fb.phones[diffIdx]
      // Only consonant contrasts feed the consonant phonemic inventory
      if (!isConsonant(pa.base) || !isConsonant(pb.base)) continue
      pairs.push({
        wordA: fa.word,
        formA: phonesToString(fa.phones),
        wordB: fb.word,
        formB: phonesToString(fb.phones),
        phoneA: pa.base,
        phoneB: pb.base,
      })
    }
  }

  const pairCounts = new Map<string, number>()
  for (const p of pairs) {
    pairCounts.set(p.phoneA, (pairCounts.get(p.phoneA) ?? 0) + 1)
    pairCounts.set(p.phoneB, (pairCounts.get(p.phoneB) ?? 0) + 1)
  }

  const inventory = new Set<string>()
  for (const [phone, count] of pairCounts) {
    if (count >= 2) inventory.add(phone)
  }
  return { inventory, pairs, pairCounts }
}

export const ADJUNCT_CLUSTERS = new Set(['sp', 'st', 'sk'])

/** Word-initial cluster inventory from actual productions, organized by sonority distance. */
export function clusterInventory(forms: ProductionForm[], minCount = 2): ClusterEntry[] {
  const counts = new Map<string, number>()
  for (const form of forms) {
    const onset: string[] = []
    for (const p of form.phones) {
      if (p.kind === 'consonant') onset.push(p.base)
      else break
    }
    if (onset.length >= 2) {
      const cluster = onset.join('')
      counts.set(cluster, (counts.get(cluster) ?? 0) + 1)
    }
  }

  const entries: ClusterEntry[] = []
  for (const [cluster, count] of counts) {
    const members = splitCluster(cluster)
    entries.push({
      cluster,
      count,
      inInventory: count >= minCount,
      sonorityDistance: members.length === 2 ? sonorityDistance(members[0], members[1]) : null,
      isAdjunct: ADJUNCT_CLUSTERS.has(cluster),
    })
  }
  entries.sort((x, y) => (x.sonorityDistance ?? 99) - (y.sonorityDistance ?? 99))
  return entries
}

/** Split a cluster string into member phones (handles tʃ/dʒ digraph bases). */
export function splitCluster(cluster: string): string[] {
  const members: string[] = []
  let i = 0
  while (i < cluster.length) {
    const two = cluster.slice(i, i + 2)
    if (two === 'tʃ' || two === 'dʒ') {
      members.push(two)
      i += 2
    } else {
      members.push(cluster[i])
      i += 1
    }
  }
  return members
}

/** OUT phones: language's consonant set minus the phonetic inventory. */
export function outPhones(languageConsonants: string[], phonetic: Map<string, number>): string[] {
  return languageConsonants.filter((c) => !phonetic.has(c))
}
