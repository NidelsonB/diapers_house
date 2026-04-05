import { seedProducts } from "@/data/seed";
import { ProductDetailPage } from "@/components/product-detail-page";

export function generateStaticParams() {
  return seedProducts.map((product) => ({ slug: product.slug }));
}

export default async function ProductoDetalleRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ProductDetailPage slug={slug} />;
}
