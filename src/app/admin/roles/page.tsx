import type { Metadata } from "next";

import { RolesContent } from "@/components/admin/roles-content";

export const metadata: Metadata = {
  title: "Roles",
  description: "Manage staff roles and their permissions.",
  robots: { index: false, follow: false },
};

export default function AdminRolesPage() {
  return <RolesContent />;
}
