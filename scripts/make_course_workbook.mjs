// Transition OS companion workbook, Modules 0 and 1. US Letter, fillable in
// Word: every prompt is followed by an empty box the reader types or writes
// into. Run: node scripts/make_course_workbook.mjs
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, HeightRule, PageBreak, Footer, Header, PageNumber,
  LevelFormat, TabStopType,
} from "docx";
import { writeFileSync, mkdirSync } from "node:fs";

const F = "Calibri", SERIF = "Georgia";
const GREEN = "2D6A4F", DARK = "1B1B1E", MUTED = "6B7280", LINE = "D1D5DB", SOFT = "F0FAF3", CREAM = "FAFAF9", AMBER = "FEF3C7", ACCENT_LIGHT = "40916C", PALE = "D8F3DC", PALER = "A7D3BC";
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
/** Contents: page name, what you get from it, and a box to tick when it is done. */
const contentsTable = (rows) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [3300, 5460, 600], rows: rows.map(([title, note]) => new TableRow({ children: [
  new TableCell({ width: { size: 3300, type: WidthType.DXA }, borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }, margins: { top: 130, bottom: 130, left: 40, right: 160 }, children: [p(title, { bold: true, size: 22, after: 0 })] }),
  new TableCell({ width: { size: 5460, type: WidthType.DXA }, borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }, margins: { top: 130, bottom: 130, left: 0, right: 160 }, children: [p(note, { color: MUTED, size: 22, after: 0 })] }),
  new TableCell({ width: { size: 600, type: WidthType.DXA }, borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }, margins: { top: 130, bottom: 130, left: 0, right: 0 }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 0 }, children: [new TextRun({ text: "\u2610", font: "Segoe UI Symbol", size: 24, color: ACCENT_LIGHT })] })] }),
] })) });
/** Tick list: checkbox glyph + label, one row each. */
const ticks = (items) => [...items.map((t) => new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "☐  ", font: "Segoe UI Symbol", size: 24, color: GREEN }), run(t)] })), gap(120)];
/** Shaded callout: a real quote from the forums, or a note. */
const calloutTable = (text, from, fill = SOFT) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W], rows: [new TableRow({ children: [new TableCell({ width: { size: W, type: WidthType.DXA }, borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, left: { style: BorderStyle.SINGLE, size: 24, color: GREEN } }, shading: { type: ShadingType.CLEAR, fill, color: "auto" }, margins: { top: 120, bottom: 120, left: 200, right: 200 }, children: [p([run(`“${text}”`, { italics: true, size: 22 }), ...(from ? [run(`   ${from}`, { size: 18, color: MUTED })] : [])], { after: 0 })] })] })] });
const callout = (text, from, fill = SOFT) => [gap(120), calloutTable(text, from, fill), gap()];
/** A shaded instruction. calloutTable is for quotes, this is for directions. */
const noteTable = (text) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W], rows: [new TableRow({ children: [new TableCell({ width: { size: W, type: WidthType.DXA }, borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, left: { style: BorderStyle.SINGLE, size: 24, color: GREEN } }, shading: { type: ShadingType.CLEAR, fill: SOFT, color: "auto" }, margins: { top: 140, bottom: 140, left: 200, right: 200 }, children: [p(text, { size: 22, after: 0 })] })] })] });
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

/** One accent per module, matching the colours the app uses for each chapter. */
const ACCENT = {
  0: { ink: "2D6A4F", tint: "F0FAF3", edge: "D8F3DC" },
  1: { ink: "2D6A4F", tint: "F0FAF3", edge: "D8F3DC" },
  2: { ink: "1E40AF", tint: "EFF6FF", edge: "BFDBFE" },
  3: { ink: "155E75", tint: "ECFEFF", edge: "A5F3FC" },
  4: { ink: "5B21B6", tint: "F5F3FF", edge: "DDD6FE" },
  5: { ink: "92400E", tint: "FEF6E7", edge: "FDE68A" },
  6: { ink: "065F46", tint: "ECFDF5", edge: "A7F3D0" },
  7: { ink: "9D174D", tint: "FDF2F8", edge: "FBCFE8" },
};

