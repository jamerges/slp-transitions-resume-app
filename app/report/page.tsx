import { PageShell } from "@/components/ui";
import ReportFlow from "./ReportFlow";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  return (
    <PageShell>
      <ReportFlow sessionId={sessionId} />
    </PageShell>
  );
}
