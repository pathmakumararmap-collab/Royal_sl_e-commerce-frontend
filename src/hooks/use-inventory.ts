"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  damageService,
  purchaseService,
  stockAdjustmentService,
  stockReturnService,
  stockService,
  stockTransferService,
  supplierService,
  warehouseService,
  type StockFilters,
  type SupplierInput,
  type WarehouseInput,
} from "@/lib/api/services/inventory.service";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import type {
  DamageInput,
  PurchaseInput,
  StockAdjustmentInput,
  StockReturnInput,
  StockTransferInput,
} from "@/types/inventory";

export function useWarehouses() {
  return useQuery({
    queryKey: queryKeys.warehouses.all,
    queryFn: () => warehouseService.list(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: WarehouseInput) => warehouseService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all });
      toast.success("Warehouse created.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<WarehouseInput> }) =>
      warehouseService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all });
      toast.success("Warehouse updated.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useSuppliers(page = 1) {
  return useQuery({
    queryKey: queryKeys.suppliers.list(page),
    queryFn: () => supplierService.list(page),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SupplierInput) => supplierService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      toast.success("Supplier created.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<SupplierInput> }) =>
      supplierService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      toast.success("Supplier updated.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => supplierService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      toast.success("Supplier removed.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useStock(filters: StockFilters = {}) {
  return useQuery({
    queryKey: queryKeys.stock.list(filters),
    queryFn: () => stockService.list(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useLowStockAlerts(page = 1) {
  return useQuery({
    queryKey: queryKeys.stock.lowStock(page),
    queryFn: () => stockService.lowStock(page),
    placeholderData: (previousData) => previousData,
  });
}

export function useStockMovements(
  filters: { warehouse_id?: number; product_id?: number; type?: string; page?: number } = {}
) {
  return useQuery({
    queryKey: queryKeys.stock.movements(filters),
    queryFn: () => stockService.movements(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function usePurchases(page = 1) {
  return useQuery({
    queryKey: queryKeys.purchases.list(page),
    queryFn: () => purchaseService.list(page),
    placeholderData: (previousData) => previousData,
  });
}

export function usePurchase(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.purchases.detail(id ?? 0),
    queryFn: () => purchaseService.get(id as number),
    enabled: !!id,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PurchaseInput) => purchaseService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
      toast.success("Purchase order created.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useReceivePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      items,
    }: {
      id: number;
      items: { item_id: number; received_quantity: number }[];
    }) => purchaseService.receive(id, items),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchases.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
      toast.success("Stock received into warehouse.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useCancelPurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchaseService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
      toast.success("Purchase order cancelled.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useStockTransfers(page = 1) {
  return useQuery({
    queryKey: queryKeys.stockTransfers.list(page),
    queryFn: () => stockTransferService.list(page),
    placeholderData: (previousData) => previousData,
  });
}

export function useStockTransfer(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.stockTransfers.detail(id ?? 0),
    queryFn: () => stockTransferService.get(id as number),
    enabled: !!id,
  });
}

export function useCreateStockTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StockTransferInput) => stockTransferService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stockTransfers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
      toast.success("Stock transfer dispatched.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useReceiveStockTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      items,
    }: {
      id: number;
      items: { item_id: number; received_quantity: number }[];
    }) => stockTransferService.receive(id, items),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stockTransfers.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stockTransfers.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
      toast.success("Stock transfer received.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useStockAdjustments(page = 1) {
  return useQuery({
    queryKey: queryKeys.stockAdjustments.list(page),
    queryFn: () => stockAdjustmentService.list(page),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StockAdjustmentInput) => stockAdjustmentService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stockAdjustments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
      toast.success("Stock adjustment recorded.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useStockReturns(page = 1) {
  return useQuery({
    queryKey: queryKeys.stockReturns.list(page),
    queryFn: () => stockReturnService.list(page),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateStockReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StockReturnInput) => stockReturnService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stockReturns.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
      toast.success("Return recorded.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDamages(page = 1) {
  return useQuery({
    queryKey: queryKeys.damages.list(page),
    queryFn: () => damageService.list(page),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateDamage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DamageInput) => damageService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.damages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
      toast.success("Damage report recorded.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
