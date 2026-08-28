import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Product } from "@/types/catalog";

export interface WishlistItem {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  add: (product: Product) => void;
  remove: (productId: number) => void;
  toggle: (product: Product) => void;
  has: (productId: number) => boolean;
  clear: () => void;
}

/**
 * The Laravel API has no wishlist tables/endpoints, so this is intentionally
 * a client-only feature persisted to localStorage. It's structured so a
 * backend-backed implementation could be swapped in later without touching
 * calling components (same shape: items[] + add/remove/toggle/has/clear).
 */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) => {
        if (get().has(product.id)) return;
        const item: WishlistItem = {
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images?.find((i) => i.is_primary)?.url ?? product.images?.[0]?.url ?? null,
          price: product.current_price,
          addedAt: new Date().toISOString(),
        };
        set({ items: [item, ...get().items] });
      },
      remove: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },
      toggle: (product) => {
        if (get().has(product.id)) {
          get().remove(product.id);
        } else {
          get().add(product);
        }
      },
      has: (productId) => get().items.some((item) => item.id === productId),
      clear: () => set({ items: [] }),
    }),
    {
      name: "royal-sl-wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
