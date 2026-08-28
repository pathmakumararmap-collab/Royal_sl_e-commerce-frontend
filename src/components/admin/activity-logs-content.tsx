"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDateTime } from "@/lib/format";
import type { ActivityLog } from "@/types/activity-log";

function subjectLabel(subjectType: string | null): string {
  if (!subjectType) return "—";
  return subjectType.split("\\").pop() ?? subjectType;
}

export function ActivityLogsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const urlSubjectType = searchParams.get("subject_type") ?? "";

  const [subjectTypeInput, setSubjectTypeInput] = React.useState(urlSubjectType);
  const debouncedSubjectType = useDebounce(subjectTypeInput, 400);

  const { data, isLoading, isError, refetch } = useActivityLogs({
    page,
    subject_type: debouncedSubjectType || undefined,
  });

  const [detail, setDetail] = React.useState<ActivityLog | undefined>(undefined);

  function goToPage(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.push(`/admin/activity-logs?${params.toString()}`);
  }

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSubjectType) {
      params.set("subject_type", debouncedSubjectType);
    } else {
      params.delete("subject_type");
    }
    params.set("page", "1");
    router.replace(`/admin/activity-logs?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSubjectType]);

  const columns: ColumnDef<ActivityLog>[] = [
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <span className="font-medium">{row.original.description}</span>,
    },
    {
      id: "causer",
      header: "By",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.causer?.name ?? "System"}</span>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <span className="bg-muted inline-flex items-center rounded-md px-2 py-1 font-mono text-xs">
          {subjectLabel(row.original.subject_type)}
          {row.original.subject_id ? `#${row.original.subject_id}` : ""}
        </span>
      ),
    },
    {
      id: "event",
      header: "Event",
      cell: ({ row }) =>
        row.original.event ? (
          <Badge variant="outline" className="font-mono text-xs uppercase">
            {row.original.event}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      id: "created_at",
      header: "When",
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums text-sm">
          {formatDateTime(row.original.created_at)}
        </span>
      ),
    },
  ];

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity logs"
        description="An audit trail of actions taken across the system. Click a row to inspect its raw properties."
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        meta={data?.meta}
        onPageChange={goToPage}
        isLoading={isLoading}
        onRowClick={(row) => setDetail(row)}
        emptyTitle="No activity yet"
        emptyDescription="Actions taken by staff and the system will appear here."
        toolbar={
          <div className="relative max-w-xs">
            <Filter className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={subjectTypeInput}
              onChange={(event) => setSubjectTypeInput(event.target.value)}
              placeholder="Filter by subject type (e.g. Order, Product)"
              className="pl-8"
            />
          </div>
        }
      />

      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(undefined)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{detail?.description}</DialogTitle>
            <DialogDescription className="flex items-center gap-1.5">
              <span>{detail?.causer?.name ?? "System"}</span>
              <span aria-hidden>·</span>
              <span className="tabular-nums">{formatDateTime(detail?.created_at)}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-eyebrow text-muted-foreground">Properties</p>
            <pre className="bg-muted/60 max-h-[50vh] overflow-auto rounded-lg border p-4 font-mono text-xs leading-relaxed">
              {JSON.stringify(detail?.properties ?? {}, null, 2)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
