import type { Metadata } from "next";

import { CatalogPage } from "@/components/catalog-page";

export const metadata: Metadata = {
  title: "Catálogo de pañales en El Salvador | La Casa del Pañal",
  description:
    "Explora nuestro catálogo de pañales para bebé y adulto, toallitas húmedas, protectores y cuidado diario en El Salvador.",
  alternates: {
    canonical: "/catalogo",
  },
};

export default function CatalogoRoute() {
  return <CatalogPage />;
}
