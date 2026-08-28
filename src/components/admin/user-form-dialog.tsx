"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateUser, useUpdateUser } from "@/hooks/use-users";
import { useRoles } from "@/hooks/use-users";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from "@/lib/validators/user";
import { cn } from "@/lib/utils";
import type { User } from "@/types/user";

const FALLBACK_ROLES = ["admin", "manager", "warehouse_manager", "pos_cashier", "customer"];

function RoleChip({
  id,
  checked,
  label,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  label: string;
  onCheckedChange: () => void;
}) {
  return (
    <div>
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} className="sr-only" />
      <Label
        htmlFor={id}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-normal capitalize transition-luxury",
          checked
            ? "border-primary/50 bg-primary/10 text-primary shadow-luxury-sm"
            : "border-input text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        {checked && <Check className="size-3.5" />}
        {label}
      </Label>
    </div>
  );
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const isEditing = !!user;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const { data: roles } = useRoles();

  const roleOptions =
    roles?.length ? roles.map((role) => role.name) : FALLBACK_ROLES;

  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      status: "active",
      roles: [],
    },
  });

  const updateForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      password: "",
      status: user?.status ?? "active",
      roles: user?.roles ?? [],
    },
  });

  React.useEffect(() => {
    if (!open) return;
    if (isEditing) {
      updateForm.reset({
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        password: "",
        status: user?.status ?? "active",
        roles: user?.roles ?? [],
      });
    } else {
      createForm.reset({
        name: "",
        email: "",
        phone: "",
        password: "",
        status: "active",
        roles: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user, isEditing]);

  const isPending = createUser.isPending || updateUser.isPending;

  function onCreateSubmit(values: CreateUserFormValues) {
    createUser.mutate(
      { ...values, phone: values.phone || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          createForm.reset();
        },
      }
    );
  }

  function onUpdateSubmit(values: UpdateUserFormValues) {
    if (!user) return;
    const input = {
      ...values,
      phone: values.phone || undefined,
      password: values.password || undefined,
    };
    updateUser.mutate(
      { id: user.id, input },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  function toggleRole(current: string[], role: string): string[] {
    return current.includes(role) ? current.filter((r) => r !== role) : [...current, role];
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit user" : "New user"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this staff member's details, roles, or password."
              : "Create a new staff account with one or more roles."}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={updateForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="banned">Banned</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>New password (leave blank to keep unchanged)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-2">
                  <Separator />
                </div>
                <FormField
                  control={updateForm.control}
                  name="roles"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Roles</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {roleOptions.map((role) => (
                          <RoleChip
                            key={role}
                            id={`update-role-${role}`}
                            checked={(field.value ?? []).includes(role)}
                            label={role.replace(/_/g, " ")}
                            onCheckedChange={() =>
                              field.onChange(toggleRole(field.value ?? [], role))
                            }
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving…" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jane@royalsl.test" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="077 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="banned">Banned</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-2">
                  <Separator />
                </div>
                <FormField
                  control={createForm.control}
                  name="roles"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Roles</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {roleOptions.map((role) => (
                          <RoleChip
                            key={role}
                            id={`create-role-${role}`}
                            checked={field.value.includes(role)}
                            label={role.replace(/_/g, " ")}
                            onCheckedChange={() => field.onChange(toggleRole(field.value, role))}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating…" : "Create user"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
