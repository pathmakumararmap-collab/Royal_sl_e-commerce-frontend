"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { PackageCheck, Plus, Trash2 } from "lucide-react";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAdminProducts } from "@/hooks/use-admin-products";
import {
  useCreateStockTransfer,
  useReceiveStockTransfer,
  useStockTransfer,
  useStockTransfers,
  useWarehouses,
} from "@/hooks/use-inventory";
import { formatDate } from "@/lib/format";
import { stockTransferSchema, type StockTransferFormValues } from "@/lib/validators/inventory";
import type { StockTransfer } from "@/types/inventory";

type TransferFormInput = z.input<typeof stockTransferSchema>;

const EMPTY_ITEM = { product_id: 0, quantity: 1 };

function NewTransferDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: warehouses } = useWarehouses();
  const { data: products } = useAdminProducts({ per_page: 100, sort: "name" });
  const createTransfer = useCreateStockTransfer();

  const form = useForm<TransferFormInput, unknown, StockTransferFormValues>({
    resolver: zodResolver(stockTransferSchema),
    defaultValues: {
      from_warehouse_id: 0,
      to_warehouse_id: 0,
      transfer_date: new Date().toISOString().slice(0, 10),
      notes: "",
      items: [EMPTY_ITEM],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  React.useEffect(() => {
    if (open) {
      form.reset({
        from_warehouse_id: 0,
        to_warehouse_id: 0,
        transfer_date: new Date().toISOString().slice(0, 10),
        notes: "",
        items: [EMPTY_ITEM],
      });
    }
  }, [open, form]);

  function onSubmit(values: StockTransferFormValues) {
    createTransfer.mutate(
      { ...values, notes: values.notes || undefined },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  const productList = products?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New stock transfer</DialogTitle>
          <DialogDescription>Move stock between two warehouses.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="from_warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(warehouses ?? []).map((warehouse) => (
                          <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                            {warehouse.name}
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
                name="to_warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Destination" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(warehouses ?? []).map((warehouse) => (
                          <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                            {warehouse.name}
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
                name="transfer_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Items</p>
                <Button type="button" variant="outline" size="sm" onClick={() => append(EMPTY_ITEM)}>
                  <Plus className="size-4" />
                  Add item
                </Button>
              </div>
              <div className="space-y-2.5">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-muted/30 grid grid-cols-[1fr_100px_auto] items-end gap-2 rounded-lg border p-2.5"
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.product_id`}
                      render={({ field: itemField }) => (
                        <FormItem>
                          <FormLabel className="sr-only">Product</FormLabel>
                          <Select
                            value={itemField.value ? String(itemField.value) : undefined}
                            onValueChange={(value) => itemField.onChange(Number(value))}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background w-full">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {productList.map((product) => (
                                <SelectItem key={product.id} value={String(product.id)}>
                                  {product.name}
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
                      name={`items.${index}.quantity`}
                      render={({ field: itemField }) => (
                        <FormItem>
                          <FormLabel className="sr-only">Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              placeholder="Qty"
                              className="bg-background"
                              {...itemField}
                              value={(itemField.value ?? "") as number}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                      title="Remove item"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={createTransfer.isPending}>
                {createTransfer.isPending ? "Dispatching…" : "Dispatch transfer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ReceiveTransferDialog({
  transferId,
  onOpenChange,
}: {
  transferId: number | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: transfer, isLoading } = useStockTransfer(transferId);
  const receiveTransfer = useReceiveStockTransfer();
  const [quantities, setQuantities] = React.useState<Record<number, number>>({});

  React.useEffect(() => {
    if (transfer?.items) {
      const initial: Record<number, number> = {};
      for (const item of transfer.items) {
        initial[item.id] = Math.max(item.quantity - item.received_quantity, 0);
      }
      setQuantities(initial);
    }
  }, [transfer]);

  const items = transfer?.items ?? [];

  function submit() {
    if (!transfer) return;
    const payload = items
      .map((item) => ({
        item_id: item.id,
        received_quantity: Math.max(
          0,
          Math.min(quantities[item.id] ?? 0, item.quantity - item.received_quantity)
        ),
      }))
      .filter((entry) => entry.received_quantity > 0);

    if (payload.length === 0) {
      onOpenChange(false);
      return;
    }

    receiveTransfer.mutate(
      { id: transfer.id, items: payload },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open={!!transferId} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Receive transfer{transfer ? ` — ${transfer.transfer_no}` : ""}</DialogTitle>
          <DialogDescription>Confirm the quantity received at the destination warehouse.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
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
                    value={quantities[item.id] ?? 0}
                    onChange={(event) =>
                      setQuantities((prev) => ({ ...prev, [item.id]: Number(event.target.value) }))
                    }
                  />
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="gradient" onClick={submit} disabled={receiveTransfer.isPending || isLoading}>
            {receiveTransfer.isPending ? "Receiving…" : "Confirm receipt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TransfersTab() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isError, refetch } = useStockTransfers(page);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [receiveId, setReceiveId] = React.useState<number | undefined>(undefined);

  const columns: ColumnDef<StockTransfer>[] = [
    {
      accessorKey: "transfer_no",
      header: "Transfer no.",
      cell: ({ row }) => <span className="font-medium">{row.original.transfer_no}</span>,
    },
    {
      id: "from",
      header: "From",
      cell: ({ row }) => row.original.from_warehouse?.name ?? "-",
    },
    {
      id: "to",
      header: "To",
      cell: ({ row }) => row.original.to_warehouse?.name ?? "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "transfer_date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.transfer_date),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.status === "in_transit" ? (
          <Button variant="outline" size="sm" onClick={() => setReceiveId(row.original.id)}>
            <PackageCheck className="size-4" />
            Receive
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="gradient" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New transfer
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          meta={data?.meta}
          onPageChange={setPage}
          isLoading={isLoading}
          emptyTitle="No stock transfers"
          emptyDescription="Move stock between warehouses by creating a transfer."
        />
      )}

      <NewTransferDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ReceiveTransferDialog transferId={receiveId} onOpenChange={(open) => !open && setReceiveId(undefined)} />
    </div>
  );
}
