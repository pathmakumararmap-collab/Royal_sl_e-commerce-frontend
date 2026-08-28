"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  MapPin,
  PackageX,
  Printer,
  Receipt,
} from "lucide-react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Currency } from "@/components/shared/currency";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { OrderReceipt } from "@/components/shared/order-receipt";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/shared/status-badge";
import {
  useAdminCancelOrder,
  useAdminOrder,
  useDownloadInvoice,
  useGenerateInvoice,
  usePaymentMethods,
  useRecordPayment,
  useUpdateOrderStatus,
} from "@/hooks/use-orders";
import { formatDateTime, formatOrderStatus } from "@/lib/format";
import type { OrderStatus } from "@/types/order";

const CANCELLABLE_STATUSES: OrderStatus[] = ["pending", "confirmed", "processing"];

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
  "returned",
];

const recordPaymentSchema = z.object({
  payment_method_id: z.coerce.number({ error: "Select a payment method." }).positive(),
  amount: z.coerce.number({ error: "Amount is required." }).positive(),
  transaction_id: z.string().optional().or(z.literal("")),
});

type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;

function RecordPaymentDialog({
  open,
  onOpenChange,
  orderId,
  balanceDue,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  balanceDue: number;
}) {
  const { data: paymentMethods } = usePaymentMethods();
  const recordPayment = useRecordPayment();

  const defaultValues: RecordPaymentFormValues = {
    payment_method_id: 0,
    amount: balanceDue > 0 ? balanceDue : 0,
    transaction_id: "",
  };

  const form = useForm({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues,
  });

  React.useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function onSubmit(values: RecordPaymentFormValues) {
    recordPayment.mutate(
      {
        id: orderId,
        input: {
          payment_method_id: values.payment_method_id,
          amount: values.amount,
          transaction_id: values.transaction_id || undefined,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>Log a payment received for this order.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="payment_method_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment method</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods?.map((method) => (
                        <SelectItem key={method.id} value={String(method.id)}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      {...field}
                      value={(field.value as number | undefined) ?? 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transaction_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction ID (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="TXN-00123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={recordPayment.isPending}>
                {recordPayment.isPending ? "Recording…" : "Record payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function OrderDetailAdminContent({ orderId }: { orderId: number }) {
  const { data: order, isLoading, isError, refetch } = useAdminOrder(orderId);
  const updateStatus = useUpdateOrderStatus();
  const cancelOrder = useAdminCancelOrder();
  const generateInvoice = useGenerateInvoice();
  const downloadInvoice = useDownloadInvoice();

  const [statusValue, setStatusValue] = React.useState<string>("");
  const [statusNote, setStatusNote] = React.useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);

  React.useEffect(() => {
    if (order) setStatusValue(order.status);
  }, [order]);

  if (isLoading) {
    return <LoadingSpinner className="min-h-[50vh]" />;
  }

  if (isError || !order) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);
  const timeline = order.status_histories ?? [];
  const balanceDue = Math.max(order.total_amount - order.paid_amount, 0);

  return (
    <div className="animate-in-fade-up space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="size-3.5" />
              Back to orders
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-display text-2xl tracking-tight">{order.order_no}</h1>
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.payment_status} />
            <Badge variant="outline" className="capitalize">
              {order.source}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">Placed on {formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPaymentDialogOpen(true)}>
            <CreditCard className="size-4" />
            Record payment
          </Button>
          {!order.invoice ? (
            <Button
              variant="outline"
              onClick={() => generateInvoice.mutate(order.id)}
              disabled={generateInvoice.isPending}
            >
              <FileText className="size-4" />
              Generate invoice
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() =>
                downloadInvoice.mutate({ id: order.invoice!.id, invoiceNo: order.invoice!.invoice_no })
              }
              disabled={downloadInvoice.isPending}
            >
              <Download className="size-4" />
              Download invoice
            </Button>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print bill
          </Button>
          {canCancel && (
            <Button variant="destructive" onClick={() => setCancelOpen(true)}>
              <PackageX className="size-4" />
              Cancel order
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-eyebrow text-muted-foreground">Items</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
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
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          <Currency value={item.unit_price} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Currency value={item.subtotal} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator className="my-4" />

              <div className="bg-muted/30 ml-auto max-w-xs space-y-1.5 rounded-lg p-4 text-sm">
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
                <div className="text-base font-semibold flex justify-between">
                  <span>Total</span>
                  <Currency value={order.total_amount} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <Currency value={order.paid_amount} />
                </div>
                {balanceDue > 0 && (
                  <div className="text-destructive flex justify-between font-medium">
                    <span>Balance due</span>
                    <Currency value={balanceDue} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-eyebrow text-muted-foreground">Update status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
                <Select value={statusValue} onValueChange={setStatusValue}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((value) => (
                      <SelectItem key={value} value={value} className="capitalize">
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  rows={1}
                  placeholder="Add an optional note…"
                  value={statusNote}
                  onChange={(event) => setStatusNote(event.target.value)}
                />
              </div>
              <Button
                size="sm"
                variant="gradient"
                disabled={
                  updateStatus.isPending || !statusValue || statusValue === order.status
                }
                onClick={() =>
                  updateStatus.mutate(
                    { id: order.id, status: statusValue, note: statusNote || undefined },
                    { onSuccess: () => setStatusNote("") }
                  )
                }
              >
                {updateStatus.isPending ? "Updating…" : "Update status"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-eyebrow text-muted-foreground">Status history</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {timeline.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No status updates yet. Current status: {formatOrderStatus(order.status)}.
                </p>
              ) : (
                <ol className="space-y-0">
                  {timeline.map((entry, index) => {
                    const isLatest = index === 0;
                    const isLast = index === timeline.length - 1;
                    return (
                      <li key={entry.id} className="relative flex gap-4 pb-6 pl-0.5 last:pb-0">
                        <div className="flex flex-col items-center">
                          <span
                            className={
                              isLatest
                                ? "bg-primary text-primary-foreground shadow-luxury-glow flex size-7 shrink-0 items-center justify-center rounded-full ring-4 ring-primary/10"
                                : "bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full"
                            }
                          >
                            <CheckCircle2 className="size-4" />
                          </span>
                          {!isLast && <span className="bg-border mt-1.5 w-px flex-1" />}
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold">{formatOrderStatus(entry.status)}</p>
                            {isLatest && (
                              <Badge variant="secondary" className="text-[10px]">
                                Current
                              </Badge>
                            )}
                          </div>
                          {entry.note && (
                            <p className="text-muted-foreground mt-0.5 text-sm text-pretty">{entry.note}</p>
                          )}
                          <p className="text-muted-foreground mt-1 text-xs tabular-nums">
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
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-eyebrow text-muted-foreground">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-6 text-sm">
              <p className="font-medium">{order.customer_name ?? order.user?.name ?? "—"}</p>
              {order.customer_phone && <p className="text-muted-foreground">{order.customer_phone}</p>}
              {order.customer_email && <p className="text-muted-foreground">{order.customer_email}</p>}
              {order.warehouse && (
                <p className="text-muted-foreground pt-1 text-xs">
                  Fulfilled from {order.warehouse.name}
                </p>
              )}
            </CardContent>
          </Card>

          {order.shipping_address && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="text-primary size-4" />
                  Shipping address
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 text-sm">
                <p className="font-medium">{order.shipping_address.recipient_name}</p>
                <p className="text-muted-foreground">
                  {order.shipping_address.address_line1}, {order.shipping_address.city}
                </p>
                <p className="text-muted-foreground">{order.shipping_address.phone}</p>
              </CardContent>
            </Card>
          )}

          {order.billing_address && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="text-primary size-4" />
                  Billing address
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 text-sm">
                <p className="font-medium">{order.billing_address.recipient_name}</p>
                <p className="text-muted-foreground">
                  {order.billing_address.address_line1}, {order.billing_address.city}
                </p>
                <p className="text-muted-foreground">{order.billing_address.phone}</p>
              </CardContent>
            </Card>
          )}

          {order.payments && order.payments.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
                  <Receipt className="text-primary size-4" />
                  Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6 text-sm">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{payment.payment_method ?? "Payment"}</p>
                      <p className="text-muted-foreground text-xs">
                        {payment.paid_at ? formatDateTime(payment.paid_at) : "Pending"}
                      </p>
                    </div>
                    <Currency value={payment.amount} className="tabular-nums font-medium" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {order.invoice && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
                  <FileText className="text-primary size-4" />
                  Invoice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 pt-6 text-sm">
                <p className="font-medium">{order.invoice.invoice_no}</p>
                <p className="text-muted-foreground text-xs">
                  Issued {formatDateTime(order.invoice.issued_at)}
                </p>
                <Badge variant="secondary" className="capitalize">
                  {order.invoice.status}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <RecordPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        orderId={order.id}
        balanceDue={balanceDue}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this order?"
        description="This will cancel the order and release any reserved stock. This action cannot be undone."
        confirmLabel="Cancel order"
        loading={cancelOrder.isPending}
        onConfirm={() =>
          cancelOrder.mutate(
            { id: order.id, reason: "Cancelled by admin" },
            { onSuccess: () => setCancelOpen(false) }
          )
        }
      />

      <OrderReceipt order={order} invoice={order.invoice} />
    </div>
  );
}