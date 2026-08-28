export interface SalesReportSummary {
  total_orders: number;
  total_subtotal: string;
  total_discount: string;
  total_tax: string;
  total_shipping: string;
  total_sales: string;
  total_collected: string;
  average_order_value: string;
}

export interface SalesBySource {
  source: string;
  orders_count: number;
  total_sales: string;
}

export interface SalesByDay {
  date: string;
  orders_count: number;
  total_sales: string;
}

export interface SalesReport {
  range: { from: string; to: string };
  summary: SalesReportSummary;
  by_source: SalesBySource[];
  by_day: SalesByDay[];
}

export interface OrderReport {
  range: { from: string; to: string };
  by_status: { status: string; total: number }[];
  by_payment_status: { payment_status: string; total: number }[];
}

export interface TopSellingProduct {
  product_id: number;
  product_name: string;
  units_sold: number;
  revenue: string;
}

export interface ProductReport {
  range: { from: string; to: string };
  top_selling: TopSellingProduct[];
  total_stock_cost_value: string | number;
}

export interface StockReport {
  total_units: number;
  low_stock_count: number;
  low_stock_items: import("./inventory").Stock[];
  recent_movements: import("./inventory").StockMovement[];
}
