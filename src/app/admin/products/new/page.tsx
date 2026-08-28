import type { Metadata } from "next";

import { ProductFormContent } from "@/components/admin/product-form-content";

export const metadata: Metadata = {
  title: "New Product",
  description: "Add a new product to the catalog.",
  robots: { index: false, follow: false },
};

export default function NewAdminProductPage() {
  return <ProductFormContent />;
}
