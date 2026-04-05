import { CatalogPage } from "@/components/catalog-page";

export default async function CatalogoRoute({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  return <CatalogPage initialCategorySlug={categoria} />;
}
