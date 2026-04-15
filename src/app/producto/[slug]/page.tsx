import type { Metadata } from "next";

import { seedProducts } from "@/data/seed";
import { ProductDetailPage } from "@/components/product-detail-page";

export function generateStaticParams() {
  return seedProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = seedProducts.find((item) => item.slug === slug);

  if (!product) {
    return { title: "Producto no encontrado | La Casa del Pañal" };
  }

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const imageUrl = `${basePath}${product.image}`;

  return {
    title: `${product.name} | La Casa del Pañal`,
    description: product.description,
    openGraph: {
      title: `${product.name} | La Casa del Pañal`,
      description: product.description,
      type: "website",
      images: [{ url: imageUrl, width: 800, height: 600, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | La Casa del Pañal`,
      description: product.description,
    },
  };
}

export default async function ProductoDetalleRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ProductDetailPage slug={slug} />;
}
