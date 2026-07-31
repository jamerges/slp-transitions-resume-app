import { NextResponse } from "next/server";
import { isReadableProse } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const buf = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (ext === "txt" || ext === "md") {
      text = buf.toString("utf-8");
    } else if (ext === "pdf") {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(buf));
      const { text: pages } = await extractText(pdf, { mergePages: true });
      text = Array.isArray(pages) ? pages.join("\n") : String(pages || "");
    } else if (ext === "docx") {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.extractRawText({ buffer: buf });
      text = result.value || "";
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Use .pdf, .docx, or .txt — or paste your text." },
        { status: 400 }
      );
    }

    text = text.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();

    if (!isReadableProse(text)) {
      return NextResponse.json(
        {
          error:
            "We couldn't read usable text from that file — it may be a scanned image or a protected PDF. Please use the \"Paste Text\" tab instead.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, words: text.split(/\s+/).length });
  } catch (err: any) {
    console.error("[/api/parse-resume]", err);
    return NextResponse.json(
      {
        error:
          "We couldn't read that file. Please use the \"Paste Text\" tab and paste your resume directly.",
      },
      { status: 500 }
    );
  }
}
