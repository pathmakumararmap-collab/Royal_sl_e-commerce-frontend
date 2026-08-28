"use client";

import { Check } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCategories, useAdminProducts } from "@/hooks/use-admin-products";
import { cn } from "@/lib/utils";

interface CheckboxIdListProps {
  selected: number[];
  onChange: (ids: number[]) => void;
}

function toggleId(list: number[], id: number): number[] {
  return list.includes(id) ? list.filter((existing) => existing !== id) : [...list, id];
}

function PickerSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border p-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-9 w-full rounded-lg" />
      ))}
    </div>
  );
}

interface PickerRowProps {
  id: string;
  checked: boolean;
  onCheckedChange: () => void;
  children: React.ReactNode;
}

function PickerRow({ id, checked, onCheckedChange, children }: PickerRowProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 transition-luxury",
        checked
          ? "border-primary/40 bg-primary/5 shadow-luxury-sm"
          : "border-transparent hover:bg-muted/60"
      )}
    >
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate text-sm">{children}</span>
      {checked && <Check className="text-primary size-3.5 shrink-0" />}
    </label>
  );
}

export function ProductPicker({ selected, onChange }: CheckboxIdListProps) {
  const { data, isLoading } = useAdminProducts({ per_page: 100, sort: "name" });

  if (isLoading) {
    return <PickerSkeleton />;
  }

  const products = data?.data ?? [];

  if (!products.length) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">
        No products available.
      </p>
    );
  }

  return (
    <ScrollArea className="bg-muted/20 h-52 rounded-xl border">
      <div className="space-y-1 p-2">
        {products.map((product) => (
          <PickerRow
            key={product.id}
            id={`product-${product.id}`}
            checked={selected.includes(product.id)}
            onCheckedChange={() => onChange(toggleId(selected, product.id))}
          >
            {product.name} <span className="text-muted-foreground">({product.sku})</span>
          </PickerRow>
        ))}
      </div>
    </ScrollArea>
  );
}

export function CategoryPicker({ selected, onChange }: CheckboxIdListProps) {
  const { data: categories, isLoading } = useAdminCategories();

  if (isLoading) {
    return <PickerSkeleton />;
  }

  if (!categories?.length) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">
        No categories available.
      </p>
    );
  }

  return (
    <ScrollArea className="bg-muted/20 h-52 rounded-xl border">
      <div className="space-y-1 p-2">
        {categories.map((category) => (
          <PickerRow
            key={category.id}
            id={`category-${category.id}`}
            checked={selected.includes(category.id)}
            onCheckedChange={() => onChange(toggleId(selected, category.id))}
          >
            {category.name}
          </PickerRow>
        ))}
      </div>
    </ScrollArea>
  );
}
