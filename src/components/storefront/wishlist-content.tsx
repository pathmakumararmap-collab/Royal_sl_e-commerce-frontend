"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Currency } from "@/components/shared/currency";
import { EmptyState } from "@/components/shared/empty-state";
import { useAddCartItem } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";

export function WishlistContent() {
  const { items, remove } = useWishlist();
  const addItem = useAddCartItem();

  return (
    <div className="container-page py-12">
      <div className="mb-10 space-y-1.5">
        <p className="text-eyebrow text-primary">Saved</p>
        <h1 className="text-display text-2xl sm:text-3xl">My wishlist</h1>
        <p className="text-muted-foreground">
          {items.length > 0
            ? `${items.length} item${items.length === 1 ? "" : "s"} saved for later`
            : "Items you love, saved on this device."}
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Tap the heart icon on any product to save it here."
          action={
            <Button asChild size="sm">
              <Link href="/products">Browse products</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="hover-lift-sm flex-row items-center gap-4 p-4">
              <div className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-lg border border-border/60">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center">
                    <Heart className="size-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <Link href={`/products/${item.slug}`} className="line-clamp-2 text-sm font-medium hover:underline">
                  {item.name}
                </Link>
                <Currency value={item.price} className="tabular-nums block text-sm font-semibold" />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => addItem.mutate({ product_id: item.id, quantity: 1 })}
                    disabled={addItem.isPending}
                  >
                    <ShoppingCart className="size-3.5" />
                    Add to cart
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => remove(item.id)}
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
