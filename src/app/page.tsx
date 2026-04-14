import type { Metadata } from "next";

import { HomePage } from "@/components/home-page";

export const metadata: Metadata = {
  title: "La Casa del Pañal | Tienda de pañales en El Salvador",
  description:
    "Compra pañales para bebé y adulto, toallitas húmedas y productos de cuidado diario con atención rápida en El Salvador.",
};

export default function Home() {
  return <HomePage />;
}
