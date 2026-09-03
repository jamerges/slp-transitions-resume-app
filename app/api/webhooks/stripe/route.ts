/**
 * Stripe's live endpoint ("SLP Transitions Production", we_1TzOkiKyPrmclvwm…)
 * was registered at THIS path in April, back when it only logged events. The
 * server-side fulfilment handler shipped on 2026-08-15 at /api/webhooks — a
 * different path — and Stripe was never repointed, so for three weeks every
 * sale hit the logger, got a 200, and fulfilment stayed dependent on the
 * buyer's browser tab surviving. Seven real sales, zero ops alerts.
 *
 * Rather than edit the Stripe endpoint (an account-settings change that also
 * risks the signing secret), this path now IS the fulfilment handler.
 *
 * Segment config must be a literal export in this file — Next.js refuses to
 * resolve it through a re-export, which is what broke the first deploy.
 * Keep these in step with ../route.ts.
 */
export const runtime = "nodejs";
export const maxDuration = 300;

export { POST } from "../route";
