import { PageShell } from "@/components/ui";
import SuccessFlow from "./SuccessFlow";

export const dynamic = "force-dynamic";

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;
  return (
    <PageShell>
      <SuccessFlow sessionId={sessionId} />
    </PageShell>
  );
}
