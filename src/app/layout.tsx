import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";

import { SiteShell } from "@/components/site-shell";
import { getCurrentAdminSession } from "@/lib/auth";
import { getPublicSiteData } from "@/lib/site-repository";
import { SiteStoreProvider } from "@/providers/site-store";

import "./globals.css";

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lacasadelpanal.com";

export const metadata: Metadata = {
  title: "La Casa del Pañal | Pañales y cuidado diario en El Salvador",
  description:
    "Compra pañales para bebé y adulto, toallitas, protectores y productos de cuidado diario con atención rápida en El Salvador.",
  keywords: [
    "pañales en El Salvador",
    "pañales para bebé en El Salvador",
    "pañales para adulto en El Salvador",
    "toallitas húmedas El Salvador",
    "La Casa del Pañal",
    "tienda de pañales en El Salvador",
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "La Casa del Pañal | Pañales y cuidado diario en El Salvador",
    description:
      "Tienda online de pañales para bebé y adulto, toallitas y productos de cuidado diario en El Salvador.",
    url: siteUrl,
    siteName: "La Casa del Pañal",
    locale: "es_SV",
    type: "website",
    images: [
      {
        url: `${basePath}/brand/logo-casa-del-panal.png`,
        width: 512,
        height: 512,
        alt: "La Casa del Pañal El Salvador",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "La Casa del Pañal | Pañales y cuidado diario en El Salvador",
    description:
      "Compra pañales para bebé y adulto, toallitas y más con atención rápida en El Salvador.",
    images: [`${basePath}/brand/logo-casa-del-panal.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: `${basePath}/icon.png`, type: "image/png" }],
    shortcut: [`${basePath}/icon.png`],
    apple: [{ url: `${basePath}/apple-icon.png`, type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [initialData, session] = await Promise.all([getPublicSiteData(), getCurrentAdminSession()]);
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "La Casa del Pañal",
    description:
      "Tienda online de pañales para bebé y adulto, toallitas, protectores y cuidado diario en El Salvador.",
    url: siteUrl,
    areaServed: "El Salvador",
    address: {
      "@type": "PostalAddress",
      addressCountry: "SV",
      addressLocality: "San Salvador",
    },
    telephone: initialData.settings.whatsappNumbers[0] ?? "",
    email: initialData.settings.email,
  };

  return (
    <html lang="es" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full" suppressHydrationWarning>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <SiteStoreProvider initialData={initialData} initialIsAdminAuthenticated={Boolean(session)}>
          <SiteShell>{children}</SiteShell>
        </SiteStoreProvider>
      </body>
    </html>
  );
}
