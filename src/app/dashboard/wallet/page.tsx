import type { Metadata } from "next";

import { WalletContent } from "@/components/customer/wallet-content";

export const metadata: Metadata = {
  title: "My Wallet",
  description: "Review your payment and refund history.",
  robots: { index: false, follow: false },
};

export default function DashboardWalletPage() {
  return <WalletContent />;
}