/** A full-width band of colour. Used for module dividers and the progress strip. */
const band = (cells, fill, ink, height = 700) => new Table({
  width: { size: W, type: WidthType.DXA },
  columnWidths: cells.map((c) => c.w),
  rows: [new TableRow({ height: { value: height, rule: HeightRule.ATLEAST }, children: cells.map((c) => new TableCell({
    width: { size: c.w, type: WidthType.DXA },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
    shading: { type: ShadingType.CLEAR, fill: c.fill ?? fill, color: "auto" },
    margins: { top: 140, bottom: 140, left: c.pad ?? 200, right: c.pad ?? 200 },
    verticalAlign: c.valign ?? "center",
    children: c.children,
  })) })],
});

/** The divider page that opens each module: number, name, and what the pages ask of you. */
const moduleCover = (n, title, weeks, blurb, pages, outcome) => {
  const a = ACCENT[n];
  return [
    pageBreak(),
    spacer(900),
    band([
      { w: 1500, fill: a.ink, children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [new TextRun({ text: String(n), font: SERIF, size: 72, bold: true, color: "FFFFFF" })] })] },
      { w: W - 1500, fill: a.tint, children: [
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `MODULE ${n} \u00b7 ${weeks.toUpperCase()}`, font: F, size: 17, bold: true, color: a.ink, characterSpacing: 30 })] }),
        new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: title, font: SERIF, size: 48, bold: true, color: DARK })] }),
      ] },
    ], a.tint, a.ink, 1100),
    spacer(240),
    p(blurb, { size: 24, color: MUTED, serif: true }),
    spacer(240),
    kickerIn("The pages in this module", a.ink),
    ...pages.map((t) => new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "\u2014  ", font: F, size: 22, color: a.ink }), run(t)] })),
    spacer(360),
    kickerIn("What you will have at the end", a.ink),
    p(outcome, { size: 22, after: 320 }),
    band([
      { w: Math.floor(W / 2), fill: "FFFFFF", children: [p("Started this module on", { bold: true, size: 20, after: 60 }), p("______________________", { color: LINE })] },
      { w: W - Math.floor(W / 2), fill: "FFFFFF", children: [p("Finished on", { bold: true, size: 20, after: 60 }), p("______________________", { color: LINE })] },
    ], "FFFFFF", a.ink, 520),
  ];
};

/** kicker(), but in a module's own colour. */
const kickerIn = (t, ink) => new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: t.toUpperCase(), font: F, size: 17, bold: true, color: ink, characterSpacing: 30 })] });

/** The eight stops, as a strip. Print it and tick them off. */
const progressStrip = () => band(
  [0, 1, 2, 3, 4, 5, 6, 7].map((n) => ({
    w: Math.floor(W / 8),
    fill: ACCENT[n].tint,
    pad: 60,
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: String(n), font: SERIF, size: 30, bold: true, color: ACCENT[n].ink })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [new TextRun({ text: ["Start", "Ground", "Explore", "Connect", "Translate", "Test", "Leap", "After"][n], font: F, size: 15, color: ACCENT[n].ink })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 0 }, children: [new TextRun({ text: "\u2610", font: "Segoe UI Symbol", size: 22, color: ACCENT[n].ink })] }),
    ],
  })), "FFFFFF", GREEN, 820);

/** Label column plus N answer columns. Used for the same questions over time. */
const matrix = (cols, rows) => {
  const first = 2600, rest = Math.floor((W - first) / (cols.length - 1));
  const widths = [first, ...cols.slice(1).map(() => rest)];
  const head = new TableRow({ children: cols.map((c, i) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA }, borders: cellBorders,
    shading: { type: ShadingType.CLEAR, fill: i === 0 ? "FFFFFF" : SOFT, color: "auto" },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [p(c, { bold: true, size: 19, after: 0 })] })) });
  const body = rows.map((label) => new TableRow({ height: { value: 640, rule: HeightRule.ATLEAST }, children: cols.map((_, i) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA }, borders: cellBorders,
    shading: { type: ShadingType.CLEAR, fill: "FFFFFF", color: "auto" },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: [i === 0 ? p(label, { bold: true, size: 20, after: 0 }) : p(" ")] })) }));
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, rows: [head, ...body] });
};

