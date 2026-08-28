"use client";

import * as React from "react";
import { KeyRound, Plus, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  useCreateRole,
  usePermissions,
  useRoles,
  useUpdateRolePermissions,
} from "@/hooks/use-users";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/role";

function groupByPrefix(names: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const name of names) {
    const prefix = name.includes(".") ? name.split(".")[0] : "other";
    groups[prefix] ??= [];
    groups[prefix].push(name);
  }
  return groups;
}

function PermissionRow({
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
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 transition-luxury",
        checked ? "border-primary/40 bg-primary/5" : "border-transparent hover:bg-muted/60"
      )}
    >
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} className="shrink-0" />
      <span className="truncate text-sm">{label}</span>
    </label>
  );
}

function EditPermissionsDialog({
  role,
  open,
  onOpenChange,
}: {
  role: Role | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: permissions, isLoading } = usePermissions();
  const updatePermissions = useUpdateRolePermissions();
  const [selected, setSelected] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (open && role) {
      setSelected(role.permissions?.map((permission) => permission.name) ?? []);
    }
  }, [open, role]);

  const groups = React.useMemo(
    () => groupByPrefix((permissions ?? []).map((permission) => permission.name)),
    [permissions]
  );

  function toggle(name: string) {
    setSelected((current) =>
      current.includes(name) ? current.filter((n) => n !== name) : [...current, name]
    );
  }

  function toggleGroup(names: string[], allChecked: boolean) {
    setSelected((current) =>
      allChecked
        ? current.filter((n) => !names.includes(n))
        : Array.from(new Set([...current, ...names]))
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="text-primary size-5" />
            Edit permissions — {role?.name}
          </DialogTitle>
          <DialogDescription>
            Choose exactly which permissions this role should have.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {Object.entries(groups)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([group, names]) => {
                const allChecked = names.every((name) => selected.includes(name));
                return (
                  <div key={group} className="bg-muted/20 rounded-xl border p-3.5">
                    <div className="mb-2.5 flex items-center justify-between">
                      <p className="text-eyebrow text-muted-foreground">{group}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroup(names, allChecked)}
                      >
                        {allChecked ? "Clear all" : "Select all"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                      {names.map((name) => (
                        <PermissionRow
                          key={name}
                          id={`perm-${name}`}
                          checked={selected.includes(name)}
                          label={name}
                          onCheckedChange={() => toggle(name)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!role || updatePermissions.isPending}
            onClick={() => {
              if (!role) return;
              updatePermissions.mutate(
                { id: role.id, permissions: selected },
                { onSuccess: () => onOpenChange(false) }
              );
            }}
          >
            {updatePermissions.isPending ? "Saving…" : "Save permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewRoleDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: permissions, isLoading } = usePermissions();
  const createRole = useCreateRole();
  const [name, setName] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (open) {
      setName("");
      setSelected([]);
    }
  }, [open]);

  const groups = React.useMemo(
    () => groupByPrefix((permissions ?? []).map((permission) => permission.name)),
    [permissions]
  );

  function toggle(perm: string) {
    setSelected((current) =>
      current.includes(perm) ? current.filter((n) => n !== perm) : [...current, perm]
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New role</DialogTitle>
          <DialogDescription>Create a role and assign its initial permissions.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role name</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="content_editor"
            />
          </div>

          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
              {Object.entries(groups)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([group, names]) => (
                  <div key={group} className="bg-muted/20 rounded-xl border p-3.5">
                    <p className="text-eyebrow text-muted-foreground mb-2.5">{group}</p>
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                      {names.map((permName) => (
                        <PermissionRow
                          key={permName}
                          id={`new-role-perm-${permName}`}
                          checked={selected.includes(permName)}
                          label={permName}
                          onCheckedChange={() => toggle(permName)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!name.trim() || createRole.isPending}
            onClick={() => {
              createRole.mutate(
                { name: name.trim(), permissions: selected },
                { onSuccess: () => onOpenChange(false) }
              );
            }}
          >
            {createRole.isPending ? "Creating…" : "Create role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RolesContent() {
  const { data: roles, isLoading, isError, refetch } = useRoles();
  const [editingRole, setEditingRole] = React.useState<Role | undefined>(undefined);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = React.useState(false);
  const [newRoleOpen, setNewRoleOpen] = React.useState(false);

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        description="Manage staff roles and the permissions granted to each."
        actions={
          <Button onClick={() => setNewRoleOpen(true)}>
            <Plus className="size-4" />
            New role
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : !roles?.length ? (
        <EmptyState
          icon={ShieldCheck}
          title="No roles found"
          description="Create a role to start assigning permissions."
        />
      ) : (
        <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id} className="hover-lift-sm gap-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 capitalize">
                    <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                      <ShieldCheck className="size-4" />
                    </span>
                    {role.name.replace(/_/g, " ")}
                  </span>
                  <Badge variant="outline" className="shrink-0">
                    {role.permissions?.length ?? 0} perms
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
                  {role.permissions?.length ? (
                    role.permissions.slice(0, 8).map((permission) => (
                      <Badge key={permission.id} variant="secondary" className="font-mono text-xs">
                        {permission.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">No permissions assigned</span>
                  )}
                  {role.permissions && role.permissions.length > 8 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 8} more
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setEditingRole(role);
                    setPermissionsDialogOpen(true);
                  }}
                >
                  Edit permissions
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EditPermissionsDialog
        role={editingRole}
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
      />
      <NewRoleDialog open={newRoleOpen} onOpenChange={setNewRoleOpen} />
    </div>
  );
}
