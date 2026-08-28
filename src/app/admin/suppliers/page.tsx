import type { Metadata } from "next";

import { SuppliersContent } from "@/components/admin/suppliers-content";

export const metadata: Metadata = {
  title: "Suppliers",
  description: "Manage suppliers used for purchase orders.",
  robots: { index: false, follow: false },
};

export default function SuppliersPage() {
  return <SuppliersContent />;
}
