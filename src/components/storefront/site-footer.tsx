import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/lib/constants/site";
import { FacebookIcon, InstagramIcon, XIcon } from "@/components/icons/social-icons";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All Products" },
      { href: "/categories", label: "Categories" },
      { href: "/search", label: "Search" },
      { href: "/wishlist", label: "Wishlist" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/orders", label: "My Orders" },
      { href: "/dashboard/addresses", label: "Addresses" },
      { href: "/dashboard/coupons", label: "Coupons" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create account" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-muted/30 border-t border-border/60">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-10">
        <div className="space-y-5">
          <Logo />
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed text-pretty">
            {siteConfig.description}
          </p>
          <div className="flex gap-2">
            <Link
              href={siteConfig.links.facebook}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex size-9 items-center justify-center rounded-full transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon className="size-4.5" />
            </Link>
            <Link
              href={siteConfig.links.instagram}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex size-9 items-center justify-center rounded-full transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon className="size-4.5" />
            </Link>
            <Link
              href={siteConfig.links.twitter}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex size-9 items-center justify-center rounded-full transition-colors"
              aria-label="Twitter"
            >
              <XIcon className="size-4.5" />
            </Link>
          </div>
        </div>

        {FOOTER_LINKS.map((section) => (
          <div key={section.title} className="space-y-4">
            <h4 className="text-eyebrow text-muted-foreground">{section.title}</h4>
            <ul className="space-y-2.5">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="space-y-4">
          <h4 className="text-eyebrow text-muted-foreground">Contact</h4>
          <ul className="text-muted-foreground space-y-2.5 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="text-primary mt-0.5 size-4 shrink-0" />
              <span>{siteConfig.contact.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="text-primary size-4 shrink-0" />
              <span>{siteConfig.contact.phone}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="text-primary size-4 shrink-0" />
              <span>{siteConfig.contact.email}</span>
            </li>
          </ul>
        </div>
      </div>
      <Separator className="bg-border/60" />
      <div className="container-page flex flex-col items-center justify-between gap-2 py-7 text-xs sm:flex-row">
        <p className="text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.fullName}. All rights reserved.
        </p>
        <p className="text-muted-foreground">Made By S.R Wijepura</p>
      </div>
    </footer>
  );
}
