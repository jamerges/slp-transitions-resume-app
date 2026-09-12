import Dashboard from "@/components/course/Dashboard";
import { getCourseAccess } from "@/lib/course-access";

export const dynamic = "force-dynamic";

export default async function CoursePage() {
  const access = await getCourseAccess();
  return <Dashboard access={access ? { product: access.product } : null} />;
}
