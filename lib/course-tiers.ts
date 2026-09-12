/** Pure, importable from client components. Module 0 is free for everyone.
 *  Ground opens Module 1. The full program opens the rest. */
export type CourseProduct = "ground" | "os";

export function canOpen(moduleN: number, access: { product: CourseProduct } | null | undefined): boolean {
  if (moduleN <= 0) return true;           // the setup is free
  if (!access) return false;
  if (moduleN <= 2) return access.product === "ground" || access.product === "os";
  return access.product === "os";
}

/** What the $24 is called where a buyer can see it. "Ground" and "Explore"
 *  stay as the module names inside the course; this is the product. */
export const GROUND_NAME = "Before You Start Looking";
export const GROUND_SUB = "Bad workplace, bad fit, or bad season, what gave you energy, and which of the twenty paths actually fit.";
