"use client";

import { useWishlistStore } from "@/store/wishlist-store";

export function useWishlist() {
  const items = useWishlistStore((state) => state.items);
  const add = useWishlistStore((state) => state.add);
  const remove = useWishlistStore((state) => state.remove);
  const toggle = useWishlistStore((state) => state.toggle);
  const has = useWishlistStore((state) => state.has);
  const clear = useWishlistStore((state) => state.clear);

  return { items, add, remove, toggle, has, clear, count: items.length };
}
