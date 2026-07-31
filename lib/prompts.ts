export interface UserGoals {
  targetRoles: string[];
  /** Optional — added after launch, so older stashed sessions may omit it. */
  targetIndustries?: string[];
  /** Deprecated in the intake form (inferred from the resume). Older sessions may still carry it. */
  settings?: string[];
  workPreferences: string[];
  topSkills: string;
  whyLeaving: string;
  /** Deprecated in the intake form (inferred from the resume). Older sessions may still carry it. */
  years?: string;
  /** Self-reported transition progress — grounds the stage diagnosis. */
  transitionStage?: string;
}

// Years of experience and clinical setting are both already in the resume, so we
// no longer ask for them. Only pass them through when an older session has them.
function aboutLine(goals: UserGoals): string {
  const bits: string[] = [];
  if (goals.years) bits.push(`${goals.years} experience`);
  if (goals.settings?.length) bits.push(`settings: ${goals.settings.join(", ")}`);
  if (goals.targetRoles.length) bits.push(`target functions: ${goals.targetRoles.join(", ")}`);
  if (goals.targetIndustries?.length) bits.push(`industries: ${goals.targetIndustries.join(", ")}`);
  if (goals.topSkills) bits.push(`skills they want highlighted: ${goals.topSkills}`);
  if (goals.whyLeaving) bits.push(`why transitioning: ${goals.whyLeaving}`);
  return bits.join(". ");
}

// The model has no idea what today's date is, so it computes "years of
// experience" from its training cutoff and systematically undercounts. Tell it.
const today = () =>
  new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

const INFER_NOTE = `Today is ${today()} — use this to compute durations; do not assume a different current year.
Infer their years of experience and clinical setting(s) directly from the resume — they were not asked, so never write a placeholder for them. Two rules when you do:
- ORGANISATION NAMES ARE NAMES, NOT DESCRIPTIONS. "STEM Preparatory Schools" is an employer's name; it does NOT mean they worked at "a STEM school". "Sunrise Senior Living" does not make them a sunrise expert. Describe the setting only from what the resume states about the work itself (grades served, population, care setting). If the setting isn't stated, say "school-based" / "medical" / "outpatient" at that level of generality, or leave it out.
- COUNT YEARS FROM THE ACTUAL DATES and round honestly (Aug 2018 → today is "nearly eight years", not "seven years"). If dates are missing or ambiguous, use a soft phrase like "several years" rather than inventing a number.`;

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
About: ${aboutLine(goals)}
${INFER_NOTE}

SCORING METHOD (do this first, internally):
1. Extract the 6-8 most important requirements from the job description (required skills, experience, credentials — weight must-haves over nice-to-haves).
2. For each, judge from the resume: "covered" (clear evidence), "partial" (adjacent/transferable evidence), or "missing" (no evidence).
3. matchScore = round(100 * (covered + 0.5*partial) / total requirements). matchLevel: 75+ = "Strong Match", 55-74 = "Good Match", below 55 = "Stretch — But Doable".

Return this exact JSON only:
{"matchScore":NUMBER,"matchLevel":"Strong Match|Good Match|Stretch — But Doable","snapshot":"2 sentences","requirementsCoverage":[{"requirement":"short requirement from the JD","status":"covered|partial|missing","evidence":"one short phrase: where the resume shows it, or what's absent"}],"translatedBullets":[{"original":"...","translated":"..."},{"original":"...","translated":"..."},{"original":"...","translated":"..."}],"quickWins":["action 1","action 2"],"fullVersionIncludes":["Every resume bullet rewritten","Tailored cover letter in your voice","Requirements gap plan with real action steps","Application screening-question answers","Interview bridge statements","LinkedIn headline + About section","Your 90-day transition plan","Editable Word doc downloads","Refine any section until it sounds like you"]}

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

