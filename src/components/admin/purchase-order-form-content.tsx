"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Currency } from "@/components/shared/currency";
import { PageHeader } from "@/components/shared/page-header";
import { useAdminProducts } from "@/hooks/use-admin-products";
import { useCreatePurchase, useSuppliers, useWarehouses } from "@/hooks/use-inventory";
import { purchaseSchema, type PurchaseFormValues } from "@/lib/validators/inventory";
import type { z } from "zod";

type PurchaseFormInput = z.input<typeof purchaseSchema>;

const EMPTY_ITEM = { product_id: 0, quantity: 1, unit_cost: 0 };

export function PurchaseOrderFormContent() {
  const router = useRouter();
  const createPurchase = useCreatePurchase();
  const { data: suppliers } = useSuppliers(1);
  const { data: warehouses } = useWarehouses();
  const { data: products } = useAdminProducts({ per_page: 100, sort: "name" });

  const form = useForm<PurchaseFormInput, unknown, PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplier_id: 0,
      warehouse_id: 0,
      order_date: new Date().toISOString().slice(0, 10),
      expected_date: "",
      tax_amount: 0,
      discount_amount: 0,
      notes: "",
      items: [EMPTY_ITEM],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = form.watch("items");
  const taxAmount = Number(form.watch("tax_amount")) || 0;
  const discountAmount = Number(form.watch("discount_amount")) || 0;

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0),
    0
  );
  const total = subtotal + taxAmount - discountAmount;

  function onSubmit(values: PurchaseFormValues) {
    createPurchase.mutate(
      {
        ...values,
        expected_date: values.expected_date || undefined,
        notes: values.notes || undefined,
      },
      {
        onSuccess: () => router.push("/admin/purchase-orders"),
      }
    );
  }

  const productList = products?.data ?? [];

  return (
    <div className="animate-in-fade-up mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link href="/admin/purchase-orders">
            <ArrowLeft className="size-3.5" />
            Back to purchase orders
          </Link>
        </Button>
        <PageHeader title="New purchase order" description="Order stock from a supplier into a warehouse." />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-eyebrow text-muted-foreground">Order details</CardTitle>
              <CardDescription>Supplier, destination warehouse, and order dates.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 pt-6 sm:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(suppliers?.data ?? []).map((supplier) => (
                          <SelectItem key={supplier.id} value={String(supplier.id)}>
                            {supplier.name}
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
                name="order_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expected_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tax_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        {...field}
                        value={(field.value ?? "") as number}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discount_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        {...field}
                        value={(field.value ?? "") as number}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2 lg:col-span-3">
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div className="space-y-1.5">
                <CardTitle className="text-eyebrow text-muted-foreground">Items</CardTitle>
                <CardDescription>Products, quantities, and unit cost for this order.</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append(EMPTY_ITEM)}
              >
                <Plus className="size-4" />
                Add item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {form.formState.errors.items?.root?.message && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.items.root.message}
                </p>
              )}
              <div className="space-y-3">
                {fields.map((field, index) => {
                  const rowQuantity = Number(items[index]?.quantity) || 0;
                  const rowCost = Number(items[index]?.unit_cost) || 0;
                  return (
                    <div
                      key={field.id}
                      className="bg-muted/30 grid grid-cols-1 gap-3 rounded-lg border p-3.5 sm:grid-cols-[1fr_100px_120px_120px_auto] sm:items-end"
                    >
                      <FormField
                        control={form.control}
                        name={`items.${index}.product_id`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <FormLabel>Product</FormLabel>
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
                            <FormLabel>Qty</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
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
                        name={`items.${index}.unit_cost`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <FormLabel>Unit cost</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                className="bg-background"
                                {...itemField}
                                value={(itemField.value ?? "") as number}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-sm">Subtotal</p>
                        <p className="text-sm font-semibold">
                          <Currency value={rowQuantity * rowCost} />
                        </p>
                      </div>
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
                  );
                })}
              </div>

              <Separator />

              <div className="bg-muted/30 ml-auto max-w-xs space-y-1.5 rounded-lg p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items subtotal</span>
                  <Currency value={subtotal} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <Currency value={taxAmount} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <Currency value={-discountAmount} />
                </div>
                <Separator />
                <div className="text-base font-semibold flex justify-between">
                  <span>Total</span>
                  <Currency value={total} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="glass-panel sticky bottom-4 z-10 flex justify-end gap-2 rounded-xl p-3 shadow-luxury-md">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/purchase-orders">Cancel</Link>
            </Button>
            <Button type="submit" variant="gradient" disabled={createPurchase.isPending}>
              {createPurchase.isPending ? "Creating…" : "Create purchase order"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
