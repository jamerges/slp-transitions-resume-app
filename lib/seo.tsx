// Structured data for the job pages.
//
// Deliberately NOT schema.org/JobPosting. Google requires the full description,
// datePosted, hiringOrganization and jobLocation on a page where the user can
// actually apply, and expects closed postings pulled within about 72 hours.
// These are weekly snapshots of titles and links pointing at other companies'
// applicant tracking systems, so JobPosting markup here would be thin data on
// pages we don't host — the failure mode is a manual action, not a rich result.
//
// CollectionPage + ItemList describes what the pages honestly are: maintained,
// dated lists. Answer engines parse it; search engines won't penalise it.

import { SITE, type Role } from "./open-roles";

const ORG = {
  "@type": "Organization",
  "@id": "https://slptransitions.com/#org",
  name: "SLP Transitions",
  url: "https://slptransitions.com/",
  description:
    "Non-clinical career guidance for speech-language pathologists — sourced salary ranges, honest timelines, and real transition stories.",
};

/** "Company — Title (Location)" reads correctly when quoted out of context. */
const roleName = (r: Role) =>
  `${r.company} — ${r.title}${r.location ? ` (${r.location})` : ""}`;

export function collectionLd(opts: {
  url: string;
  name: string;
  description: string;
  modified: Date;
  items: { name: string; url: string }[];
  breadcrumbs?: { name: string; url: string }[];
}) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "CollectionPage",
      "@id": `${opts.url}#page`,
      url: opts.url,
      name: opts.name,
      description: opts.description,
      dateModified: opts.modified.toISOString(),
      isPartOf: { "@id": `${SITE}/#website` },
      publisher: { "@id": ORG["@id"] },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: opts.items.length,
        itemListOrder: "https://schema.org/ItemListUnordered",
        itemListElement: opts.items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          url: it.url,
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: `${SITE}/`,
      name: "SLP Career Pivot Suite",
      publisher: { "@id": ORG["@id"] },
    },
    ORG,
  ];

  if (opts.breadcrumbs?.length) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: opts.breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: b.url,
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export const roleItems = (roles: Role[]) =>
  roles.map((r) => ({ name: roleName(r), url: r.url }));

/** Next has no <JsonLd>; a script tag in a server component is the way. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
