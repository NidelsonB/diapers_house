import { NextResponse } from "next/server";
import { z } from "zod";

import { createOrder } from "@/lib/site-repository";

const orderSchema = z.object({
  customerName: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  branch: z.string().trim().min(1),
  address: z.string().trim().min(1),
  notes: z.string().trim().optional(),
  items: z.array(
    z.object({
      productId: z.string().trim().min(1),
      quantity: z.number().int().positive(),
      selectedSize: z.string().trim().optional(),
    }),
  ).min(1),
});

export async function POST(request: Request) {
  try {
    const payload = orderSchema.parse(await request.json());
    const result = await createOrder(payload);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Datos de pedido incompletos." }, { status: 400 });
    }

    if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK:")) {
      return NextResponse.json(
        { success: false, error: `No hay suficiente inventario para ${error.message.split(":")[1]}.` },
        { status: 409 },
      );
    }

    if (error instanceof Error && error.message.startsWith("PRODUCT_NOT_FOUND:")) {
      return NextResponse.json({ success: false, error: "Uno de los productos ya no estA disponible." }, { status: 404 });
    }

    console.error(error);
    return NextResponse.json({ success: false, error: "No fue posible crear el pedido." }, { status: 500 });
  }
}
