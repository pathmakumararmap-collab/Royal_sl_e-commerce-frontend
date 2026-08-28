export interface Permission {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  permissions?: Permission[];
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  status?: "active" | "inactive" | "banned";
  roles: string[];
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  status?: "active" | "inactive" | "banned";
  roles?: string[];
}
