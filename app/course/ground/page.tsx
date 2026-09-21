import GroundBuy from "@/components/course/GroundBuy";
import { GROUND_PRICE } from "@/lib/course-tiers";
import { getCourseAccess } from "@/lib/course-access";
export const metadata = {
  title: "Getting Started for SLPs | SLP Transitions",
  description: `The first month of Transition OS in one kit: your reasons in writing, the people who already made the move, and the r\u00e9sum\u00e9 pass. Twelve lessons, the workbook, $${GROUND_PRICE} once.`,
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
