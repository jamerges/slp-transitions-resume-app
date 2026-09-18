"use client";
// Progress store for Transition OS. localStorage is the working copy for
// everyone; a buyer (access cookie) also syncs it to Redis through
// /api/course/progress, keyed by their Stripe session, so the answers and the
// people list follow them to another browser. Merge rule on load: the newer
// document wins per key, lists are unioned, XP is the max.
import { useCallback, useEffect, useRef, useState } from "react";
import { BADGES, LESSONS, XP_PER_LESSON, XP_PER_ACTION, type BadgeId } from "./course";

export interface Progress {
  startedAt: string | null;
  completed: string[];          // lesson ids, e.g. "1.2"
  actions: string[];            // lesson ids whose action step was done
  xp: number;
  badges: BadgeId[];
  streak: { count: number; last: string | null }; // last = YYYY-MM-DD of last action
  answers: Record<string, unknown>;               // per-lesson saved inputs
  updatedAt?: string;                             // ISO, set on every commit; decides the merge
}

const KEY = "tos:progress:v1";
const EMPTY: Progress = { startedAt: null, completed: [], actions: [], xp: 0, badges: [], streak: { count: 0, last: null }, answers: {} };

const today = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

// 2026-09-17: the verdict lesson moved from 1.2 to 0.3 and "Three things I
// believed" from 0.3 to 0.4. Anything saved under the old ids is renamed on
// load so nobody loses a verdict or an XP badge over a renumbering.
function migrate(p: Progress): Progress {
  const a = p.answers as Record<string, any>;
  // Old "Three things I believed" is a completed 0.3 with no answer (it never
  // saved one); the verdict always saves one, so this cannot match new data.
  const oldThreeLies = p.completed.includes("0.3") && !a["0.3"];
  const oldVerdict = "1.2" in a || p.completed.includes("1.2");
  if (!oldThreeLies && !oldVerdict) return p;
  const ren = (id: string) => (oldThreeLies && id === "0.3" ? "0.4" : oldVerdict && id === "1.2" ? "0.3" : id);
  const answers: Record<string, any> = {};
  for (const [k, v] of Object.entries(a)) answers[ren(k)] = v;
  return { ...p, answers, completed: Array.from(new Set(p.completed.map(ren))), actions: p.actions.map(ren) };
}
function load(): Progress {
  try { const raw = localStorage.getItem(KEY); return raw ? migrate({ ...EMPTY, ...JSON.parse(raw) }) : EMPTY; } catch { return EMPTY; }
}
function save(p: Progress) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode */ } }

/** Two copies of the same person's progress: the newer one is the base, lists are unioned, nothing earned is lost. */
function merge(a: Progress, b: Progress): Progress {
  const newer = (b.updatedAt || "") > (a.updatedAt || "") ? b : a;
  const older = newer === a ? b : a;
  const uniq = <T,>(x: T[], y: T[]) => Array.from(new Set([...x, ...y]));
  const oa = older.answers as Record<string, any>, na = newer.answers as Record<string, any>;
  const answers: Record<string, unknown> = { ...oa, ...na };
  if (oa.__shared || na.__shared) answers.__shared = { ...(oa.__shared || {}), ...(na.__shared || {}) };
  return {
    ...newer,
    startedAt: [older.startedAt, newer.startedAt].filter(Boolean).sort()[0] || null,
    completed: uniq(older.completed, newer.completed),
    actions: uniq(older.actions, newer.actions),
    badges: uniq(older.badges, newer.badges),
    xp: Math.max(older.xp, newer.xp),
    streak: (older.streak.last || "") > (newer.streak.last || "") ? older.streak : newer.streak,
    answers,
  };
}

const ENDPOINT = "/api/course/progress";
function push(p: Progress, beacon = false) {
  const body = JSON.stringify(p);
  if (beacon && typeof navigator !== "undefined" && navigator.sendBeacon) { navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" })); return; }
  fetch(ENDPOINT, { method: "PUT", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => { /* next commit retries */ });
}

/** Streak rule: an action today extends it; one missed day is forgiven; two resets. */
function bumpStreak(s: Progress["streak"]): Progress["streak"] {
  const t = today();
  if (s.last === t) return s;
  if (!s.last) return { count: 1, last: t };
  const gap = daysBetween(s.last, t);
  return { count: gap <= 2 ? s.count + 1 : 1, last: t };
}

export interface Unlock { xp: number; badges: BadgeId[] }

export function useProgress() {
  const [p, setP] = useState<Progress>(EMPTY);
  const [ready, setReady] = useState(false);
  // A ref mirror so complete() can compute the next state synchronously and
  // pay XP exactly once. Doing it inside a setState updater double-paid under
  // React Strict Mode, which runs updaters twice in development.
  const ref = useRef<Progress>(EMPTY);
  // null = not known yet, false = browser only (free visitor, or no store), true = follows the buyer.
  const [synced, setSynced] = useState<boolean | null>(null);
  const syncRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loaded = load(); ref.current = loaded; setP(loaded); setReady(true);
    let cancelled = false;
    fetch(ENDPOINT, { cache: "no-store" }).then(async (r) => {
      if (cancelled || r.status !== 200) { if (!cancelled) setSynced(false); return; }
      const { progress, store } = await r.json();
      if (!store) { setSynced(false); return; }
      syncRef.current = true; setSynced(true);
      const merged = progress ? merge(ref.current, migrate({ ...EMPTY, ...progress })) : ref.current;
      ref.current = merged; setP(merged); save(merged);
      push(merged);
    }).catch(() => { if (!cancelled) setSynced(false); });
    const onHide = () => { if (document.visibilityState === "hidden" && syncRef.current) push(ref.current, true); };
    document.addEventListener("visibilitychange", onHide);
    return () => { cancelled = true; document.removeEventListener("visibilitychange", onHide); };
  }, []);

  const commit = useCallback((next: Progress) => {
    const stamped = { ...next, updatedAt: new Date().toISOString() };
    ref.current = stamped; setP(stamped); save(stamped);
    if (syncRef.current) { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => push(ref.current), 1500); }
  }, []);

  const saveAnswer = useCallback((lessonId: string, value: unknown) => {
    commit({ ...ref.current, answers: { ...ref.current.answers, [lessonId]: value } });
  }, [commit]);

  /** Completing a lesson pays XP once. Completing its action pays more and can unlock a badge. */
  const complete = useCallback((lessonId: string, opts: { action?: boolean } = {}): Unlock => {
    const prev = ref.current;
    const unlock: Unlock = { xp: 0, badges: [] };
    const next: Progress = { ...prev, startedAt: prev.startedAt || new Date().toISOString() };
    if (!next.completed.includes(lessonId)) { next.completed = [...next.completed, lessonId]; unlock.xp += XP_PER_LESSON; }
    if (opts.action && !next.actions.includes(lessonId)) {
      next.actions = [...next.actions, lessonId]; unlock.xp += XP_PER_ACTION; next.streak = bumpStreak(next.streak);
    }
    for (const b of BADGES) {
      if (!next.badges.includes(b.id) && b.when(next)) { next.badges = [...next.badges, b.id]; unlock.badges.push(b.id); unlock.xp += b.xp; }
    }
    next.xp = prev.xp + unlock.xp;
    commit(next);
    return unlock;
  }, [commit]);

  const reset = useCallback(() => commit(EMPTY), [commit]);

  const pct = Math.round((p.completed.length / LESSONS.length) * 100);
  return { p, ready, pct, complete, saveAnswer, reset, synced };
}
