import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const apiKey = process.env.MAILERLITE_API_KEY;
    const groupId = process.env.MAILERLITE_GROUP_ID;
    if (!apiKey || !groupId) {
      console.warn("[/api/subscribe] MailerLite not configured; skipping");
      return NextResponse.json({ ok: true, skipped: true });
    }

    const resp = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ email, groups: [groupId] }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("[/api/subscribe] MailerLite error", resp.status, text.slice(0, 300));
      return NextResponse.json({ ok: true, mailerlite_error: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[/api/subscribe]", err);
    return NextResponse.json({ ok: true, error: err?.message });
  }
}
