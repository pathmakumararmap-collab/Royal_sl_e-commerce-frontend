"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ADMIN_NAV_GROUPS } from "@/lib/constants/admin-nav";
import { hasPermission, useAuthStore } from "@/store/auth-store";

export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <nav className="flex flex-col gap-6 p-4">
      {ADMIN_NAV_GROUPS.map((group) => {
        const visibleItems = group.items.filter(
          (item) => !item.permission || hasPermission(user, item.permission)
        );

        if (visibleItems.length === 0) return null;

        return (
          <div key={group.title} className="space-y-1">
            <p className="text-muted-foreground text-eyebrow px-3">{group.title}</p>
            {visibleItems.map((item) => {
              const isActive =
                item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "transition-luxury relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-4 shrink-0 transition-transform duration-300",
                      isActive && "text-primary"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="bg-primary absolute top-1/2 right-2 size-1.5 -translate-y-1/2 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden w-64 shrink-0 overflow-y-auto border-r lg:block">
      <div className="bg-sidebar border-sidebar-border sticky top-0 z-10 flex h-16 items-center gap-2 border-b px-4">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/" aria-label="Back to store">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <Logo />
      </div>
      <AdminSidebarNav />
    </aside>
  );
}
