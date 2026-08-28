"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/shared/error-state";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PageHeader } from "@/components/shared/page-header";
import {
  useAdminBrands,
  useAdminCategories,
  useAdminProduct,
  useCreateProduct,
  useDeleteProductImage,
  useDeleteProductVariant,
  useUpdateProduct,
} from "@/hooks/use-admin-products";
import { useWarehouses } from "@/hooks/use-inventory";
import { productSchema, type ProductFormValues } from "@/lib/validators/product";
import type { AdminProductVariantInput } from "@/lib/api/services/admin-product.service";

interface VariantRow {
  id?: number;
  sku: string;
  barcode: string;
  attributesText: string;
  cost_price: number;
  selling_price: number;
  image: File | null;
  existingImageUrl?: string | null;
  initial_quantity: number;
}

const EMPTY_VARIANT_ROW: VariantRow = {
  sku: "",
  barcode: "",
  attributesText: "",
  cost_price: 0,
  selling_price: 0,
  image: null,
  existingImageUrl: null,
  initial_quantity: 0,
};

function parseAttributes(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  text
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const [key, ...rest] = pair.split(":");
      const value = rest.join(":").trim();
      if (key?.trim() && value) {
        result[key.trim()] = value;
      }
    });
  return result;
}

const DEFAULT_VALUES: ProductFormValues = {
  category_id: 0,
  brand_id: null,
  name: "",
  sku: "",
  barcode: "",
  description: "",
  short_description: "",
  cost_price: 0,
  selling_price: 0,
  discount_price: null,
  tax_rate: 0,
  unit: "",
  has_variants: false,
  is_active: true,
  is_featured: true,
  low_stock_threshold: 5,
  weight: null,
};

interface ProductFormContentProps {
  productId?: number;
}

