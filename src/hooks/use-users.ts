"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { roleService, userService } from "@/lib/api/services/user.service";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import type { CreateUserInput, UpdateUserInput } from "@/types/role";

export function useUsers(page = 1) {
  return useQuery({
    queryKey: queryKeys.users.list(page),
    queryFn: () => userService.list(page),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => userService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("User created.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateUserInput }) =>
      userService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("User updated.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("User deleted.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: () => roleService.list(),
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: queryKeys.roles.permissions,
    queryFn: () => roleService.permissions(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; permissions: string[] }) =>
      roleService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      toast.success("Role created.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissions }: { id: number; permissions: string[] }) =>
      roleService.updatePermissions(id, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      toast.success("Role permissions updated.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
