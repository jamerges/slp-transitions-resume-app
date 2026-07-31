import { PageShell, S } from "@/components/ui";
import CareerQuiz from "@/components/CareerQuiz";

export const metadata = {
  title: "Which non-clinical career fits you? | SLP Transitions",
  description:
    "A 2-minute quiz for SLPs considering a non-clinical move. Built on documented transitions — real salary ranges, real timelines, honest caveats.",
};

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string; result?: string }>;
}) {
  const params = await searchParams;
  const initialPath = (params.path || params.result || "").toLowerCase() || undefined;

  return (
    <PageShell>
      {!initialPath && (
        <div style={{ ...S.wrap, textAlign: "center", paddingBottom: 8 }}>
          <h1 style={{ ...S.h1, fontSize: 30 }}>Which direction actually fits you?</h1>
          <p style={{ ...S.p, maxWidth: 520, margin: "0 auto 24px" }}>
            Eight questions, about two minutes. Built from documented SLP transitions — so you'll get real
            salary ranges, real timelines, and the honest catch for whichever path comes up.
          </p>
        </div>
      )}
      <CareerQuiz initialPath={initialPath} />
    </PageShell>
  );
}
