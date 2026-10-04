import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { adsenseClient, googleSiteVerification, site } from "@/lib/site";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Toolora — Calculators, converters and small web tools",
    template: "%s | Toolora",
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Toolora — Calculators, converters and small web tools",
    description: site.description,
    type: "website",
    locale: "en_US",
    siteName: site.name,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolora — Calculators, converters and small web tools",
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: googleSiteVerification ? { google: googleSiteVerification } : undefined,
  other: adsenseClient ? { "google-adsense-account": adsenseClient } : undefined,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full bg-canvas font-sans text-ink">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: site.name,
            url: site.url,
            description: site.description,
            potentialAction: {
              "@type": "SearchAction",
              target: `${site.url}/tools?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: site.name,
            url: site.url,
            email: site.email,
          }}
        />
        <AdSenseScript />
        <SiteShell>{children}</SiteShell>
        <CookieBanner />
      </body>
    </html>
  );
}
