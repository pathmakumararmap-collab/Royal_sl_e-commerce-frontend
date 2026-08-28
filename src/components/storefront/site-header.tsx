"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Search, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/shared/logo";
import { UserNav } from "@/components/shared/user-nav";
import { MobileNav } from "@/components/storefront/mobile-nav";
import { CartSheet } from "@/components/storefront/cart-sheet";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useUiStore } from "@/store/ui-store";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/products", label: "All Products" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [hideTopRow, setHideTopRow] = React.useState(false);
  const lastScrollY = React.useRef(0);
  const { data: cart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const setCartOpen = useUiStore((state) => state.setCartOpen);

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const isHomepage = pathname === "/";

  React.useEffect(() => {
    if (!isHomepage) {
      setHideTopRow(false);
      return;
    }

    function handleScroll() {
      if (window.innerWidth >= 768) {
        setHideTopRow(false);
        return;
      }
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      // Ignore tiny movements (momentum-scroll jitter) so the header
      // doesn't flicker; only react once the scroll has moved a few px.
      if (Math.abs(delta) > 6) {
        setHideTopRow(currentY > 72 && delta > 0);
        lastScrollY.current = currentY;
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomepage]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header
      className={cn(
        "glass-nav sticky top-0 z-40 border-b border-border/60 transition-transform duration-300",
        hideTopRow && "-translate-y-16"
      )}
    >
      <div className="container-page flex h-16 items-center gap-4 lg:gap-6">
        <MobileNav />
        <Logo className="shrink-0" />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="mx-auto hidden max-w-lg flex-1 md:flex">
          <div className="relative w-full">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products…"
              className="rounded-md pr-11 pl-9"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md bg-[#FB6C00] text-white transition-opacity hover:opacity-90"
            >
              <Search className="size-4" />
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-0.5 md:ml-0">
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/wishlist" aria-label="Wishlist">
              <Heart className="size-5" />
              {wishlistCount > 0 && (
                <Badge className="bg-gradient-gold text-accent-foreground absolute -top-1 -right-1 h-4.5 min-w-4.5 justify-center rounded-full border-0 px-1 text-[10px] shadow-sm">
                  {wishlistCount}
                </Badge>
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setCartOpen(true)}
            aria-label="Cart"
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <Badge className="bg-gradient-gold text-accent-foreground absolute -top-1 -right-1 h-4.5 min-w-4.5 justify-center rounded-full border-0 px-1 text-[10px] shadow-sm">
                {cartCount}
              </Badge>
            )}
          </Button>

          <UserNav />
        </div>
      </div>

      {isHomepage && (
        <form
          onSubmit={handleSearch}
          className="border-border/60 container-page border-t pt-2.5 pb-3 md:hidden"
        >
          <div className="relative w-full">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products…"
              className="rounded-full border-1 border-[#FB6C00] bg-white pr-[4.75rem] pl-9 text-sm font-normal placeholder:text-xs placeholder:font-normal"
            />
            <button
              type="submit"
              className="absolute top-1/2 right-1.25 h-7.25 -translate-y-1/2 rounded-full bg-[#FB6C00] px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              Search
            </button>
          </div>
        </form>
      )}

      <CartSheet />
    </header>
  );
}