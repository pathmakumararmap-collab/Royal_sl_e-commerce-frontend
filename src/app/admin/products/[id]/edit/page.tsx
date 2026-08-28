import type { Metadata } from "next";

import { ProductFormContent } from "@/components/admin/product-form-content";

export const metadata: Metadata = {
  title: "Edit Product",
  description: "Update product details.",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAdminProductPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductFormContent productId={Number(id)} />;
}
