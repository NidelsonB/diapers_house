import type { Metadata } from "next";

import { CheckoutPage } from "@/components/checkout-page";

export const metadata: Metadata = {
  title: "Finaliza tu compra | La Casa del Pañal El Salvador",
  description:
    "Completa tu pedido de pañales, toallitas y productos de cuidado diario con atención rápida en El Salvador.",
  alternates: {
    canonical: "/checkout",
  },
};

export default function CheckoutRoute() {
  return <CheckoutPage />;
}
