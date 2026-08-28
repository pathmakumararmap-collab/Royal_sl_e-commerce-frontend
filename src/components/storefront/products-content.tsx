"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ProductGrid } from "@/components/storefront/product-grid";
import {
  ProductFiltersMobile,
  ProductFiltersSidebar,
  type ProductFilterValues,
} from "@/components/storefront/product-filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/shared/search-input";
import { ErrorState } from "@/components/shared/error-state";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { useBrands, useCategories, useProducts } from "@/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";

export function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = React.useState(searchParams.get("q") ?? "");
  const debouncedKeyword = useDebounce(keyword, 400);
  const page = Number(searchParams.get("page") ?? 1);

  const filters: ProductFilterValues = {
    categoryId: searchParams.get("category") ? Number(searchParams.get("category")) : undefined,
    brandId: searchParams.get("brand") ? Number(searchParams.get("brand")) : undefined,
    minPrice: searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
    maxPrice: searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
    sort: (searchParams.get("sort") as ProductFilterValues["sort"]) ?? "latest",
  };

  const { data: categories } = useCategories();
  const { data: brandsData } = useBrands();

  const { data, isLoading, isError, refetch } = useProducts({
    keyword: debouncedKeyword || undefined,
    category_id: filters.categoryId,
    brand_id: filters.brandId,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    sort: filters.sort,
    is_featured: searchParams.get("featured") === "1" ? true : undefined,
    page,
    per_page: 12,
  });

  function updateParams(next: Partial<Record<string, string | number | undefined>>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(next).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    if (!("page" in next)) {
      params.delete("page");
    }

    router.push(`/products?${params.toString()}`);
  }

  function handleFilterChange(values: ProductFilterValues) {
    updateParams({
      category: values.categoryId,
      brand: values.brandId,
      min_price: values.minPrice,
      max_price: values.maxPrice,
      sort: values.sort,
    });
  }

  React.useEffect(() => {
    if (debouncedKeyword !== (searchParams.get("q") ?? "")) {
      updateParams({ q: debouncedKeyword || undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  const filterProps = {
    categories: categories ?? [],
    brands: brandsData ?? [],
    filters,
    onChange: handleFilterChange,
  };

  return (
    <div className="container-page py-12">
      <div className="mb-8 space-y-1.5">
        <p className="text-eyebrow text-primary">Catalog</p>
        <h1 className="text-display text-2xl sm:text-3xl">All products</h1>
        <p className="text-muted-foreground">
          {data ? `${data.meta.total} products available` : "Discover our full catalog"}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={keyword} onChange={setKeyword} placeholder="Search products…" className="sm:max-w-xs" />
        <ProductFiltersMobile {...filterProps} />
        <div className="sm:ml-auto">
          <Select value={filters.sort} onValueChange={(value) => updateParams({ sort: value })}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="name">Name: A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-10">
        <ProductFiltersSidebar {...filterProps} />

        <div className="min-w-0 flex-1">
          {isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
            <>
              <ProductGrid products={data?.data ?? []} isLoading={isLoading} />

              {data && data.meta.last_page > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => updateParams({ page: page - 1 })}
                      >
                        Previous
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-muted-foreground px-3 text-sm">
                        Page {page} of {data.meta.last_page}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= data.meta.last_page}
                        onClick={() => updateParams({ page: page + 1 })}
                      >
                        Next
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
