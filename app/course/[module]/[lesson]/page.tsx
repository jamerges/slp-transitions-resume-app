import { notFound, redirect } from "next/navigation";
import LessonPage from "@/components/course/LessonPage";
import LockedLesson from "@/components/course/Locked";
import { lessonById, moduleOf, MERGED_INTO } from "@/lib/course";
import { getCourseAccess } from "@/lib/course-access";
import { canOpenLesson } from "@/lib/course-tiers";

// Access comes from a cookie, so every lesson renders per request.
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ module: string; lesson: string }> }) {
  const { module: slug, lesson } = await params;
  // A lesson that was merged into another: send old links and bookmarks to it.
  const moved = MERGED_INTO[lesson] && lessonById(MERGED_INTO[lesson]);
  if (moved) redirect(`/course/${moduleOf(moved).slug}/${moved.id}`);
  const l = lessonById(lesson);
  if (!l || moduleOf(l).slug !== slug || !moduleOf(l).built) notFound();
  const m = moduleOf(l);
  const access = await getCourseAccess();
  if (!canOpenLesson(l.id, m.n, access)) return <LockedLesson moduleN={m.n} moduleTitle={m.title} lessonTitle={l.title} lessonId={l.id} owns={access?.product ?? null} />;
  return <LessonPage id={lesson} access={access ? { product: access.product } : null} />;
}
