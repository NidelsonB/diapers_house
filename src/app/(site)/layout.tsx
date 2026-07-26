import type { Metadata } from "next";

import { SiteShell } from "@/components/site-shell";
import { getPublicSiteData } from "@/lib/site-repository";
import { SiteStoreProvider } from "@/providers/site-store";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lacasadelpanal.com";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialData = await getPublicSiteData();

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
    <SiteStoreProvider initialData={initialData} initialIsAdminAuthenticated={false}>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <SiteShell>{children}</SiteShell>
    </SiteStoreProvider>
  );
}
