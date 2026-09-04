// The weekly job snapshot, read by /jobs, the /jobs/<path> pages, and the
// sitemap. scripts/job_digest.py writes open-roles.json; nothing here should
// reach past that file for job data.

import snapshot from "./open-roles.json";
import { PATHS, type QuizPath } from "./quiz";

export interface Role {
  company: string;
  title: string;
  location: string;
  url: string;
  remote: boolean;
  path: string;
}

interface Snapshot {
  generated: string;
  scanned: number;
  paths: { slug: string; label: string }[];
  roles: Role[];
}

const snap = snapshot as Snapshot;

export const ROLES: Role[] = snap.roles;
export const PATH_LIST = snap.paths;
export const GENERATED = snap.generated;
export const SCANNED = snap.scanned;

export const SITE =
  process.env.NEXT_PUBLIC_APP_URL || "https://app.slptransitions.com";

/** Midday UTC so the date never slips a day either side of the line. */
export const GENERATED_AT = new Date(`${GENERATED}T12:00:00Z`);

export const formatUpdated = (d: Date = GENERATED_AT) =>
  d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

/** Days since the snapshot was written — the page says so once it goes stale. */
export const snapshotAgeDays = (now = new Date()) =>
  Math.floor((now.getTime() - GENERATED_AT.getTime()) / 86_400_000);

export const rolesFor = (slug: string) => ROLES.filter((r) => r.path === slug);

/**
 * Every path page is a quiz path. The slugs are the same list on purpose —
 * see the coupling note in CLAUDE.md — so a path that exists in one and not
 * the other is a bug, not a state to render around.
 */
export function pathInfo(slug: string): QuizPath | undefined {
  return PATHS[slug];
}

export const remoteCount = (rs: Role[] = ROLES) => rs.filter((r) => r.remote).length;
export const companyCount = (rs: Role[] = ROLES) =>
  new Set(rs.map((r) => r.company)).size;
