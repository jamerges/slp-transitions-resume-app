import type { Metadata } from "next";
import "./course.css";

// Prototype. Unlisted until the program launches; the sales page lives on
// slptransitions.com, delivery lives here because progress, the Suite and
// the coach already do.
export const metadata: Metadata = {
  title: "Transition OS | SLP Transitions",
  description: "The 90-day guided exit from clinical SLP work.",
  robots: { index: false, follow: false },
};

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
