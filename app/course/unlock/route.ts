import { NextResponse } from "next/server";
import { verifyAccess, ACCESS_COOKIE, cookieOptions } from "@/lib/course-access";

/** The link in the access email. Verifies the token, sets the cookie, lands on the quest log. */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const token = u.searchParams.get("k") || "";
  const access = verifyAccess(token);
  if (!access) return NextResponse.redirect(new URL("/course/ground?link=invalid", u.origin));
  const res = NextResponse.redirect(new URL("/course?unlocked=1", u.origin));
  res.cookies.set(ACCESS_COOKIE, token, cookieOptions);
  return res;
}
