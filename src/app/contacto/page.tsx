import type { Metadata } from "next";

import { ContactPage } from "@/components/contact-page";

export const metadata: Metadata = {
  title: "Contacto y sucursales | La Casa del Pañal El Salvador",
  description:
    "Conoce nuestras sucursales, teléfonos y medios de contacto para comprar pañales y productos de cuidado diario en El Salvador.",
  alternates: {
    canonical: "/contacto",
  },
};

export default function ContactoRoute() {
  return <ContactPage />;
}
