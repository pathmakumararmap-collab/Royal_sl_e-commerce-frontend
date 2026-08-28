"use client";

import { SlidersHorizontal } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Brand, Category } from "@/types/catalog";

export interface ProductFilterValues {
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  sort: "latest" | "price_asc" | "price_desc" | "name";
}

interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
  filters: ProductFilterValues;
  onChange: (filters: ProductFilterValues) => void;
}

function FilterFields({ categories, brands, filters, onChange }: ProductFiltersProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Category</Label>
        <RadioGroup
          value={filters.categoryId ? String(filters.categoryId) : "all"}
          onValueChange={(value) =>
            onChange({ ...filters, categoryId: value === "all" ? undefined : Number(value) })
          }
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="all" id="cat-all" />
            <Label htmlFor="cat-all" className="text-sm font-normal">All categories</Label>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <RadioGroupItem value={String(category.id)} id={`cat-${category.id}`} />
              <Label htmlFor={`cat-${category.id}`} className="text-sm font-normal">
                {category.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Brand</Label>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={filters.brandId === brand.id}
                onCheckedChange={(checked) =>
                  onChange({ ...filters, brandId: checked ? brand.id : undefined })
                }
              />
              <Label htmlFor={`brand-${brand.id}`} className="text-sm font-normal">
                {brand.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Price range (LKR)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                minPrice: event.target.value ? Number(event.target.value) : undefined,
              })
            }
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                maxPrice: event.target.value ? Number(event.target.value) : undefined,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

export function ProductFiltersSidebar(props: ProductFiltersProps) {
  return (
    <aside className="border-border/60 hidden w-64 shrink-0 border-r pr-6 lg:block">
      <p className="text-eyebrow text-muted-foreground mb-5">Filters</p>
      <ScrollArea className="h-full pr-2">
        <FilterFields {...props} />
      </ScrollArea>
    </aside>
  );
}

export function ProductFiltersMobile(props: ProductFiltersProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto px-4 pb-6">
          <FilterFields {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
