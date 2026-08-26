import type { Metadata } from "next";
import { PageShell, S } from "@/components/ui";
import StoryForm from "@/components/StoryForm";
import { SITE } from "@/lib/open-roles";

export const metadata: Metadata = {
  title: "Share your SLP transition story | SLP Transitions",
  description:
    "Left clinical speech-language pathology for something else? Tell James what you did, what you do now, and how long it took — interviews on SLP Transitions come from these.",
  alternates: { canonical: `${SITE}/share-your-story` },
};

export default function ShareYourStoryPage() {
  return (
    <PageShell>
      <h1 style={S.h1}>Share your story</h1>
      <p style={{ ...S.p, marginBottom: 8 }}>
        Every interview on this site started with someone filling in something like
        this. If you left clinical work &mdash; or you&rsquo;re partway out &mdash; the
        details below are what I need to know whether your story fits a piece.
      </p>
      <p style={{ ...S.p, marginBottom: 30 }}>
        You don&rsquo;t need a dramatic arc or a big title. The transitions readers
        find most useful are the ordinary ones: a normal caseload, a lateral move, a
        realistic timeline.
      </p>

      <StoryForm />
    </PageShell>
  );
}
