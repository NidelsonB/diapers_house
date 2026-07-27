import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, latencyMs: Date.now() - startedAt });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      latencyMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "No fue posible conectar a la base de datos.",
    });
  }
}
