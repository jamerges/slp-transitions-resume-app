import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

// Fetching a user-supplied URL server-side is an SSRF risk, so we allow only
// public http(s) hosts and refuse anything that resolves to internal space.
const BLOCKED_HOST = /^(localhost|127\.|0\.|10\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?|.*\.internal|.*\.local)$/i;

function isSafeUrl(raw: string): URL | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  if (BLOCKED_HOST.test(u.hostname)) return null;
  // Bare IPv4 literals are never legitimate job boards.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname)) return null;
  return u;
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|tr|section)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractTitle(html: string): string {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i);
  if (og) return og[1].trim().slice(0, 120);
  const t = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (t) return t[1].split(/[|\-–—]/)[0].trim().slice(0, 120);
  return "";
}

// Job posts talk about job things. Landing pages and login walls don't.
function looksLikeJobPost(text: string): boolean {
  if (text.length < 400) return false;
  const signals = [
    "responsibilit", "qualification", "requirement", "you'll", "you will",
    "experience", "we're looking", "we are looking", "role", "team", "benefits",
    "skills", "about the job", "what you", "apply",
  ];
  const low = text.toLowerCase();
  return signals.filter((s) => low.includes(s)).length >= 4;
}

const CANT_READ =
  "We couldn't read that link — many job boards (LinkedIn and Indeed especially) block automated readers. Please copy the job description text and paste it instead.";

export async function POST(req: Request) {
  try {
    const { url } = (await req.json()) as { url?: string };
    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

    const safe = isSafeUrl(url.trim());
    if (!safe) {
      return NextResponse.json(
        { error: "That doesn't look like a valid public job link. Paste the description instead." },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    let resp: Response;
    try {
      resp = await fetch(safe.toString(), {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
    } finally {
      clearTimeout(timer);
    }

    if (!resp.ok) return NextResponse.json({ error: CANT_READ }, { status: 422 });
    const ctype = resp.headers.get("content-type") || "";
    if (!ctype.includes("html") && !ctype.includes("text")) {
      return NextResponse.json({ error: CANT_READ }, { status: 422 });
    }

    const html = (await resp.text()).slice(0, 1_500_000);
    const text = htmlToText(html).slice(0, 12000);
    if (!looksLikeJobPost(text)) {
      return NextResponse.json({ error: CANT_READ }, { status: 422 });
    }

    return NextResponse.json({ text, title: extractTitle(html), words: text.split(/\s+/).length });
  } catch (err: any) {
    console.error("[/api/fetch-job]", err?.message);
    return NextResponse.json({ error: CANT_READ }, { status: 500 });
  }
}