export function ProductFormContent({ productId }: ProductFormContentProps) {
  const router = useRouter();
  const isEditing = !!productId;

  const { data: categories } = useAdminCategories();
  const { data: brands } = useAdminBrands();
  const {
    data: product,
    isLoading: productLoading,
    isError: productError,
    refetch: refetchProduct,
  } = useAdminProduct(productId);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteImage = useDeleteProductImage();
  const deleteVariant = useDeleteProductVariant();
  const { data: warehouses } = useWarehouses();

  const [images, setImages] = React.useState<File[]>([]);
  const [variants, setVariants] = React.useState<VariantRow[]>([]);
  const [warehouseId, setWarehouseId] = React.useState<number | undefined>(undefined);
  const [startingQuantity, setStartingQuantity] = React.useState(0);

  React.useEffect(() => {
    if (!isEditing && warehouseId === undefined && warehouses?.length) {
      setWarehouseId(warehouses[0].id);
    }
  }, [isEditing, warehouseId, warehouses]);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const hasVariants = form.watch("has_variants");

  function addVariantRow() {
    setVariants((prev) => [...prev, { ...EMPTY_VARIANT_ROW }]);
  }

  function updateVariantRow(index: number, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeVariantRow(index: number) {
    const row = variants[index];

    if (row.id && productId) {
      deleteVariant.mutate(
        { productId, variantId: row.id },
        { onSuccess: () => setVariants((prev) => prev.filter((_, i) => i !== index)) }
      );
      return;
    }

    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  React.useEffect(() => {
    if (product) {
      form.reset({
        category_id: product.category?.id ?? 0,
        brand_id: product.brand?.id ?? null,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode ?? "",
        description: product.description ?? "",
        short_description: product.short_description ?? "",
        cost_price: product.cost_price ?? 0,
        selling_price: product.selling_price,
        discount_price: product.discount_price,
        tax_rate: product.tax_rate,
        unit: product.unit,
        has_variants: product.has_variants,
        is_active: product.is_active,
        is_featured: product.is_featured,
        low_stock_threshold: product.low_stock_threshold,
        weight: product.weight,
      });

      if (product.variants?.length) {
        setVariants(
          product.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            barcode: variant.barcode ?? "",
            attributesText: Object.entries(variant.attributes ?? {})
              .map(([key, value]) => `${key}: ${value}`)
              .join(", "),
            cost_price: variant.cost_price,
            selling_price: variant.selling_price,
            image: null,
            existingImageUrl: variant.image ?? null,
            initial_quantity: 0,
          }))
        );
      }
    }
  }, [product, form]);

  const isPending = createProduct.isPending || updateProduct.isPending;

  function onSubmit(values: ProductFormValues) {
    const payload = { ...values, weight: values.weight ?? undefined };

    const variantsPayload: AdminProductVariantInput[] | undefined =
      values.has_variants && variants.length
        ? variants.map((row) => ({
            id: row.id,
            sku: row.sku,
            barcode: row.barcode,
            attributes: parseAttributes(row.attributesText),
            cost_price: row.cost_price,
            selling_price: row.selling_price,
            image: row.image ?? undefined,
            initial_quantity: isEditing ? undefined : row.initial_quantity,
          }))
        : undefined;

    if (isEditing && productId) {
      updateProduct.mutate(
        {
          id: productId,
          input: {
            ...payload,
            images: images.length ? images : undefined,
            variants: variantsPayload,
          },
        },
        { onSuccess: () => router.push("/admin/products") }
      );
      return;
    }

    createProduct.mutate(
      {
        ...payload,
        images: images.length ? images : undefined,
        variants: variantsPayload,
        warehouse_id: warehouseId,
        initial_quantity: values.has_variants ? undefined : startingQuantity,
      },
      { onSuccess: () => router.push("/admin/products") }
    );
  }

  if (isEditing && productLoading) {
    return <LoadingSpinner className="min-h-[50vh]" />;
  }

  if (isEditing && productError) {
    return <ErrorState onRetry={() => refetchProduct()} />;
  }

  return (
    <div className="animate-in-fade-up mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="size-3.5" />
            Back to products
          </Link>
        </Button>
        <PageHeader
          title={isEditing ? "Edit product" : "New product"}
          description={
            isEditing
              ? "Update pricing, stock rules, and catalog placement."
              : "Add a new item to your catalog."
          }
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-eyebrow text-muted-foreground">Basic information</CardTitle>
              <CardDescription>Name, category, and identifiers for this product.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Product name</FormLabel>
                    <FormControl>
                      <Input placeholder="Wireless Mouse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
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
                name="brand_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand (optional)</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No brand</SelectItem>
                        {brands?.map((brand) => (
                          <SelectItem key={brand.id} value={String(brand.id)}>
                            {brand.name}
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
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="WM-1001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="8901234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="pcs, kg, box…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-eyebrow text-muted-foreground">Pricing & stock</CardTitle>
              <CardDescription>Cost, margin, tax, and reorder thresholds.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 pt-6 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
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
                name="selling_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
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
                name="discount_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount price (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={(field.value as number | null | undefined) ?? ""}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        onChange={(event) =>
                          field.onChange(event.target.value === "" ? null : event.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        max={100}
                        value={(field.value as number | undefined) ?? 0}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        onChange={(event) =>
                          field.onChange(event.target.value === "" ? undefined : event.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="low_stock_threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low stock threshold</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={(field.value as number | undefined) ?? 0}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        onChange={(event) =>
                          field.onChange(event.target.value === "" ? undefined : event.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg, optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={(field.value as number | null | undefined) ?? ""}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        onChange={(event) =>
                          field.onChange(event.target.value === "" ? null : event.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-eyebrow text-muted-foreground">Description</CardTitle>
              <CardDescription>Copy shown on listing cards and the product page.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 pt-6">
              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short description (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="One-line summary shown on listing cards." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full description (optional)</FormLabel>
                    <FormControl>
                      <RichTextEditor value={field.value ?? ""} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {!isEditing && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-eyebrow text-muted-foreground">Starting stock</CardTitle>
                <CardDescription>
                  Optional — set the quantity on hand now instead of via Inventory afterwards.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FormLabel>Warehouse</FormLabel>
                  <Select
                    value={warehouseId ? String(warehouseId) : undefined}
                    onValueChange={(value) => setWarehouseId(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {(warehouses ?? []).map((warehouse) => (
                        <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {hasVariants ? (
                  <p className="text-muted-foreground self-end pb-2 text-sm">
                    Set each variant&apos;s starting quantity in the Variants section below.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    <FormLabel>Starting quantity</FormLabel>
                    <Input
                      type="number"
                      min={0}
                      value={startingQuantity}
                      onChange={(event) => setStartingQuantity(Number(event.target.value))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-eyebrow text-muted-foreground">Images</CardTitle>
              <CardDescription>Product photography — the first image becomes the primary shot.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {isEditing && (product?.images?.length ?? 0) > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2.5 text-sm font-medium">Current images</p>
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                    {product?.images?.map((image) => (
                      <div
                        key={image.id}
                        className="bg-muted ring-border/60 group relative aspect-square overflow-hidden rounded-lg ring-1"
                      >
                        {image.url && (
                          <Image src={image.url} alt={product.name} fill className="object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            productId && deleteImage.mutate({ productId, imageId: image.id })
                          }
                          className="bg-background/90 text-destructive absolute top-1 right-1 rounded-md p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <FileDropzone
                  value={images}
                  onChange={setImages}
                  multiple
                  label="Upload product images"
                  hint="PNG, JPG up to 4MB each"
                />
              </div>
            </CardContent>
          </Card>

          {hasVariants && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-eyebrow text-muted-foreground">Variants</CardTitle>
                <CardDescription>
                  Add one row per variant (e.g. Color/Size combination) with its own SKU and price.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {variants.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    No variants added yet. Click &quot;Add variant&quot; below for each combination
                    (e.g. Black / M, Black / L, Red / M).
                  </p>
                )}
                {variants.map((row, index) => (
                  <div key={row.id ?? `new-${index}`} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Variant {index + 1}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariantRow(index)}
                      >
                        <Trash2 className="text-destructive size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5 sm:col-span-2">
                        <FormLabel>Variant image (optional)</FormLabel>
                        <div className="flex items-center gap-3">
                          {(row.image || row.existingImageUrl) && (
                            <div className="bg-muted ring-border/60 relative size-14 shrink-0 overflow-hidden rounded-lg ring-1">
                              {row.image ? (
                                // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote asset
                                <img
                                  src={URL.createObjectURL(row.image)}
                                  alt="Variant preview"
                                  className="size-full object-cover"
                                />
                              ) : (
                                row.existingImageUrl && (
                                  <Image
                                    src={row.existingImageUrl}
                                    alt="Variant preview"
                                    fill
                                    className="object-cover"
                                  />
                                )
                              )}
                            </div>
                          )}
                          <Input
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={(event) =>
                              updateVariantRow(index, {
                                image: event.target.files?.[0] ?? null,
                              })
                            }
                          />
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Shown on the storefront when this variant is selected. Falls back to the
                          product&apos;s main image if left empty. Choosing a new file replaces the
                          current image.
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <FormLabel>SKU</FormLabel>
                        <Input
                          value={row.sku}
                          onChange={(event) => updateVariantRow(index, { sku: event.target.value })}
                          placeholder="e.g. TSHIRT-BLK-M"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <FormLabel>Barcode</FormLabel>
                        <Input
                          value={row.barcode}
                          onChange={(event) => updateVariantRow(index, { barcode: event.target.value })}
                          placeholder="e.g. 8901234567890"
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <FormLabel>Attributes</FormLabel>
                        <Input
                          value={row.attributesText}
                          onChange={(event) =>
                            updateVariantRow(index, { attributesText: event.target.value })
                          }
                          placeholder="Color: Black, Size: M"
                        />
                        <p className="text-muted-foreground text-xs">
                          Comma-separated key: value pairs.
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <FormLabel>Cost price</FormLabel>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={row.cost_price}
                          onChange={(event) =>
                            updateVariantRow(index, { cost_price: Number(event.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <FormLabel>Selling price</FormLabel>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={row.selling_price}
                          onChange={(event) =>
                            updateVariantRow(index, { selling_price: Number(event.target.value) })
                          }
                        />
                      </div>
                      {!isEditing && (
                        <div className="space-y-1.5">
                          <FormLabel>Starting quantity</FormLabel>
                          <Input
                            type="number"
                            min={0}
                            value={row.initial_quantity}
                            onChange={(event) =>
                              updateVariantRow(index, { initial_quantity: Number(event.target.value) })
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addVariantRow}>
                  <Plus className="size-4" />
                  Add variant
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-eyebrow text-muted-foreground">Visibility</CardTitle>
              <CardDescription>Control where this product appears in the storefront.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="hover:bg-muted/40 transition-luxury flex flex-row items-center justify-between rounded-lg border p-3.5">
                    <FormLabel className="font-normal">Active</FormLabel>
                    <FormControl>
                      <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="hover:bg-muted/40 transition-luxury flex flex-row items-center justify-between rounded-lg border p-3.5">
                    <FormLabel className="font-normal">Featured</FormLabel>
                    <FormControl>
                      <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="has_variants"
                render={({ field }) => (
                  <FormItem className="hover:bg-muted/40 transition-luxury flex flex-row items-center justify-between rounded-lg border p-3.5">
                    <FormLabel className="font-normal">Has variants</FormLabel>
                    <FormControl>
                      <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="glass-panel sticky bottom-4 z-10 flex justify-end gap-2 rounded-xl p-3 shadow-luxury-md">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={isPending}>
              {isPending ? "Saving…" : isEditing ? "Save changes" : "Create product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
