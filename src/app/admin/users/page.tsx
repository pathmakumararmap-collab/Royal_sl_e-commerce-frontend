import type { Metadata } from "next";

import { UsersContent } from "@/components/admin/users-content";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage staff accounts, roles, and access.",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return <UsersContent />;
}
