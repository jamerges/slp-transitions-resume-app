import type { MetadataRoute } from "next";
import { SITE } from "@/lib/open-roles";

// Paid-flow pages and the API. /companies is deliberately absent: it carries a
// noindex meta tag, and a crawler blocked here would never read it.
const OFF_LIMITS = ["/api/", "/report", "/success"];

/**
 * Answer engines are allowed. Being cited in an AI answer is the same
 * distribution bet as ranking, and these pages exist to be quoted: sourced
 * salary bands, honest timelines, named companies.
 *
 * To reverse it, move a name into BLOCKED. Google-Extended governs Gemini and
 * AI Overviews grounding and is separate from Googlebot, so blocking it costs
 * nothing in ordinary search.
 */
const ANSWER_ENGINES = [
  "GPTBot", // ChatGPT browsing + training
  "OAI-SearchBot", // ChatGPT search results
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "cohere-ai",
];
const BLOCKED: string[] = [];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: OFF_LIMITS },
      // A named agent stops reading the "*" rule entirely, so the same
      // exclusions have to be repeated for each one.
      ...ANSWER_ENGINES.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: OFF_LIMITS,
      })),
      ...BLOCKED.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
