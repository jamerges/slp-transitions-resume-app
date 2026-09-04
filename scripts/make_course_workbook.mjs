// Transition OS companion workbook, Modules 0 and 1. US Letter, fillable in
// Word: every prompt is followed by an empty box the reader types or writes
// into. Run: node scripts/make_course_workbook.mjs
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, HeightRule, PageBreak, Footer, Header, PageNumber,
  LevelFormat, TabStopType,
} from "docx";
import { writeFileSync } from "node:fs";

const F = "Calibri", SERIF = "Georgia";
const GREEN = "2D6A4F", DARK = "1B1B1E", MUTED = "6B7280", LINE = "D1D5DB", SOFT = "F0FAF3", CREAM = "FAFAF9", AMBER = "FEF3C7";
const W = 9360; // 6.5in text width in DXA

const run = (text, o = {}) => new TextRun({ text, font: o.serif ? SERIF : F, size: o.size ?? 22, bold: o.bold, italics: o.italics, color: o.color ?? DARK });
const p = (text, o = {}) => new Paragraph({ spacing: { after: o.after ?? 120, before: o.before ?? 0 }, alignment: o.align, children: Array.isArray(text) ? text : [run(text, o)] });
const muted = (t, o = {}) => p(t, { color: MUTED, size: 20, ...o });
const kicker = (t) => new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: t.toUpperCase(), font: F, size: 17, bold: true, color: GREEN, characterSpacing: 30 })] });
const h1 = (t, sub) => [
  new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 0, after: sub ? 60 : 240 }, children: [new TextRun({ text: t, font: SERIF, size: 40, bold: true, color: DARK })] }),
  ...(sub ? [p(sub, { color: MUTED, size: 22, after: 320 })] : []),
];
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 360, after: 140 }, children: [new TextRun({ text: t, font: F, size: 24, bold: true, color: DARK })] });
const rule = () => new Paragraph({ spacing: { after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GREEN, space: 1 } }, children: [run(" ")] });
const bullets = (items) => items.map((t) => new Paragraph({ numbering: { reference: "dots", level: 0 }, spacing: { after: 60 }, children: [run(t)] }));

const cellBorders = { top: { style: BorderStyle.SINGLE, size: 6, color: LINE }, bottom: { style: BorderStyle.SINGLE, size: 6, color: LINE }, left: { style: BorderStyle.SINGLE, size: 6, color: LINE }, right: { style: BorderStyle.SINGLE, size: 6, color: LINE } };

