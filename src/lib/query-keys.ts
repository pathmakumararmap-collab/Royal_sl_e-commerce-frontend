import type { OrderFilters } from "@/types/order";
import type { ProductFilters } from "@/types/catalog";
import type { StockFilters } from "@/lib/api/services/inventory.service";
import type { ActivityLogFilters } from "@/lib/api/services/activity-log.service";
import type { ReportFilters, MovementReportFilters } from "@/lib/api/services/report.service";
import type { AdminReviewFilters } from "@/lib/api/services/admin-review.service";

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  products: {
    all: ["products"] as const,
    list: (filters: ProductFilters) => ["products", "list", filters] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
  },
  reviews: {
    list: (productId: number, page: number) => ["reviews", productId, page] as const,
    mine: (productId: number) => ["reviews", productId, "mine"] as const,
  },
  adminReviews: {
    all: ["admin-reviews"] as const,
    list: (filters: AdminReviewFilters) => ["admin-reviews", "list", filters] as const,
  },
  adminProducts: {
    all: ["admin-products"] as const,
    list: (filters: ProductFilters) => ["admin-products", "list", filters] as const,
    detail: (id: number) => ["admin-products", "detail", id] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  adminCategories: {
    all: ["admin-categories"] as const,
  },
  catalogBrands: {
    all: ["catalog-brands"] as const,
  },
  brands: {
    all: ["admin-brands"] as const,
  },
  cart: {
    detail: ["cart"] as const,
  },
  addresses: {
    all: ["addresses"] as const,
  },
  customerOrders: {
    all: ["customer-orders"] as const,
    list: (page: number) => ["customer-orders", "list", page] as const,
    detail: (id: number) => ["customer-orders", "detail", id] as const,
  },
  adminOrders: {
    all: ["admin-orders"] as const,
    list: (filters: OrderFilters) => ["admin-orders", "list", filters] as const,
    detail: (id: number) => ["admin-orders", "detail", id] as const,
  },
  coupons: {
    all: ["coupons"] as const,
    list: (page: number) => ["coupons", "list", page] as const,
    detail: (id: number) => ["coupons", "detail", id] as const,
  },
  paymentMethods: {
    all: ["payment-methods"] as const,
  },
  warehouses: {
    all: ["warehouses"] as const,
  },
  suppliers: {
    all: ["suppliers"] as const,
    list: (page: number) => ["suppliers", "list", page] as const,
  },
  stock: {
    all: ["stock"] as const,
    list: (filters: StockFilters) => ["stock", "list", filters] as const,
    lowStock: (page: number) => ["stock", "low-stock", page] as const,
    movements: (filters: Record<string, unknown>) =>
      ["stock", "movements", filters] as const,
  },
  purchases: {
    all: ["purchases"] as const,
    list: (page: number) => ["purchases", "list", page] as const,
    detail: (id: number) => ["purchases", "detail", id] as const,
  },
  stockTransfers: {
    all: ["stock-transfers"] as const,
    list: (page: number) => ["stock-transfers", "list", page] as const,
    detail: (id: number) => ["stock-transfers", "detail", id] as const,
  },
  stockAdjustments: {
    all: ["stock-adjustments"] as const,
    list: (page: number) => ["stock-adjustments", "list", page] as const,
  },
  stockReturns: {
    all: ["stock-returns"] as const,
    list: (page: number) => ["stock-returns", "list", page] as const,
  },
  damages: {
    all: ["damages"] as const,
    list: (page: number) => ["damages", "list", page] as const,
  },
  reports: {
    sales: (filters: ReportFilters) => ["reports", "sales", filters] as const,
    orders: (filters: ReportFilters) => ["reports", "orders", filters] as const,
    products: (filters: ReportFilters) => ["reports", "products", filters] as const,
    stock: (filters: ReportFilters) => ["reports", "stock", filters] as const,
    movement: (filters: MovementReportFilters) => ["reports", "movement", filters] as const,
    movementThresholds: ["reports", "movement", "thresholds"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (page: number) => ["users", "list", page] as const,
  },
  roles: {
    all: ["roles"] as const,
    permissions: ["permissions"] as const,
  },
  activityLogs: {
    list: (filters: ActivityLogFilters) => ["activity-logs", filters] as const,
  },
};
