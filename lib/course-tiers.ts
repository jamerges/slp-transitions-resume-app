import { priceOf, LIST } from "./pricing";
/** Pure, importable from client components. Module 0 is free for everyone.
 *  Ground opens Module 1. The full program opens the rest. */
/** "free" is the Module 0 link: it opens nothing paid but carries a stable session id so progress syncs. */
export type CourseProduct = "free" | "ground" | "os";

export function canOpen(moduleN: number, access: { product: CourseProduct } | null | undefined): boolean {
  if (moduleN <= 0) return true;           // the setup is free
  if (!access) return false;
  if (moduleN === 1) return access.product === "ground" || access.product === "os";
  return access.product === "os";
}

/** What the $24 is called where a buyer can see it. "Ground" and "Explore"
 *  stay as the module names inside the course; this is the product. */
export const GROUND_NAME = "Before You Start Looking";
export const GROUND_SUB = "You know you want out but not where to start. Get your reasons in writing before you look at a single job posting.";
/** One place owns the price. $19 sits between the $9 report and the $24 Suite
 *  so the ladder reads at a glance, and it credits in full toward the program:
 *  its job is deposits, not margin. */
export const GROUND_PRICE = priceOf("ground");
/** What Module 1 costs when there is no sale. */
export const GROUND_LIST_PRICE = LIST.ground;
