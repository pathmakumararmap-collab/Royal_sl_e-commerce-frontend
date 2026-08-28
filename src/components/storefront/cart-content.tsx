"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Currency } from "@/components/shared/currency";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/hooks/use-cart";

export function CartContent() {
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  const items = cart?.items ?? [];

  if (isLoading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Start exploring our catalog."
          action={
            <Button asChild>
              <Link href="/products">Start shopping</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-display text-2xl sm:text-3xl">Shopping cart</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearCart.mutate()}
            disabled={clearCart.isPending}
          >
            Clear cart
          </Button>
        </div>

        <Card className="divide-border/60 divide-y py-0">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4">
              <div className="bg-muted relative size-24 shrink-0 overflow-hidden rounded-lg border border-border/60">
                {item.product?.images?.[0]?.url ? (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center">
                    <ShoppingBag className="size-6" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/products/${item.product?.slug}`}
                      className="font-medium hover:underline"
                    >
                      {item.product?.name}
                    </Link>
                    {item.variant && (
                      <p className="text-muted-foreground text-xs">
                        {Object.values(item.variant.attributes).join(" / ")}
                      </p>
                    )}
                    <Currency value={item.unit_price} className="text-muted-foreground tabular-nums mt-1 block text-sm" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem.mutate(item.id)}
                    disabled={removeItem.isPending}
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={updateItem.isPending || item.quantity <= 1}
                      onClick={() =>
                        updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                      }
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={updateItem.isPending}
                      onClick={() =>
                        updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })
                      }
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <Currency value={item.subtotal} className="tabular-nums font-semibold" />
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card className="h-fit">
        <CardContent className="space-y-4">
          <h2 className="text-eyebrow text-muted-foreground">Order summary</h2>
          <div className="text-muted-foreground flex justify-between text-sm">
            <span>Subtotal</span>
            <Currency value={cart?.total ?? 0} className="tabular-nums" />
          </div>
          <p className="text-muted-foreground text-xs">
            Shipping, tax, and coupon discounts are calculated at checkout.
          </p>
          <Separator className="bg-border/60" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <Currency value={cart?.total ?? 0} className="tabular-nums text-lg" />
          </div>
          <Button asChild size="lg" variant="gradient" className="w-full">
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
