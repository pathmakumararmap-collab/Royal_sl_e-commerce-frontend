"use client";

import * as React from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { ImageOff, Pencil, Plus, Trash2 } from "lucide-react";

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
import { FileDropzone } from "@/components/shared/file-dropzone";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionGate } from "@/components/shared/permission-gate";
import {
  useAdminBrands,
  useCreateBrand,
  useDeleteBrand,
  useUpdateBrand,
} from "@/hooks/use-admin-products";
import { brandSchema, type BrandFormValues } from "@/lib/validators/product";
import type { Brand } from "@/types/catalog";

const DEFAULT_VALUES: BrandFormValues = {
  name: "",
  slug: "",
  is_active: true,
};

function BrandFormDialog({
  open,
  onOpenChange,
  brand,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand;
}) {
  const isEditing = !!brand;
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const [logo, setLogo] = React.useState<File[]>([]);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: DEFAULT_VALUES,
  });

  React.useEffect(() => {
    if (open) {
      form.reset(
        brand
          ? { name: brand.name, slug: brand.slug, is_active: brand.is_active }
          : DEFAULT_VALUES
      );
      setLogo([]);
    }
  }, [open, brand, form]);

  const isPending = createBrand.isPending || updateBrand.isPending;

  function onSubmit(values: BrandFormValues) {
    const input = { ...values, logo: logo[0] };

    if (isEditing) {
      updateBrand.mutate({ id: brand.id, input }, { onSuccess: () => onOpenChange(false) });
      return;
    }

    createBrand.mutate(input, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset(DEFAULT_VALUES);
        setLogo([]);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit brand" : "New brand"}</DialogTitle>
          <DialogDescription>Brands help customers filter and trust your catalog.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Samsung" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Slug (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="samsung" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-2 space-y-2">
                <FormLabel>Logo (optional)</FormLabel>
                <FileDropzone value={logo} onChange={setLogo} label="Upload brand logo" hint="PNG, JPG up to 4MB" />
              </div>
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
                {isPending ? "Saving…" : "Save brand"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function BrandsContent() {
  const { data: brands, isLoading, isError, refetch } = useAdminBrands();
  const deleteBrand = useDeleteBrand();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Brand | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<Brand | undefined>(undefined);

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(brand: Brand) {
    setEditing(brand);
    setDialogOpen(true);
  }

  const columns: ColumnDef<Brand>[] = [
    {
      id: "logo",
      header: "",
      cell: ({ row }) => (
        <div className="bg-muted ring-border/60 relative size-11 shrink-0 overflow-hidden rounded-lg p-1.5 ring-1">
          {row.original.logo ? (
            <Image src={row.original.logo} alt={row.original.name} fill sizes="44px" className="object-contain" />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              <ImageOff className="size-4" />
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-muted-foreground text-xs tracking-wide">{row.original.slug}</div>
        </div>
      ),
    },
    {
      id: "status",
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
        title="Brands"
        description="Manage the brands available across your catalog."
        actions={
          <PermissionGate permission="brands.create">
            <Button variant="gradient" onClick={openCreate}>
              <Plus className="size-4" />
              New brand
            </Button>
          </PermissionGate>
        }
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={brands ?? []}
          isLoading={isLoading}
          emptyTitle="No brands yet"
          emptyDescription="Create your first brand to start tagging products."
        />
      )}

      <BrandFormDialog open={dialogOpen} onOpenChange={setDialogOpen} brand={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title="Delete brand?"
        description={`This will permanently remove "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteBrand.isPending}
        onConfirm={() =>
          deleteTarget &&
          deleteBrand.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(undefined),
          })
        }
      />
    </div>
  );
}
