"use client";

import { Bell, Menu } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { UserNav } from "@/components/shared/user-nav";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar";
import { useLowStockAlerts } from "@/hooks/use-inventory";

export function AdminHeader() {
  const { data } = useLowStockAlerts(1);
  const alertCount = data?.meta.total ?? 0;

  return (
    <header className="glass-nav border-border/60 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 overflow-y-auto p-0">
          <SheetHeader className="border-b">
            <SheetTitle asChild>
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <AdminSidebarNav />
        </SheetContent>
      </Sheet>

      <div className="lg:hidden">
        <Logo />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link href="/admin/inventory?tab=low-stock" aria-label="Low stock alerts">
            <Bell className="size-5" />
            {alertCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4.5 min-w-4.5 justify-center rounded-full px-1 text-[10px]">
                {alertCount}
              </Badge>
            )}
          </Link>
        </Button>
        <ModeToggle />
        <UserNav />
      </div>
    </header>
  );
}