/** A prompt with an empty box under it. `lines` sets the box height (in text lines). */
const gap = (h = 200) => new Paragraph({ spacing: { before: 0, after: h, line: 120 }, children: [new TextRun({ text: "", font: F, size: 8 })] });
const ask = (prompt, lines = 4, hint) => [
  new Paragraph({ spacing: { before: 280, after: 80 }, children: [run(prompt, { bold: true, size: 22 })] }),
  ...(hint ? [muted(hint, { after: 100 })] : []),
  new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W], rows: [new TableRow({ height: { value: 300 * lines + 160, rule: HeightRule.ATLEAST }, children: [new TableCell({ width: { size: W, type: WidthType.DXA }, borders: cellBorders, shading: { type: ShadingType.CLEAR, fill: "FFFFFF", color: "auto" }, margins: { top: 140, bottom: 140, left: 160, right: 160 }, children: [p(" ", { size: 22 })] })] })] }),
  gap(),
];
/** Two-column fill table: label | answer box. */
const fieldsTable = (rows) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [3600, 5760], rows: rows.map(([label, hint]) => new TableRow({ height: { value: 640, rule: HeightRule.ATLEAST }, children: [
  new TableCell({ width: { size: 3600, type: WidthType.DXA }, borders: cellBorders, shading: { type: ShadingType.CLEAR, fill: SOFT, color: "auto" }, margins: { top: 120, bottom: 120, left: 160, right: 160 }, children: [p(label, { bold: true, size: 21 }), ...(hint ? [muted(hint, { after: 0, size: 18 })] : [])] }),
  new TableCell({ width: { size: 5760, type: WidthType.DXA }, borders: cellBorders, shading: { type: ShadingType.CLEAR, fill: "FFFFFF", color: "auto" }, margins: { top: 120, bottom: 120, left: 160, right: 160 }, children: [p(" ")] }),
] })) });
const fields = (rows) => [fieldsTable(rows), gap()];
/** Tick list: checkbox glyph + label, one row each. */
const ticks = (items) => [...items.map((t) => new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "☐  ", font: "Segoe UI Symbol", size: 24, color: GREEN }), run(t)] })), gap(120)];
/** Shaded callout: a real quote from the forums, or a note. */
const calloutTable = (text, from, fill = SOFT) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W], rows: [new TableRow({ children: [new TableCell({ width: { size: W, type: WidthType.DXA }, borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, left: { style: BorderStyle.SINGLE, size: 24, color: GREEN } }, shading: { type: ShadingType.CLEAR, fill, color: "auto" }, margins: { top: 120, bottom: 120, left: 200, right: 200 }, children: [p([run(`“${text}”`, { italics: true, size: 22 }), ...(from ? [run(`   ${from}`, { size: 18, color: MUTED })] : [])], { after: 0 })] })] })] });
const callout = (text, from, fill = SOFT) => [gap(120), calloutTable(text, from, fill), gap()];
const spacer = (h = 120) => new Paragraph({ spacing: { after: h }, children: [run(" ")] });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });
/** Five labelled tick boxes in a row. Tick one on screen (type an X) or on paper. */
const scale = (label, options) => {
  const cw = Math.floor(W / 5);
  return [
    p(label, { bold: true, size: 22, before: 240, after: 80 }),
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [cw, cw, cw, cw, W - cw * 4], rows: [new TableRow({ height: { value: 900, rule: HeightRule.ATLEAST }, children: options.map((o, i) => new TableCell({ width: { size: i === 4 ? W - cw * 4 : cw, type: WidthType.DXA }, borders: cellBorders, shading: { type: ShadingType.CLEAR, fill: i === 0 || i === 4 ? SOFT : "FFFFFF", color: "auto" }, margins: { top: 110, bottom: 110, left: 100, right: 100 }, verticalAlign: "center", children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "☐", font: "Segoe UI Symbol", size: 30, color: GREEN })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [run(o, { size: 18, color: i === 0 || i === 4 ? DARK : MUTED })] }),
    ] })) })] }),
    gap(),
  ];
};