/* Two editions from one source. The $19 product is Module 1, so its workbook
 * is the Module 1 pages plus the tracker that spans the whole program. The
 * sheets you carry into a room belong to Modules 3 and 6 and ship with the
 * full program. Run: node scripts/make_course_workbook.mjs [module1|full|both]
 */
const EDITION = process.argv[2] || "both";
const MODULE1_ONLY = EDITION === "module1";

const children = [];
// ------------------------------------------------------------------ cover
// Emerald field over a cream foot: the palette James picked, with the page
// rhythm from the quieter direction (title high, room falling below it).
children.push(
  band([{ w: W, fill: GREEN, pad: 260, valign: "top", children: [
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "WORKBOOK", font: F, size: 17, bold: true, color: PALE, characterSpacing: 30 })] }),
    new Paragraph({ spacing: { after: 700 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_LIGHT, space: 6 } }, children: [new TextRun({ text: MODULE1_ONLY ? "MODULE 1" : "NINETY DAYS", font: F, size: 17, color: PALER, characterSpacing: 24 })] }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Transition OS", font: SERIF, size: 72, bold: true, color: "FFFFFF" })] }),
    new Paragraph({ spacing: { after: 260 }, border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: PALE, space: 2 } }, children: [new TextRun({ text: "     ", font: F, size: 10 })] }),
    new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: MODULE1_ONLY
      ? "Work out whether you are actually leaving, and what you are protecting if you are."
      : "Ninety days, from wondering whether you\u2019re allowed to leave to interviewing outside the clinic.", font: SERIF, size: 28, color: PALE })] }),
  ] }], GREEN, GREEN, 8200),
  spacer(500),
  kicker("The eight stops"),
  progressStrip(),
  spacer(700),
  p("Name", { bold: true, size: 20, after: 40 }), p("________________________________________", { color: LINE }),
  p("Started on", { bold: true, size: 20, after: 40, before: 160 }), p("________________________________________", { color: LINE }),
  spacer(400),
  p("Print it, or type straight into it.", { color: MUTED, size: 21 }),
  pageBreak(),
);
// ------------------------------------------------------------ what's in here
children.push(
  ...h1("What\u2019s in here"),
  contentsTable(MODULE1_ONLY ? [
    ["Bad week, or time to go", "Answer the same thing in week 1, 6 and 12 so one bad Tuesday does not decide it"],
    ["Why leaving isn\u2019t a wasted degree", "Why the years and the debt already spent are not a reason to stay"],
    ["Your why, in writing", "What you actually want to leave, so you know what to look for in the next job"],
    ["What you\u2019ll miss", "What you give up by leaving, and which parts you can keep anyway"],
    ["Telling the first person", "Say it out loud to one person, and plan exactly what you\u2019ll say first"],
  ] : [
    ["Bad week, or time to go", "Answer the same thing in week 1, 6 and 12 so one bad Tuesday does not decide it"],
    ["Why leaving isn\u2019t a wasted degree", "Why the years and the debt already spent are not a reason to stay"],
    ["Your why, in writing", "What you actually want to leave, so you know what to look for in the next job"],
    ["What you\u2019ll miss", "What you give up by leaving, and which parts you can keep anyway"],
    ["Telling the first person", "Say it out loud to one person, and plan exactly what you\u2019ll say first"],
    ["Informational interview sheet", "What to ask someone who already left, and how to turn one call into two"],
    ["Interview prep on one page", "Your 45-second intro, and answering \u2018why are you leaving\u2019 without saying burnout"],
    ["Negotiating the offer", "Your opening number and your walk-away floor, decided before the phone rings"],
    ["Six months in", "What\u2019s different on a Tuesday now, and what you\u2019d tell someone in week one"],
  ]),
  ...(MODULE1_ONLY ? [gap(200), muted("The informational interview sheet, the interview page and the offer page come with the full program.")] : []),
  spacer(400),
  noteTable("Do the lesson on screen first. It does the maths, the sorting and the ranking, and it keeps your answers."),
  gap(120),
  noteTable("Write badly. Fragments, half-sentences, a list. If you catch yourself drafting sentences, you have switched into work mode."),
  pageBreak(),
);

