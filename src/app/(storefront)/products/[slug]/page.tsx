import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailContent } from "@/components/storefront/product-detail-content";
import { catalogService } from "@/lib/api/services/catalog.service";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await catalogService.getProduct(slug);

    return {
      title: product.name,
      description: product.short_description ?? product.description ?? product.name,
      openGraph: {
        title: product.name,
        description: product.short_description ?? product.name,
        images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : undefined,
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  return <ProductDetailContent slug={slug} />;
}
