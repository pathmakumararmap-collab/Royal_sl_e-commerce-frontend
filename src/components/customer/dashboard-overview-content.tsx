"use client";

import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Package,
  Receipt,
  ShoppingBag,
  Wallet as WalletIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Currency } from "@/components/shared/currency";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { useCustomerOrders } from "@/hooks/use-orders";
import { useAddresses } from "@/hooks/use-addresses";
import { formatDate } from "@/lib/format";
import { useAuthStore } from "@/store/auth-store";

export function DashboardOverviewContent() {
  const user = useAuthStore((state) => state.user);
  const { data: orders, isLoading, isError, refetch } = useCustomerOrders(1);
  const { data: addresses } = useAddresses();

  const recentOrders = orders?.data.slice(0, 5) ?? [];
  const totalSpent = (orders?.data ?? []).reduce((sum, order) => sum + order.paid_amount, 0);
  const pendingOrders = (orders?.data ?? []).filter((order) =>
    ["pending", "confirmed", "processing", "packed", "shipped"].includes(order.status)
  ).length;

  return (
    <div className="space-y-8">
      <div className="animate-in-fade-up">
        <p className="text-eyebrow text-primary/70">Account overview</p>
        <h1 className="text-display mt-1.5 text-3xl">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Here&apos;s a quick look at your account activity.
        </p>
      </div>

      <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total orders" value={String(orders?.meta.total ?? 0)} icon={ShoppingBag} />
        <StatCard label="In progress" value={String(pendingOrders)} icon={Package} />
        <StatCard
          label="Total paid"
          value={new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(totalSpent)}
          icon={WalletIcon}
        />
        <StatCard label="Saved addresses" value={String(addresses?.length ?? 0)} icon={MapPin} />
      </div>

      <Card className="shadow-luxury-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-display text-lg">Recent orders</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/orders">
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : recentOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No orders yet"
              description="When you place an order, it will show up here."
              action={
                <Button asChild size="sm">
                  <Link href="/products">Start shopping</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border/60">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="hover:bg-muted/50 transition-luxury -mx-2 flex items-center justify-between gap-4 rounded-lg px-2 py-3.5"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{order.order_no}</p>
                      <p className="text-muted-foreground text-xs">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Currency value={order.total_amount} className="text-sm font-medium" />
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="stagger-children grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/addresses" className="group">
          <Card className="hover-lift press-scale group-hover:border-primary/40 h-full">
            <CardContent className="flex items-center gap-3.5 py-5">
              <div className="bg-primary/10 text-primary ring-primary/10 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105">
                <MapPin className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-medium">Addresses</p>
                <p className="text-muted-foreground text-xs">Manage shipping details</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/invoices" className="group">
          <Card className="hover-lift press-scale group-hover:border-primary/40 h-full">
            <CardContent className="flex items-center gap-3.5 py-5">
              <div className="bg-primary/10 text-primary ring-primary/10 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105">
                <Receipt className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-medium">Invoices</p>
                <p className="text-muted-foreground text-xs">Download past invoices</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/wallet" className="group">
          <Card className="hover-lift press-scale group-hover:border-primary/40 h-full">
            <CardContent className="flex items-center gap-3.5 py-5">
              <div className="bg-primary/10 text-primary ring-primary/10 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105">
                <WalletIcon className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-medium">Wallet</p>
                <p className="text-muted-foreground text-xs">Track payments &amp; refunds</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
