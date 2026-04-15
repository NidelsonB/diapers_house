import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminSession, getStaticQaAdminCredentials, isStaticQaAdminMode, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());

    if (isStaticQaAdminMode()) {
      const qaCredentials = getStaticQaAdminCredentials();

      if (payload.email.trim().toLowerCase() !== qaCredentials.email || payload.password !== qaCredentials.password) {
        return NextResponse.json({ success: false, error: "Credenciales invalidas." }, { status: 401 });
      }

      await createAdminSession("qa-admin");
      return NextResponse.json({ success: true, qa: true });
    }

    if (process.env.QA_ADMIN_BYPASS === "true") {
      return NextResponse.json({ success: true, bypass: true });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: payload.email.trim().toLowerCase() },
    });

    if (!admin) {
      return NextResponse.json({ success: false, error: "Credenciales invalidas." }, { status: 401 });
    }

    const isValid = await verifyPassword(payload.password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Credenciales invalidas." }, { status: 401 });
    }

    await createAdminSession(admin.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Datos de acceso invalidos." }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ success: false, error: "No fue posible iniciar sesion." }, { status: 500 });
  }
}