// ----------------------------------------------- 1. answered more than once
children.push(
  kickerIn("Weeks 1, 6 and 12", ACCENT[1].ink),
  ...h1("Bad week, or time to go", "Answer these in week 1, then again in week 6 and week 12. One bad Tuesday should not be the thing that decides it."),
  matrix(["", "Week 1", "Week 6", "Week 12"], [
    "Date",
    "The stage you are in",
    "Bad workplace, bad fit, or bad season",
    "The path you would name today",
    "Your pay floor",
  ]),
  ...ask("Where you are going, in one sentence. Write a new one each time rather than editing the old one.", 6, "Three sentences by week twelve. The first one is usually about leaving and the last one usually is not."),
  pageBreak(),
);

// ------------------------------------------------ 2. not for a text field
children.push(
  kickerIn("Module 1 · sunk cost", ACCENT[1].ink),
  ...h1("Why leaving isn\u2019t a wasted degree", "The years and the debt are already spent either way. This is where you stop counting them as a reason to stay."),
  ...ask("Write it exactly as it sounds in your head. Not the reasonable version.", 4, "It usually starts with “after all that” or “I should be able to”."),
  ...callout("I know it's the sunken cost fallacy but it's so hard to quit after putting so much time, money, and effort into this career.", "an SLP, r/slp"),
  ...ask("Who taught you that sentence? A supervisor, a cohort, a parent, yourself at twenty-four.", 3),
  ...ask("What would you say to a CF who said it to you, word for word?", 5, "People are consistently kinder to a hypothetical CF than to themselves. Use the kinder version."),
  pageBreak(),

  kickerIn("Module 1 · the checkpoint", ACCENT[1].ink),
  ...h1("Your why, in writing", "What you want to leave, in your own words, so you know what you are looking for in the next job."),
  ...ask("Everything you want to leave. Names, days, specific meetings, the thing you have never said out loud. Do not soften it.", 10, "Nobody reads this."),
  ...ask("Read it back, and mark the three that would still be true in a different building.", 4, "Those three are about the work. Everything else is about this job, and that is a different problem with a faster fix."),
  pageBreak(),

  kickerIn("Module 1 · what you keep", ACCENT[1].ink),
  ...h1("What you\u2019ll miss", "Name it now. The people who skip this are the ones who end up going back."),
  ...ask("Finish the sentence: I will miss being the person who …", 4),
  ...callout("I've taken a long time to grieve the loss of who I was in my previous role.", "a comment on a former SLP's essay about leaving"),
  ...ask("Which part of that goes with you into any job? A moment, a person, a session. Be specific.", 4),
  ...ask("Which part only exists in a clinic, and what will you do about that outside work?", 4),
  pageBreak(),

  kickerIn("Module 1 · lesson 7", ACCENT[1].ink),
  ...h1("Telling the first person", "Say it out loud to one person. Plan who, when, and what you will say."),
  ...fields([["Who", "Not a colleague, if you can avoid it"], ["When", "A date, not “soon”"], ["What you plan to say", "One sentence"]]),
  ...ask("What you actually said, and what they said back.", 6, "Fill this in afterwards. People are almost always less surprised than you expect them to be."),
  ...ask("What changed for you in the hour after.", 3),
  pageBreak(),
);

