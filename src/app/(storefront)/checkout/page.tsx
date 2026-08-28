import type { Metadata } from "next";

import { CheckoutContent } from "@/components/storefront/checkout-content";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase securely.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutContent />;
}
