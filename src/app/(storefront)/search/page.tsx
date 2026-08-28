import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchContent } from "@/components/storefront/search-content";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Royal SL product catalog.",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="min-h-[60vh]" />}>
      <SearchContent />
    </Suspense>
  );
}
