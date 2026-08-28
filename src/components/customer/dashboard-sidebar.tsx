"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronLeft,
  CreditCard,
  LayoutDashboard,
  MapPin,
  Package,
  Settings,
  Ticket,
  User,
  Wallet as WalletIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/invoices", label: "Invoices", icon: CreditCard },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/wallet", label: "Wallet", icon: WalletIcon },
  { href: "/dashboard/coupons", label: "Coupons", icon: Ticket },
  { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "transition-luxury flex items-center gap-3 rounded-full px-3.5 py-2 text-sm font-medium",
              isActive
                ? "bg-primary/10 text-primary shadow-luxury-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className={cn("size-4 shrink-0", isActive && "text-primary")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  return (
    <aside className="bg-sidebar text-sidebar-foreground hidden w-64 shrink-0 border-r border-sidebar-border lg:block">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/" aria-label="Back to store">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <Logo />
      </div>
      <DashboardSidebarNav />
    </aside>
  );
}
