import { NextResponse } from "next/server";
import sharp from "sharp";

import { prisma } from "@/lib/prisma";
import { getProductImageFallback, isProductImageProxyPath } from "@/lib/utils";

export const runtime = "nodejs";

const DATA_URL_PATTERN = /^data:([^;,]+)(;base64)?,([\s\S]*)$/;

const imageHeaders = (contentType: string) => ({
  "Content-Type": contentType,
  "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
});

const optimizeImage = async (body: Buffer, contentType: string) => {
  if (contentType === "image/svg+xml") {
    return { body, contentType };
  }

  try {
    const optimized = await sharp(body)
      .rotate()
      .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 74, effort: 4 })
      .toBuffer();

    return { body: optimized, contentType: "image/webp" };
  } catch (error) {
    console.error("PRODUCT_IMAGE_OPTIMIZE_FAILED", error);
    return { body, contentType };
  }
};

const redirectToFallback = (request: Request, categoryId?: string) =>
  NextResponse.redirect(new URL(getProductImageFallback(categoryId), request.url), 302);

export async function GET(request: Request, context: RouteContext<"/api/product-images/[id]">) {
  if (!process.env.DATABASE_URL || process.env.NEXT_BUILD === "true") {
    return redirectToFallback(request);
  }

  const { id } = await context.params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      categoryId: true,
      image: true,
    },
  });

  if (!product) {
    return redirectToFallback(request);
  }

  const image = product.image.trim();
  const match = DATA_URL_PATTERN.exec(image);

  if (!match) {
    if (isProductImageProxyPath(image)) {
      return redirectToFallback(request, product.categoryId);
    }

    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|\/)/i.test(image)) {
      return NextResponse.redirect(new URL(image, request.url), 302);
    }

    return redirectToFallback(request, product.categoryId);
  }

  const [, contentType, isBase64, payload] = match;
  const body = isBase64
    ? Buffer.from(payload, "base64")
    : Buffer.from(decodeURIComponent(payload), "utf8");
  const optimized = await optimizeImage(body, contentType || "application/octet-stream");

  return new Response(new Uint8Array(optimized.body), {
    headers: imageHeaders(optimized.contentType),
  });
}
