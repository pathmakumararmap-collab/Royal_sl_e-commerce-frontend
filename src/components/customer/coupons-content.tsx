import Link from "next/link";
import { ArrowRight, BadgePercent, Tag, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const STEPS = [
  {
    icon: Tag,
    title: "Have a coupon code?",
    description:
      "Enter it in the “Coupon code” field at checkout and the discount will be applied to your order automatically before you pay.",
  },
  {
    icon: BadgePercent,
    title: "Look out for promotions",
    description:
      "Keep an eye on our storefront and notifications for seasonal offers and limited-time discount codes.",
  },
];

export function CouponsContent() {
  return (
    <div className="space-y-8">
      <PageHeader title="Coupons" description="Save on your next order with a discount code." />

      <div className="bg-gradient-brand-radiant relative overflow-hidden rounded-2xl px-6 py-10 sm:px-10 sm:py-14">
        <div className="animate-float absolute -top-6 -right-6 hidden size-32 rounded-full bg-white/5 blur-2xl sm:block" aria-hidden />
        <div className="relative mx-auto max-w-lg text-center">
          <span className="bg-white/10 text-accent ring-white/15 mx-auto flex size-14 items-center justify-center rounded-2xl ring-1 backdrop-blur-sm">
            <Ticket className="size-6" />
          </span>
          <h2 className="text-display mt-5 text-2xl text-white sm:text-3xl">
            Every discount, <span className="text-gradient-gold">automatically applied</span>
          </h2>
          <p className="mt-3 text-sm text-white/70">
            No stacking, no guesswork — just enter your code at checkout and watch the total update.
          </p>
        </div>
      </div>

      <div>
        <p className="text-eyebrow text-primary/70 mb-4">How it works</p>
        <div className="stagger-children grid gap-4 sm:grid-cols-2">
          {STEPS.map((step) => (
            <Card key={step.title} className="hover-lift-sm">
              <CardContent className="flex items-start gap-4 py-1">
                <div className="bg-primary/10 text-primary ring-primary/10 flex size-11 shrink-0 items-center justify-center rounded-xl ring-1">
                  <step.icon className="size-5" />
                </div>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-muted-foreground mt-1 text-sm text-pretty">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <Button asChild size="lg" variant="gradient">
          <Link href="/cart">
            Go to cart
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}