const children = [];
// ------------------------------------------------------------------ cover
children.push(
  spacer(1800),
  kicker("Transition OS · companion workbook"),
  new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "The workbook.", font: SERIF, size: 66, bold: true, color: DARK })] }),
  new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: "Ninety days of the thinking that does not fit in a text box. One page per lesson that is worth writing by hand.", font: SERIF, size: 28, color: MUTED })] }),
  rule(),
  p("Six modules. About four hours of writing, spread over three months. Nobody reads this but you.", { color: MUTED, size: 22 }),
  spacer(1400),
  p("Name", { bold: true, size: 20, after: 40 }), p("________________________________________", { color: LINE }),
  p("Started on", { bold: true, size: 20, after: 40, before: 120 }), p("________________________________________", { color: LINE }),
  pageBreak(),
);
// --------------------------------------------------------- how to use it
children.push(
  ...h1("How to use this", "Three rules, and one from me."),
  ...bullets([
    "Do the lesson on screen first, then the page here. The screen version has the calculators and the animations; this is where you say what you actually think.",
    "Write badly. Fragments, half-sentences, a list. The box is for thinking, not for prose. If you find yourself drafting, you've switched into work mode, and this isn't work.",
    "Come back. Every page has a date line. The answers change, and the difference between the first and the third pass is the useful part.",
  ]),
  spacer(),
  p("And mine: I filled in a version of these pages in 2019 with a pen, in a car, before a shift. Most of what I wrote was wrong, and it still got me out. Wrong answers you've written down are worth more than right answers you're still thinking about.", { italics: true }),
  spacer(200),
  kicker("What's in here"),
  ...fields([["Modules 0 and 1", "Ground: permission, the decision, the dials"], ["Module 2", "Explore: the paths, and three messages sent"], ["Module 3", "Translate: your words into theirs"], ["Module 4", "Test: proof, the bridge, the money"], ["Module 5", "Leap: interviews and the offer"], ["Module 6", "After: your story, and the next rung"]]),
  pageBreak(),
  kicker("Modules 0 and 1 in detail"),
  ...fields([["0.1  Welcome", "What you want, in one line"], ["0.2  Your starting line", "Stage, income floor, date"], ["0.3  Three things I believed", "Which of the three you hold"], ["1.1  You're allowed to want out", "Your stage, your belief, your move"], ["1.2  Bad workplace, bad fit, bad season?", "Six questions and a verdict"], ["1.3  The sunk-cost audit", "Spent vs. still live"], ["1.4  What actually gave you energy", "Energisers and drainers"], ["1.5  What you're protecting", "Four dials, three paths"], ["1.6  The part you get to keep", "What goes with you"], ["1.7  Tell one person", "Who, when, what they said"], ["1.8  Checkpoint", "One sentence in pull language"]]),
  pageBreak(),
);
// ------------------------------------------------------------------- 0.1
children.push(
  kicker("Module 0 · Lesson 1 · 3 min"), ...h1("Welcome", "Before the map, one honest line."),
  ...ask("If this program works, what is different on a Tuesday in December? Not the title. The day.", 5, "Where you are at 8am. What you're not doing. Who you talk to. What time you close the laptop."),
  ...ask("What have you already tried? Settings, hours, a different district, a course, a coach. List them, with roughly what each one cost you.", 5),
  ...ask("What's the thing you'd be embarrassed to admit you want? Write it here. Nobody's reading.", 3),
  spacer(), muted("Date: ____ / ____ / ________"),
  pageBreak(),
);
// ------------------------------------------------------------------- 0.2
children.push(
  kicker("Module 0 · Lesson 2 · 5 min"), ...h1("Your starting line", "Five answers. Everything after this bends around them."),
  h2("1. Which of these sounds most like right now?"),
  ...ticks(["I haven't told anyone I'm thinking about this.", "I feel guilty even looking. The degree, the loans, the people I'd leave.", "I keep reading exit stories and wondering if it's really possible.", "I want out. I just don't know what else I could do.", "I know what I want. I'm applying and not getting traction."]),
  h2("2. A path, if you have one"),
  muted("Optional. Nothing needs it until Module 2; the mindset, résumé, LinkedIn and networking lessons work for any title. A path only changes which examples, postings and artifact brief you see."),
  ...fields([["Path, or \"not sure yet\"", ""], ["Why that one, in ten words", ""]]),
  h2("3. Your income floor"),
  ...ticks(["Must match my SLP pay from day one", "I can take a small dip for better conditions", "I have runway for a bigger jump"]),
  ...ask("The number underneath the box you ticked. What's the monthly figure below which this stops being a choice?", 2),
  h2("4. Target date"),
  ...fields([["The date I want to be in a new role", "Ninety days out is the default. Fast paths fit inside it; long builds run 6–15 months."], ["What has to be true by then", ""]]),
  pageBreak(),
);
// ------------------------------------------------------------------- 0.3
children.push(
  kicker("Module 0 · Lesson 3 · 3 min"), ...h1("Three things I believed", "I held all three. Tick the ones you hold."),
  ...ticks(["\"I'd have to start over.\"", "\"I need a certificate first.\"", "\"I'd be throwing away my degree.\""]),
  ...ask("Pick the one you ticked hardest. Where did it come from? A person, a post, a professor, a number?", 4),
  ...ask("What has believing it cost you so far? Months, applications not sent, a conversation not had.", 4),
  ...callout("I know it's the sunken cost fallacy but it's so hard to quit after putting so much time, money, and effort into this career.", "an SLP on r/slp"),
  spacer(), muted("Date: ____ / ____ / ________"),
  pageBreak(),
);
// ------------------------------------------------------------------- 1.1
children.push(
  kicker("Module 1 · Lesson 1 · 6 min"), ...h1("You're allowed to want out", "Five stages. Find yours, then name the belief in your own words."),
  ...fields([["1  Private doubt", "\"Looking means deciding.\""], ["2  Guilt and identity", "\"Leaving wastes the degree.\""], ["3  Permission-seeking", "\"It works for other people, not me.\""], ["4  Practical panic", "\"I'd have to start over at the bottom.\""], ["5  Action", "\"If I were good enough, I'd get callbacks.\""]]),
  muted("Tick the row you're in. Then:", { before: 120 }),
  ...ask("The belief that keeps you at this stage, in your own words. Not the lesson's version. Yours.", 4),
  ...ask("The one move for your stage (from the lesson), and when this week you'll do it.", 3),
  ...ask("Which stage were you in six months ago? What moved you?", 3),
  ...callout("Maybe it's just a problem with my brain and not the job.", "a school SLP, r/slp"),
  spacer(), muted("Date: ____ / ____ / ________"),
  pageBreak(),
);
// ------------------------------------------------------------------- 1.2
children.push(
  kicker("Module 1 · Lesson 2 · 8 min"), ...h1("Bad workplace, bad fit, or bad season?", "\"I want to quit\" is three problems wearing one trench coat."),
  ...fields([
    ["If the conditions were decent (a fair caseload, real documentation time, a manager who backs you), would the clinical work itself still light you up?", "Yes / No / Not sure"],
    ["Have you already changed settings and had the feeling follow you?", "Yes / No"],
    ["Is something outside work taking most of what you've got right now?", "Yes / No"],
    ["Would any job feel impossible this month, even a good one?", "Yes / No"],
    ["Are you more interested in the data, the training, the coordination or the tech around therapy than in the therapy itself?", "Yes / No"],
    ["Is the thing draining you a specific person, building, or productivity number?", "Yes / No"],
  ]),
  h2("Your verdict"),
  ...ticks(["Bad workplace: the profession might be fine and the setting is not.", "Bad fit: the conditions could be perfect and I'd still feel it.", "Bad season: life outside work is taking everything I've got."]),
  ...ask("The settings experiment. List every setting or employer you've tried, and whether the feeling came with you.", 4, "Changing settings is the advice every exit thread gets. Having run it three times is data."),
  ...ask("What you do first, given the verdict. One sentence.", 2),
  ...callout("I've worked in several settings so can't imagine a setting change is the answer. It's all the same story, different font.", "r/slp"),
  pageBreak(),
);
// ------------------------------------------------------------------- 1.3
children.push(
  kicker("Module 1 · Lesson 3 · 7 min"), ...h1("The sunk-cost audit", "The degree is spent either way. Only the next years are still live."),
  h2("Already spent (the same whether you stay or go)"),
  ...fields([["Years in the field", ""], ["Student debt remaining", ""], ["What the degree cost, roughly", "ASHA, 2024: SLP master's programs run $23,000 to $75,000."]]),
  h2("Still live"),
  ...fields([["Current salary", "BLS median for SLPs, May 2025: $97,870. Middle half: $77,730 to $114,570."], ["Target path and its documented range", ""], ["Months I expect the move to take", "Typical: 6 to 15."], ["Ten-year total if I stay", "From the on-screen calculator."], ["Ten-year total if I move", ""], ["The difference", ""]]),
  ...ask("Now the part the calculator can't do. When you think about the money, what's the story underneath? Whose salary are you comparing yours to?", 4, "In the forums the comparison is almost always a spouse, a sibling, or a friend with PTO, not a number."),
  ...ask("If you're on PSLF or income-driven repayment: how many qualifying payments are left, and who would you need to ask to be sure?", 3, "Module 4 covers the loan as a calendar. Write what you know now."),
  ...callout("Sometimes a pay cut is worth sanity... and it may only be temporary anyway.", "r/SLPcareertransitions"),
  muted("Why the tuition feels refundable: Arkes and Blumer (1985) gave theatre-goers randomly discounted season tickets. The people who paid full price went to more plays, because of what they had already spent. The money was gone either way.", { before: 120 }),
  pageBreak(),
  kicker("Module 1 · Lesson 4 · 8 min"), ...h1("What actually gave you energy", "Competence and energy are different things. This page is about the second one."),
  muted("Work through your last month. For each task, mark whether it gave you energy or took it, and ignore whether you are good at it."),
  ...fields([["Direct therapy sessions", "Gave  /  Took"], ["Evaluations and report writing", "Gave  /  Took"], ["IEP or care-plan meetings", "Gave  /  Took"], ["Progress notes and documentation", "Gave  /  Took"], ["Parent and family conversations", "Gave  /  Took"], ["Supervising CFs or students", "Gave  /  Took"], ["Training colleagues or staff", "Gave  /  Took"], ["Data collection and progress monitoring", "Gave  /  Took"], ["Choosing or trialling AAC and devices", "Gave  /  Took"], ["Learning a new system or platform", "Gave  /  Took"]]),
  ...ask("Anything else that took up real time last month, and which column it belongs in.", 4),
  ...ask("Now the harder question. Which of the draining ones are you actually good at? Those are the tasks a career quietly gets built on.", 4),
  ...ask("Look at the two columns and name the pattern in your own words. Not \"working with people\", which is too vague. Working with whom, on what, under what conditions?", 5),
  pageBreak(),
);
// ------------------------------------------------------------------- 1.4
children.push(
  kicker("Module 1 · Lesson 5 · 8 min"), ...h1("What you're protecting", "Four dials, five boxes each. Tick where you are this month, not where you'd like to be."),
  ...scale("Pay floor", ["I have runway", "A dip is fine for a while", "Roughly the same", "Must match now", "Must beat it"]),
  ...scale("Distance from clinical", ["Clean break", "Mostly out", "Adjacent", "Close to it", "Inside it"]),
  ...scale("Live people-time", ["As little as possible", "A few calls a day", "Half my day", "Most of my day", "Still love 1:1"]),
  ...scale("New tools and software", ["Rather work with people", "Learn as needed", "Comfortable", "Enjoy learning them", "Colleagues come to me"]),
  ...fields([["Path 1 (from the on-screen ranking)", ""], ["Path 2", ""], ["Path 3", ""]]),
  ...ask("Which dial surprised you? Which one did you set where you think you should be, and then move?", 4),
  ...ask("The dial you'd be most ashamed to admit is set the way it is. Why that one?", 3),
  pageBreak(),
);
// ------------------------------------------------------------------- 1.5
children.push(
  kicker("Module 1 · Lesson 6 · 5 min"), ...h1("The part you get to keep", "Caitlin, Lindsey and Bethany kept the thing they were good at. The title was the only casualty."),
  ...ask("The part of the work you'd keep if you could keep only one thing. Explaining hard things simply? Holding a room to a plan? Reading the data? Building trust with skeptics? Be specific: a moment, a person, a session.", 5),
  ...ask("The part you wouldn't miss for a second.", 3),
  ...ask("Of the three stories, whose starting point looks most like yours, and what did they do in the first month?", 4, "Skip the last month. The last month is always the offer letter."),
  ...callout("I've taken a long time to grieve the loss of who I was in my previous role.", "a comment on a former SLP's essay about leaving"),
  ...ask("If it's grief, what are you grieving? Write the sentence that starts \"I'll miss being the person who...\"", 3),
  pageBreak(),
);
// ------------------------------------------------------------------- 1.6
children.push(
  kicker("Module 1 · Lesson 7 · 3 min"), ...h1("Tell one person", "The smallest possible disclosure. It costs less than the secret does."),
  ...fields([["Who (someone who won't argue)", ""], ["When", ""], ["The sentence", "\"I'm looking at what else I could do with my SLP background.\""]]),
  ...ask("How it went. What they said, what your face did, what you felt an hour later.", 5),
  h2("If they push back"),
  muted("Two replies show up in every forum thread about leaving. Write yours now so they don't cost you anything later."),
  ...fields([["\"Have you tried a different setting?\"", "My reply:"], ["\"There's a shortage. This makes it worse.\"", "My reply:"]]),
  ...callout("Posting here because I don't have the energy for the replies and shaming that I anticipate would come from r/slp.", "r/SLPcareertransitions"),
  pageBreak(),
);
// ------------------------------------------------------------------- 1.7
children.push(
  kicker("Module 1 · Checkpoint · 2 min"), ...h1("Checkpoint: Ground", "Three things leave this module with you. Write the sentence, and Explore opens."),
  ...fields([["My stage", ""], ["My verdict", "Bad workplace / bad fit / bad season"], ["The three paths my dials pointed at", ""]]),
  ...ask("Why I'm leaving, in pull language. One sentence about where you're going, not what you're escaping. No burnout words.", 4, "It becomes the first line of your cover letter, your LinkedIn About, and your answer to \"why are you leaving clinical work?\""),
  ...callout("Examples of pull: \"I want to work at the scale of a system instead of one room.\" \"I want to build the training instead of deliver it.\" \"I want to use what I know about clinicians to make a product they'll actually use.\"", "", AMBER),
  ...ask("Read it aloud. Would a hiring manager hear a retention risk, or a plan? Rewrite once if it's the first.", 4),
  h2("Notes to the person reading this in three months"),
  ...ask("What do you want them to remember about how this week felt?", 6),
  spacer(), muted("Date: ____ / ____ / ________"),
);


