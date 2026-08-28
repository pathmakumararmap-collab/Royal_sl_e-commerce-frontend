"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { couponService } from "@/lib/api/services/coupon.service";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import type { CouponInput } from "@/types/coupon";

export function useCoupons(page = 1) {
  return useQuery({
    queryKey: queryKeys.coupons.list(page),
    queryFn: () => couponService.list(page),
    placeholderData: (previousData) => previousData,
  });
}

export function useCoupon(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.coupons.detail(id ?? 0),
    queryFn: () => couponService.get(id as number),
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CouponInput) => couponService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.all });
      toast.success("Coupon created.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CouponInput> }) =>
      couponService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.all });
      toast.success("Coupon updated.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => couponService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.all });
      toast.success("Coupon deleted.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
