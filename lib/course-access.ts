import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { isAccessRevoked } from "./quiz-log";

/**
 * Course access without accounts. A buyer gets a signed link; opening it sets
 * a cookie; the cookie says which product they hold. The token carries the
 * Stripe session id, never an email, so nothing personal sits in a URL.
 *
 * Signed with CRON_SECRET, the same secret the unsubscribe link already uses.
 * Rotating it invalidates every link and cookie; buyers recover from
 * /course/welcome?session_id=… which re-issues from Stripe.
 */
import { canOpen, type CourseProduct } from "./course-tiers";
export { canOpen, type CourseProduct };
export interface CourseAccess { product: CourseProduct; sid: string }

export const ACCESS_COOKIE = "tos_access";
const YEAR = 60 * 60 * 24 * 365;

function secret(): string {
  const s = process.env.CRON_SECRET;
  if (!s) throw new Error("CRON_SECRET is not set");
  return s;
}
const b64u = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const unb64u = (s: string) => Buffer.from(s, "base64url").toString("utf8");

export function signAccess(a: { sid: string; product: CourseProduct; ttlSeconds?: number }): string {
  const payload = b64u(JSON.stringify({ s: a.sid, p: a.product, x: Math.floor(Date.now() / 1000) + (a.ttlSeconds ?? YEAR * 2) }));
  const mac = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${mac}`;
}

export function verifyAccess(token: string | undefined | null): CourseAccess | null {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 1) return null;
  const payload = token.slice(0, i), mac = token.slice(i + 1);
  let expected: string;
  try { expected = createHmac("sha256", secret()).update(payload).digest("hex"); } catch { return null; }
  if (mac.length !== expected.length || !timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    const j = JSON.parse(unb64u(payload)) as { s?: string; p?: string; x?: number };
    if (!j.s || (j.p !== "ground" && j.p !== "os")) return null;
    if (!j.x || j.x < Date.now() / 1000) return null;
    return { product: j.p, sid: j.s };
  } catch { return null; }
}

export function unlockUrl(token: string, base = process.env.NEXT_PUBLIC_APP_URL || "https://app.slptransitions.com"): string {
  return `${base}/course/unlock?k=${encodeURIComponent(token)}`;
}

/** Server-side: what the current request holds. No dev bypass: gating is
 *  tested the way buyers hit it, and a review token can be minted with
 *  signAccess() when someone needs to see the full program without paying. */
export async function getCourseAccess(): Promise<CourseAccess | null> {
  const jar = await cookies();
  const a = verifyAccess(jar.get(ACCESS_COOKIE)?.value);
  if (!a) return null;
  if (await isAccessRevoked(a.sid)) return null;
  return a;
}

export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: YEAR };
