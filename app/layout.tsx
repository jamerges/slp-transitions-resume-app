import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SLP Career Pivot Suite",
  description:
    "Translate your speech-language pathology resume into a non-clinical career hiring managers understand.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://app.slptransitions.com"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
