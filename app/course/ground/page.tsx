import GroundBuy from "@/components/course/GroundBuy";
import { getCourseAccess } from "@/lib/course-access";
export const metadata = {
  title: "Before You Start Looking | SLP Transitions",
  description: "Modules 1 and 2 of Transition OS: whether you're actually leaving, what you're protecting if you are, and which of the twenty paths fit. Fifteen lessons, $24 once.",
  robots: { index: false, follow: true },
};
export default async function GroundPage({ searchParams }: { searchParams: Promise<{ stage?: string; path?: string; canceled?: string; link?: string; live?: string }> }) {
  const p = await searchParams;
  const access = await getCourseAccess();
  // Live only once the price id exists in the environment; until then the page
  // takes an email instead of showing a button that would fail at checkout.
  const live = !!process.env.STRIPE_GROUND_PRICE_ID && !(process.env.NODE_ENV === "development" && p.live === "0");
  return <GroundBuy stage={p.stage || ""} path={p.path || ""} canceled={p.canceled === "1"} badLink={p.link === "invalid"} alreadyHas={!!access} live={live} />;
}
