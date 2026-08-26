import { Redis } from "@upstash/redis";
import type { UserGoals } from "./prompts";

export interface StashedInputs {
  resumeText: string;
  jobTitle: string;
  jobDesc: string;
  goals: UserGoals;
  email: string;
  writingSample?: string;
}

// Stripe caps each individual metadata VALUE at 500 characters — not the
// total metadata size. Since the whole payload is stored under one key
// ("payload"), this is effectively the real ceiling. Leave a safety margin.
const STRIPE_METADATA_VALUE_LIMIT = 450;
// Paying customers commonly target 2-3 roles over several days, so results and
// inputs need to outlive a single sitting. 7 days covers "come back this week"
// without holding resume text indefinitely.
const TTL_SECONDS = 60 * 60 * 24 * 7;

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

export async function stashInputs(
  sessionKey: string,
  inputs: StashedInputs
): Promise<{ inMetadata: boolean; payload: string | null }> {
  const json = JSON.stringify(inputs);
  if (json.length <= STRIPE_METADATA_VALUE_LIMIT) {
    return { inMetadata: true, payload: json };
  }
  const r = getRedis();
  if (!r) {
    throw new Error(
      "Inputs are too large for Stripe metadata (500-char limit per value) and Upstash Redis is not configured. Add the Upstash Redis integration in your Vercel project (Storage → Marketplace → Upstash Redis)."
    );
  }
  await r.set(`inputs:${sessionKey}`, json, { ex: TTL_SECONDS });
  return { inMetadata: false, payload: null };
}

// Redis is checked FIRST and metadata is only the fallback. Quiz buyers check
// out with a tiny payload (no resume) that fits in Stripe metadata, then add
// their resume afterwards via updateInputs — which can only write to Redis,
// since a session's metadata is frozen once created. Reading metadata first
// would hand back the pre-resume copy forever.
export async function retrieveInputs(
  sessionId: string,
  metadataPayload?: string | null
): Promise<StashedInputs | null> {
  const r = getRedis();
  if (r) {
    const raw = await r.get<string>(`inputs:${sessionId}`);
    if (raw) return typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as StashedInputs);
  }
  if (metadataPayload) {
    try {
      return JSON.parse(metadataPayload) as StashedInputs;
    } catch {
      // fall through
    }
  }
  return null;
}

/** Overwrite a stashed payload after checkout (used to attach the resume that
 *  quiz buyers supply on /report). Always Redis — metadata is immutable. */
export async function updateInputs(
  sessionKey: string,
  inputs: StashedInputs
): Promise<void> {
  const r = getRedis();
  if (!r) {
    throw new Error(
      "Upstash Redis is not configured, so we can't save your resume against this purchase. Email hello@slptransitions.com with your receipt and we'll generate your report manually."
    );
  }
  await r.set(`inputs:${sessionKey}`, JSON.stringify(inputs), { ex: TTL_SECONDS });
}

/**
 * Returns true only for the first caller with this key — a one-shot latch for
 * side effects that must not repeat on page refresh (e.g. the "add your resume"
 * email). Returns false when Redis is unavailable, so a missing cache degrades
 * to not-sending rather than sending on every reload.
 */
export async function claimOnce(key: string): Promise<boolean> {
  const r = getRedis();
  if (!r) return false;
  const res = await r.set(`once:${key}`, "1", { nx: true, ex: TTL_SECONDS });
  return res === "OK";
}

/**
 * Fixed-window rate limit. Allows the request when Redis is unavailable —
 * local dev has no Upstash, and a public form that refuses everything because
 * a cache is missing is worse than one that occasionally lets a bot through.
 * The honeypot and timing checks are the real defence; this caps the blast.
 */
export async function rateLimit(
  key: string,
  max: number,
  windowSeconds: number
): Promise<boolean> {
  const r = getRedis();
  if (!r) return true;
  try {
    const n = await r.incr(`rl:${key}`);
    if (n === 1) await r.expire(`rl:${key}`, windowSeconds);
    return n <= max;
  } catch {
    return true;
  }
}

export async function stashResult(sessionId: string, result: any): Promise<void> {
  const r = getRedis();
  if (!r) return;
  await r.set(`result:${sessionId}`, JSON.stringify(result), { ex: TTL_SECONDS });
}

export async function retrieveResult(sessionId: string): Promise<any | null> {
  const r = getRedis();
  if (!r) return null;
  const raw = await r.get<string>(`result:${sessionId}`);
  if (!raw) return null;
  if (typeof raw === "string") return JSON.parse(raw);
  return raw;
}
