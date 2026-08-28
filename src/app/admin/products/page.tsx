import type { Metadata } from "next";

import { ProductsListContent } from "@/components/admin/products-list-content";

export const metadata: Metadata = {
  title: "Products",
  description: "Manage the product catalog.",
  robots: { index: false, follow: false },
};

export default function AdminProductsPage() {
  return <ProductsListContent />;
}
