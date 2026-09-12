import GroundWelcome from "@/components/course/GroundWelcome";
export const metadata = { title: "You're in | Transition OS", robots: { index: false, follow: false } };
export default async function Welcome({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  return <GroundWelcome sessionId={session_id || ""} />;
}
