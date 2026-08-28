"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionGate } from "@/components/shared/permission-gate";
import { useCreateWarehouse, useUpdateWarehouse, useWarehouses } from "@/hooks/use-inventory";
import { warehouseSchema, type WarehouseFormValues } from "@/lib/validators/inventory";
import type { Warehouse } from "@/types/inventory";

const DEFAULT_VALUES: WarehouseFormValues = {
  name: "",
  code: "",
  type: "branch",
  address: "",
  phone: "",
  is_default: false,
  is_active: true,
};

function WarehouseFormDialog({
  open,
  onOpenChange,
  warehouse,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse?: Warehouse;
}) {
  const isEditing = !!warehouse;
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: DEFAULT_VALUES,
  });

  React.useEffect(() => {
    if (open) {
      form.reset(
        warehouse
          ? {
              name: warehouse.name,
              code: warehouse.code,
              type: warehouse.type,
              address: warehouse.address ?? "",
              phone: warehouse.phone ?? "",
              is_default: warehouse.is_default,
              is_active: warehouse.is_active,
            }
          : DEFAULT_VALUES
      );
    }
  }, [open, warehouse, form]);

  const isPending = createWarehouse.isPending || updateWarehouse.isPending;

  function onSubmit(values: WarehouseFormValues) {
    if (isEditing) {
      updateWarehouse.mutate(
        { id: warehouse.id, input: values },
        { onSuccess: () => onOpenChange(false) }
      );
      return;
    }
    createWarehouse.mutate(values, {
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
          <DialogTitle>{isEditing ? "Edit warehouse" : "New warehouse"}</DialogTitle>
          <DialogDescription>
            Warehouses and outlets are used to track stock separately across locations.
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
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Colombo Main Warehouse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="WH-COL" {...field} />
                    </FormControl>
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
                        <SelectItem value="main">Main</SelectItem>
                        <SelectItem value="branch">Branch</SelectItem>
                        <SelectItem value="outlet">Outlet</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input placeholder="011 234 5678" {...field} />
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
                      <Input placeholder="No. 10, Main Street, Colombo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_default"
                render={({ field }) => (
                  <FormItem className="hover:bg-muted/40 transition-luxury flex flex-row items-center justify-between rounded-lg border p-3.5">
                    <FormLabel className="font-normal">Default warehouse</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="hover:bg-muted/40 transition-luxury flex flex-row items-center justify-between rounded-lg border p-3.5">
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
                {isPending ? "Saving…" : "Save warehouse"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function WarehousesContent() {
  const { data, isLoading, isError, refetch } = useWarehouses();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Warehouse | undefined>(undefined);

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(warehouse: Warehouse) {
    setEditing(warehouse);
    setDialogOpen(true);
  }

  const columns: ColumnDef<Warehouse>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-muted-foreground text-xs">{row.original.code}</div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <span className="capitalize">{row.original.type}</span>,
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => row.original.address || "-",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone || "-",
    },
    {
      accessorKey: "is_default",
      header: "Default",
      cell: ({ row }) =>
        row.original.is_default ? <Badge variant="info">Default</Badge> : null,
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
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => openEdit(row.original)}
        >
          <Pencil className="size-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="animate-in-fade-up space-y-6">
      <PageHeader
        title="Warehouses"
        description="Manage the warehouses and outlets stock is tracked against."
        actions={
          <PermissionGate permission="warehouses.create">
            <Button variant="gradient" onClick={openCreate}>
              <Plus className="size-4" />
              New warehouse
            </Button>
          </PermissionGate>
        }
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          emptyTitle="No warehouses yet"
          emptyDescription="Create your first warehouse or outlet to start tracking stock."
        />
      )}

      <WarehouseFormDialog open={dialogOpen} onOpenChange={setDialogOpen} warehouse={editing} />
    </div>
  );
}
