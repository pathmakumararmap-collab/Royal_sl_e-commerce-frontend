"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { useUiStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/products", label: "All products" },
  { href: "/wishlist", label: "Wishlist" },
];

export function MobileNav() {
  const isOpen = useUiStore((state) => state.isMobileNavOpen);
  const setOpen = useUiStore((state) => state.setMobileNavOpen);
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle asChild>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <nav className="stagger-children flex flex-col gap-1 px-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}

          {!user && (
            <>
              <div className="border-border/60 my-2 border-t" />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="text-primary rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}