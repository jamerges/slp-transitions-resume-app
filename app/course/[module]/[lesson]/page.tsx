import { notFound } from "next/navigation";
import LessonPage from "@/components/course/LessonPage";
import LockedLesson from "@/components/course/Locked";
import { lessonById, moduleOf } from "@/lib/course";
import { getCourseAccess, canOpen } from "@/lib/course-access";

// Access comes from a cookie, so every lesson renders per request.
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ module: string; lesson: string }> }) {
  const { module: slug, lesson } = await params;
  const l = lessonById(lesson);
  if (!l || moduleOf(l).slug !== slug || !moduleOf(l).built) notFound();
  const m = moduleOf(l);
  const access = await getCourseAccess();
  if (!canOpen(m.n, access)) return <LockedLesson moduleN={m.n} moduleTitle={m.title} lessonTitle={l.title} owns={access?.product ?? null} />;
  return <LessonPage id={lesson} access={access ? { product: access.product } : null} />;
}
