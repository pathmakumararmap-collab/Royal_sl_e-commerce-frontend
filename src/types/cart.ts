import type { Product, ProductVariant } from "./catalog";

export interface CartItem {
  id: number;
  product?: Product;
  variant?: ProductVariant;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}
