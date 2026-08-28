export type UserStatus = "active" | "inactive" | "banned";

export type UserRole =
  | "admin"
  | "manager"
  | "warehouse_manager"
  | "pos_cashier"
  | "customer";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: UserStatus;
  roles?: string[];
  permissions?: string[];
  created_at?: string;
}

export type AddressType = "shipping" | "billing";

export interface Address {
  id: number;
  label: string | null;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  type: AddressType;
  is_default: boolean;
}

export interface AddressInput {
  label?: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country?: string;
  type: AddressType;
  is_default?: boolean;
}
