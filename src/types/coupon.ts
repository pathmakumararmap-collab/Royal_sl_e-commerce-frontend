export type CouponType = "fixed" | "percentage";
export type CouponApplicableTo = "all" | "category" | "product";

export interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  is_valid: boolean;
  applicable_to: CouponApplicableTo;
}

export interface CouponInput {
  code: string;
  type: CouponType;
  value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_limit_per_user?: number;
  starts_at?: string;
  expires_at?: string;
  is_active?: boolean;
  applicable_to: CouponApplicableTo;
  product_ids?: number[];
  category_ids?: number[];
}
