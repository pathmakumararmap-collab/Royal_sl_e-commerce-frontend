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
import { Currency } from "@/components/shared/currency";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAdminProducts } from "@/hooks/use-admin-products";
import { useCreateDamage, useDamages, useWarehouses } from "@/hooks/use-inventory";
import { formatDate } from "@/lib/format";
import { damageSchema, type DamageFormValues } from "@/lib/validators/inventory";
import type { Damage } from "@/types/inventory";

type DamageFormInput = z.input<typeof damageSchema>;

const EMPTY_ITEM = { product_id: 0, quantity: 1, estimated_loss: 0 };

function NewDamageDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: warehouses } = useWarehouses();
  const { data: products } = useAdminProducts({ per_page: 100, sort: "name" });
  const createDamage = useCreateDamage();

  const form = useForm<DamageFormInput, unknown, DamageFormValues>({
    resolver: zodResolver(damageSchema),
    defaultValues: {
      warehouse_id: 0,
      reason: "",
      notes: "",
      items: [EMPTY_ITEM],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  React.useEffect(() => {
    if (open) {
      form.reset({ warehouse_id: 0, reason: "", notes: "", items: [EMPTY_ITEM] });
    }
  }, [open, form]);

  function onSubmit(values: DamageFormValues) {
    createDamage.mutate(
      { ...values, reason: values.reason || undefined, notes: values.notes || undefined },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  const productList = products?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New damage report</DialogTitle>
          <DialogDescription>Write off damaged stock from a warehouse.</DialogDescription>
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
                    <FormControl>
                      <Input placeholder="Water damage, breakage, etc." {...field} />
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
                    className="bg-muted/30 grid grid-cols-[1fr_90px_120px_auto] items-end gap-2 rounded-lg border p-2.5"
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
                      name={`items.${index}.estimated_loss`}
                      render={({ field: itemField }) => (
                        <FormItem>
                          <FormLabel className="sr-only">Est. loss</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="Est. loss"
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
              <Button type="submit" variant="gradient" disabled={createDamage.isPending}>
                {createDamage.isPending ? "Saving…" : "Record damage"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function DamagesTab() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isError, refetch } = useDamages(page);
  const [createOpen, setCreateOpen] = React.useState(false);

  const columns: ColumnDef<Damage>[] = [
    {
      accessorKey: "damage_no",
      header: "Damage no.",
      cell: ({ row }) => <span className="font-medium">{row.original.damage_no}</span>,
    },
    {
      id: "warehouse",
      header: "Warehouse",
      cell: ({ row }) => row.original.warehouse?.name ?? "-",
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => row.original.reason || "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "loss",
      header: "Est. loss",
      cell: ({ row }) => (
        <Currency
          value={(row.original.items ?? []).reduce((sum, item) => sum + (item.estimated_loss || 0), 0)}
        />
      ),
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
          New damage report
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
          emptyTitle="No damage reports"
          emptyDescription="Write off damaged stock to keep quantities accurate."
        />
      )}

      <NewDamageDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
