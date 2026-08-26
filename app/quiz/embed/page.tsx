import { S } from "@/components/ui";
import CareerQuiz from "@/components/CareerQuiz";
import EmbedAutoHeight from "@/components/EmbedAutoHeight";

// Chrome-free version of the quiz for embedding on slptransitions.com.
// No site header/footer — the parent page already has them.
export const metadata = {
  title: "Career Quiz",
  robots: { index: false, follow: false },
};

export default async function QuizEmbed({
  searchParams,
}: {
  searchParams: Promise<{ path?: string }>;
}) {
  const { path } = await searchParams;
  return (
    <div style={{ ...S.root, minHeight: 0, padding: "0 12px", background: "transparent" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <EmbedAutoHeight messageKey="slpQuizHeight" />
      <div style={{ paddingTop: 8, paddingBottom: 24 }}>
        <CareerQuiz initialPath={path?.toLowerCase() || undefined} embedded />
      </div>
    </div>
  );
}
