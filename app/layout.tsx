import type { Metadata } from "next";
import Script from "next/script";
import { GA_ID } from "@/lib/analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "SLP Career Pivot Suite",
  description:
    "Translate your speech-language pathology resume into a non-clinical career hiring managers understand.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://app.slptransitions.com"
  ),
};

// Only report from the deployed app. Without this, local development and
// preview deploys pollute the same property the marketing site reports to.
const GA_ENABLED = process.env.NODE_ENV === "production" && !!GA_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {GA_ENABLED && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
