import { S } from "@/components/ui";
import StoryForm from "@/components/StoryForm";
import EmbedAutoHeight from "@/components/EmbedAutoHeight";

// Chrome-free version of the story form for slptransitions.com/share-your-story/.
export const metadata = {
  title: "Share your story",
  robots: { index: false, follow: false },
};

export default function ShareEmbed() {
  return (
    <div style={{ ...S.root, minHeight: 0, padding: "0 12px", background: "transparent" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <EmbedAutoHeight messageKey="slpStoryHeight" />
      <div style={{ paddingTop: 8, paddingBottom: 24 }}>
        <StoryForm />
      </div>
    </div>
  );
}
