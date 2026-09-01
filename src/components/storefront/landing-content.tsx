"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HeroSection } from "@/components/storefront/hero-section";
import { FlashSaleBanner } from "@/components/storefront/flash-sale-banner";
import { FlashSaleSection } from "@/components/storefront/flash-sale-section";
import { CategoryCard, CategoryCardLarge } from "@/components/storefront/category-card";
import { ProductGrid } from "@/components/storefront/product-grid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useProducts } from "@/hooks/use-products";

export function LandingContent() {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: featured, isLoading: featuredLoading } = useProducts({
    is_featured: true,
    per_page: 8,
  });
  const { data: latest, isLoading: latestLoading } = useProducts({
    sort: "latest",
    per_page: 8,
  });

  return (
    <div>
      <HeroSection />

      <div className="bg-neutral-100 pb-20">
        <FlashSaleBanner />

        <FlashSaleSection />

        <section className="container-page py-14 sm:py-16">
          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <div className="space-y-1.5">
              <p className="text-eyebrow text-primary hidden sm:block">Explore</p>
              <h2 className="text-display text-2xl sm:text-3xl">Shop by category</h2>
              <p className="text-muted-foreground hidden text-sm sm:block">
                Explore our popular collections.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/categories">
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          {categoriesLoading ? (
            <>
              <div className="flex gap-3 overflow-hidden sm:hidden">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-40 w-[calc((100%-1.5rem)/3)] shrink-0 rounded-2xl"
                  />
                ))}
              </div>
              <div className="hidden gap-4 sm:grid sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-4/3 rounded-2xl" />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Mobile: horizontal-scroll strip, 3 cards visible at a time */}
              <div className="flex snap-x gap-3 overflow-x-auto pb-1 sm:hidden">
                {(categories ?? []).slice(0, 10).map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>

              {/* Desktop/tablet: grid of large tinted cards */}
              <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                {(categories ?? []).slice(0, 4).map((category, index) => (
                  <CategoryCardLarge key={category.id} category={category} index={index} />
                ))}
              </div>
            </>
          )}
        </section>

        <section className="container-page border-t border-border/60 py-14 sm:py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-eyebrow text-primary">Curated</p>
              <h2 className="text-display text-2xl sm:text-3xl">Featured products</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/products?featured=1">
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <ProductGrid products={featured?.data ?? []} isLoading={featuredLoading} />
        </section>

        <section className="container-page border-t border-border/60 py-14 sm:py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-eyebrow text-primary">Just in</p>
              <h2 className="text-display text-2xl sm:text-3xl">New arrivals</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/products">
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <ProductGrid products={latest?.data ?? []} isLoading={latestLoading} />
        </section>
      </div>
    </div>
  );
}