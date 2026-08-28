import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type {
  OrderReport,
  ProductReport,
  SalesReport,
  StockReport,
} from "@/types/report";

export interface ReportFilters {
  from?: string;
  to?: string;
  source?: string;
  warehouse_id?: number;
  limit?: number;
}

export interface MovementReportFilters {
  from?: string;
  to?: string;
  warehouse_id?: number;
  warehouse_type?: "main" | "branch" | "outlet";
  category_id?: number;
  brand_id?: number;
  group_by?: "category" | "subcategory" | "brand";
  bucket?: "fast" | "slow" | "non_moving";
}

export interface MovementReportProductRow {
  product_id: number;
  product_name: string;
  sku: string;
  category_id: number | null;
  category_name: string | null;
  top_category_id: number | null;
  top_category_name: string | null;
  brand_id: number | null;
  brand_name: string | null;
  qty_sold: number;
  revenue: number;
  bucket: "fast" | "slow" | "non_moving" | null;
}

export interface MovementReportGroupRow {
  group_id: number | null;
  group_name: string;
  products_count: number;
  qty_sold: number;
  revenue: number;
  fast_count: number;
  slow_count: number;
  non_moving_count: number;
}

export interface MovementReport {
  range: { from: string; to: string };
  thresholds: MovementReportThresholds;
  group_by: "category" | "subcategory" | "brand" | null;
  rows: MovementReportProductRow[] | MovementReportGroupRow[];
}

export interface MovementReportThresholds {
  mode: "percentile" | "fixed";
  fast_percentile: number;
  slow_percentile: number;
  fast_qty_threshold: number;
  slow_qty_threshold: number;
}

export const reportService = {
  async sales(filters: ReportFilters = {}): Promise<SalesReport> {
    const { data } = await apiClient.get<{ data: SalesReport }>(
      API_ENDPOINTS.reports.sales,
      { params: filters }
    );
    return data.data;
  },

  async orders(filters: ReportFilters = {}): Promise<OrderReport> {
    const { data } = await apiClient.get<{ data: OrderReport }>(
      API_ENDPOINTS.reports.orders,
      { params: filters }
    );
    return data.data;
  },

  async products(filters: ReportFilters = {}): Promise<ProductReport> {
    const { data } = await apiClient.get<{ data: ProductReport }>(
      API_ENDPOINTS.reports.products,
      { params: filters }
    );
    return data.data;
  },

  async stock(filters: ReportFilters = {}): Promise<StockReport> {
    const { data } = await apiClient.get<{ data: StockReport }>(
      API_ENDPOINTS.reports.stock,
      { params: filters }
    );
    return data.data;
  },

  async movement(filters: MovementReportFilters = {}): Promise<MovementReport> {
    const { data } = await apiClient.get<{ data: MovementReport }>(
      API_ENDPOINTS.reports.movement,
      { params: filters }
    );
    return data.data;
  },

  async movementThresholds(): Promise<MovementReportThresholds> {
    const { data } = await apiClient.get<{ data: MovementReportThresholds }>(
      API_ENDPOINTS.reports.movementThresholds
    );
    return data.data;
  },

  async updateMovementThresholds(
    input: MovementReportThresholds
  ): Promise<MovementReportThresholds> {
    const { data } = await apiClient.put<{ data: MovementReportThresholds }>(
      API_ENDPOINTS.reports.movementThresholds,
      input
    );
    return data.data;
  },

  async exportMovement(
    filters: MovementReportFilters,
    format: "excel" | "pdf" | "word"
  ): Promise<Blob> {
    const { data } = await apiClient.get<Blob>(API_ENDPOINTS.reports.movementExport, {
      params: { ...filters, format },
      responseType: "blob",
    });
    return data;
  },
};
