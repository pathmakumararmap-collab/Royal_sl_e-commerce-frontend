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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionGate } from "@/components/shared/permission-gate";
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/use-admin-products";
import { categorySchema, type CategoryFormValues } from "@/lib/validators/product";
import type { Category } from "@/types/catalog";

const DEFAULT_VALUES: CategoryFormValues = {
  parent_id: null,
  name: "",
  slug: "",
  description: "",
  is_active: true,
  sort_order: 0,
};

function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  categories: Category[];
}) {
  const isEditing = !!category;
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const [image, setImage] = React.useState<File[]>([]);

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: DEFAULT_VALUES,
  });

  React.useEffect(() => {
    if (open) {
      form.reset(
        category
          ? {
              parent_id: category.parent_id,
              name: category.name,
              slug: category.slug,
              description: category.description ?? "",
              is_active: category.is_active,
              sort_order: category.sort_order,
            }
          : DEFAULT_VALUES
      );
      setImage([]);
    }
  }, [open, category, form]);

  const isPending = createCategory.isPending || updateCategory.isPending;
  const parentOptions = categories.filter((item) => item.id !== category?.id);

  function onSubmit(values: CategoryFormValues) {
    const input = { ...values, image: image[0] };

    if (isEditing) {
      updateCategory.mutate(
        { id: category.id, input },
        { onSuccess: () => onOpenChange(false) }
      );
      return;
    }

    createCategory.mutate(input, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset(DEFAULT_VALUES);
        setImage([]);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>Categories organize the product catalog.</DialogDescription>
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
                      <Input placeholder="Electronics" {...field} />
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
                      <Input placeholder="electronics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Parent category</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (top level)</SelectItem>
                        {parentOptions.map((option) => (
                          <SelectItem key={option.id} value={String(option.id)}>
                            {option.name}
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
                name="sort_order"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Sort order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        value={(field.value as number | undefined) ?? 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-2 space-y-2">
                <FormLabel>Image (optional)</FormLabel>
                <FileDropzone
                  value={image}
                  onChange={setImage}
                  label="Upload category image"
                  hint="PNG, JPG up to 4MB"
                />
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
                {isPending ? "Saving…" : "Save category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function CategoriesContent() {
  const { data: categories, isLoading, isError, refetch } = useAdminCategories();
  const deleteCategory = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<Category | undefined>(undefined);

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setDialogOpen(true);
  }

  const columns: ColumnDef<Category>[] = [
    {
      id: "image",
      header: "",
      cell: ({ row }) => (
        <div className="bg-muted ring-border/60 relative size-11 shrink-0 overflow-hidden rounded-lg ring-1">
          {row.original.image ? (
            <Image src={row.original.image} alt={row.original.name} fill sizes="44px" className="object-cover" />
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
      id: "parent",
      header: "Parent",
      cell: ({ row }) => {
        const parent = categories?.find((item) => item.id === row.original.parent_id);
        return parent?.name ?? "—";
      },
    },
    {
      accessorKey: "sort_order",
      header: "Sort",
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
        title="Categories"
        description="Organize your products into categories."
        actions={
          <PermissionGate permission="categories.create">
            <Button variant="gradient" onClick={openCreate}>
              <Plus className="size-4" />
              New category
            </Button>
          </PermissionGate>
        }
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={categories ?? []}
          isLoading={isLoading}
          emptyTitle="No categories yet"
          emptyDescription="Create your first category to start organizing products."
        />
      )}

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
        categories={categories ?? []}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title="Delete category?"
        description={`This will permanently remove "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteCategory.isPending}
        onConfirm={() =>
          deleteTarget &&
          deleteCategory.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(undefined),
          })
        }
      />
    </div>
  );
}
