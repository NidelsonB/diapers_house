import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Contacto | La Casa del Pañal El Salvador",
  description:
    "Consulta nuestras sucursales, teléfonos y medios de contacto para recibir ayuda con tu compra en tienda.",
  alternates: {
    canonical: "/contacto",
  },
};

export default function CheckoutRoute() {
  redirect("/contacto");
}
