"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  adminProductService,
  brandService,
  categoryService,
  type AdminProductCreateInput,
  type AdminProductUpdateInput,
  type BrandInput,
  type CategoryInput,
} from "@/lib/api/services/admin-product.service";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import type { ProductFilters } from "@/types/catalog";

export function useAdminProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: queryKeys.adminProducts.list(filters),
    queryFn: () => adminProductService.list(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminProduct(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.adminProducts.detail(id ?? 0),
    queryFn: () => adminProductService.get(id as number),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminProductCreateInput) => adminProductService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminProducts.all });
      toast.success("Product created successfully.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AdminProductUpdateInput }) =>
      adminProductService.update(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminProducts.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminProducts.detail(variables.id),
      });
      toast.success("Product updated successfully.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      adminProductService.deleteImage(productId, imageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminProducts.detail(variables.productId),
      });
      toast.success("Image removed.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: number; variantId: number }) =>
      adminProductService.deleteVariant(productId, variantId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminProducts.detail(variables.productId),
      });
      toast.success("Variant removed.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminProductService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminProducts.all });
      toast.success("Product deleted.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: queryKeys.adminCategories.all,
    queryFn: () => categoryService.list(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CategoryInput) => categoryService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCategories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success("Category created.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CategoryInput> }) =>
      categoryService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCategories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success("Category updated.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCategories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success("Category deleted.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useAdminBrands() {
  return useQuery({
    queryKey: queryKeys.brands.all,
    queryFn: () => brandService.list(),
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BrandInput) => brandService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
      toast.success("Brand created.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<BrandInput> }) =>
      brandService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
      toast.success("Brand updated.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => brandService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
      toast.success("Brand deleted.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
