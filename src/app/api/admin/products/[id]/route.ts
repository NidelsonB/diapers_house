import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/auth";
import { deleteProduct } from "@/lib/site-repository";

export async function DELETE(_request: Request, context: RouteContext<"/api/admin/products/[id]">) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const data = await deleteProduct(id);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No fue posible eliminar el producto." }, { status: 500 });
  }
}
