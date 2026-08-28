import type { Metadata } from "next";

import { AddressesContent } from "@/components/customer/addresses-content";

export const metadata: Metadata = {
  title: "My Addresses",
  description: "Manage your shipping and billing addresses.",
  robots: { index: false, follow: false },
};

export default function DashboardAddressesPage() {
  return <AddressesContent />;
}
