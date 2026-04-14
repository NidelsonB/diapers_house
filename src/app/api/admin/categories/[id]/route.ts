import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/auth";
import { deleteCategory } from "@/lib/site-repository";

export async function DELETE(_request: Request, context: RouteContext<"/api/admin/categories/[id]">) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const data = await deleteCategory(id);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No fue posible eliminar la categoria." }, { status: 500 });
  }
}