About: ${aboutLine(goals)}
${INFER_NOTE}${voiceInstruction}

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
  "elevatorPitch": "30-second pitch, pull-framed, no burnout language",
  "ninetyDayPlan": [
    {"phase": "Weeks 1-2", "focus": "one-line theme", "actions": ["specific action with any real names/links relevant to THIS role and industry"]}
  ],
  "knockoutAnswers": [
    {"question": "an application-form screening question this specific job will likely ask (salary expectations, years of experience, required credential/degree, work authorization, willingness to X)", "strategy": "exactly how this candidate should answer it, given their real background — including what number/phrasing to use and why"}
  ]
}

Provide all 6-8 requirementsCoverage items (most important first), 5-8 translatedBullets, 2-3 gapAnalysis items, 2-4 proofArtifacts matched to the target field's actual hiring bar (per your role knowledge — e.g., portfolio artifacts for design/research/ID roles, certs only where they genuinely signal), 3-4 talkingPoints, 4 ninetyDayPlan phases (Weeks 1-2, Weeks 3-4, Month 2, Month 3 — each with 3-4 concrete actions that reference the proof artifacts and gap actions above, plus networking/referral steps since referrals decide most transitions), and 3-4 knockoutAnswers. Valid JSON only.`;
}

// The full package as two prompts run in PARALLEL — one generation of the whole
// thing takes ~140s of wall time; two halves run concurrently in ~half that.
// Their keys are disjoint, so the results merge with a spread.
export function buildFullPromptParts(input: FullInput): { materials: string; guidance: string } {
  const { resumeText, jobTitle, jobDesc, goals, writingSample } = input;
  const voiceInstruction = writingSample
    ? `\n\nIMPORTANT: Match the tone and voice of this writing sample from the candidate. Notice their sentence length, word choice, level of formality, any phrases or rhythms they tend to use. Written documents should feel like THEM, not generic AI text:\n---WRITING SAMPLE---\n${writingSample.slice(0, 3000)}\n---END SAMPLE---\n`
    : "";

  const context = `Resume:
---
${resumeText}
---

Target role: ${jobTitle}

Job Description:
---
${jobDesc}
---

About: ${aboutLine(goals)}
${INFER_NOTE}${voiceInstruction}`;

  const materials = `${context}

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
  "coverLetter": "Full cover letter as single string with \\n line breaks. 3-4 paragraphs but vary the structure — no template skeleton. Must reference at least one specific from this JD and one real accomplishment with its number from the resume."
}

Provide all 6-8 requirementsCoverage items (most important first) and 5-8 translatedBullets. Valid JSON only.`;

  const guidance = `${context}

Return ONLY this JSON structure with no preamble:

{
  "gapAnalysis": [
    {"gap": "...", "actionSteps": ["..."], "timeframe": "2-4 weeks", "priority": "high|medium|low"}
  ],
  "proofArtifacts": [
    {"artifact": "specific thing to build/obtain for THIS target field (e.g., a case study, portfolio piece, cert)", "why": "what it proves to this hiring manager", "timeEstimate": "e.g., 2 weekends", "cost": "e.g., free, $175"}
  ],
  "talkingPoints": [
    {"question": "Likely interview Q for a career changer in this role", "bridgeStatement": "How to answer: positive clinical framing, growth ceiling, specific pull toward this role, one concrete accomplishment as proof"}
  ],
  "linkedinHeadline": "Optimized headline",
  "linkedinAbout": "LinkedIn About section, 3 short paragraphs, first person, written to be found by recruiters searching for this target role. \\n line breaks between paragraphs.",
  "elevatorPitch": "30-second pitch, pull-framed, no burnout language",
  "ninetyDayPlan": [
    {"phase": "Weeks 1-2", "focus": "one-line theme", "actions": ["specific action with any real names/links relevant to THIS role and industry"]}
  ],
  "knockoutAnswers": [
    {"question": "an application-form screening question this specific job will likely ask (salary expectations, years of experience, required credential/degree, work authorization, willingness to X)", "strategy": "exactly how this candidate should answer it, given their real background — including what number/phrasing to use and why"}
  ]
}

Provide 2-3 gapAnalysis items, 2-4 proofArtifacts matched to the target field's actual hiring bar (per your role knowledge — e.g., portfolio artifacts for design/research/ID roles, certs only where they genuinely signal), 3-4 talkingPoints, 4 ninetyDayPlan phases (Weeks 1-2, Weeks 3-4, Month 2, Month 3 — each with 3-4 concrete actions), and 3-4 knockoutAnswers. Valid JSON only.

The ninetyDayPlan is an APPLICATION CAMPAIGN, not career exploration — this buyer has already chosen the target and has a live posting in hand. No "decide your direction" or "research whether this fits" steps. Cover: application volume and cadence for this role type (first-48-hours applications), weekly outreach targets at companies like this one, the proof artifacts and gap actions above scheduled into specific weeks, interview reps, and salary/negotiation prep in the final phase.`;

  return { materials, guidance };
}

