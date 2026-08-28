import type { Metadata } from "next";

import { InvoicesListContent } from "@/components/admin/invoices-list-content";

export const metadata: Metadata = {
  title: "Invoices",
  description: "Generate and download order invoices.",
  robots: { index: false, follow: false },
};

export default function AdminInvoicesPage() {
  return <InvoicesListContent />;
}
