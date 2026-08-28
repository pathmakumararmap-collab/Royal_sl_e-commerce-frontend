import type { Metadata } from "next";

import { InvoicesContent } from "@/components/customer/invoices-content";

export const metadata: Metadata = {
  title: "My Invoices",
  description: "Download invoices for your past orders.",
  robots: { index: false, follow: false },
};

export default function DashboardInvoicesPage() {
  return <InvoicesContent />;
}
