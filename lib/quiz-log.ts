import { Redis } from "@upstash/redis";
import { createHmac } from "crypto";

/**
 * Our own record of quiz completions, so follow-ups can be timed from the
 * actual completion rather than MailerLite's subscribed_at (which is the date
 * someone first joined the LIST — wrong for anyone who was on it before they
 * took the quiz). Also the opt-out and customer flags the follow-up cron
 * checks before sending anything.
 */

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

const KEY = "quiz:completions";
export interface Completion { email: string; slug: string; name?: string; ts: number }

export async function recordQuizCompletion(email: string, slug: string, name?: string): Promise<void> {
  const r = getRedis(); if (!r) return;
  const ts = Date.now();
  const member = JSON.stringify({ e: email.toLowerCase(), s: slug, n: name || "" });
  await r.zadd(KEY, { score: ts, member });
}

/** Completions whose timestamp falls in [fromMs, toMs]. */
export async function completionsBetween(fromMs: number, toMs: number): Promise<Completion[]> {
  const r = getRedis(); if (!r) return [];
  const rows = (await r.zrange(KEY, fromMs, toMs, { byScore: true, withScores: true })) as (string | number)[];
  const out: Completion[] = [];
  for (let i = 0; i + 1 < rows.length; i += 2) {
    try {
      const m = JSON.parse(String(rows[i]));
      out.push({ email: m.e, slug: m.s, name: m.n || undefined, ts: Number(rows[i + 1]) });
    } catch { /* skip malformed */ }
  }
  return out;
}

export async function isUnsubscribed(email: string): Promise<boolean> {
  const r = getRedis(); if (!r) return false;
  return !!(await r.get(`unsub:${email.toLowerCase()}`));
}
export async function markUnsubscribed(email: string): Promise<void> {
  const r = getRedis(); if (!r) return;
  await r.set(`unsub:${email.toLowerCase()}`, "1");
}
export async function isCustomer(email: string): Promise<boolean> {
  const r = getRedis(); if (!r) return false;
  return !!(await r.get(`customer:${email.toLowerCase()}`));
}
export async function markCustomer(email: string): Promise<void> {
  const r = getRedis(); if (!r) return;
  await r.set(`customer:${email.toLowerCase()}`, "1");
}

/** Signed opt-out link. Keyed on CRON_SECRET so no extra env var is needed. */
export function unsubToken(email: string): string {
  const secret = process.env.CRON_SECRET || "";
  return createHmac("sha256", secret).update(email.toLowerCase()).digest("hex").slice(0, 32);
}
export function unsubUrl(email: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://app.slptransitions.com";
  return `${base}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubToken(email)}`;
}
