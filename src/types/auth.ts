import type { User } from "./user";

export interface LoginInput {
  email: string;
  password: string;
  device_name?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
