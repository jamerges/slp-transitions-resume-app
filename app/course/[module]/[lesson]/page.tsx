import { notFound } from "next/navigation";
import LessonPage from "@/components/course/LessonPage";
import { MODULES, lessonById, moduleOf } from "@/lib/course";

export function generateStaticParams() {
  return MODULES.filter((m) => m.built).flatMap((m) => m.lessons.map((l) => ({ module: m.slug, lesson: l.id })));
}

export default async function Page({ params }: { params: Promise<{ module: string; lesson: string }> }) {
  const { module: slug, lesson } = await params;
  const l = lessonById(lesson);
  if (!l || moduleOf(l).slug !== slug || !moduleOf(l).built) notFound();
  return <LessonPage id={lesson} />;
}
