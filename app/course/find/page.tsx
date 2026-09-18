import FindCourse from "@/components/course/FindCourse";

export const metadata = { title: "Find your course link | Transition OS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function Page() { return <FindCourse />; }
