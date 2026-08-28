"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionGate } from "@/components/shared/permission-gate";
import {
  useCreateSupplier,
  useDeleteSupplier,
  useSuppliers,
  useUpdateSupplier,
} from "@/hooks/use-inventory";
import { supplierSchema, type SupplierFormValues } from "@/lib/validators/inventory";
import type { Supplier } from "@/types/inventory";

const DEFAULT_VALUES: SupplierFormValues = {
  name: "",
  company_name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  is_active: true,
};

function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier;
}) {
  const isEditing = !!supplier;
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: DEFAULT_VALUES,
  });

  React.useEffect(() => {
    if (open) {
      form.reset(
        supplier
          ? {
              name: supplier.name,
              company_name: supplier.company_name ?? "",
              email: supplier.email ?? "",
              phone: supplier.phone ?? "",
              address: supplier.address ?? "",
              city: supplier.city ?? "",
              country: supplier.country ?? "",
              is_active: supplier.is_active,
            }
          : DEFAULT_VALUES
      );
    }
  }, [open, supplier, form]);

  const isPending = createSupplier.isPending || updateSupplier.isPending;

  function onSubmit(values: SupplierFormValues) {
    if (isEditing) {
      updateSupplier.mutate(
        { id: supplier.id, input: values },
        { onSuccess: () => onOpenChange(false) }
      );
      return;
    }
    createSupplier.mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset(DEFAULT_VALUES);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit supplier" : "New supplier"}</DialogTitle>
          <DialogDescription>
            Suppliers can be linked to products and purchase orders.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Contact name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Company name</FormLabel>
                    <FormControl>
                      <Input placeholder="Silva Traders (Pvt) Ltd" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="supplier@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="077 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="No. 10, Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Colombo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Sri Lanka" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="hover:bg-muted/40 transition-luxury col-span-2 flex flex-row items-center justify-between rounded-lg border p-3.5">
                    <FormLabel className="font-normal">Active</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={isPending}>
                {isPending ? "Saving…" : "Save supplier"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function SuppliersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);

  const { data, isLoading, isError, refetch } = useSuppliers(page);
  const deleteSupplier = useDeleteSupplier();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Supplier | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<Supplier | undefined>(undefined);

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier);
    setDialogOpen(true);
  }

  function goToPage(next: number) {
    router.push(`/admin/suppliers?page=${next}`);
  }

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.company_name && (
            <div className="text-muted-foreground text-xs">{row.original.company_name}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || "-",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone || "-",
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => [row.original.city, row.original.country].filter(Boolean).join(", ") || "-",
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "success" : "secondary"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => openEdit(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-in-fade-up space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage suppliers used when raising purchase orders."
        actions={
          <PermissionGate permission="suppliers.create">
            <Button variant="gradient" onClick={openCreate}>
              <Plus className="size-4" />
              New supplier
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
          onPageChange={goToPage}
          isLoading={isLoading}
          emptyTitle="No suppliers yet"
          emptyDescription="Add your first supplier to start raising purchase orders."
        />
      )}

      <SupplierFormDialog open={dialogOpen} onOpenChange={setDialogOpen} supplier={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title="Delete supplier?"
        description={`This will permanently remove "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteSupplier.isPending}
        onConfirm={() =>
          deleteTarget &&
          deleteSupplier.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(undefined),
          })
        }
      />
    </div>
  );
}
