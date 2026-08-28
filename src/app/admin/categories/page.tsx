import type { Metadata } from "next";

import { CategoriesContent } from "@/components/admin/categories-content";

export const metadata: Metadata = {
  title: "Categories",
  description: "Manage product categories.",
  robots: { index: false, follow: false },
};

export default function AdminCategoriesPage() {
  return <CategoriesContent />;
}
