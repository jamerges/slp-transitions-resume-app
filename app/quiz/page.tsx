import { PageShell, S } from "@/components/ui";
import CareerQuiz from "@/components/CareerQuiz";

export const metadata = {
  title: "Which non-clinical career fits you? | SLP Transitions",
  description:
    "A 2-minute quiz for SLPs considering a non-clinical move. Built on documented transitions — real salary ranges, real timelines, honest caveats.",
  // slptransitions.com/career-quiz/ is the page we want ranking for quiz
  // queries — it has the domain authority and internal links. This is the
  // tool it sends people to, so keep the two from competing.
  robots: { index: false, follow: true },
  alternates: { canonical: "https://slptransitions.com/career-quiz/" },
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
      {/* The intro lives inside CareerQuiz so it disappears once there's a
          result — by then they've taken the quiz and just want the answer. */}
      <CareerQuiz initialPath={initialPath} showIntro={!initialPath} />
    </PageShell>
  );
}