// ---------------------------------------------------------------- Module 2
children.push(
  pageBreak(),
  kicker("Module 2 · Explore · Weeks 2 and 3"), ...h1("Twenty paths, one choice", "The screen ranks them. This page is where you argue with the ranking."),
  ...ask("Which three paths did the map and the dials put in front of you, and what was your gut reaction to each?", 5, "Gut reactions are data here. A path you dismissed in half a second is worth a sentence about why."),
  ...ask("Which one are you choosing to explore first, and what would have to be true for it to be wrong?", 4),
  h2("What the day actually looks like"),
  muted("From the deep-dive and from any postings you read. Write it in your own words, not theirs."),
  ...ask("A Tuesday in this role, in four sentences.", 4),
  ...ask("Which requirement on the postings do you already meet, and which one is a genuine gap?", 4),
  pageBreak(),
  kicker("Module 2 · Lesson 8 and 9"), ...h1("Three messages", "The reach-out is the first thing that involves another person. Plan it here."),
  ...fields([["Person 1: who, and where you found them", ""], ["What made you pick them", ""], ["Sent on", ""], ["Reply", ""]]),
  ...fields([["Person 2: who, and where you found them", ""], ["What made you pick them", ""], ["Sent on", ""], ["Reply", ""]]),
  ...fields([["Person 3: who, and where you found them", ""], ["What made you pick them", ""], ["Sent on", ""], ["Reply", ""]]),
  ...ask("If someone replies and gives you twenty minutes, what are the three things you most want to know?", 4, "Not what the job pays. Things only a person in the seat can tell you."),
  muted("About one in four of these gets no answer. That is the rate, not a verdict."),
);

