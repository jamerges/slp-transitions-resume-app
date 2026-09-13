import { redirect } from "next/navigation";
import MyWorkbook from "@/components/course/MyWorkbook";
import { getCourseAccess } from "@/lib/course-access";

export const metadata = { title: "Your workbook | Transition OS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  // Same gate as the lessons: the filled workbook is part of what was bought.
  // A visitor lands on the product page rather than a bare 404, because the
  // free lesson 0.2 links here and a 404 is a dead end at the curious moment.
  if (!(await getCourseAccess())) redirect("/course/ground");
  return <MyWorkbook />;
}
