import type { Metadata } from "next";

import { AdminReviewsContent } from "@/components/admin/admin-reviews-content";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Moderate customer product reviews.",
  robots: { index: false, follow: false },
};

export default function AdminReviewsPage() {
  return <AdminReviewsContent />;
}
