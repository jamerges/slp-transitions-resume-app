export interface UserGoals {
  targetRoles: string[];
  settings: string[];
  workPreferences: string[];
  topSkills: string;
  whyLeaving: string;
  years: string;
}

export interface PreviewInput {
  resumeText: string;
  jobTitle: string;
  jobDesc: string;
  goals: UserGoals;
}

export interface FullInput extends PreviewInput {
  writingSample?: string;
}

export interface ExploreInput {
  resumeText: string;
  goals: UserGoals;
  workPreferenceLabels: string[];
}

export function buildPreviewPrompt(input: PreviewInput): string {
  const { resumeText, jobTitle, jobDesc, goals } = input;
  return `Resume:
---
${resumeText}
---
Target role: ${jobTitle}
Job Description:
---
${jobDesc}
---
About: ${goals.years} exp, settings: ${goals.settings.join(", ")}, targets: ${goals.targetRoles.join(", ")}. Skills: ${goals.topSkills}. Why: ${goals.whyLeaving}

SCORING METHOD (do this first, internally):
1. Extract the 6-8 most important requirements from the job description (required skills, experience, credentials — weight must-haves over nice-to-haves).
2. For each, judge from the resume: "covered" (clear evidence), "partial" (adjacent/transferable evidence), or "missing" (no evidence).
3. matchScore = round(100 * (covered + 0.5*partial) / total requirements). matchLevel: 75+ = "Strong Match", 55-74 = "Good Match", below 55 = "Stretch — But Doable".

Return this exact JSON only:
{"matchScore":NUMBER,"matchLevel":"Strong Match|Good Match|Stretch — But Doable","snapshot":"2 sentences","requirementsCoverage":[{"requirement":"short requirement from the JD","status":"covered|partial|missing","evidence":"one short phrase: where the resume shows it, or what's absent"}],"translatedBullets":[{"original":"...","translated":"..."},{"original":"...","translated":"..."},{"original":"...","translated":"..."}],"quickWins":["action 1","action 2"],"fullVersionIncludes":["Every resume bullet rewritten","Tailored cover letter in your voice","Requirements gap plan with real action steps","Interview bridge statements","LinkedIn headline + About section","Companies that hire former SLPs"]}

Include all 6-8 requirements in requirementsCoverage, ordered most important first.`;
}

