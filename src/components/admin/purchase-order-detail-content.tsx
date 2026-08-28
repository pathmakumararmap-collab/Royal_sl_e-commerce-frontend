"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, PackageCheck } from "lucide-react";

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
import { Input } from "@/components/ui/input";
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
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { usePurchase, useReceivePurchase } from "@/hooks/use-inventory";
import { formatDate, formatDateTime } from "@/lib/format";

export function PurchaseOrderDetailContent({ id }: { id: number }) {
  const { data: purchase, isLoading, isError, refetch } = usePurchase(id);
  const receivePurchase = useReceivePurchase();

  const [receiveOpen, setReceiveOpen] = React.useState(false);
  const [receivedQuantities, setReceivedQuantities] = React.useState<Record<number, number>>({});

  React.useEffect(() => {
    if (receiveOpen && purchase?.items) {
      const initial: Record<number, number> = {};
      for (const item of purchase.items) {
        initial[item.id] = Math.max(item.quantity - item.received_quantity, 0);
      }
      setReceivedQuantities(initial);
    }
  }, [receiveOpen, purchase]);

  if (isLoading) {
    return <LoadingSpinner className="min-h-[50vh]" />;
  }

  if (isError || !purchase) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const currentPurchase = purchase;
  const items = currentPurchase.items ?? [];
  const canReceive = currentPurchase.status === "ordered";

  function submitReceive() {
    const payload = items
      .map((item) => ({
        item_id: item.id,
        received_quantity: Math.max(0, Math.min(receivedQuantities[item.id] ?? 0, item.quantity - item.received_quantity)),
      }))
      .filter((entry) => entry.received_quantity > 0);

    if (payload.length === 0) {
      setReceiveOpen(false);
      return;
    }

    receivePurchase.mutate(
      { id: currentPurchase.id, items: payload },
      { onSuccess: () => setReceiveOpen(false) }
    );
  }

  return (
    <div className="animate-in-fade-up space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link href="/admin/purchase-orders">
              <ArrowLeft className="size-3.5" />
              Back to purchase orders
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-display text-2xl tracking-tight">{purchase.purchase_no}</h1>
            <StatusBadge status={purchase.status} />
          </div>
          <p className="text-muted-foreground text-sm">
            {purchase.supplier?.name ?? "Unknown supplier"} · {purchase.warehouse?.name ?? "Unknown warehouse"}
          </p>
        </div>
        {canReceive && (
          <Button variant="gradient" onClick={() => setReceiveOpen(true)}>
            <PackageCheck className="size-4" />
            Receive stock
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-eyebrow text-muted-foreground">Items</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Ordered</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Unit cost</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.product?.name ?? "-"}</div>
                      {item.product?.sku && (
                        <div className="text-muted-foreground text-xs">{item.product.sku}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.received_quantity}</TableCell>
                    <TableCell className="text-right">
                      <Currency value={item.unit_cost} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Currency value={item.subtotal} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Separator className="my-4" />

            <div className="bg-muted/30 ml-auto max-w-xs space-y-1.5 rounded-lg p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <Currency value={purchase.subtotal} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <Currency value={purchase.tax_amount} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <Currency value={-purchase.discount_amount} />
              </div>
              <Separator />
              <div className="text-base font-semibold flex justify-between">
                <span>Total</span>
                <Currency value={purchase.total_amount} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-eyebrow text-muted-foreground">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order date</span>
                <span>{formatDate(purchase.order_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected date</span>
                <span>{purchase.expected_date ? formatDate(purchase.expected_date) : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Received date</span>
                <span>{purchase.received_date ? formatDate(purchase.received_date) : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDateTime(purchase.created_at)}</span>
              </div>
              {purchase.notes && (
                <div className="space-y-1 pt-2">
                  <span className="text-muted-foreground">Notes</span>
                  <p>{purchase.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Receive stock</DialogTitle>
            <DialogDescription>
              Enter the quantity received for each item. Received stock will be added to{" "}
              {purchase.warehouse?.name ?? "the warehouse"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5">
            {items.map((item) => {
              const remaining = Math.max(item.quantity - item.received_quantity, 0);
              return (
                <div
                  key={item.id}
                  className="bg-muted/30 flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.product?.name ?? "-"}</p>
                    <p className="text-muted-foreground text-xs tabular-nums">
                      {item.received_quantity} of {item.quantity} received
                    </p>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    max={remaining}
                    className="bg-background w-24"
                    disabled={remaining === 0}
                    value={receivedQuantities[item.id] ?? 0}
                    onChange={(event) =>
                      setReceivedQuantities((prev) => ({
                        ...prev,
                        [item.id]: Number(event.target.value),
                      }))
                    }
                  />
                </div>
              );
            })}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setReceiveOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="gradient" onClick={submitReceive} disabled={receivePurchase.isPending}>
              {receivePurchase.isPending ? "Receiving…" : "Confirm receipt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
