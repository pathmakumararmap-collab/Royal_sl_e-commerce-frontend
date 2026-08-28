import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type { Order, Invoice } from "@/types/order";
import type { Product } from "@/types/catalog";
import type { ApiResource } from "@/types/common";

export interface PosCheckoutInput {
  warehouse_id: number;
  items: { product_id: number; product_variant_id?: number | null; quantity: number }[];
  payment_method_id: number;
  coupon_code?: string;
  customer_name?: string;
  customer_phone?: string;
  user_id?: number;
  amount_tendered?: number;
  transaction_id?: string;
}

export interface PosCheckoutResult {
  data: Order;
  invoice: Invoice;
  change_due: number;
}

export const posService = {
  async checkout(input: PosCheckoutInput): Promise<PosCheckoutResult> {
    const { data } = await apiClient.post<PosCheckoutResult>(
      API_ENDPOINTS.pos.checkout,
      input
    );
    return data;
  },

  async lookupByBarcode(barcode: string): Promise<Product> {
    const { data } = await apiClient.get<ApiResource<Product>>(
      API_ENDPOINTS.pos.lookup(barcode)
    );
    return data.data;
  },
};
