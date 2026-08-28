"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  reportService,
  type MovementReportFilters,
  type MovementReportThresholds,
  type ReportFilters,
} from "@/lib/api/services/report.service";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

export function useSalesReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: queryKeys.reports.sales(filters),
    queryFn: () => reportService.sales(filters),
  });
}

export function useOrderReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: queryKeys.reports.orders(filters),
    queryFn: () => reportService.orders(filters),
  });
}

export function useProductReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: queryKeys.reports.products(filters),
    queryFn: () => reportService.products(filters),
  });
}

export function useStockReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: queryKeys.reports.stock(filters),
    queryFn: () => reportService.stock(filters),
  });
}

export function useMovementReport(filters: MovementReportFilters = {}) {
  return useQuery({
    queryKey: queryKeys.reports.movement(filters),
    queryFn: () => reportService.movement(filters),
  });
}

export function useMovementReportThresholds() {
  return useQuery({
    queryKey: queryKeys.reports.movementThresholds,
    queryFn: () => reportService.movementThresholds(),
  });
}

export function useUpdateMovementReportThresholds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MovementReportThresholds) => reportService.updateMovementThresholds(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.movementThresholds });
      queryClient.invalidateQueries({ queryKey: ["reports", "movement"] });
      toast.success("Thresholds updated.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

const EXPORT_EXTENSIONS: Record<"excel" | "pdf" | "word", string> = {
  excel: "xlsx",
  pdf: "pdf",
  word: "docx",
};

export function useExportMovementReport() {
  return useMutation({
    mutationFn: async ({
      filters,
      format,
    }: {
      filters: MovementReportFilters;
      format: "excel" | "pdf" | "word";
    }) => {
      const blob = await reportService.exportMovement(filters, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `movement-report-${Date.now()}.${EXPORT_EXTENSIONS[format]}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
    onError: (error: ApiError) => toast.error(error.message || "Export failed."),
  });
}
