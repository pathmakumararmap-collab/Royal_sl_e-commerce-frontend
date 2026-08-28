import type { Metadata } from "next";

import { BrandsContent } from "@/components/admin/brands-content";

export const metadata: Metadata = {
  title: "Brands",
  description: "Manage product brands.",
  robots: { index: false, follow: false },
};

export default function AdminBrandsPage() {
  return <BrandsContent />;
}
