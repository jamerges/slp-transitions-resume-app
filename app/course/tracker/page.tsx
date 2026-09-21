import Lists from "@/components/course/Lists";
import LockedLesson from "@/components/course/Locked";
import { getCourseAccess, canOpen } from "@/lib/course-access";

export const metadata = { title: "Your people and applications | Transition OS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  // Same gate as Module 3, where the lists start: a Ground owner sees the
  // "not open yet" page rather than a sales page for something they own.
  const access = await getCourseAccess();
  if (!canOpen(3, access) && access?.product !== "ground") return <LockedLesson moduleN={3} moduleTitle="Connect" lessonTitle="Your people and applications" owns={access?.product ?? null} />;
  return <Lists />;
}
