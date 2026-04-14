import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentAdminSession } from "@/lib/auth";
import { updateSettings } from "@/lib/site-repository";

const branchSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  hours: z.string(),
  phones: z.array(z.string()),
});

const settingsSchema = z.object({
  businessName: z.string().trim().min(1),
  email: z.string().trim().email(),
  whatsappNumbers: z.array(z.string()),
  socialLinks: z.object({
    instagram: z.string(),
    facebook: z.string(),
  }),
  branches: z.array(branchSchema),
  trustMessages: z.array(z.string()),
  heroBanner: z.object({
    title: z.string(),
    subtitle: z.string(),
    highlight: z.string(),
    ctaText: z.string(),
  }),
});

export async function PUT(request: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = settingsSchema.parse(await request.json());
    const data = await updateSettings(payload);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Configuracion invalida." }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "No fue posible actualizar la configuracion." }, { status: 500 });
  }
}