// --------------------------------------------- 3. carried into a room
const conversationPage = (n) => [
  kickerIn(`Module 3 \u00b7 sheet ${n} of 2`, ACCENT[3].ink),
  ...h1("Informational interview sheet", "Keep this open while you talk. Their answers, in their words."),
  ...fields([["Who, and their title now", "How you found them"], ["Date", ""]]),
  ...ask("How did you get the first one? Walk me through the six months before the offer.", 3),
  ...ask("What does a Tuesday actually look like?", 2),
  ...ask("What part of the clinical background turned out to be useful, and what did you drop?", 2),
  ...ask("Who else should I be talking to?", 2, "The question that turns one conversation into two."),
  ...ask("The sentence you are taking away, and what you do in the next fortnight because of it.", 2, "You asked for fifteen minutes. Running over it is the fastest way to not get a second conversation."),
  pageBreak(),
];
if (!MODULE1_ONLY) children.push(...conversationPage(1), ...conversationPage(2));

const interviewPage = (n) => [
  kickerIn(`Module 6 \u00b7 interview ${n} of 2`, ACCENT[6].ink),
  ...h1("Interview prep on one page", "Take this in with you, decided in advance rather than in the room."),
  ...fields([["Company and role", "Who you are speaking to"], ["Date", ""]]),
  h2("Your bridge statement"),
  muted("Where you are going, how you prepared, one accomplishment with a number in it. Forty-five seconds."),
  ...ask("Write it out, then say it aloud five times before you go in.", 3),
  h2("Three stories, each with a number in it"),
  ...fields([["Story 1", "The number"], ["Story 2", "The number"], ["Story 3", "The number"]]),
  ...ask("Three questions for them: the first ninety days, what the last person found hard, how the work gets measured.", 3),
  muted("Burnout is a true reason and a bad answer. Answer with where you are going, not what you are leaving."),
  pageBreak(),
];
if (!MODULE1_ONLY) children.push(...interviewPage(1), ...interviewPage(2));

if (!MODULE1_ONLY) children.push(
  kickerIn("Module 6 · the offer", ACCENT[6].ink),
  ...h1("Negotiating the offer", "Your opening number and your walk-away floor, decided before the phone rings."),
  ...fields([
    ["The number you say first", "The top of the documented range for your path"],
    ["Your floor", "Below this you decline. Write it now, not on the call"],
    ["The date you will answer by", ""],
  ]),
  h2("The three things you ask for if the base will not move"),
  ...fields([["Ask 1", "Sign-on, PTO, remote days, start date, an early review"], ["Ask 2", ""], ["Ask 3", ""]]),
  h2("Say it out loud once before you say it to them"),
  muted("The sentence that feels outrageous in your head almost always sounds reasonable in the air."),
  ...ask("The exact words you will use.", 3),
  muted("About thirty percent of people negotiate, and two thirds or more of those who ask get something. Hiring managers report fewer than two withdrawn offers across roughly twenty-seven they have made."),
  pageBreak(),
);

// ---------------------------------------------------------------- after
if (!MODULE1_ONLY) children.push(
  kickerIn("Module 7 · after", ACCENT[7].ink),
  ...h1("Six months in", "Fill this in when you are on the other side."),
  ...ask("What is different on a Tuesday now? Compare it with the first pass on the three-passes page.", 5),
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
    headers: { default: new Header({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: W }], children: [new TextRun({ text: "TRANSITION OS", font: F, size: 16, bold: true, color: GREEN, characterSpacing: 30 }), new TextRun({ text: "\tCompanion workbook", font: F, size: 16, color: MUTED })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: W }], children: [new TextRun({ text: "slptransitions.com", font: F, size: 16, color: MUTED }), new TextRun({ children: ["\t", PageNumber.CURRENT], font: F, size: 16, color: MUTED })] })] }) },
    children,
  }],
});

const buf = await Packer.toBuffer(doc);
const out = MODULE1_ONLY
  ? "content/course/workbook/transition-os-workbook-module1.docx"
  : "content/course/workbook/transition-os-workbook.docx";
mkdirSync("content/course/workbook", { recursive: true });
writeFileSync(out, buf);
console.log(`wrote ${out} (${EDITION})`, buf.length, "bytes");
