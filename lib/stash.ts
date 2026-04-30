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

const STRIPE_METADATA_LIMIT = 7000;
const TTL_SECONDS = 60 * 60 * 6;

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
  if (json.length <= STRIPE_METADATA_LIMIT) {
    return { inMetadata: true, payload: json };
  }
  const r = getRedis();
  if (!r) {
    throw new Error(
      "Inputs exceed Stripe metadata limit and Upstash Redis is not configured. Add the Upstash Redis integration in your Vercel project (Storage → Marketplace → Upstash Redis)."
    );
  }
  await r.set(`inputs:${sessionKey}`, json, { ex: TTL_SECONDS });
  return { inMetadata: false, payload: null };
}

export async function retrieveInputs(
  sessionId: string,
  metadataPayload?: string | null
): Promise<StashedInputs | null> {
  if (metadataPayload) {
    try {
      return JSON.parse(metadataPayload) as StashedInputs;
    } catch {
      // fall through
    }
  }
  const r = getRedis();
  if (!r) return null;
  const raw = await r.get<string>(`inputs:${sessionId}`);
  if (!raw) return null;
  if (typeof raw === "string") return JSON.parse(raw);
  return raw as unknown as StashedInputs;
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