// ---------------------------------------------------------------- Module 3
children.push(
  pageBreak(),
  kicker("Module 3 · Translate · Weeks 3 to 5"), ...h1("The same work, their words", "The tool does the bulk translation. This page holds the two or three that need your judgement."),
  h2("Your numbers"),
  muted("Pulled from the number-mining tool, or from memory. Estimates are fine; bracket anything you need to confirm."),
  ...fields([["Largest caseload", ""], ["People trained or supervised", ""], ["Meetings led in a month", ""], ["Systems rolled out or changed", ""], ["Sites covered", ""], ["One outcome you moved, before and after", ""]]),
  pageBreak(),
  kicker("Module 3 · Lesson 2"), ...h1("Three bullets, rewritten by hand", "One line as it reads today. One line as it should read."),
  ...ask("Bullet 1, today:", 2), ...ask("Bullet 1, translated:", 3),
  ...ask("Bullet 2, today:", 2), ...ask("Bullet 2, translated:", 3),
  ...ask("Bullet 3, today:", 2), ...ask("Bullet 3, translated:", 3),
  pageBreak(),
  kicker("Module 3 · Lesson 7"), ...h1("The paragraph only you could write", "Every cover letter has one. It is the reason the letter costs you something."),
  ...ask("Write it. The specific thing about this company, this product or this problem that made you apply. If you could send the paragraph to any employer unchanged, it is not the one.", 6),
  ...ask("Read it back. Which sentence would a teacher leaving the classroom also be able to send? Cross it out and replace it.", 4),
);

