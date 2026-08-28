import type { Metadata } from "next";

import { CustomersContent } from "@/components/admin/customers-content";

export const metadata: Metadata = {
  title: "Customers",
  description: "Browse registered storefront customers.",
  robots: { index: false, follow: false },
};

export default function AdminCustomersPage() {
  return <CustomersContent />;
}
