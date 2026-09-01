"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";

import { Currency } from "@/components/shared/currency";
import { StarRating } from "@/components/shared/star-rating";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlashSale } from "@/hooks/use-products";
import { cn } from "@/lib/utils";
import type { FlashSaleProduct } from "@/types/catalog";

const LOW_STOCK_THRESHOLD = 15;

function useCountdown(endsAt: string | null) {
  const [remainingMs, setRemainingMs] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!endsAt) {
      setRemainingMs(null);
      return;
    }

    function tick() {
      const diff = new Date(endsAt as string).getTime() - Date.now();
      setRemainingMs(Math.max(0, diff));
    }

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  return remainingMs;
}

function formatCountdown(ms: number): { hours: string; minutes: string; seconds: string } {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return { hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) };
}

function FlashSaleCard({ product }: { product: FlashSaleProduct }) {
  const image = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const stock = product.total_stock ?? null;
  const showLowStock = stock !== null && stock > 0 && stock <= LOW_STOCK_THRESHOLD;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="hover-lift-sm bg-card border-border/60 shadow-luxury-sm w-[calc((100%-1.5rem)/3)] shrink-0 snap-start overflow-hidden rounded-2xl border sm:w-56"
    >
      <div className="bg-muted relative aspect-square">
        {image?.url ? (
          <Image src={image.url} alt={product.name} fill className="object-cover" sizes="220px" />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
            No image
          </div>
        )}
        <span className="absolute top-2 left-2 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white sm:text-xs">
          SALE
        </span>
      </div>
      <div className="space-y-1.5 p-2.5 sm:p-3.5">
        <p className="line-clamp-2 min-h-8 text-xs font-medium sm:min-h-10 sm:text-sm">{product.name}</p>

        {!!product.reviews_count && (
          <StarRating value={product.rating_average ?? 0} size="sm" />
        )}

        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5">
          <div>
            <Currency
              value={product.flash_sale_price}
              className="tabular-nums text-sm font-bold sm:text-lg"
            />
            <Currency
              value={product.current_price}
              className="text-muted-foreground tabular-nums block text-[10px] font-normal line-through sm:text-xs"
            />
          </div>
          <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-600 sm:text-xs">
            -{product.flash_sale_discount_percent}%
          </span>
        </div>

        {showLowStock && (
          <p className="text-[10px] font-medium text-red-600 sm:text-xs">Only {stock} left</p>
        )}
      </div>
    </Link>
  );
}

export function FlashSaleSection() {
  const { data, isLoading } = useFlashSale();
  const remainingMs = useCountdown(data?.ends_at ?? null);

  // Hide the whole section once nothing is on sale — no empty band on the homepage.
  if (!isLoading && (!data || data.products.length === 0)) return null;
  if (!isLoading && remainingMs === 0) return null;

  const countdown = remainingMs !== null ? formatCountdown(remainingMs) : null;

  return (
    <section className="container-page py-14 sm:py-16">
      <div className="relative">
        <div className="absolute -inset-4 -z-10 rounded-[0rem] bg-white-500 sm:-inset-6" />

        <div className="bg-card border-border/60 shadow-luxury-sm rounded-2xl border p-4 sm:rounded-3xl sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-display text-2xl tracking-tight sm:text-3xl">FLASH SALE</h2>
                <Flame className="size-6 fill-orange-500 text-orange-500 sm:size-7" />
              </div>

              {countdown && (
                <div className="flex items-center gap-1.5">
                  {(
                    [
                      ["HOURS", countdown.hours],
                      ["MINUTES", countdown.minutes],
                      ["SECONDS", countdown.seconds],
                    ] as const
                  ).map(([label, value], index) => (
                    <React.Fragment key={label}>
                      {index > 0 && <span className="text-lg font-bold">:</span>}
                      <div className="text-center">
                        <span className="block font-mono text-lg font-bold tabular-nums sm:text-2xl">
                          {value}
                        </span>
                        <span className="text-muted-foreground hidden text-[9px] tracking-wide uppercase sm:block">
                          {label}
                        </span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/products?sort=latest"
              className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 text-sm font-medium transition-colors"
            >
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className={cn(
                    "h-52 w-[calc((100%-1.5rem)/3)] shrink-0 rounded-2xl sm:h-64 sm:w-56"
                  )}
                />
              ))}
            </div>
          ) : (
            <div className="flex snap-x gap-3 overflow-x-auto pb-1 sm:gap-4">
              {data?.products.map((product) => (
                <FlashSaleCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}