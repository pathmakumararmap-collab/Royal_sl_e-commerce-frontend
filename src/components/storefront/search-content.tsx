"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { ProductGrid } from "@/components/storefront/product-grid";
import { SearchInput } from "@/components/shared/search-input";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { useProducts } from "@/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";
import { Search } from "lucide-react";

export function SearchContent() {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = React.useState(searchParams.get("q") ?? "");
  const debouncedKeyword = useDebounce(keyword, 400);

  const { data, isLoading, isError, refetch } = useProducts({
    keyword: debouncedKeyword || undefined,
    per_page: 16,
  });

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-xl space-y-1.5 text-center">
        <p className="text-eyebrow text-primary">Search</p>
        <h1 className="text-display text-2xl sm:text-3xl">Search products</h1>
        <p className="text-muted-foreground">Find exactly what you&apos;re looking for.</p>
      </div>

      <div className="mx-auto mt-8 max-w-xl">
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder="Search by name, SKU, or barcode…"
        />
      </div>

      <div className="mt-10">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !debouncedKeyword ? (
          <EmptyState
            icon={Search}
            title="Start typing to search"
            description="Try searching for a product name, category, or brand."
          />
        ) : (
          <ProductGrid products={data?.data ?? []} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
