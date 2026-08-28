export type PaymentMethodCode =
  | "cash"
  | "card"
  | "bank_transfer"
  | "cod"
  | "online_gateway";

export interface PaymentMethod {
  id: number;
  name: string;
  code: PaymentMethodCode;
  is_active: boolean;
  config: Record<string, unknown> | null;
}

export interface RecordPaymentInput {
  payment_method_id: number;
  amount: number;
  transaction_id?: string;
}
