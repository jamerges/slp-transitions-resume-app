import { PageShell } from "@/components/ui";
import StoryForm from "@/components/StoryForm";

export const metadata = {
  title: "Share your transition story | SLP Transitions",
  description: "Landed a job outside the clinic? Tell the SLP who's still where you were how you did it.",
  // slptransitions.com/share-your-story/ is the address people are given; keep the two from competing.
  robots: { index: false, follow: true },
  alternates: { canonical: "https://slptransitions.com/share-your-story/" },
};

export default function SharePage() {
  return (
    <PageShell>
      <StoryForm />
    </PageShell>
  );
}
