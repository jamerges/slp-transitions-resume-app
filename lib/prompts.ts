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

Return this exact JSON only:
{"matchScore":NUMBER,"matchLevel":"Strong Match|Good Match|Stretch — But Doable","snapshot":"2 sentences","translatedBullets":[{"original":"...","translated":"..."},{"original":"...","translated":"..."},{"original":"...","translated":"..."}],"quickWins":["action 1","action 2"],"fullVersionIncludes":["Complete resume rewrite","Tailored cover letter","Gap analysis","Interview prep","LinkedIn headline","Company suggestions"]}`;
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

Return ONLY this JSON structure with no preamble:

{
  "professionalSummary": "3-4 sentences, no clinical jargon",
  "translatedBullets": [
    {"original": "their bullet", "translated": "rewritten in market language", "section": "Job Title or section"}
  ],
  "skillsSection": {
    "Category Name": ["skill1", "skill2"]
  },
  "gapAnalysis": [
    {"gap": "...", "actionSteps": ["..."], "timeframe": "2-4 weeks", "priority": "high|medium|low"}
  ],
  "coverLetter": "Full cover letter as single string with \\n line breaks, 3-4 paragraphs",
  "talkingPoints": [
    {"question": "Likely interview Q", "bridgeStatement": "How to answer using SLP experience"}
  ],
  "linkedinHeadline": "Optimized headline",
  "elevatorPitch": "30-second pitch"
}

Provide 5-8 translatedBullets, 2-3 gapAnalysis items, 3-4 talkingPoints. Valid JSON only.`;
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

Provide 4-5 topRoleMatches with diverse difficulty levels, 4 transferableStrengths, 4 exploratoryActions, and 3 warningQuestions. Be specific and grounded in their actual resume content.`;
}
