import { S } from "@/components/ui";
import StoryForm from "@/components/StoryForm";
import EmbedAutoHeight from "@/components/EmbedAutoHeight";

// Chrome-free version of the story form, embedded on slptransitions.com/about.
// No site header/footer and no intro copy — the parent page already has both.
export const metadata = {
  title: "Share your story",
  robots: { index: false, follow: false },
};

export default function StoryEmbed() {
  return (
    <div
      style={{
        ...S.root,
        minHeight: 0,
        padding: "0 4px",
        background: "transparent",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <EmbedAutoHeight messageKey="slpStoryHeight" />
      <div style={{ maxWidth: 680, paddingTop: 4, paddingBottom: 16 }}>
        <StoryForm />
      </div>
    </div>
  );
}
