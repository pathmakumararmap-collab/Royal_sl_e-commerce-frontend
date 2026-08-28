import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductsContent } from "@/components/storefront/products-content";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse and filter our full product catalog.",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="min-h-[60vh]" />}>
      <ProductsContent />
    </Suspense>
  );
}
