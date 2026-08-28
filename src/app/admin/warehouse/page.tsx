import type { Metadata } from "next";

import { WarehousesContent } from "@/components/admin/warehouses-content";

export const metadata: Metadata = {
  title: "Warehouses",
  description: "Manage warehouse and outlet locations.",
  robots: { index: false, follow: false },
};

export default function WarehousePage() {
  return <WarehousesContent />;
}
