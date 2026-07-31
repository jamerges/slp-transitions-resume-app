// Client-side Word document generation for purchased results.
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
} from "docx";

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const body = (text: string, opts: { bold?: boolean; size?: number; color?: string } = {}) =>
  new Paragraph({
    children: [new TextRun({ text, bold: opts.bold, size: opts.size ?? 22, color: opts.color, font: "Calibri" })],
    spacing: { after: 120 },
  });

const heading = (text: string) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, size: 26, color: "2D6A4F", font: "Calibri" })],
    spacing: { before: 240, after: 120 },
  });

const bullet = (text: string) =>
  new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Calibri" })],
    bullet: { level: 0 },
    spacing: { after: 80 },
  });

function slug(s: string): string {
  return s.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "role";
}

export async function downloadResumeDocx(full: any, jobTitle: string) {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Resume Content — ${jobTitle}`, bold: true, size: 32, font: "Calibri" })],
      spacing: { after: 60 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Paste each section into your own resume. Keep a single-column layout with standard headers — it parses best.", italics: true, size: 18, color: "6B7280", font: "Calibri" })],
      spacing: { after: 240 },
    }),
  ];

  if (full.professionalSummary) {
    children.push(heading("Professional Summary"));
    children.push(body(full.professionalSummary));
  }

  if (full.skillsSection && Object.keys(full.skillsSection).length) {
    children.push(heading("Skills"));
    for (const [cat, skills] of Object.entries(full.skillsSection)) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${cat}: `, bold: true, size: 22, font: "Calibri" }),
            new TextRun({ text: (skills as string[]).join(", "), size: 22, font: "Calibri" }),
          ],
          spacing: { after: 80 },
        })
      );
    }
  }

  const bullets = full.translatedBullets || [];
  if (bullets.length) {
    children.push(heading("Experience (translated bullets)"));
    let lastSection = "";
    for (const b of bullets) {
      if (b.section && b.section !== lastSection) {
        lastSection = b.section;
        children.push(body(b.section, { bold: true }));
      }
      children.push(bullet(b.translated));
    }
  }

  if (full.linkedinHeadline) {
    children.push(heading("LinkedIn Headline"));
    children.push(body(full.linkedinHeadline));
  }
  if (full.linkedinAbout) {
    children.push(heading("LinkedIn About"));
    for (const p of String(full.linkedinAbout).split(/\n+/)) children.push(body(p));
  }

  const doc = new Document({ sections: [{ children }] });
  download(await Packer.toBlob(doc), `resume-content-${slug(jobTitle)}.docx`);
}

export async function downloadCoverLetterDocx(full: any, jobTitle: string) {
  const children: Paragraph[] = [];
  for (const p of String(full.coverLetter || "").split(/\n+/)) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: p, size: 22, font: "Calibri" })],
        spacing: { after: 200 },
      })
    );
  }
  const doc = new Document({ sections: [{ children }] });
  download(await Packer.toBlob(doc), `cover-letter-${slug(jobTitle)}.docx`);
}
