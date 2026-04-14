import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { getCurrentAdminSession } from "@/lib/auth";
import { upsertProduct } from "@/lib/site-repository";

const sizePackageInfoSchema = z.object({
  size: z.string(),
  units: z.number().int().nonnegative(),
});

const productSchema = z.object({
  id: z.string(),
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative().optional(),
  size: z.string().trim().min(1),
  sizeOptions: z.array(z.string()).optional(),
  sizePackageInfo: z.array(sizePackageInfoSchema).optional(),
  sortOrder: z.number().int().optional(),
  brand: z.string().trim().min(1),
  pack: z.string().trim().min(1),
  stock: z.number().int().nonnegative(),
  categoryId: z.string().trim().min(1),
  image: z.string().trim().min(1),
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  onSale: z.boolean().optional(),
  tags: z.array(z.string()),
});

export async function POST(request: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = productSchema.parse(await request.json());
    const data = await upsertProduct(payload);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Producto invalido." }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un producto con ese slug o identificador. Cambia el nombre o el slug e intenta de nuevo." },
        { status: 409 },
      );
    }

    console.error(error);
    return NextResponse.json({ error: "No fue posible guardar el producto." }, { status: 500 });
  }
}
