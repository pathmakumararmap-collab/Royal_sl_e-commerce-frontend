"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Minus, Package, Plus, ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Currency } from "@/components/shared/currency";
import { StarRating } from "@/components/shared/star-rating";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorState } from "@/components/shared/error-state";
import { ProductGrid } from "@/components/storefront/product-grid";
import { ProductReviewsSection } from "@/components/storefront/product-reviews-section";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { useProduct, useProducts } from "@/hooks/use-products";
import { useAddCartItem } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";

export function ProductDetailContent({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: product, isLoading, isError, refetch } = useProduct(slug);
  const addItem = useAddCartItem();
  const { has, toggle } = useWishlist();

  const [selectedAttributes, setSelectedAttributes] = React.useState<Record<string, string>>({});
  const [displayImage, setDisplayImage] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState("description");
  const [optionSheetOpen, setOptionSheetOpen] = React.useState(false);

  React.useEffect(() => {
    setDisplayImage(product?.images?.[0]?.url ?? null);
    setSelectedAttributes({});
  }, [product?.id, product?.images]);

  const { data: related } = useProducts({
    category_id: product?.category?.id,
    per_page: 4,
  });

  if (isLoading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  if (isError || !product) {
    return (
      <div className="container-page py-16">
        <ErrorState
          title="Product not found"
          description="This product may have been removed or is no longer available."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const variants = product.variants ?? [];

  // Distinct attribute keys (e.g. "Color", "Size"), in first-seen order.
  const attributeKeys: string[] = [];
  variants.forEach((variant) => {
    Object.keys(variant.attributes ?? {}).forEach((key) => {
      if (!attributeKeys.includes(key)) attributeKeys.push(key);
    });
  });
  const colorKey = attributeKeys.find((key) => /colou?r/i.test(key));

  function valuesForAttribute(key: string): string[] {
    const values: string[] = [];
    variants.forEach((variant) => {
      const value = variant.attributes?.[key];
      if (value && !values.includes(value)) values.push(value);
    });
    return values;
  }

  const allAttributesSelected =
    attributeKeys.length > 0 && attributeKeys.every((key) => !!selectedAttributes[key]);
  const selectedVariant = allAttributesSelected
    ? variants.find((variant) =>
        attributeKeys.every((key) => variant.attributes?.[key] === selectedAttributes[key])
      )
    : undefined;

  // Gallery = the product's own photos + each color variant's own photo
  // (deduped), so picking a color and picking a thumbnail stay in sync.
  const galleryItems: { url: string; colorValue?: string }[] = images
    .filter((image): image is typeof image & { url: string } => !!image.url)
    .map((image) => ({ url: image.url }));

  if (colorKey) {
    valuesForAttribute(colorKey).forEach((value) => {
      const swatchVariant = variants.find(
        (variant) => variant.attributes?.[colorKey] === value && variant.image
      );
      if (swatchVariant?.image && !galleryItems.some((item) => item.url === swatchVariant.image)) {
        galleryItems.push({ url: swatchVariant.image, colorValue: value });
      }
    });
  }

  const mainImageUrl = displayImage ?? selectedVariant?.image ?? galleryItems[0]?.url;
  const price = selectedVariant?.selling_price ?? product.current_price;
  const isWishlisted = has(product.id);
  const stock = selectedVariant?.stock_quantity ?? product.total_stock ?? 0;
  const outOfStock = stock <= 0;
  const needsSelection = product.has_variants && !!variants.length && !selectedVariant;

  function handleBuyNow() {
    addItem.mutate(
      { product_id: product!.id, product_variant_id: selectedVariant?.id, quantity },
      { onSuccess: () => router.push("/checkout") }
    );
  }

  function renderAttributeRows() {
    return (
      <>
        {attributeKeys.map((key) => {
          const values = valuesForAttribute(key);
          const isColorRow = key === colorKey;

          return (
            <div key={key} className="space-y-2">
              <p className="text-sm font-medium">
                {key}
                {selectedAttributes[key] ? `: ${selectedAttributes[key]}` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const isSelected = selectedAttributes[key] === value;

                  if (isColorRow) {
                    const swatchVariant = variants.find(
                      (variant) => variant.attributes?.[key] === value && variant.image
                    );

                    return (
                      <button
                        key={value}
                        type="button"
                        title={value}
                        onClick={() => {
                          setSelectedAttributes((prev) => ({ ...prev, [key]: value }));
                          if (swatchVariant?.image) setDisplayImage(swatchVariant.image);
                        }}
                        className={cn(
                          "bg-muted hover-lift-sm relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                          isSelected ? "border-primary" : "border-transparent"
                        )}
                      >
                        {swatchVariant?.image ? (
                          <Image src={swatchVariant.image} alt={value} fill className="object-cover" />
                        ) : (
                          <span className="text-muted-foreground flex h-full items-center justify-center px-1 text-center text-[11px] leading-tight">
                            {value}
                          </span>
                        )}
                      </button>
                    );
                  }

                  return (
                    <Button
                      key={value}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAttributes((prev) => ({ ...prev, [key]: value }))}
                    >
                      {value}
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {needsSelection && (
          <p className="text-muted-foreground text-xs">
            Select {attributeKeys.filter((key) => !selectedAttributes[key]).join(" and ")} to see the
            exact price and availability.
          </p>
        )}
      </>
    );
  }

  return (
    <div className="container-page py-12">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="bg-muted shadow-luxury-sm relative aspect-square overflow-hidden rounded-2xl border border-border/60">
            {mainImageUrl ? (
              <Image
                src={mainImageUrl}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center">
                <Package className="size-10" />
              </div>
            )}

            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute top-3 right-3 rounded-full shadow-luxury-sm"
              onClick={() => toggle(product)}
              aria-label="Toggle wishlist"
            >
              <Heart className={cn("size-5", isWishlisted && "fill-destructive text-destructive")} />
            </Button>
          </div>
          {galleryItems.length > 1 && (
            <div className="flex flex-wrap gap-2.5">
              {galleryItems.map((item) => (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => {
                    setDisplayImage(item.url);
                    if (item.colorValue && colorKey) {
                      setSelectedAttributes((prev) => ({ ...prev, [colorKey]: item.colorValue as string }));
                    }
                  }}
                  className={cn(
                    "bg-muted hover-lift-sm relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                    mainImageUrl === item.url ? "border-primary" : "border-transparent"
                  )}
                >
                  <Image src={item.url} alt={product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            {product.brand && (
              <p className="text-muted-foreground text-sm">{product.brand.name}</p>
            )}
            <h1 className="text-display text-2xl sm:text-3xl">{product.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm">SKU: {selectedVariant?.sku ?? product.sku}</p>
            {!!product.reviews_count && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("reviews");
                  document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-2 inline-flex items-center gap-2"
              >
                <StarRating value={product.rating_average ?? 0} size="sm" />
                <span className="text-muted-foreground text-sm hover:underline">
                  {(product.rating_average ?? 0).toFixed(1)} ({product.reviews_count} review
                  {product.reviews_count === 1 ? "" : "s"})
                </span>
              </button>
            )}
          </div>

          <div>
            <Currency value={price} className="tabular-nums text-3xl font-bold" />
            {product.discount_price && product.discount_price < product.selling_price && (
              <Currency
                value={product.selling_price}
                className="text-muted-foreground tabular-nums mt-0.5 block text-base font-normal line-through"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            {outOfStock ? (
              <Badge variant="destructive">Out of stock</Badge>
            ) : stock <= product.low_stock_threshold ? (
              <Badge variant="warning">Only {stock} left</Badge>
            ) : (
              <Badge variant="success">In stock</Badge>
            )}
            {product.is_featured && <Badge variant="secondary">Featured</Badge>}
          </div>

          {product.short_description && (
            <p className="text-muted-foreground">{product.short_description}</p>
          )}

          {product.has_variants && !!variants.length && (
            <div className="hidden space-y-4 md:block">{renderAttributeRows()}</div>
          )}

          {/* Mobile-only: "Product Option" variant thumbnails — tapping one
              opens the full option sheet (color/size/quantity + actions). */}
          {product.has_variants && !!variants.length && (
            <div className="md:hidden">
              <p className="mb-2 text-sm font-medium">Product Option</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {colorKey ? (
                  valuesForAttribute(colorKey).map((value) => {
                    const swatchVariant = variants.find(
                      (variant) => variant.attributes?.[colorKey] === value && variant.image
                    );
                    const isSelected = selectedAttributes[colorKey] === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        title={value}
                        onClick={() => {
                          setSelectedAttributes((prev) => ({ ...prev, [colorKey]: value }));
                          if (swatchVariant?.image) setDisplayImage(swatchVariant.image);
                          setOptionSheetOpen(true);
                        }}
                        className={cn(
                          "bg-muted relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                          isSelected ? "border-primary" : "border-transparent"
                        )}
                      >
                        {swatchVariant?.image ? (
                          <Image src={swatchVariant.image} alt={value} fill className="object-cover" />
                        ) : (
                          <span className="text-muted-foreground flex h-full items-center justify-center px-1 text-center text-[11px] leading-tight">
                            {value}
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <Button variant="outline" onClick={() => setOptionSheetOpen(true)}>
                    Select options
                  </Button>
                )}
              </div>
            </div>
          )}

          <Separator />

          <div className="hidden flex-wrap items-center gap-3 md:flex">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="w-10 text-center">{quantity}</span>
              <Button variant="outline" size="icon-sm" onClick={() => setQuantity((q) => q + 1)}>
                <Plus className="size-3.5" />
              </Button>
            </div>

            <Button
              size="lg"
              className="bg-[#FB6C00] text-white hover:bg-[#FB6C00]/90"
              disabled={outOfStock || needsSelection || addItem.isPending}
              onClick={handleBuyNow}
            >
              {outOfStock ? "Out of stock" : needsSelection ? "Select options" : "Buy Now"}
            </Button>

            <Button
              size="lg"
              variant="outline"
              disabled={outOfStock || needsSelection || addItem.isPending}
              onClick={() =>
                addItem.mutate({
                  product_id: product.id,
                  product_variant_id: selectedVariant?.id,
                  quantity,
                })
              }
            >
              <ShoppingCart className="size-4" />
              {outOfStock ? "Out of stock" : needsSelection ? "Select options" : "Add to cart"}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile-only: sticky bottom purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
        <div className="bg-card border-border/60 shadow-luxury-lg mx-auto flex max-w-md items-center gap-2 rounded-full border p-2">
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="w-6 text-center text-sm font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="size-3.5" />
            </Button>
          </div>

          <Button
            className="flex-1 rounded-full bg-[#FB6C00] text-white hover:bg-[#FB6C00]/90"
            disabled={outOfStock || addItem.isPending}
            onClick={() => (needsSelection ? setOptionSheetOpen(true) : handleBuyNow())}
          >
            {outOfStock ? "Out of stock" : "Buy Now"}
          </Button>

          <Button
            className="flex-1 rounded-full"
            disabled={outOfStock || addItem.isPending}
            onClick={() =>
              needsSelection
                ? setOptionSheetOpen(true)
                : addItem.mutate({
                    product_id: product.id,
                    product_variant_id: selectedVariant?.id,
                    quantity,
                  })
            }
          >
            <ShoppingCart className="size-4" />
            {outOfStock ? "Out of stock" : "Add to cart"}
          </Button>
        </div>
      </div>

      {/* Spacer so the fixed mobile bar doesn't cover the page content below it */}
      <div className="h-20 md:hidden" />

      {/* Mobile-only: bottom sheet for picking Color/Size/Quantity, opened
          from the "Product Option" thumbnails above. */}
      <Sheet open={optionSheetOpen} onOpenChange={setOptionSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] gap-0 overflow-y-auto rounded-t-2xl p-0 md:hidden">
          <div className="flex items-center gap-3 p-4 pr-10">
            <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg">
              {mainImageUrl ? (
                <Image src={mainImageUrl} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center">
                  <Package className="size-6" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
              <p className="text-muted-foreground text-xs">SKU: {selectedVariant?.sku ?? product.sku}</p>
              {product.brand && <p className="text-muted-foreground text-xs">{product.brand.name}</p>}
              {!!product.reviews_count && (
                <div className="mt-1 flex items-center gap-1.5">
                  <StarRating value={product.rating_average ?? 0} size="sm" />
                  <span className="text-muted-foreground text-xs">
                    {(product.rating_average ?? 0).toFixed(1)} ({product.reviews_count} review
                    {product.reviews_count === 1 ? "" : "s"})
                  </span>
                </div>
              )}
              <Currency value={price} className="tabular-nums mt-1 block text-xl font-bold" />
            </div>
          </div>

          <Separator />

          <div className="max-h-[42vh] space-y-4 overflow-y-auto px-4 py-4">{renderAttributeRows()}</div>

          <Separator />

          <div className="space-y-2 px-4 py-3">
            <p className="text-sm font-medium">Quantity</p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="w-10 text-center">{quantity}</span>
              <Button variant="outline" size="icon-sm" onClick={() => setQuantity((q) => q + 1)}>
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="border-border/60 flex items-center gap-2 border-t p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <Button variant="outline" className="shrink-0" onClick={() => toggle(product)}>
              <Heart className={cn("size-4", isWishlisted && "fill-destructive text-destructive")} />
              {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
            </Button>
            <Button
              className="flex-1 bg-[#FB6C00] text-white hover:bg-[#FB6C00]/90"
              disabled={outOfStock || needsSelection || addItem.isPending}
              onClick={() => {
                setOptionSheetOpen(false);
                handleBuyNow();
              }}
            >
              {outOfStock ? "Out of stock" : "Buy Now"}
            </Button>
            <Button
              className="flex-1"
              disabled={outOfStock || needsSelection || addItem.isPending}
              onClick={() => {
                addItem.mutate({
                  product_id: product.id,
                  product_variant_id: selectedVariant?.id,
                  quantity,
                });
                setOptionSheetOpen(false);
              }}
            >
              <ShoppingCart className="size-4" />
              {outOfStock ? "Out of stock" : "Add to cart"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-16" id="reviews">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews{product.reviews_count ? ` (${product.reviews_count})` : ""}
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="description"
          className="text-muted-foreground max-w-3xl py-4 text-sm leading-relaxed"
        >
          {product.description ? (
            <div
              className="[&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_p]:my-2"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
            />
          ) : (
            "No description available for this product."
          )}
        </TabsContent>
        <TabsContent value="details" className="py-4">
          <dl className="grid max-w-md grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Category</dt>
            <dd>{product.category?.name ?? "-"}</dd>
            <dt className="text-muted-foreground">Brand</dt>
            <dd>{product.brand?.name ?? "-"}</dd>
            <dt className="text-muted-foreground">Unit</dt>
            <dd>{product.unit}</dd>
            {product.weight && (
              <>
                <dt className="text-muted-foreground">Weight</dt>
                <dd>{product.weight} kg</dd>
              </>
            )}
          </dl>
        </TabsContent>
        <TabsContent value="reviews">
          <ProductReviewsSection
            productId={product.id}
            ratingAverage={product.rating_average}
            reviewsCount={product.reviews_count}
          />
        </TabsContent>
      </Tabs>

      {!!related?.data.length && (
        <section className="border-border/60 mt-16 border-t pt-12">
          <h2 className="text-display mb-6 text-xl sm:text-2xl">You might also like</h2>
          <ProductGrid products={related.data.filter((p) => p.id !== product.id).slice(0, 4)} />
        </section>
      )}
    </div>
  );
}