// $9 Pivot Report — the deep, personal readout sold after the free explore.
export function buildReportPrompt(input: ExploreInput): string {
  const { resumeText, goals, workPreferenceLabels } = input;
  return `An SLP purchased a personalized Pivot Report to plan their move out of clinical work. This is a paid product — it must feel personal, specific, and worth real money. Ground every claim in their actual resume and answers; never generic filler.

Resume:
---
${resumeText}
---

${INFER_NOTE}${(goals.targetIndustries || []).length ? `\nIndustries they're drawn to: ${(goals.targetIndustries || []).join(", ")}` : ""}${goals.targetRoles.filter((r) => !r.startsWith("Not sure")).length ? `\nRoles they've considered: ${goals.targetRoles.join(", ")}` : ""}
Work aspects they enjoy: ${workPreferenceLabels.join(", ")}
Skills they want to highlight: ${goals.topSkills}
Why they want to transition: ${goals.whyLeaving}

TRANSITION READINESS PROFILES (assign exactly one, based on their inputs):
- "The Depleted Expert": running on empty, needs recovery-paced plan; strength is deep competence they can't currently see
- "The Quiet Researcher": has been reading/lurking for months, needs permission to act; strength is they already know more than they think
- "The Restless Builder": energy and ideas but scattered focus, needs one target; strength is momentum
- "The Ready Leaper": clear-eyed and prepared, needs tactics not therapy; strength is decisiveness

STAGE (do NOT guess — they told you): they reported "${goals.transitionStage || "not specified"}".
Map it exactly: "Just thinking about it"/"Reading and researching" → Ground. "Talked with people who've made the jump" → Explore. "Taken a course, built something, or tried a project" → Test. "Applying and/or interviewing now" → Leap. If not specified, say so plainly in the diagnosis and place them in Ground.
What each stage means: Ground = getting clear on direction and what you already have. Explore = researching real roles and talking to people in them. Test = running small experiments to build proof. Leap = applying, interviewing, negotiating.
The "diagnosis" field MUST open by naming the evidence — reference what they actually told you (e.g. "You've had conversations but haven't built anything to point at yet, which puts you at the end of Explore"). Never assert a stage without tying it to their own answer. If their resume or answers suggest they're further along than they reported, say that too.

Return ONLY this JSON:
{
  "headline": "One warm, specific sentence naming what you see in their situation — their years, their setting, their direction",
  "readinessProfile": {"profile": "one of the four names", "meaning": "2-3 sentences on what this profile means for THEM specifically", "watchOutFor": "the trap this profile falls into", "superpower": "the strength this profile underrates"},
  "phase": {"name": "Ground|Explore|Test|Leap", "basedOn": "one short clause naming the specific answer this is based on, e.g. 'you've had conversations but haven't tested a direction yet'", "diagnosis": "2 sentences opening with that evidence, then what it means for them", "focusNow": "the ONE thing to focus on in this stage", "notYet": "what to explicitly NOT worry about yet"},
  "topRoles": [
    {"role": "specific role title", "whyYou": "2-3 sentences tying THEIR resume specifics to this role", "salaryRange": "realistic range", "timeline": "realistic months range", "entryPath": "the realistic entry door (entry roles, certs that matter, certs that don't)", "firstMove": "one concrete action this week"}
  ],
  "thirtyDayPlan": [
    {"week": "Week 1", "theme": "short theme", "actions": ["2-3 concrete actions, sized for someone working full-time"]}
  ],
  "outreach": {
    "why": "1-2 sentences on why outreach beats applying cold, with the honest hit rate (roughly 1 in 4 strangers reply; that is normal, not rejection)",
    "whoToMessage": ["2-3 specific kinds of people THIS person should message, given their background — e.g. 'SLPs who now have your target title (search LinkedIn for \\"CCC-SLP\\" + the title)'"],
    "messages": [
      {"scenario": "e.g. Cold message to a stranger who made this exact move", "template": "A short, sendable LinkedIn message under 90 words, written in first person AS THIS PERSON with their real specifics filled in (their setting, their years, their target role). No [brackets] except where a name genuinely varies, like [Name]. It must sound like a human wrote it at their kitchen table, not a recruiter."}
    ],
    "followUp": "One sentence on when and how to follow up once, without being annoying"
  },
  "honestTruths": ["2-3 things a paid report owes them that free content sugarcoats — timelines, referral math, specific tradeoffs for THEIR situation"],
  "closing": "2-3 warm sentences. Permission-granting, not hype. Reference something specific from their story."
}

Provide exactly 3 topRoles (ordered by fit-times-realism, grounded in where SLPs actually land per your role knowledge — use real salary/timeline data), 4 thirtyDayPlan weeks, and exactly 3 outreach.messages covering: (1) a cold message to a stranger who made this move, (2) a message to a dormant contact/former colleague, and (3) a follow-up after a good conversation that asks for a referral without asking for a job. If their "why" mentions burnout or exhaustion, honor it in the diagnosis with compassion but keep all forward-looking language pull-framed. Valid JSON only.`;
}

