"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { CircleDollarSign, TrendingUp, Wallet as WalletIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Currency } from "@/components/shared/currency";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomerOrders } from "@/hooks/use-orders";
import { formatDate } from "@/lib/format";

export function WalletContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);

  const { data, isLoading, isError, refetch } = useCustomerOrders(page);
  const orders = data?.data ?? [];

  const totalPaid = orders.reduce((sum, order) => sum + order.paid_amount, 0);
  const totalOutstanding = orders.reduce(
    (sum, order) => sum + Math.max(order.total_amount - order.paid_amount, 0),
    0
  );
  const refundedCount = orders.filter((order) => order.payment_status === "refunded").length;

  function goToPage(next: number) {
    router.push(`/dashboard/wallet?page=${next}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My wallet"
        description="A summary of payment activity across your orders."
      />

      <div className="stagger-children grid gap-4 sm:grid-cols-3">
        <StatCard label="Total paid" value={new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(totalPaid)} icon={WalletIcon} />
        <StatCard label="Outstanding balance" value={new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(totalOutstanding)} icon={CircleDollarSign} />
        <StatCard label="Refunded orders" value={String(refundedCount)} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-display text-lg">Payment activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : orders.length === 0 ? (
            <EmptyState
              icon={WalletIcon}
              title="No payment activity yet"
              description="Your payment history will appear here once you place an order."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_no}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={order.payment_status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        <Currency value={order.total_amount} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        <Currency value={order.paid_amount} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        <Currency value={Math.max(order.total_amount - order.paid_amount, 0)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data && data.meta.last_page > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                        Previous
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-muted-foreground px-3 text-sm">
                        Page {page} of {data.meta.last_page}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= data.meta.last_page}
                        onClick={() => goToPage(page + 1)}
                      >
                        Next
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