// ---------------------------------------------------------------- Module 4
children.push(
  pageBreak(),
  kicker("Module 4 · Test · Weeks 5 to 8"), ...h1("The thing you make", "One artifact, two sessions, a process note. Plan it here so the week does not eat it."),
  ...fields([["What I am making", ""], ["Session 1, ninety minutes: date", ""], ["Session 2, ninety minutes: date", ""], ["Where it will live", ""]]),
  ...ask("The process note. What was the problem, what did you decide, and what would you do differently? Three or four sentences, written after it exists.", 5),
  pageBreak(),
  kicker("Module 4 · Lesson 5"), ...h1("The three numbers", "Loans, coverage, runway. Fill these in with real figures, not remembered ones."),
  h2("Forgiveness, if it applies"),
  ...fields([["Qualifying payments made so far", "Check your federal loan account, do not estimate"], ["Payments remaining", ""], ["Does my employer qualify?", "Look it up in the official employer search"], ["Last time I filed the certification form", ""]]),
  h2("Coverage"),
  ...fields([["Who covers me now, and until when", ""], ["COBRA cost per month, if offered", "Up to 102% of the full premium"], ["Marketplace estimate for my expected income", ""], ["Gap I would need to bridge, in weeks", ""]]),
  h2("Runway"),
  ...fields([["Savings I would use", ""], ["Monthly income I would give up", ""], ["Monthly gap, all in", ""], ["Months of runway", "Savings divided by the monthly gap"], ["Months I expect the move to take", "Documented: 6 to 15"]]),
  ...ask("If the runway is shorter than the move, which lever are you pulling: a smaller dip, a shorter bridge, or a fast-exit path first?", 4),
);

