"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  adminReviewService,
  type AdminReviewFilters,
} from "@/lib/api/services/admin-review.service";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

export function useAdminReviews(filters: AdminReviewFilters = {}) {
  return useQuery({
    queryKey: queryKeys.adminReviews.list(filters),
    queryFn: () => adminReviewService.list(filters),
  });
}

export function useApproveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminReviewService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReviews.all });
      toast.success("Review approved.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useRejectReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminReviewService.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReviews.all });
      toast.success("Review rejected.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminReviewService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReviews.all });
      toast.success("Review deleted.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
