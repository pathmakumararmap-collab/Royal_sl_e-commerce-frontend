import type { Warehouse } from "./inventory";
import type { Address, User } from "./user";

export type OrderSource = "website" | "facebook" | "pos";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "returned";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";

export interface OrderItem {
  id: number;
  product_id: number;
  product_variant_id: number | null;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
  subtotal: number;
}

export interface OrderStatusHistory {
  id: number;
  status: string;
  note: string | null;
  changed_by: number | null;
  created_at: string;
}

export interface Payment {
  id: number;
  payment_no: string;
  payment_method?: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  transaction_id: string | null;
  paid_at: string | null;
  meta?: { amount_tendered?: number; change_due?: number } | null;
}

export interface Invoice {
  id: number;
  invoice_no: string;
  issued_at: string;
  total_amount: number;
  status: "issued" | "paid" | "void";
  download_url: string;
}

export interface Order {
  id: number;
  order_no: string;
  source: OrderSource;
  channel_reference: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  paid_amount: number;
  currency: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  notes: string | null;
  cancelled_reason: string | null;
  warehouse?: Warehouse;
  user?: User;
  shipping_address?: Address;
  billing_address?: Address;
  items?: OrderItem[];
  payments?: Payment[];
  status_histories?: OrderStatusHistory[];
  invoice?: Invoice;
  created_at: string;
  updated_at: string;
}

export interface OrderFilters {
  source?: OrderSource;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  warehouse_id?: number;
  user_id?: number;
  date_from?: string;
  date_to?: string;
  keyword?: string;
  per_page?: number;
  page?: number;
}

export interface PlaceOrderInput {
  items: { product_id: number; product_variant_id?: number | null; quantity: number }[];
  coupon_code?: string;
  shipping_address_id?: number;
  billing_address_id?: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  shipping_amount?: number;
  notes?: string;
}

export interface FacebookOrderInput {
  channel_reference: string;
  warehouse_id: number;
  items: { product_id: number; product_variant_id?: number | null; quantity: number }[];
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_amount?: number;
  notes?: string;
}