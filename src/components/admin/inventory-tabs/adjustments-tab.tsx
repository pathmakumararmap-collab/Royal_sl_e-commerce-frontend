"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";
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
import { useAdminProduct, useAdminProducts } from "@/hooks/use-admin-products";
import { useCreateStockAdjustment, useStockAdjustments, useWarehouses } from "@/hooks/use-inventory";
import { formatDate, formatOrderStatus } from "@/lib/format";
import { stockAdjustmentSchema, type StockAdjustmentFormValues } from "@/lib/validators/inventory";
import type { StockAdjustment } from "@/types/inventory";

type AdjustmentFormInput = z.input<typeof stockAdjustmentSchema>;

const EMPTY_ITEM = { product_id: 0, product_variant_id: undefined, new_quantity: 0 };

function AdjustmentItemRow({
  index,
  onRemove,
  disableRemove,
  productList,
}: {
  index: number;
  onRemove: () => void;
  disableRemove: boolean;
  productList: { id: number; name: string; has_variants: boolean }[];
}) {
  const { control, setValue } = useFormContext<AdjustmentFormInput>();
  const productId = useWatch({ control, name: `items.${index}.product_id` });

  // Full product detail (with variants) for whichever product is picked in this row.
  const { data: product } = useAdminProduct(productId ? Number(productId) : undefined);
  const variants = product?.variants ?? [];

  const previousProductId = React.useRef(productId);
  React.useEffect(() => {
    if (previousProductId.current !== productId) {
      setValue(`items.${index}.product_variant_id`, undefined);
      previousProductId.current = productId;
    }
  }, [productId, index, setValue]);

  return (
    <div className="bg-muted/30 grid grid-cols-1 items-end gap-2 rounded-lg border p-2.5 sm:grid-cols-[1fr_1fr_110px_auto]">
      <FormField
        control={control}
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
                {productList.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`items.${index}.product_variant_id`}
        render={({ field: variantField }) => (
          <FormItem>
            <FormLabel className="sr-only">Variant</FormLabel>
            <Select
              value={variantField.value ? String(variantField.value) : undefined}
              onValueChange={(value) => variantField.onChange(Number(value))}
              disabled={!product?.has_variants || variants.length === 0}
            >
              <FormControl>
                <SelectTrigger className="bg-background w-full">
                  <SelectValue
                    placeholder={
                      !productId
                        ? "Select product first"
                        : product?.has_variants
                          ? "Select variant"
                          : "No variants"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {variants.map((variant) => (
                  <SelectItem key={variant.id} value={String(variant.id)}>
                    {variant.sku}
                    {Object.values(variant.attributes ?? {}).length
                      ? ` (${Object.values(variant.attributes).join(" / ")})`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`items.${index}.new_quantity`}
        render={({ field: itemField }) => (
          <FormItem>
            <FormLabel className="sr-only">New quantity</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                placeholder="New qty"
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
        disabled={disableRemove}
        onClick={onRemove}
        title="Remove item"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function NewAdjustmentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: warehouses } = useWarehouses();
  const { data: products } = useAdminProducts({ per_page: 100, sort: "name" });
  const createAdjustment = useCreateStockAdjustment();

  const form = useForm<AdjustmentFormInput, unknown, StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      warehouse_id: 0,
      reason: "count",
      notes: "",
      items: [EMPTY_ITEM],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  React.useEffect(() => {
    if (open) {
      form.reset({ warehouse_id: 0, reason: "count", notes: "", items: [EMPTY_ITEM] });
    }
  }, [open, form]);

  function onSubmit(values: StockAdjustmentFormValues) {
    createAdjustment.mutate(
      { ...values, notes: values.notes || undefined },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  const productList = products?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New stock adjustment</DialogTitle>
          <DialogDescription>
            Set the actual counted quantity for products in a warehouse (e.g. after a stock count).
          </DialogDescription>
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
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="count">Stock count</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <AdjustmentItemRow
                    key={field.id}
                    index={index}
                    onRemove={() => remove(index)}
                    disableRemove={fields.length === 1}
                    productList={productList}
                  />
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
              <Button type="submit" variant="gradient" disabled={createAdjustment.isPending}>
                {createAdjustment.isPending ? "Saving…" : "Record adjustment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function AdjustmentsTab() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isError, refetch } = useStockAdjustments(page);
  const [createOpen, setCreateOpen] = React.useState(false);

  const columns: ColumnDef<StockAdjustment>[] = [
    {
      accessorKey: "adjustment_no",
      header: "Adjustment no.",
      cell: ({ row }) => <span className="font-medium">{row.original.adjustment_no}</span>,
    },
    {
      id: "warehouse",
      header: "Warehouse",
      cell: ({ row }) => row.original.warehouse?.name ?? "-",
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => formatOrderStatus(row.original.reason),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => row.original.items?.length ?? 0,
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
          New adjustment
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
          emptyTitle="No stock adjustments"
          emptyDescription="Record a stock count or correction to adjust quantities."
        />
      )}

      <NewAdjustmentDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
