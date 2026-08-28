"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { addressService, profileService, type ProfileUpdateInput } from "@/lib/api/services/address.service";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import type { AddressInput } from "@/types/user";

export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.addresses.all,
    queryFn: () => addressService.list(),
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddressInput) => addressService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      toast.success("Address added.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<AddressInput> }) =>
      addressService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      toast.success("Address updated.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => addressService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      toast.success("Address removed.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProfileUpdateInput) => profileService.update(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
      toast.success("Profile updated.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
