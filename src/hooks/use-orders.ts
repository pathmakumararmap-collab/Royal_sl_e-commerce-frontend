"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  adminOrderService,
  customerOrderService,
  invoiceService,
  paymentMethodService,
} from "@/lib/api/services/order.service";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import type {
  FacebookOrderInput,
  OrderFilters,
  PlaceOrderInput,
} from "@/types/order";
import type { RecordPaymentInput } from "@/types/payment";

export function useCustomerOrders(page = 1) {
  return useQuery({
    queryKey: queryKeys.customerOrders.list(page),
    queryFn: () => customerOrderService.list(page),
    placeholderData: (previousData) => previousData,
  });
}

export function useCustomerOrder(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.customerOrders.detail(id ?? 0),
    queryFn: () => customerOrderService.get(id as number),
    enabled: !!id,
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PlaceOrderInput) => customerOrderService.checkout(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail });
      queryClient.invalidateQueries({ queryKey: queryKeys.customerOrders.all });
      toast.success("Order placed successfully!");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      customerOrderService.cancel(id, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customerOrders.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.customerOrders.detail(variables.id),
      });
      toast.success("Order cancelled.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useAdminOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: queryKeys.adminOrders.list(filters),
    queryFn: () => adminOrderService.list(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminOrder(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.adminOrders.detail(id ?? 0),
    queryFn: () => adminOrderService.get(id as number),
    enabled: !!id,
  });
}

export function useCreateFacebookOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: FacebookOrderInput) =>
      adminOrderService.createFacebookOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders.all });
      toast.success("Facebook order imported.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: number;
      status: string;
      note?: string;
    }) => adminOrderService.updateStatus(id, status, note),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminOrders.detail(variables.id),
      });
      toast.success("Order status updated.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useAdminCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminOrderService.cancel(id, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminOrders.detail(variables.id),
      });
      toast.success("Order cancelled.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: RecordPaymentInput }) =>
      adminOrderService.recordPayment(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminOrders.detail(variables.id),
      });
      toast.success("Payment recorded.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useGenerateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminOrderService.generateInvoice(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders.detail(id) });
      toast.success("Invoice generated.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: queryKeys.paymentMethods.all,
    queryFn: () => paymentMethodService.list(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: async ({ id, invoiceNo }: { id: number; invoiceNo: string }) => {
      const blob = await invoiceService.download(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoiceNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: (error: ApiError) => toast.error(error.message || "Could not download invoice."),
  });
}
