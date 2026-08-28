import type { Metadata } from "next";

import { CartContent } from "@/components/storefront/cart-content";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review the items in your shopping cart.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartContent />;
}
