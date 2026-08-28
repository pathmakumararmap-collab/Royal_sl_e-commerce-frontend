"use client";

import { CategoryCard } from "@/components/storefront/category-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useCategories } from "@/hooks/use-products";
import { Shapes } from "lucide-react";

export function CategoriesContent() {
  const { data: categories, isLoading, isError, refetch } = useCategories();

  return (
    <div className="container-page py-12">
      <div className="mb-10 space-y-1.5">
        <p className="text-eyebrow text-primary">Browse</p>
        <h1 className="text-display text-2xl sm:text-3xl">All categories</h1>
        <p className="text-muted-foreground text-pretty">Browse our full range of product categories.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="aspect-4/3 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !categories?.length ? (
        <EmptyState icon={Shapes} title="No categories yet" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
