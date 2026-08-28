"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Download, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Currency } from "@/components/shared/currency";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerOrders, useDownloadInvoice } from "@/hooks/use-orders";
import { formatDate } from "@/lib/format";

export function InvoicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);

  const { data, isLoading, isError, refetch } = useCustomerOrders(page);
  const downloadInvoice = useDownloadInvoice();

  const invoicedOrders = (data?.data ?? []).filter((order) => !!order.invoice);

  function goToPage(next: number) {
    router.push(`/dashboard/invoices?page=${next}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My invoices" description="Download invoices generated for your orders." />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : invoicedOrders.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices yet"
          description="Invoices are generated once your order has been processed. Check back after your order ships."
        />
      ) : (
        <>
          <div className="stagger-children space-y-3">
            {invoicedOrders.map((order) => (
              <Card key={order.id} className="hover-lift-sm">
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="bg-primary/10 text-primary ring-primary/10 hidden size-10 shrink-0 items-center justify-center rounded-xl ring-1 sm:flex">
                      <Receipt className="size-4.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{order.invoice!.invoice_no}</p>
                        <StatusBadge status={order.invoice!.status} />
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Order {order.order_no} · Issued {formatDate(order.invoice!.issued_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Currency value={order.invoice!.total_amount} className="tabular-nums font-semibold" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        downloadInvoice.mutate({
                          id: order.invoice!.id,
                          invoiceNo: order.invoice!.invoice_no,
                        })
                      }
                      disabled={downloadInvoice.isPending}
                    >
                      <Download className="size-3.5" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {data && data.meta.last_page > 1 && (
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
