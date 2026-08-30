"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Download, MapPin, PackageX, Receipt } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Currency } from "@/components/shared/currency";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/shared/status-badge";
import { useCancelOrder, useCustomerOrder, useDownloadInvoice } from "@/hooks/use-orders";
import { formatDate, formatDateTime, formatOrderStatus } from "@/lib/format";

const CANCELLABLE_STATUSES = ["pending", "confirmed"];

export function OrderDetailContent({ orderId }: { orderId: number }) {
  const { data: order, isLoading, isError, refetch } = useCustomerOrder(orderId);
  const cancelOrder = useCancelOrder();
  const downloadInvoice = useDownloadInvoice();
  const [cancelOpen, setCancelOpen] = React.useState(false);

  if (isLoading) {
    return <LoadingSpinner className="min-h-[50vh]" />;
  }

  if (isError || !order) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);
  const timeline = order.status_histories ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="size-3.5" />
              Back to orders
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-display text-2xl">{order.order_no}</h1>
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.payment_status} />
          </div>
          <p className="text-muted-foreground text-sm">Placed on {formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {order.invoice && (
            <Button
              variant="outline"
              onClick={() =>
                downloadInvoice.mutate({ id: order.invoice!.id, invoiceNo: order.invoice!.invoice_no })
              }
              disabled={downloadInvoice.isPending}
            >
              <Download className="size-4" />
              Invoice
            </Button>
          )}
          {canCancel && (
            <Button variant="destructive" onClick={() => setCancelOpen(true)}>
              <PackageX className="size-4" />
              Cancel order
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="text-display text-lg">Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit price</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(order.items ?? []).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-muted-foreground text-xs">{item.sku}</div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        <Currency value={item.unit_price} />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <Currency value={item.subtotal} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <div className="ml-auto max-w-xs space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <Currency value={order.subtotal} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <Currency value={-order.discount_amount} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <Currency value={order.tax_amount} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <Currency value={order.shipping_amount} />
                </div>
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <Currency value={order.total_amount} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-display text-lg">Track order</CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No status updates yet. Current status: {formatOrderStatus(order.status)}.
                </p>
              ) : (
                <ol className="space-y-0">
                  {timeline.map((entry, index) => {
                    const isCurrent = index === 0;
                    const isLast = index === timeline.length - 1;
                    return (
                      <li key={entry.id} className="relative flex gap-4 pb-7 pl-1 last:pb-0">
                        {!isLast && (
                          <span
                            className={cn(
                              "absolute top-7 left-[19px] -ml-px h-[calc(100%-1.75rem)] w-0.5",
                              isCurrent ? "bg-primary/40" : "bg-border"
                            )}
                            aria-hidden
                          />
                        )}
                        <span
                          className={cn(
                            "relative flex size-[38px] shrink-0 items-center justify-center rounded-full ring-4",
                            isCurrent
                              ? "bg-primary text-primary-foreground ring-primary/10 shadow-luxury-glow"
                              : "bg-muted text-muted-foreground ring-transparent"
                          )}
                        >
                          <CheckCircle2 className="size-4.5" />
                        </span>
                        <div className="pt-1.5">
                          <p className={cn("text-sm font-semibold", isCurrent && "text-primary")}>
                            {formatOrderStatus(entry.status)}
                          </p>
                          {entry.note && (
                            <p className="text-muted-foreground mt-0.5 text-sm">{entry.note}</p>
                          )}
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {formatDateTime(entry.created_at)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {order.shipping_address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                    <MapPin className="size-4" />
                  </span>
                  Shipping address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">{order.shipping_address.recipient_name}</p>
                <p className="text-muted-foreground mt-1">
                  {order.shipping_address.address_line1}, {order.shipping_address.city}
                </p>
                <p className="text-muted-foreground">{order.shipping_address.phone}</p>
              </CardContent>
            </Card>
          )}

          {order.payments && order.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                    <Receipt className="size-4" />
                  </span>
                  Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-border/60 divide-y text-sm">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium">{payment.payment_method ?? "Payment"}</p>
                      <p className="text-muted-foreground text-xs">
                        {payment.paid_at ? formatDate(payment.paid_at) : "Pending"}
                      </p>
                    </div>
                    <Currency value={payment.amount} className="tabular-nums font-medium" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this order?"
        description="This will cancel your order. This action cannot be undone."
        confirmLabel="Cancel order"
        loading={cancelOrder.isPending}
        onConfirm={() =>
          cancelOrder.mutate(
            { id: order.id, reason: "Cancelled by customer" },
            { onSuccess: () => setCancelOpen(false) }
          )
        }
      />
    </div>
  );
}