import { PageShell, S } from "@/components/ui";
import CompaniesDirectory from "@/components/CompaniesDirectory";
import { COMPANIES_DB } from "@/lib/companies";

export const metadata = {
  title: "Companies that hire former SLPs | SLP Transitions",
  description:
    "A searchable list of ed-tech, health-tech, and speech/AAC companies that hire speech-language pathologists into non-clinical roles. Filter by what you'd do and the kind of company.",
  // This is the lead-magnet deliverable. slptransitions.com/ed-health-tech-jobs/
  // is the page that should rank and capture the email; this is what it hands
  // over afterwards, so keep the two from competing in search.
  robots: { index: false, follow: true },
  alternates: { canonical: "https://slptransitions.com/ed-health-tech-jobs/" },
};

export default function CompaniesPage() {
  const total = COMPANIES_DB.length;
  const speech = COMPANIES_DB.filter((c) => c.categories.includes("SLP-Adjacent")).length;

  return (
    <PageShell wide>
      <h1 style={S.h1}>Companies that hire former SLPs</h1>
      <p style={{ ...S.p, marginBottom: 8 }}>
        {total} ed-tech, health-tech, and speech companies, {speech} of them founded or
        staffed by speech-language pathologists. Filter by the kind of work you want to
        do, or search for a condition, product, or setting.
      </p>
      <p style={{ ...S.p, fontSize: 13.5, marginBottom: 28 }}>
        Every card links to the company. Roles listed are the functions each company
        has hired for &mdash; not live openings, so check their careers page for what&rsquo;s
        currently posted.
      </p>

      <CompaniesDirectory companies={COMPANIES_DB} />
    </PageShell>
  );
}
