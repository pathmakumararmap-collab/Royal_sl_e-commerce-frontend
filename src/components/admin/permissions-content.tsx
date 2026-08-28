"use client";

import * as React from "react";
import { KeyRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { usePermissions } from "@/hooks/use-users";

function groupByPrefix(names: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const name of names) {
    const prefix = name.includes(".") ? name.split(".")[0] : "other";
    groups[prefix] ??= [];
    groups[prefix].push(name);
  }
  return groups;
}

export function PermissionsContent() {
  const { data: permissions, isLoading, isError, refetch } = usePermissions();
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!permissions) return [];
    if (!search.trim()) return permissions;
    const query = search.trim().toLowerCase();
    return permissions.filter((permission) => permission.name.toLowerCase().includes(query));
  }, [permissions, search]);

  const groups = React.useMemo(
    () => groupByPrefix(filtered.map((permission) => permission.name)),
    [filtered]
  );

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions"
        description="Reference list of every permission recognized by the system. Assign permissions to roles from the Roles page."
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search permissions…"
        className="max-w-sm"
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : !filtered.length ? (
        <EmptyState
          icon={KeyRound}
          title="No permissions found"
          description={search ? "Try a different search term." : "No permissions are defined yet."}
        />
      ) : (
        <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(groups)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([group, names]) => (
              <Card key={group} className="hover-lift-sm gap-4">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 capitalize">
                      <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                        <KeyRound className="size-4" />
                      </span>
                      {group}
                    </span>
                    <Badge variant="outline" className="shrink-0">
                      {names.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1.5">
                  {names.map((name) => (
                    <Badge key={name} variant="secondary" className="font-mono text-xs">
                      {name}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
