"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { ImageOff, Pencil, Plus, ScanBarcode, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Currency } from "@/components/shared/currency";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionGate } from "@/components/shared/permission-gate";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAdminCategories, useAdminBrands, useAdminProducts, useDeleteProduct } from "@/hooks/use-admin-products";
import { adminProductService } from "@/lib/api/services/admin-product.service";
import { useDebounce } from "@/hooks/use-debounce";
import type { Product } from "@/types/catalog";

export function ProductsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const [keyword, setKeyword] = React.useState(searchParams.get("q") ?? "");
  const debouncedKeyword = useDebounce(keyword, 400);

  const categoryId = searchParams.get("category") ? Number(searchParams.get("category")) : undefined;
  const brandId = searchParams.get("brand") ? Number(searchParams.get("brand")) : undefined;
  const activeOnly = searchParams.get("active") === "1";

  const { data: categories } = useAdminCategories();
  const { data: brands } = useAdminBrands();

  const { data, isLoading, isError, refetch } = useAdminProducts({
    keyword: debouncedKeyword || undefined,
    category_id: categoryId,
    brand_id: brandId,
    is_active: activeOnly ? true : undefined,
    page,
    per_page: 15,
  });

  const deleteProduct = useDeleteProduct();

  const [deleteTarget, setDeleteTarget] = React.useState<Product | undefined>(undefined);
  const [barcodeProduct, setBarcodeProduct] = React.useState<Product | undefined>(undefined);

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
    router.push(`/admin/products?${params.toString()}`);
  }

  React.useEffect(() => {
    if (debouncedKeyword !== (searchParams.get("q") ?? "")) {
      updateParams({ q: debouncedKeyword || undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  const columns: ColumnDef<Product>[] = [
    {
      id: "image",
      header: "",
      cell: ({ row }) => {
        const primary =
          row.original.images?.find((image) => image.is_primary)?.url ?? row.original.images?.[0]?.url;
        return (
          <div className="bg-muted ring-border/60 relative size-11 shrink-0 overflow-hidden rounded-lg ring-1">
            {primary ? (
              <Image src={primary} alt={row.original.name} fill sizes="44px" className="object-cover" />
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center">
                <ImageOff className="size-4" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{row.original.name}</div>
          <div className="text-muted-foreground text-xs tracking-wide">{row.original.sku}</div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => row.original.category?.name ?? "-",
    },
    {
      id: "brand",
      header: "Brand",
      cell: ({ row }) => row.original.brand?.name ?? "-",
    },
    {
      id: "price",
      header: "Price",
      cell: ({ row }) => {
        const product = row.original;
        const hasDiscount =
          product.discount_price !== null &&
          product.discount_price !== undefined &&
          product.discount_price < product.selling_price;
        return (
          <div className="flex flex-col">
            <Currency value={hasDiscount ? product.discount_price! : product.selling_price} />
            {hasDiscount && (
              <Currency
                value={product.selling_price}
                className="text-muted-foreground text-xs line-through"
              />
            )}
          </div>
        );
      },
    },
    {
      id: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.original.total_stock ?? 0;
        const low = stock <= row.original.low_stock_threshold;
        return (
          <Badge variant={stock <= 0 ? "destructive" : low ? "warning" : "secondary"}>{stock}</Badge>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.is_active ? "active" : "inactive"} />,
    },
    {
      id: "featured",
      header: "Featured",
      cell: ({ row }) =>
        row.original.is_featured ? (
          <Badge variant="warning">Featured</Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
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
            title="View barcode"
            onClick={() => setBarcodeProduct(row.original)}
          >
            <ScanBarcode className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            asChild
            title="Edit product"
          >
            <Link href={`/admin/products/${row.original.id}/edit`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            title="Delete product"
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
        title="Products"
        description="Manage your catalog, pricing, and stock."
        actions={
          <PermissionGate permission="products.create">
            <Button variant="gradient" asChild>
              <Link href="/admin/products/new">
                <Plus className="size-4" />
                Add product
              </Link>
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
          emptyTitle="No products found"
          emptyDescription="Try adjusting your filters, or add your first product."
          toolbar={
            <div className="bg-card/50 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:flex-wrap sm:items-center">
              <SearchInput
                value={keyword}
                onChange={setKeyword}
                placeholder="Search products…"
                className="sm:max-w-xs"
              />
              <Select
                value={categoryId ? String(categoryId) : "all"}
                onValueChange={(value) => updateParams({ category: value === "all" ? undefined : value })}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={brandId ? String(brandId) : "all"}
                onValueChange={(value) => updateParams({ brand: value === "all" ? undefined : value })}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All brands</SelectItem>
                  {brands?.map((brand) => (
                    <SelectItem key={brand.id} value={String(brand.id)}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 sm:ml-auto">
                <Switch
                  id="active-only"
                  checked={activeOnly}
                  onCheckedChange={(checked) => updateParams({ active: checked ? "1" : undefined })}
                />
                <Label htmlFor="active-only" className="text-sm font-normal">
                  Active only
                </Label>
              </div>
            </div>
          }
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title="Delete product?"
        description={`This will permanently remove "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteProduct.isPending}
        onConfirm={() =>
          deleteTarget &&
          deleteProduct.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(undefined),
          })
        }
      />

      <Dialog open={!!barcodeProduct} onOpenChange={(open) => !open && setBarcodeProduct(undefined)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Barcode</DialogTitle>
            <DialogDescription>
              {barcodeProduct?.name} · {barcodeProduct?.sku}
            </DialogDescription>
          </DialogHeader>
          {barcodeProduct && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={adminProductService.barcodeUrl(barcodeProduct.id)}
              alt={`Barcode for ${barcodeProduct.name}`}
              className="shadow-luxury-sm w-full rounded-lg border bg-white p-4"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
