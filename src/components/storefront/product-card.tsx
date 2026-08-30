"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Currency } from "@/components/shared/currency";
import { StarRating } from "@/components/shared/star-rating";
import { cn } from "@/lib/utils";
import { useAddCartItem } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import type { Product } from "@/types/catalog";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { has, toggle } = useWishlist();
  const isWishlisted = has(product.id);
  const addItem = useAddCartItem();

  const primaryImage =
    product.images?.find((image) => image.is_primary)?.url ?? product.images?.[0]?.url;

  const hasDiscount =
    product.discount_price !== null &&
    product.discount_price !== undefined &&
    product.discount_price < product.selling_price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((product.selling_price - (product.discount_price ?? 0)) / product.selling_price) * 100
      )
    : 0;

  const outOfStock = (product.total_stock ?? 1) <= 0;

  return (
    <Card
      className={cn(
        "group hover-lift relative gap-3 overflow-hidden py-0",
        className
      )}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="bg-muted relative aspect-square overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
              No image
            </div>
          )}

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && (
              <Badge className="border-transparent bg-red-600 text-white">-{discountPercent}%</Badge>
            )}
            {product.is_featured && (
              <Badge className="border-transparent bg-[#0D47A1] text-white">Featured</Badge>
            )}
            {outOfStock && <Badge variant="secondary">Out of stock</Badge>}
          </div>

          <div className="absolute top-2 right-2 flex flex-col gap-1.5">
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              className="rounded-full opacity-100 shadow-luxury-sm transition-opacity md:opacity-0 md:group-hover:opacity-100"
              onClick={(event) => {
                event.preventDefault();
                toggle(product);
              }}
              aria-label="Toggle wishlist"
            >
              <Heart className={cn("size-4", isWishlisted && "fill-destructive text-destructive")} />
            </Button>

            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              className="rounded-full opacity-100 shadow-luxury-sm transition-opacity md:opacity-0 md:group-hover:opacity-100"
              disabled={outOfStock || addItem.isPending}
              onClick={(event) => {
                event.preventDefault();
                addItem.mutate({ product_id: product.id, quantity: 1 });
              }}
              aria-label="Add to cart"
            >
              <ShoppingCart className="size-4" />
            </Button>
          </div>
        </div>
      </Link>

      <div className="space-y-2 px-3 pb-3.5">
        {product.brand && (
          <p className="text-muted-foreground text-xs">{product.brand.name}</p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-10 text-sm font-medium transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        {!!product.reviews_count && (
          <StarRating
            value={product.rating_average ?? 0}
            count={product.reviews_count}
            size="sm"
            showCount
          />
        )}
        <div className="flex items-center gap-2">
          <Currency value={product.current_price} className="tabular-nums text-base font-semibold" />
          {hasDiscount && (
            <Currency
              value={product.selling_price}
              className="text-muted-foreground tabular-nums text-xs font-normal line-through"
            />
          )}
        </div>
      </div>
    </Card>
  );
}