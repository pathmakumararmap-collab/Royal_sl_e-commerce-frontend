"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Currency } from "@/components/shared/currency";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/shared/status-badge";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerOrders } from "@/hooks/use-orders";
import { formatDate } from "@/lib/format";

export function CustomerOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);

  const { data, isLoading, isError, refetch } = useCustomerOrders(page);

  function goToPage(next: number) {
    router.push(`/dashboard/orders?page=${next}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My orders" description="Track and manage all your past and current orders." />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data?.data.length ? (
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
        <>
          <div className="stagger-children space-y-3">
            {data.data.map((order) => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="group block">
                <Card className="hover-lift press-scale group-hover:border-primary/40">
                  <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{order.order_no}</p>
                        <OrderStatusBadge status={order.status} />
                        <PaymentStatusBadge status={order.payment_status} />
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Placed on {formatDate(order.created_at)} · {order.items?.length ?? 0} item(s)
                      </p>
                    </div>
                    <Currency value={order.total_amount} className="tabular-nums text-lg font-semibold" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {data.meta.last_page > 1 && (
            <Pagination>
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
    </div>
  );
}
