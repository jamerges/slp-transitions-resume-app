import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getCourseAccess } from "@/lib/course-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The workbook, gated. It used to sit in public/ where anyone with the URL
 * could take it, which is a poor way to run the main non-course deliverable
 * of a paid product.
 *
 * Which edition you get follows what you hold: Module 1 buyers get the five
 * pages that belong to Module 1 plus the weeks 1/6/12 tracker; the full
 * program adds the sheets you carry into a room, which belong to Modules 3
 * and 6. Files live in content/, outside the public directory.
 */
const FILES = {
  ground: "transition-os-workbook-module1",
  os: "transition-os-workbook",
} as const;

export async function GET(req: Request) {
  const access = await getCourseAccess();
  if (!access) {
    return NextResponse.json(
      { error: "The workbook comes with Module 1.", where: "/course/ground" },
      { status: 403 }
    );
  }
  const url = new URL(req.url);
  const ext = url.searchParams.get("f") === "docx" ? "docx" : "pdf";
  const base = FILES[access.product];
  try {
    const buf = await readFile(path.join(process.cwd(), "content/course/workbook", `${base}.${ext}`));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": ext === "docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/pdf",
        "Content-Disposition": `inline; filename="transition-os-workbook.${ext}"`,
        // Private: the response depends on the access cookie.
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (e) {
    console.error("[/api/course/workbook] read failed", e);
    return NextResponse.json({ error: "Could not read the workbook." }, { status: 500 });
  }
}
