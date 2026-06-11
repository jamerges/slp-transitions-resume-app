# Phonology Probe — Screening Workbench (Phase 0)

The first buildable slice of the **Language Sample App** spec: the deterministic phonology
engine and clinician workflow, with **manual IPA entry instead of ML transcription**. The
clinician types (or in Phase 1, corrects) the actual production; everything downstream is
the spec's "crown jewel" rules engine. All data stays in the browser (localStorage) — no
backend, no PHI transmission, which makes Phase 0 HIPAA-trivial.

## Run it

```bash
npm install
npm run dev    # web app
npm test       # 38 engine tests, incl. an end-to-end worked example
npm run build  # type-check + production build
```

Click **Load demo case** for a simulated 4;6 child with velar fronting, stopping, gliding,
and cluster reduction.

## What's implemented (spec § mapping)

| Spec | Module | Notes |
|---|---|---|
| §4.2 alignment | `src/engine/align.ts` | Needleman-Wunsch over phone strings with articulatory-feature substitution costs (the Phon approach). Symbolic alignment — distinct from acoustic forced alignment, which is Phase 1 and timing-display only. |
| §6.1 phonetic inventory | `src/engine/inventory.ts` | ≥2 productions of the phone, from **actual** forms (a substitution still proves producibility). |
| §6.1 phonemic inventory | `src/engine/inventory.ts` | Exact minimal-pair search over actual productions, ≥2 pairs per phone. Implements the *intent* of the worksheet heuristic (which is a shortcut for humans without aligned data). |
| §6.1 cluster inventory | `src/engine/inventory.ts` | Word-initial clusters by sonority distance. Gierut (1999) scale: vl stop 1 / vd stop 2 / vl fric 3 / vd fric 4 / nasal 5 / liquid 6 / glide 7 → /sp st sk/ adjuncts = SD −2. |
| §6.1 stimulability | UI tab + `targets.ts` | Manual entry of % accuracy with support; ≥30% = stimulable. |
| §6.2 implicational laws | `src/engine/targets.ts` (`implicationalGain`) | Encoded as transitive class implications; used to score Step 3 candidates by predicted system-wide change. |
| §6.3 target selection | `src/engine/targets.ts` | Steps 1→2→3 ported directly, language-parameterized, every decision emitted as a `TraceLine` (the audit trail is also the CDS-exemption regulatory posture). |
| §6.4 PCC + severity | `src/engine/pcc.ts` | Strict PCC and PCC-R, Shriberg severity bands. |
| §6.4 screening flags | `src/engine/analyze.ts` | Lateral lisp (any age), frontal lisp (age-gated ≥7;0), vowel-error rate and repeated-word inconsistency (CAS hallmarks). Candidates for clinician confirmation, never diagnoses. |
| §6.3 bilingual note | `src/engine/language.ts` | `LanguageConfig` parameterizes consonant set, early-acquired set, frequency order, cluster pools. English complete; Spanish stubbed (see caveats). |

## Engine decisions worth knowing

- **Step 2b** (SD cut): adjuncts /sp st sk/ and C+/j/ are excluded when computing the
  child's minimum IN-cluster SD — they pattern differently.
- **Step 2d** (/sw sl sm sn/): kept only if the child produces one as a true cluster;
  otherwise "if unclear, cut" per the worksheet.
- **Step 3a**: untested stimulability is treated as nonstimulable (conservative — keeps the
  sound eligible as a target); the UI surfaces which sounds are untested.
- **Distortions** are detected as base-match-with-diacritic-mismatch. They count as errors
  in strict PCC, correct in PCC-R. Phase 1 recognizers won't emit diacritics — distortion
  marking stays clinician-driven.

## Caveats / TODO before clinical use

- **Validate against the actual San Diego USD worksheet worked examples.** The tests pin
  the algorithm as specced; the uploads' worked cases should be added as fixtures
  (`targets.test.ts`) and any discrepancies resolved.
- Spanish frequency order and cluster pool are approximations — verify against the Spanish
  worksheet before enabling for real clients.
- Phonemic-inventory minimal pairs require equal-length forms differing in exactly one
  segment; near-pairs (one-segment + length difference) are not counted.
- No persistence beyond localStorage, no multi-client caseload, no auth — Phase 0 is a
  single-session workbench.

## Phase 1 seam

`analyze()` takes `ProbeItem[]` with `actualIpa` strings. The phone recognizer drops in by
pre-filling `actualIpa` (plus per-segment confidence for review routing); nothing else
changes. The review UI (probe table + alignment chips + IPA palette) is the correction
surface the spec mandates.
