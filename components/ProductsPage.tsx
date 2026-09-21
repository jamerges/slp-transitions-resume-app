"use client";
// Where the sale banner lands: the three tools, one price, one payment each.
// Prices and positioning come from ProductMenu and lib/pricing so this page
// can never disagree with the quiz result or the course page.
import { PageShell, S } from "./ui";
import ProductMenu, { PRODUCTS, type ProductKey } from "./ProductMenu";
import { SALE, LIST } from "@/lib/pricing";
import { track } from "@/lib/analytics";

const HREF: Record<ProductKey, string> = { ground: "/course", report: "/quiz", suite: "/" };

export default function ProductsPage() {
  return (
    <PageShell>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {SALE.on && <div style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", background: "var(--accent-bg-subtle)", borderRadius: 999, padding: "4px 12px", marginBottom: 12 }}>Sale &middot; {SALE.note}</div>}
        <h1 style={{ ...S.h1, marginBottom: 8 }}>{SALE.on ? `Every tool is $${SALE.price}` : "The tools"}</h1>
        <p style={{ ...S.p, fontSize: 17, marginBottom: 6 }}>Find clarity on your next steps with real career paths: twenty documented ones, with what each pays and how long the move takes.</p>
        {SALE.on && <p style={{ ...S.p, color: "var(--muted)", marginBottom: 22 }}>Usually ${LIST.report}, ${LIST.ground} and ${LIST.suite}. One payment each, no subscription, and a thirty-day refund by replying to one email.</p>}
        <ProductMenu
          order={["ground", "report", "suite"]}
          heading="Pick the one that matches where you are"
          onPick={(k) => track("select_item", { item_list_id: "products_page", item_list_name: "Products page", items: [{ item_id: k, item_name: PRODUCTS[k].name, price: PRODUCTS[k].price, quantity: 1 }], placement: "products_page" })}
          hrefFor={(k) => HREF[k]}
        />
      </div>
    </PageShell>
  );
}
