"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { cartService } from "@/lib/api/services/cart.service";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { ApiError } from "@/lib/api/client";

export function useCart() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.cart.detail,
    queryFn: () => cartService.get(),
    staleTime: 0,
    // Guests get a cart via X-Cart-Token, so this is safe to run either way,
    // but we key off auth state to force a refetch right after login/logout.
    meta: { isAuthenticated },
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      product_id: number;
      product_variant_id?: number | null;
      quantity: number;
    }) => cartService.addItem(input),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.detail, cart);
      toast.success("Added to cart.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartService.updateItem(itemId, quantity),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.detail, cart);
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number) => cartService.removeItem(itemId),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.detail, cart);
      toast.success("Removed from cart.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clear(),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.detail, cart);
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
