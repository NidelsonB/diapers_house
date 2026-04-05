import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";

import { SiteShell } from "@/components/site-shell";
import { SiteStoreProvider } from "@/providers/site-store";

import "./globals.css";

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "La Casa del Pañal | Tienda online para tu bebé",
  description:
    "Catálogo de pañales, carrito de compras y atención rápida para familias de El Salvador.",
  keywords: [
    "pañales",
    "tienda online",
    "ecommerce",
    "El Salvador",
    "La Casa del Pañal",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full">
        <SiteStoreProvider>
          <SiteShell>{children}</SiteShell>
        </SiteStoreProvider>
      </body>
    </html>
  );
}
