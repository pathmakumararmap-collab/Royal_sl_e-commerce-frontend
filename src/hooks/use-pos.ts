"use client";

import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { posService, type PosCheckoutInput } from "@/lib/api/services/pos.service";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

export function usePosCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PosCheckoutInput) => posService.checkout(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
      toast.success("Sale completed.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useBarcodeLookup() {
  return useMutation({
    mutationFn: (barcode: string) => posService.lookupByBarcode(barcode),
    onError: (error: ApiError) =>
      toast.error(error.message || "Product not found for this barcode."),
  });
}
