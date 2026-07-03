import { PageShell } from "@/components/ui";
import SuccessFlow from "./SuccessFlow";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  return (
    <PageShell>
      <SuccessFlow sessionId={sessionId} />
    </PageShell>
  );
}
