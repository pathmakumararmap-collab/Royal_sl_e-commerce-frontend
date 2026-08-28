import type { Metadata } from "next";

import { WishlistContent } from "@/components/storefront/wishlist-content";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Products you've saved for later.",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return <WishlistContent />;
}
