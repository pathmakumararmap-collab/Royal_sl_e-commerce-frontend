export type WarehouseType = "main" | "branch" | "outlet";

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  type: WarehouseType;
  address: string | null;
  phone: string | null;
  is_default: boolean;
  is_active: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  is_active: boolean;
}

export interface Stock {
  id: number;
  product?: import("./catalog").Product;
  variant?: import("./catalog").ProductVariant;
  warehouse?: Warehouse;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
}

export type StockMovementType =
  | "purchase"
  | "sale"
  | "return"
  | "damage"
  | "adjustment"
  | "transfer_in"
  | "transfer_out"
  | "initial";

export interface StockMovement {
  id: number;
  product?: import("./catalog").Product;
  warehouse?: Warehouse;
  type: StockMovementType;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reference_type: string | null;
  reference_id: number | null;
  note: string | null;
  created_at: string;
}

export interface LowStockAlert {
  id: number;
  product?: import("./catalog").Product;
  warehouse?: Warehouse;
  threshold: number;
  current_quantity: number;
  status: "active" | "resolved";
  notified_at: string | null;
}

export interface PurchaseItem {
  id: number;
  product?: import("./catalog").Product;
  variant?: import("./catalog").ProductVariant;
  quantity: number;
  received_quantity: number;
  unit_cost: number;
  subtotal: number;
}

export type PurchaseStatus = "pending" | "ordered" | "received" | "cancelled";

export interface Purchase {
  id: number;
  purchase_no: string;
  supplier?: Supplier;
  warehouse?: Warehouse;
  status: PurchaseStatus;
  order_date: string;
  expected_date: string | null;
  received_date: string | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes: string | null;
  items?: PurchaseItem[];
  created_at: string;
}

export interface PurchaseInput {
  supplier_id: number;
  warehouse_id: number;
  order_date: string;
  expected_date?: string;
  tax_amount?: number;
  discount_amount?: number;
  notes?: string;
  items: {
    product_id: number;
    product_variant_id?: number | null;
    quantity: number;
    unit_cost: number;
  }[];
}

export interface StockTransferItem {
  id: number;
  product?: import("./catalog").Product;
  variant?: import("./catalog").ProductVariant;
  quantity: number;
  received_quantity: number;
}

export type StockTransferStatus =
  | "pending"
  | "in_transit"
  | "completed"
  | "cancelled";

export interface StockTransfer {
  id: number;
  transfer_no: string;
  from_warehouse?: Warehouse;
  to_warehouse?: Warehouse;
  status: StockTransferStatus;
  transfer_date: string;
  received_date: string | null;
  notes: string | null;
  items?: StockTransferItem[];
  created_at: string;
}

export interface StockTransferInput {
  from_warehouse_id: number;
  to_warehouse_id: number;
  transfer_date: string;
  notes?: string;
  items: {
    product_id: number;
    product_variant_id?: number | null;
    quantity: number;
  }[];
}

export interface StockAdjustmentItem {
  id: number;
  product?: import("./catalog").Product;
  variant?: import("./catalog").ProductVariant;
  quantity_change: number;
  before_quantity: number;
  after_quantity: number;
}

export interface StockAdjustment {
  id: number;
  adjustment_no: string;
  warehouse?: Warehouse;
  reason: "count" | "expired" | "other";
  status: "pending" | "approved";
  notes: string | null;
  items?: StockAdjustmentItem[];
  created_at: string;
}

export interface StockAdjustmentInput {
  warehouse_id: number;
  reason: "count" | "expired" | "other";
  notes?: string;
  items: {
    product_id: number;
    product_variant_id?: number | null;
    new_quantity: number;
  }[];
}

export interface StockReturnItem {
  id: number;
  product?: import("./catalog").Product;
  variant?: import("./catalog").ProductVariant;
  quantity: number;
  condition: "good" | "damaged";
}

export interface StockReturn {
  id: number;
  return_no: string;
  order_id: number | null;
  warehouse?: Warehouse;
  type: "customer_return" | "supplier_return";
  status: "pending" | "approved" | "rejected";
  reason: string | null;
  notes: string | null;
  items?: StockReturnItem[];
  created_at: string;
}

export interface StockReturnInput {
  order_id?: number | null;
  warehouse_id: number;
  type: "customer_return" | "supplier_return";
  reason?: string;
  notes?: string;
  items: {
    product_id: number;
    product_variant_id?: number | null;
    quantity: number;
    condition: "good" | "damaged";
  }[];
}

export interface DamageItem {
  id: number;
  product?: import("./catalog").Product;
  variant?: import("./catalog").ProductVariant;
  quantity: number;
  estimated_loss: number;
}

export interface Damage {
  id: number;
  damage_no: string;
  warehouse?: Warehouse;
  reason: string | null;
  status: "pending" | "approved";
  notes: string | null;
  items?: DamageItem[];
  created_at: string;
}

export interface DamageInput {
  warehouse_id: number;
  reason?: string;
  notes?: string;
  items: {
    product_id: number;
    product_variant_id?: number | null;
    quantity: number;
    estimated_loss?: number;
  }[];
}
