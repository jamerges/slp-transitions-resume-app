import type { AlignedSegment, Phone } from './types'
import { CONSONANTS } from './phones'

// Target↔actual alignment: Needleman-Wunsch over phone sequences with
// articulatory-feature substitution costs (the Phon approach). This is the
// *symbolic* alignment that drives error classification — distinct from
// acoustic forced alignment (Phase 1, timing display only).

const GAP_COST = 1.0
const VC_MISMATCH_COST = 2.5 // vowel↔consonant: prefer omission+addition over substitution

function substitutionCost(a: Phone, b: Phone): number {
  if (a.base === b.base) return 0
  if (a.kind !== b.kind) return VC_MISMATCH_COST
  if (a.kind === 'vowel') return 0.6 // vowel-vowel substitutions are cheap to align
  const ca = CONSONANTS[a.base]
  const cb = CONSONANTS[b.base]
  if (!ca || !cb) return 1.0
  let cost = 0.1 // floor so identical-feature distinct symbols still cost something
  if (ca.place !== cb.place) cost += 0.4
  if (ca.manner !== cb.manner) cost += 0.5
  if (ca.voiced !== cb.voiced) cost += 0.2
  return cost
}

export function alignPhones(target: Phone[], actual: Phone[]): AlignedSegment[] {
  const n = target.length
  const m = actual.length
  // dp[i][j] = min cost aligning target[0..i) with actual[0..j)
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  const back: ('diag' | 'up' | 'left')[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill('diag'),
  )

  for (let i = 1; i <= n; i++) {
    dp[i][0] = i * GAP_COST
    back[i][0] = 'up'
  }
  for (let j = 1; j <= m; j++) {
    dp[0][j] = j * GAP_COST
    back[0][j] = 'left'
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const diag = dp[i - 1][j - 1] + substitutionCost(target[i - 1], actual[j - 1])
      const up = dp[i - 1][j] + GAP_COST // omission of target[i-1]
      const left = dp[i][j - 1] + GAP_COST // addition of actual[j-1]
      const best = Math.min(diag, up, left)
      dp[i][j] = best
      back[i][j] = best === diag ? 'diag' : best === up ? 'up' : 'left'
    }
  }

  // Backtrack
  const ops: AlignedSegment[] = []
  let i = n
  let j = m
  while (i > 0 || j > 0) {
    const dir = back[i][j]
    if (i > 0 && j > 0 && dir === 'diag') {
      ops.push(classify(target[i - 1], actual[j - 1]))
      i--
      j--
    } else if (i > 0 && (dir === 'up' || j === 0)) {
      ops.push({ status: 'omission', target: target[i - 1] })
      i--
    } else {
      ops.push({ status: 'addition', actual: actual[j - 1] })
      j--
    }
  }
  ops.reverse()
  return ops
}

function classify(target: Phone, actual: Phone): AlignedSegment {
  if (target.base === actual.base) {
    const sameDiacritics =
      target.diacritics.length === actual.diacritics.length &&
      target.diacritics.every((d, k) => actual.diacritics[k] === d)
    // Same base, different diacritics = distortion (the clinician marks these;
    // automated recognizers won't emit them — spec review note #2)
    return { status: sameDiacritics ? 'correct' : 'distortion', target, actual }
  }
  return { status: 'substitution', target, actual }
}
