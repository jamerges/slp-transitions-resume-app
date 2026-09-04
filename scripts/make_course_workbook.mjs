// Module 1 workbook (Word). Run: node scripts/make_course_workbook.mjs
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import { writeFileSync } from "node:fs";

const F = "Calibri", GREEN = "2D6A4F", MUTED = "6B7280";
const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 120 }, children: [new TextRun({ text: t, bold: true, size: 30, color: GREEN, font: F })] });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 }, children: [new TextRun({ text: t, bold: true, size: 24, color: "1B1B1E", font: F })] });
const p = (t, o = {}) => new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: t, size: o.size ?? 22, bold: o.bold, italics: o.italics, color: o.color, font: F })] });
const muted = (t) => p(t, { color: MUTED, size: 20, italics: true });
const line = () => new Paragraph({ spacing: { after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "D1D5DB" } }, children: [new TextRun({ text: " ", font: F })] });
const lines = (n) => Array.from({ length: n }, line);
const box = (rows) => new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: rows.map(([a, b]) => new TableRow({ children: [
  new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: [p(a, { bold: true })] }),
  new TableCell({ width: { size: 60, type: WidthType.PERCENTAGE }, children: [p(b ?? "")] }),
] })) });

const doc = new Document({ styles: { default: { document: { run: { font: F, size: 22 } } } }, sections: [{ children: [
  new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 60 }, children: [new TextRun({ text: "TRANSITION OS", bold: true, size: 20, color: GREEN, font: F, characterSpacing: 40 })] }),
  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Module 1 workbook: Ground", bold: true, size: 40, font: F })] }),
  muted("Permission, identity, and the honest decision. One page per lesson. Write in it; nobody else reads it."),

  h1("1.1  You're allowed to want out"),
  p("Circle the stage that sounds most like this week."),
  box([["1  Private doubt", "I haven't told anyone."], ["2  Guilt and identity", "The degree, the loans, the people I'd leave."], ["3  Permission-seeking", "I keep reading exit stories."], ["4  Practical panic", "I want out. What else could I do?"], ["5  Action", "I'm applying and not getting traction."]]),
  p(""), p("The belief that keeps me at this stage, in my own words:"), ...lines(2),
  p("The one move for this stage (from the lesson):"), ...lines(1),

  h1("1.2  Bad workplace, bad fit, or bad season?"),
  p("\"I want to quit\" is three problems wearing one trench coat. Answer honestly."),
  box([["If the conditions were decent, would the clinical work itself still light me up?", "Yes / No / Not sure"], ["Have I already changed settings and had the feeling follow me?", "Yes / No"], ["Is something outside work taking most of what I've got right now?", "Yes / No"], ["Would any job feel impossible this month, even a good one?", "Yes / No"], ["Am I more interested in the data, training, coordination or tech around therapy than in the therapy?", "Yes / No"], ["Is the thing draining me a specific person, building or productivity number?", "Yes / No"]]),
  p(""), p("My verdict:  □ Bad workplace   □ Bad fit   □ Bad season", { bold: true }),
  p("What that verdict means I do first:"), ...lines(2),

  h1("1.3  The sunk-cost audit"),
  muted("The degree is spent whether you stay or go. Only the next years are still live. Numbers from the lesson's calculator go here."),
  box([["Years in the field", ""], ["Student debt remaining", ""], ["Current salary (BLS median for SLPs, May 2025: $97,870)", ""], ["Target path and its documented range", ""], ["Months I expect the move to take (typical: 6–15)", ""], ["Ten-year total if I stay", ""], ["Ten-year total if I move", ""], ["The difference", ""]]),
  p(""), p("If I'm on PSLF or income-driven repayment, the loans lesson in Module 4 comes before any decision. Tick when read:  □"),
  muted("Why the tuition feels refundable: Arkes & Blumer (1985) showed that people who paid more for theatre season tickets attended more plays, because of what they had already spent. The money was gone either way. So is the tuition."),

  h1("1.4  What you're protecting"),
  p("Set each dial where you actually are, not where you'd like to be."),
  box([["Pay floor", "Must match SLP pay  ·  Small dip OK  ·  I have runway"], ["Hours available outside work", "Almost none  ·  A couple  ·  A few, consistently  ·  A defined sprint"], ["Distance from clinical", "Stay close  ·  Adjacent  ·  Clean break"], ["Live people-time", "Still love 1:1  ·  Accounts and colleagues  ·  Through systems  ·  As little as possible"], ["Appetite for new tools", "Colleagues come to me  ·  I enjoy learning  ·  As needed  ·  Rather work with people"]]),
  p(""), p("The three paths the dials pointed at:"), ...lines(3),

  h1("1.5  Still you"),
  p("The part of the work I want to keep (explaining hard things simply, holding a room to a plan, reading data, building trust with sceptics):"), ...lines(2),
  p("Where the person I read about was when they started looking:"), ...lines(2),

  h1("1.6  Tell one person"),
  p("Who (someone who won't argue):"), ...lines(1),
  p("The sentence: \"I'm looking at what else I could do with my SLP background.\""),
  p("When I said it:  ____ / ____ / ________          How it went:"), ...lines(2),

  h1("1.7  Checkpoint"),
  p("Why I'm leaving, in pull language (what I'm moving toward, one sentence, no burnout words):", { bold: true }), ...lines(3),
  muted("Examples of pull: \"I want to work at the scale of a system instead of one room.\" \"I want to build the training instead of deliver it.\" \"I want to use what I know about clinicians to make a product they'll actually use.\""),
] }] });

const buf = await Packer.toBuffer(doc);
writeFileSync("public/course/module-1-workbook.docx", buf);
console.log("wrote public/course/module-1-workbook.docx", buf.length, "bytes");
