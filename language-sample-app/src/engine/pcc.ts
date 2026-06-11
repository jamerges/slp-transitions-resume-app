import type { AlignedSegment, PccResult } from './types'

// PCC (Shriberg & Kwiatkowski): correct consonants / total target consonants.
// Strict PCC counts distortions as errors; PCC-R counts them correct.
// Severity bands (Shriberg): >=85 mild, 65-85 mild-moderate, 50-65 moderate-severe, <50 severe.

export function computePcc(alignments: AlignedSegment[][]): PccResult {
  let total = 0
  let correctStrict = 0
  let correctWithDistortions = 0

  for (const alignment of alignments) {
    for (const seg of alignment) {
      if (!seg.target || seg.target.kind !== 'consonant') continue
      total++
      if (seg.status === 'correct') {
        correctStrict++
        correctWithDistortions++
      } else if (seg.status === 'distortion') {
        correctWithDistortions++
      }
    }
  }

  const pcc = total === 0 ? 0 : (correctStrict / total) * 100
  const pccR = total === 0 ? 0 : (correctWithDistortions / total) * 100

  return {
    totalConsonants: total,
    correctStrict,
    correctWithDistortions,
    pcc,
    pccR,
    severity: total === 0 ? null : severityBand(pcc),
  }
}

function severityBand(pcc: number): PccResult['severity'] {
  if (pcc >= 85) return 'mild'
  if (pcc >= 65) return 'mild-moderate'
  if (pcc >= 50) return 'moderate-severe'
  return 'severe'
}