export function buildFullPrompt(input: FullInput): string {
  const { resumeText, jobTitle, jobDesc, goals, writingSample } = input;
  const voiceInstruction = writingSample
    ? `\n\nIMPORTANT: Match the tone and voice of this writing sample from the candidate. Notice their sentence length, word choice, level of formality, any phrases or rhythms they tend to use. The cover letter and elevator pitch should feel like THEM, not generic AI text:\n---WRITING SAMPLE---\n${writingSample.slice(0, 3000)}\n---END SAMPLE---\n`
    : "";

  return `Resume:
---
${resumeText}
---

Target role: ${jobTitle}

Job Description:
---
${jobDesc}
---

About: ${goals.years} years experience, settings: ${goals.settings.join(", ")}, targets: ${goals.targetRoles.join(", ")}. Skills: ${goals.topSkills}. Why transitioning: ${goals.whyLeaving}${voiceInstruction}

SCORING METHOD for requirementsCoverage (do this first, internally):
1. Extract the 6-8 most important requirements from the job description.
2. For each, judge from the resume: "covered" (clear evidence), "partial" (adjacent/transferable evidence), or "missing" (no evidence).
3. For partial/missing items, give one concrete way to close or reframe the gap.

Return ONLY this JSON structure with no preamble:

{
  "requirementsCoverage": [
    {"requirement": "short requirement from the JD", "status": "covered|partial|missing", "evidence": "where the resume shows it, or what's absent", "action": "for partial/missing: one concrete step to close or reframe it; empty string if covered"}
  ],
  "professionalSummary": "3-4 sentences, no clinical jargon, anchored in their actual numbers",
  "translatedBullets": [
    {"original": "their bullet", "translated": "rewritten in the job description's own vocabulary", "section": "Job Title or section"}
  ],
  "skillsSection": {
    "Category Name": ["skill1", "skill2"]
  },
  "gapAnalysis": [
    {"gap": "...", "actionSteps": ["..."], "timeframe": "2-4 weeks", "priority": "high|medium|low"}
  ],
  "proofArtifacts": [
    {"artifact": "specific thing to build/obtain for THIS target field (e.g., a case study, portfolio piece, cert)", "why": "what it proves to this hiring manager", "timeEstimate": "e.g., 2 weekends", "cost": "e.g., free, $175"}
  ],
  "coverLetter": "Full cover letter as single string with \\n line breaks. 3-4 paragraphs but vary the structure — no template skeleton. Must reference at least one specific from this JD and one real accomplishment with its number from the resume.",
  "talkingPoints": [
    {"question": "Likely interview Q for a career changer in this role", "bridgeStatement": "How to answer: positive clinical framing, growth ceiling, specific pull toward this role, one concrete accomplishment as proof"}
  ],
  "linkedinHeadline": "Optimized headline",
  "linkedinAbout": "LinkedIn About section, 3 short paragraphs, first person, written to be found by recruiters searching for this target role. \\n line breaks between paragraphs.",
  "elevatorPitch": "30-second pitch, pull-framed, no burnout language"
}

Provide all 6-8 requirementsCoverage items (most important first), 5-8 translatedBullets, 2-3 gapAnalysis items, 2-4 proofArtifacts matched to the target field's actual hiring bar (per your role knowledge — e.g., portfolio artifacts for design/research/ID roles, certs only where they genuinely signal), 3-4 talkingPoints. Valid JSON only.`;
}

export function buildExplorePrompt(input: ExploreInput): string {
  const { resumeText, goals, workPreferenceLabels } = input;
  return `An SLP wants to leave clinical work but isn't sure what direction to go. Help them explore.

Resume:
---
${resumeText}
---

Clinical settings: ${goals.settings.join(", ")}
Years of experience: ${goals.years}
Work aspects they enjoy: ${workPreferenceLabels.join(", ")}
Skills they want to highlight: ${goals.topSkills}
Why they want to transition: ${goals.whyLeaving}

Generate a personalized career exploration report. Return ONLY this JSON:
{
  "personalitySnapshot": "2-3 sentences capturing who they are professionally and what they're optimizing for",
  "topRoleMatches": [
    {"role": "Specific role title", "fit": "Why this fits their preferences and SLP background (2-3 sentences)", "matchScore": 85, "salaryRange": "$60k-$95k", "dayInLife": "1 sentence about what the day looks like", "transitionDifficulty": "Easy|Moderate|Stretch"}
  ],
  "transferableStrengths": [
    {"strength": "Strength name", "evidence": "Where in their resume this shows up", "sellsAs": "How to frame this in non-clinical interviews"}
  ],
  "exploratoryActions": [
    {"action": "Specific thing to do this week", "why": "What it teaches you", "timeNeeded": "30 mins"}
  ],
  "warningQuestions": [
    "Honest question they should ask themselves before pursuing this direction"
  ]
}

Provide 4-5 topRoleMatches with diverse difficulty levels, 4 transferableStrengths, 4 exploratoryActions, and 3 warningQuestions. Be specific and grounded in their actual resume content.

Ground topRoleMatches in your knowledge of where SLPs actually land (the tiers in your role knowledge): favor documented-success paths (project/program management, healthcare data analyst, customer success/implementation at health-tech and speech-tech companies, marketing/content, clinical liaison, utilization review, clinical educator at device companies, informatics) over aspirational ones. Use realistic salary ranges and transition timelines from real reports, and give honest transitionDifficulty ratings — if they'd love a saturated or long-runway field (UX research, software engineering, product management), include it but rate it honestly and say what it actually takes in the fit description.`;
}
