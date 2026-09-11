"use client";
import { S } from "./ui";

export default function PrintButton({ label = "Print or save as PDF" }: { label?: string }) {
  return (
    <button type="button" className="no-print" onClick={() => window.print()} style={{ ...S.btn, padding: "11px 22px", fontSize: 14.5 }}>
      {label}
    </button>
  );
}
