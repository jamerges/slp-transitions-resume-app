/**
 * Thin GA4 wrapper.
 *
 * The marketing site (slptransitions.com) has had GA4 since launch, but the
 * app had none — so every reader who clicked through to the quiz disappeared
 * from analytics at exactly the point where the funnel gets interesting.
 * Both now report to the SAME measurement id, and because they share a root
 * domain GA stitches the session, so blog → quiz → checkout is one journey.
 *
 * NEVER pass PII here. This app handles resumes and email addresses; event
 * params are limited to non-identifying things like a path slug and a price.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-PNHZM7J56D";

/** Fire-and-forget. Silent when GA is blocked, absent, or server-side, because
 *  an analytics failure must never break a checkout. */
export function track(event: string, params: Record<string, unknown> = {}): void {
  try {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("event", event, params);
  } catch {
    /* analytics is not worth an exception */
  }
}
