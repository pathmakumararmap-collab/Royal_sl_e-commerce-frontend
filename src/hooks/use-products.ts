"use client";

import { useQuery } from "@tanstack/react-query";

import { catalogService } from "@/lib/api/services/catalog.service";
import { queryKeys } from "@/lib/query-keys";
import type { ProductFilters } from "@/types/catalog";

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => catalogService.listProducts(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: () => catalogService.getProduct(slug),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => catalogService.listCategories(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: queryKeys.catalogBrands.all,
    queryFn: () => catalogService.listBrands(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useFlashSale() {
  return useQuery({
    queryKey: queryKeys.flashSale.all,
    queryFn: () => catalogService.getFlashSale(),
    staleTime: 60 * 1000,
  });
}