export function buildExplorePrompt(input: ExploreInput): string {
  const { resumeText, goals, workPreferenceLabels } = input;
  return `An SLP wants to leave clinical work but isn't sure what direction to go. Help them explore.

Resume:
---
${resumeText}
---

${INFER_NOTE}${(goals.targetIndustries || []).length ? `\nIndustries they're drawn to: ${(goals.targetIndustries || []).join(", ")}` : ""}
Work aspects they enjoy: ${workPreferenceLabels.join(", ")}
Skills they want to highlight: ${goals.topSkills}
Why they want to transition: ${goals.whyLeaving}

Generate a personalized career exploration report. Return ONLY this JSON:
{
  "personalitySnapshot": "2 sentences capturing who they are professionally and what they're optimizing for",
  "topRoleMatches": [
    {"role": "Specific role title", "fit": "Why this fits their preferences and SLP background (2 sentences)", "matchScore": 85, "salaryRange": "$60k-$95k", "dayInLife": "1 short sentence", "transitionDifficulty": "Easy|Moderate|Stretch"}
  ],
  "transferableStrengths": [
    {"strength": "Strength name", "evidence": "Where in their resume this shows up (1 short sentence)", "sellsAs": "How to frame this in non-clinical interviews (1 short sentence)"}
  ],
  "exploratoryActions": [
    {"action": "Specific thing to do this week", "why": "What it teaches you (1 short sentence)", "timeNeeded": "30 mins"}
  ],
  "warningQuestions": [
    "Honest question they should ask themselves before pursuing this direction"
  ]
}

Provide exactly 4 topRoleMatches with diverse difficulty levels, 3 transferableStrengths, 3 exploratoryActions, and 2 warningQuestions. Be specific and grounded in their actual resume content, but keep every field tight — this is a free overview, not the full report. Brevity is required.

Ground topRoleMatches in your knowledge of where SLPs actually land (the tiers in your role knowledge): favor documented-success paths (project/program management, healthcare data analyst, customer success/implementation at health-tech and speech-tech companies, marketing/content, clinical liaison, utilization review, clinical educator at device companies, informatics) over aspirational ones. Use realistic salary ranges and transition timelines from real reports, and give honest transitionDifficulty ratings — if they'd love a saturated or long-runway field (UX research, software engineering, product management), include it but rate it honestly and say what it actually takes in the fit description.`;
}
