/** Pure, importable from client components. Module 0 is free for everyone.
 *  Ground opens Module 1. The full program opens the rest. */
export type CourseProduct = "ground" | "os";

export function canOpen(moduleN: number, access: { product: CourseProduct } | null | undefined): boolean {
  if (moduleN <= 0) return true;
  if (!access) return false;
  if (moduleN === 1) return access.product === "ground" || access.product === "os";
  return access.product === "os";
}
