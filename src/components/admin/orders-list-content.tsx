"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
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
import { Currency } from "@/components/shared/currency";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionGate } from "@/components/shared/permission-gate";
import { SearchInput } from "@/components/shared/search-input";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/shared/status-badge";
import { useAdminProducts } from "@/hooks/use-admin-products";
import { useWarehouses } from "@/hooks/use-inventory";
import { useAdminOrders, useCreateFacebookOrder } from "@/hooks/use-orders";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate } from "@/lib/format";
import type { Order, OrderStatus } from "@/types/order";

const SOURCE_LABEL: Record<string, string> = {
  website: "Website",
  facebook: "Facebook",
  pos: "POS",
};

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

const facebookOrderSchema = z.object({
  channel_reference: z.string().min(1, "Reference is required."),
  warehouse_id: z.coerce.number({ error: "Select a warehouse." }).positive(),
  customer_name: z.string().min(1, "Customer name is required."),
  customer_phone: z.string().min(1, "Phone number is required."),
  customer_email: z.email().optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        product_id: z.coerce.number({ error: "Select a product." }).positive(),
        quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
      })
    )
    .min(1, "Add at least one item."),
});

type FacebookOrderFormValues = z.infer<typeof facebookOrderSchema>;

const FACEBOOK_ORDER_DEFAULTS: FacebookOrderFormValues = {
  channel_reference: "",
  warehouse_id: 0,
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  items: [{ product_id: 0, quantity: 1 }],
};

function FacebookOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: warehouses } = useWarehouses();
  const { data: productsData } = useAdminProducts({ per_page: 100, sort: "name" });
  const createFacebookOrder = useCreateFacebookOrder();

  const form = useForm({
    resolver: zodResolver(facebookOrderSchema),
    defaultValues: FACEBOOK_ORDER_DEFAULTS,
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  React.useEffect(() => {
    if (open) {
      form.reset(FACEBOOK_ORDER_DEFAULTS);
    }
  }, [open, form]);

  function onSubmit(values: FacebookOrderFormValues) {
    createFacebookOrder.mutate(
      {
        channel_reference: values.channel_reference,
        warehouse_id: values.warehouse_id,
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        customer_email: values.customer_email || undefined,
        items: values.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Facebook order</DialogTitle>
          <DialogDescription>
            Record an order that came in through Facebook Messenger or comments.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="channel_reference"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Facebook reference</FormLabel>
                    <FormControl>
                      <Input placeholder="Conversation / post link" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="warehouse_id"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Fulfilling warehouse</FormLabel>
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
                        {warehouses?.map((warehouse) => (
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
                name="customer_name"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Customer name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customer_phone"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Customer phone</FormLabel>
                    <FormControl>
                      <Input placeholder="077 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customer_email"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Customer email (optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jane@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <FormLabel>Items</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ product_id: 0, quantity: 1 })}
                >
                  <Plus className="size-3.5" />
                  Add item
                </Button>
              </div>
              <div className="space-y-2.5">
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-muted/30 flex items-start gap-2 rounded-lg border p-2.5"
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.product_id`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Select
                            value={field.value ? String(field.value) : undefined}
                            onValueChange={(value) => field.onChange(Number(value))}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background w-full">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {productsData?.data.map((product) => (
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
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              className="bg-background"
                              {...field}
                              value={(field.value as number | undefined) ?? 1}
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
                      className="text-muted-foreground hover:text-destructive mt-0.5"
                      disabled={fields.length <= 1}
                      onClick={() => remove(index)}
                      title="Remove item"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {form.formState.errors.items?.root?.message && (
                <p className="text-destructive text-sm">{form.formState.errors.items.root.message}</p>
              )}
              {form.formState.errors.items?.message && (
                <p className="text-destructive text-sm">{form.formState.errors.items.message}</p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={createFacebookOrder.isPending}>
                {createFacebookOrder.isPending ? "Creating…" : "Create order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function OrdersListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const [keyword, setKeyword] = React.useState(searchParams.get("q") ?? "");
  const debouncedKeyword = useDebounce(keyword, 400);

  const status = (searchParams.get("status") as OrderStatus | null) ?? undefined;
  const source = searchParams.get("source") ?? undefined;
  const dateFrom = searchParams.get("date_from") ?? "";
  const dateTo = searchParams.get("date_to") ?? "";

  const { data, isLoading, isError, refetch } = useAdminOrders({
    keyword: debouncedKeyword || undefined,
    status,
    source: source as never,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page,
    per_page: 15,
  });

  const [facebookOrderOpen, setFacebookOrderOpen] = React.useState(false);

  function updateParams(next: Partial<Record<string, string | number | undefined>>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    if (!("page" in next)) params.delete("page");
    router.push(`/admin/orders?${params.toString()}`);
  }

  React.useEffect(() => {
    if (debouncedKeyword !== (searchParams.get("q") ?? "")) {
      updateParams({ q: debouncedKeyword || undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "order_no",
      header: "Order",
      cell: ({ row }) => (
        <Link
          href={`/admin/orders/${row.original.id}`}
          className="hover:text-primary font-medium tracking-tight transition-colors"
        >
          {row.original.order_no}
        </Link>
      ),
    },
    {
      id: "source",
      header: "Source",
      cell: ({ row }) => (
        <Badge variant="outline">{SOURCE_LABEL[row.original.source] ?? row.original.source}</Badge>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => row.original.customer_name ?? row.original.user?.name ?? "—",
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
    },
    {
      id: "payment_status",
      header: "Payment",
      cell: ({ row }) => <PaymentStatusBadge status={row.original.payment_status} />,
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => <Currency value={row.original.total_amount} />,
    },
    {
      id: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{formatDate(row.original.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="animate-in-fade-up space-y-6">
      <PageHeader
        title="Orders"
        description="Track and fulfil orders across every sales channel."
        actions={
          <PermissionGate permission="orders.create">
            <Button variant="gradient" onClick={() => setFacebookOrderOpen(true)}>
              <Plus className="size-4" />
              New Facebook order
            </Button>
          </PermissionGate>
        }
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          meta={data?.meta}
          onPageChange={(next) => updateParams({ page: next })}
          isLoading={isLoading}
          emptyTitle="No orders found"
          emptyDescription="Try adjusting your filters."
          onRowClick={(order) => router.push(`/admin/orders/${order.id}`)}
          toolbar={
            <div className="bg-card/50 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:flex-wrap sm:items-center">
              <SearchInput
                value={keyword}
                onChange={setKeyword}
                placeholder="Search order # or customer…"
                className="sm:max-w-xs"
              />
              <Select
                value={status ?? "all"}
                onValueChange={(value) => updateParams({ status: value === "all" ? undefined : value })}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {ORDER_STATUSES.map((value) => (
                    <SelectItem key={value} value={value} className="capitalize">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={source ?? "all"}
                onValueChange={(value) => updateParams({ source: value === "all" ? undefined : value })}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="pos">POS</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFrom}
                onChange={(event) => updateParams({ date_from: event.target.value })}
                className="w-full sm:w-40"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(event) => updateParams({ date_to: event.target.value })}
                className="w-full sm:w-40"
              />
            </div>
          }
        />
      )}

      <FacebookOrderDialog open={facebookOrderOpen} onOpenChange={setFacebookOrderOpen} />
    </div>
  );
}
