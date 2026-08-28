"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Trash2 } from "lucide-react";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { useAdminProducts } from "@/hooks/use-admin-products";
import { useCreateStockReturn, useStockReturns, useWarehouses } from "@/hooks/use-inventory";
import { formatDate, formatOrderStatus } from "@/lib/format";
import { stockReturnSchema, type StockReturnFormValues } from "@/lib/validators/inventory";
import type { StockReturn } from "@/types/inventory";

type ReturnFormInput = z.input<typeof stockReturnSchema>;

const EMPTY_ITEM = { product_id: 0, quantity: 1, condition: "good" as const };

function NewReturnDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: warehouses } = useWarehouses();
  const { data: products } = useAdminProducts({ per_page: 100, sort: "name" });
  const createReturn = useCreateStockReturn();

  const form = useForm<ReturnFormInput, unknown, StockReturnFormValues>({
    resolver: zodResolver(stockReturnSchema),
    defaultValues: {
      warehouse_id: 0,
      type: "customer_return",
      reason: "",
      notes: "",
      items: [EMPTY_ITEM],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  React.useEffect(() => {
    if (open) {
      form.reset({
        warehouse_id: 0,
        type: "customer_return",
        reason: "",
        notes: "",
        items: [EMPTY_ITEM],
      });
    }
  }, [open, form]);

  function onSubmit(values: StockReturnFormValues) {
    createReturn.mutate(
      { ...values, reason: values.reason || undefined, notes: values.notes || undefined },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  const productList = products?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New stock return</DialogTitle>
          <DialogDescription>Record stock returned by a customer or to a supplier.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select warehouse" />
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="customer_return">Customer return</SelectItem>
                        <SelectItem value="supplier_return">Supplier return</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Reason (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Wrong item, damaged in transit, etc." {...field} />
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
                    className="bg-muted/30 grid grid-cols-[1fr_90px_140px_auto] items-end gap-2 rounded-lg border p-2.5"
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
                    <FormField
                      control={form.control}
                      name={`items.${index}.condition`}
                      render={({ field: itemField }) => (
                        <FormItem>
                          <FormLabel className="sr-only">Condition</FormLabel>
                          <Select value={itemField.value} onValueChange={itemField.onChange}>
                            <FormControl>
                              <SelectTrigger className="bg-background w-full">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="damaged">Damaged</SelectItem>
                            </SelectContent>
                          </Select>
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
              <Button type="submit" variant="gradient" disabled={createReturn.isPending}>
                {createReturn.isPending ? "Saving…" : "Record return"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function ReturnsTab() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isError, refetch } = useStockReturns(page);
  const [createOpen, setCreateOpen] = React.useState(false);

  const columns: ColumnDef<StockReturn>[] = [
    {
      accessorKey: "return_no",
      header: "Return no.",
      cell: ({ row }) => <span className="font-medium">{row.original.return_no}</span>,
    },
    {
      id: "warehouse",
      header: "Warehouse",
      cell: ({ row }) => row.original.warehouse?.name ?? "-",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => formatOrderStatus(row.original.type),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => row.original.reason || "-",
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="gradient" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New return
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
          emptyTitle="No stock returns"
          emptyDescription="Record returns from customers or back to suppliers."
        />
      )}

      <NewReturnDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
