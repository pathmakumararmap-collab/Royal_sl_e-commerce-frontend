"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { reviewService, type ReviewInput } from "@/lib/api/services/review.service";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";

export function useProductReviews(productId: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reviews.list(productId, page),
    queryFn: () => reviewService.list(productId, page),
    enabled: !!productId,
  });
}

export function useMyReview(productId: number) {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: queryKeys.reviews.mine(productId),
    queryFn: () => reviewService.mine(productId),
    enabled: !!productId && !!user,
  });
}

export function useSubmitReview(productId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReviewInput) => reviewService.submit(productId, input),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.mine(productId) });
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      toast.success(result.message);
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
