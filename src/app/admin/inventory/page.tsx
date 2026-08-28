import type { Metadata } from "next";

import { InventoryHubContent } from "@/components/admin/inventory-hub-content";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Stock levels, alerts, movements, transfers, adjustments, returns, and damages.",
  robots: { index: false, follow: false },
};

export default function InventoryPage() {
  return <InventoryHubContent />;
}
