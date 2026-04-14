import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentAdminSession } from "@/lib/auth";
import { orderStatuses } from "@/lib/utils";
import { updateOrderStatus } from "@/lib/site-repository";

const statusSchema = z.object({
  status: z.enum(orderStatuses),
});

export async function PATCH(request: Request, context: RouteContext<"/api/admin/orders/[id]">) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = statusSchema.parse(await request.json());
    const { id } = await context.params;
    const data = await updateOrderStatus(id, payload.status);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Estado invalido." }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "No fue posible actualizar el pedido." }, { status: 500 });
  }
}
