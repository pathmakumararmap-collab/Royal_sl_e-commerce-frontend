"use client";

import Link from "next/link";
import { Bell, Menu } from "lucide-react";

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
import { DashboardSidebarNav } from "@/components/customer/dashboard-sidebar";
import { useNotifications } from "@/hooks/use-notifications";

export function DashboardHeader() {
  const { data } = useNotifications();
  const unreadCount = data?.unread_count ?? 0;

  return (
    <header className="glass-nav sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 px-4 lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b">
            <SheetTitle asChild>
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <DashboardSidebarNav />
        </SheetContent>
      </Sheet>

      <div className="lg:hidden">
        <Logo />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link href="/dashboard/notifications" aria-label="Notifications">
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <Badge className="bg-gradient-gold text-accent-foreground absolute -top-1 -right-1 h-4.5 min-w-4.5 justify-center rounded-full border-0 px-1 text-[10px] shadow-luxury-sm">
                {unreadCount}
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
