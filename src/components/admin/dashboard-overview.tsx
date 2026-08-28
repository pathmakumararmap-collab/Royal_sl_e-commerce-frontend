"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CreditCard,
  ScanLine,
  ShoppingBag,
  ShoppingCart,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Currency } from "@/components/shared/currency";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { useAdminOrders } from "@/hooks/use-orders";
import { useSalesReport, useStockReport } from "@/hooks/use-reports";
import { formatDate } from "@/lib/format";

const SOURCE_LABEL: Record<string, string> = {
  website: "Website",
  facebook: "Facebook",
  pos: "POS",
};

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function DashboardOverview() {
  const today = new Date();
  const todayStr = toIsoDate(today);
  const monthStart = toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const todayOrders = useAdminOrders({ date_from: todayStr, date_to: todayStr, per_page: 1 });
  const monthOrders = useAdminOrders({ date_from: monthStart, date_to: todayStr, per_page: 1 });
  const recentOrders = useAdminOrders({ per_page: 6 });
  const salesReport = useSalesReport({ from: monthStart, to: todayStr });
  const stockReport = useStockReport({});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A snapshot of today's orders, revenue, and stock health."
        actions={
          <Button asChild variant="gradient" size="sm">
            <Link href="/admin/pos">
              <ScanLine className="size-4" />
              Open POS
            </Link>
          </Button>
        }
      />

      <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Orders today"
          value={todayOrders.isLoading ? "…" : String(todayOrders.data?.meta.total ?? 0)}
          icon={ShoppingCart}
        />
        <StatCard
          label="Orders this month"
          value={monthOrders.isLoading ? "…" : String(monthOrders.data?.meta.total ?? 0)}
          icon={ShoppingBag}
        />
        <StatCard
          label="Revenue this month"
          value={
            salesReport.isLoading
              ? "…"
              : (salesReport.data?.summary.total_sales ?? "0")
          }
          icon={Wallet}
        />
        <StatCard
          label="Low stock items"
          value={stockReport.isLoading ? "…" : String(stockReport.data?.low_stock_count ?? 0)}
          icon={AlertTriangle}
        />
      </div>

      <div className="stagger-children grid gap-4 sm:grid-cols-3">
        <Link href="/admin/pos" className="press-scale">
          <Card className="hover-lift group h-full">
            <CardContent className="flex items-center justify-between py-5">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary ring-primary/10 flex size-10 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105">
                  <ScanLine className="size-5" />
                </div>
                <div>
                  <p className="font-medium">Point of Sale</p>
                  <p className="text-muted-foreground text-xs">Ring up a walk-in sale</p>
                </div>
              </div>
              <ArrowRight className="text-muted-foreground size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/products" className="press-scale">
          <Card className="hover-lift group h-full">
            <CardContent className="flex items-center justify-between py-5">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary ring-primary/10 flex size-10 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105">
                  <Boxes className="size-5" />
                </div>
                <div>
                  <p className="font-medium">Products</p>
                  <p className="text-muted-foreground text-xs">Manage catalog & stock</p>
                </div>
              </div>
              <ArrowRight className="text-muted-foreground size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/orders" className="press-scale">
          <Card className="hover-lift group h-full">
            <CardContent className="flex items-center justify-between py-5">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary ring-primary/10 flex size-10 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <p className="font-medium">Orders</p>
                  <p className="text-muted-foreground text-xs">Track & fulfil orders</p>
                </div>
              </div>
              <ArrowRight className="text-muted-foreground size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-eyebrow text-muted-foreground">Latest activity</p>
            <CardTitle className="text-display text-lg">Recent orders</CardTitle>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/orders">
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.isError ? (
            <ErrorState onRetry={() => recentOrders.refetch()} />
          ) : !recentOrders.isLoading && !recentOrders.data?.data.length ? (
            <EmptyState title="No orders yet" description="New orders will appear here." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.isLoading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          {Array.from({ length: 7 }).map((__, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton className="h-4 w-full max-w-[120px]" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : recentOrders.data?.data.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/40">
                          <TableCell>
                            <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                              {order.order_no}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{SOURCE_LABEL[order.source] ?? order.source}</Badge>
                          </TableCell>
                          <TableCell>{order.customer_name ?? order.user?.name ?? "—"}</TableCell>
                          <TableCell>
                            <OrderStatusBadge status={order.status} />
                          </TableCell>
                          <TableCell>
                            <PaymentStatusBadge status={order.payment_status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Currency value={order.total_amount} />
                          </TableCell>
                          <TableCell className="text-muted-foreground text-right text-xs">
                            {formatDate(order.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
