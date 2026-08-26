import type { MetadataRoute } from "next";
import { SITE, PATH_LIST, GENERATED_AT } from "@/lib/open-roles";

/**
 * Only pages that should rank. /companies is noindex (it points its canonical
 * at the WordPress lead-magnet page), and /report and /success are paid-flow
 * screens, so none of them belong here.
 *
 * lastModified on the job pages comes from the snapshot rather than the build,
 * so a redeploy that ships no new roles does not claim freshness it hasn't got.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/quiz`, changeFrequency: "monthly", priority: 0.9 },
    {
      url: `${SITE}/jobs`,
      lastModified: GENERATED_AT,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { url: `${SITE}/share-your-story`, changeFrequency: "yearly", priority: 0.4 },
    ...PATH_LIST.map((p) => ({
      url: `${SITE}/jobs/${p.slug}`,
      lastModified: GENERATED_AT,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
