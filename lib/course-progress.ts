"use client";
// Prototype progress store for Transition OS. localStorage only; the real
// build swaps this for Redis behind a magic-link session. The shape is the
// contract: keep it stable so the swap is a transport change, not a rewrite.
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
  useEffect(() => { const loaded = load(); ref.current = loaded; setP(loaded); setReady(true); }, []);

  const commit = useCallback((next: Progress) => { ref.current = next; setP(next); save(next); }, []);

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
  return { p, ready, pct, complete, saveAnswer, reset };
}
