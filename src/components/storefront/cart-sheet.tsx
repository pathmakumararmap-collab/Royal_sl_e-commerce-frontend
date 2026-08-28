"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { Currency } from "@/components/shared/currency";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/use-cart";
import { useUiStore } from "@/store/ui-store";

export function CartSheet() {
  const isOpen = useUiStore((state) => state.isCartOpen);
  const setOpen = useUiStore((state) => state.setCartOpen);
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const items = cart?.items ?? [];

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your cart {items.length > 0 && `(${items.length})`}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : items.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Browse our catalog and add items you love."
              className="mt-8 border-none"
              action={
                <Button asChild size="sm" onClick={() => setOpen(false)}>
                  <Link href="/products">Start shopping</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-border/60 divide-y">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3.5 py-4">
                  <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg border border-border/60">
                    {item.product?.images?.[0]?.url ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground flex h-full items-center justify-center">
                        <ShoppingBag className="size-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.product?.slug}`}
                        className="line-clamp-2 text-sm font-medium hover:underline"
                        onClick={() => setOpen(false)}
                      >
                        {item.product?.name}
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground shrink-0"
                        onClick={() => removeItem.mutate(item.id)}
                        disabled={removeItem.isPending}
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    {item.variant && (
                      <p className="text-muted-foreground text-xs">
                        {Object.values(item.variant.attributes).join(" / ")}
                      </p>
                    )}
                    <div className="mt-1 flex items-center justify-between">
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
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
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
                      <Currency value={item.subtotal} className="tabular-nums text-sm font-medium" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t border-border/60">
            <div className="flex items-center justify-between py-2 text-sm font-medium">
              <span>Subtotal</span>
              <Currency value={cart?.total ?? 0} className="tabular-nums text-base" />
            </div>
            <Separator className="mb-2 bg-border/60" />
            <Button asChild size="lg" variant="gradient" onClick={() => setOpen(false)}>
              <Link href="/checkout">Checkout</Link>
            </Button>
            <Button variant="ghost" asChild onClick={() => setOpen(false)}>
              <Link href="/cart">View cart</Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
