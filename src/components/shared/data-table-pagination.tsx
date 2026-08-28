"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/common";

interface DataTablePaginationProps {
  meta: PaginationMeta | undefined;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({ meta, onPageChange }: DataTablePaginationProps) {
  if (!meta) return null;

  const { current_page, last_page, total, from, to } = meta;

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-4 px-1 py-2 sm:flex-row">
      <p className="text-muted-foreground text-sm">
        {total > 0 ? (
          <>
            Showing <span className="text-foreground font-medium">{from}</span>–
            <span className="text-foreground font-medium">{to}</span> of{" "}
            <span className="text-foreground font-medium">{total}</span> results
          </>
        ) : (
          "No results"
        )}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={current_page <= 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={current_page <= 1}
          onClick={() => onPageChange(current_page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-muted-foreground px-2 text-sm">
          Page {current_page} of {Math.max(last_page, 1)}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={current_page >= last_page}
          onClick={() => onPageChange(current_page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={current_page >= last_page}
          onClick={() => onPageChange(last_page)}
          aria-label="Last page"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
