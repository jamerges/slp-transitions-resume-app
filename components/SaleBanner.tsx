// The site-wide sale strip. Mirrors the Kadence element on slptransitions.com
// (same words, same link) so a reader who crosses from the marketing site to
// the app sees one sale, not two. Renders nothing when SALE.on is false.
import { SALE } from "@/lib/pricing";

export default function SaleBanner() {
  if (!SALE.on) return null;
  return (
    <a href="/products" style={{ display: "block", background: "var(--accent)", color: "#fff", textAlign: "center", padding: "10px 16px", fontSize: 14.5, lineHeight: 1.4, textDecoration: "none", fontWeight: 600 }}>
      Sale: find clarity on your next steps with real career paths <span style={{ opacity: 0.85, fontWeight: 400 }}>&middot; every tool ${SALE.price}, {SALE.note}</span> &rarr;
    </a>
  );
}
