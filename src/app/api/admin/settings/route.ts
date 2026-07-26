import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentAdminSession } from "@/lib/auth";
import { updateSettings } from "@/lib/site-repository";

const normalizeUrl = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)) return trimmed;
  if (/^(maps\.app\.goo\.gl|goo\.gl\/maps|waze\.com|www\.waze\.com|google\.com\/maps|www\.google\.com\/maps)/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

const branchSchema = z.object({
  id: z.string(),
  name: z.string().trim(),
  address: z.string().trim(),
  hours: z.string().trim(),
  phones: z.array(z.string().trim()).default([]),
  locationUrl: z
    .preprocess(
      normalizeUrl,
      z.string().url().optional(),
    )
    .optional(),
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
      return NextResponse.json(
        { error: "Configuración inválida. Revisa el correo, los enlaces y los campos de sucursales." },
        { status: 400 },
      );
    }

    console.error(error);
    return NextResponse.json({ error: "No fue posible actualizar la configuración." }, { status: 500 });
  }
}
