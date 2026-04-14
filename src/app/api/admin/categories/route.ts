import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { getCurrentAdminSession } from "@/lib/auth";
import { upsertCategory } from "@/lib/site-repository";

const categorySchema = z.object({
  id: z.string(),
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  icon: z.string().trim().min(1),
});

export async function POST(request: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = categorySchema.parse(await request.json());
    const data = await upsertCategory(payload);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Categoria invalida." }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe una categoria con ese slug o identificador. Cambia el nombre o el slug e intenta de nuevo." },
        { status: 409 },
      );
    }

    console.error(error);
    return NextResponse.json({ error: "No fue posible guardar la categoria." }, { status: 500 });
  }
}
