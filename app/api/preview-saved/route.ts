import { NextResponse } from "next/server";
import { rateLimit, retrievePreview } from "@/lib/stash";

export const runtime = "nodejs";

/**
 * Reopens a free Suite preview from the link in its email (/?preview=<id>).
 * The id is 128 random bits and is the only credential, the same model as
 * /?continue=<stripe session>. Saved previews last 7 days (lib/stash.ts).
 */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("k") || "";
  if (!/^[a-f0-9]{32}$/.test(id)) {
    return NextResponse.json({ error: "expired" }, { status: 404 });
  }
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (!(await rateLimit(`previewsaved:${ip}`, 30, 3600))) {
    return NextResponse.json({ error: "Too many tries. Give it a few minutes." }, { status: 429 });
  }
  try {
    const saved = await retrievePreview(id);
    if (!saved?.preview || !saved.inputs?.resumeText) {
      return NextResponse.json({ error: "expired" }, { status: 404 });
    }
    return NextResponse.json(
      { inputs: saved.inputs, preview: saved.preview },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("[/api/preview-saved]", e);
    return NextResponse.json({ error: "expired" }, { status: 404 });
  }
}
