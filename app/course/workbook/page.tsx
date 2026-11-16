import { redirect } from "next/navigation";
import MyWorkbook from "@/components/course/MyWorkbook";
import { getCourseAccess } from "@/lib/course-access";
import type { CourseProduct } from "@/lib/course-tiers";

export const metadata = { title: "Your workbook | Transition OS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ blank?: string; as?: string; print?: string }> }) {
  const sp = await searchParams;
  // Same gate as the lessons: the workbook is part of what was bought. A visitor
  // lands on the product page rather than a bare 404, because the free lesson 0.2
  // links here and a 404 is a dead end at the curious moment.
  const access = await getCourseAccess();
  let product: CourseProduct | undefined = access?.product;
  // Development only: scripts/workbook-render/render.sh prints the blank PDFs from
  // this page, and a headless browser has no access cookie to send.
  if (process.env.NODE_ENV === "development" && (sp.as === "os" || sp.as === "ground")) product = sp.as;
  if (!product) redirect("/course/ground");
  return <MyWorkbook product={product} blank={sp.blank === "1"} printPreview={sp.print === "1"} />;
}