// ---------------------------------------------------------------- Module 5
children.push(
  pageBreak(),
  kicker("Module 5 · Leap · Weeks 8 to 12"), ...h1("Your bridge statement", "Three parts, said aloud until it stops sounding rehearsed."),
  ...ask("Pull: where you are going. Copy it from the Module 1 checkpoint, or improve it now.", 3),
  ...ask("Preparation: what you have done to get ready. The artifact, the conversations, the certificate.", 3),
  ...ask("Proof: one accomplishment with a real number, mapped onto a problem this role has in its first ninety days.", 4),
  muted("Tick each time you say the whole thing out loud:   ☐   ☐   ☐   ☐   ☐"),
  pageBreak(),
  kicker("Module 5 · Lessons 3 and 5"), ...h1("The questions and the number", "Two things to have decided before an interview, rather than during one."),
  ...ask("Which screening question would you fumble today? Write your answer, then cut it in half.", 5),
  h2("Your number"),
  ...fields([["Documented range for my path", ""], ["The number I will say if asked first", ""], ["My walk-away number", "Below this, the runway maths fails"], ["What I would ask for if the base is fixed", "Sign-on, PTO, remote days, an early review"]]),
  ...ask("Say the counter out loud once, to a person. Who did you say it to, and how did it sound?", 3),
);

// ---------------------------------------------------------------- Module 6
children.push(
  pageBreak(),
  kicker("Across Modules 2 to 5"), ...h1("The tracker", "Two conversations and a ratio. The spreadsheet does the arithmetic; this page is for the part it cannot hold."),
  muted("Download the three-sheet tracker from the course dashboard and import it into Google Sheets or Notion. Use this page for the thinking behind the rows."),
  h2("People"),
  ...fields([["Who I am trying to reach, and why them", ""], ["Messages sent so far", ""], ["Replies", "About one in four gets no answer"], ["Conversations had", ""], ["Names I was given", "This column is where a network comes from"]]),
  ...ask("The most useful thing anyone has told me so far, and what I did about it.", 4),
  h2("Applications"),
  ...fields([["Applications sent", ""], ["Screens", ""], ["Interviews", ""], ["Offers", ""], ["My ratio, so far", "113 to 7 to 1 is one documented transition"]]),
  ...ask("Which stage is actually broken? Applications without screens is a résumé problem, screens without interviews is a bridge-statement problem, interviews without offers is usually a proof problem.", 5),
  ...ask("What I am changing this week because of that.", 3),
  pageBreak(),
  kicker("Module 6 · After"), ...h1("Six months in", "Come back to this page when you are on the other side."),
  ...ask("What is different on a Tuesday now? Compare it with what you wrote on the very first page.", 5),
  ...ask("What did you worry about that turned out not to matter?", 4),
  ...ask("What would you tell the person who is where you were in week one?", 5),
  muted("That last answer is your story. The form is at slptransitions.com/about."),
  spacer(300),
  rule(),
  p("You did the whole thing.", { serif: true, size: 30, bold: true }),
  muted("Whatever the title says now, you are still the person who can explain hard things simply, hold a room to a plan, and read a page of data and know what to do next. That was never the job. That was you."),
);

const doc = new Document({
  styles: { default: { document: { run: { font: F, size: 22, color: DARK } } } },
  numbering: { config: [{ reference: "dots", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 480, hanging: 240 } }, run: { color: GREEN } } }] }] },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1300, bottom: 1200, left: 1440, right: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: W }], children: [new TextRun({ text: "TRANSITION OS", font: F, size: 16, bold: true, color: GREEN, characterSpacing: 30 }), new TextRun({ text: "\tCompanion workbook · Modules 0 and 1", font: F, size: 16, color: MUTED })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: W }], children: [new TextRun({ text: "slptransitions.com · Nobody reads this but you.", font: F, size: 16, color: MUTED }), new TextRun({ children: ["\t", PageNumber.CURRENT], font: F, size: 16, color: MUTED })] })] }) },
    children,
  }],
});

const buf = await Packer.toBuffer(doc);
writeFileSync("public/course/transition-os-workbook.docx", buf);
console.log("wrote public/course/transition-os-workbook.docx", buf.length, "bytes");
