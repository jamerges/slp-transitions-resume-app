import { notFound } from "next/navigation";
import MyWorkbook from "@/components/course/MyWorkbook";
import { getCourseAccess } from "@/lib/course-access";

export const metadata = { title: "Your workbook | Transition OS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  // Same gate as the lessons: the filled workbook is part of what was bought.
  if (!(await getCourseAccess())) notFound();
  return <MyWorkbook />;
}
