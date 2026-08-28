import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type { ApiResource, PaginatedResponse } from "@/types/common";
import type {
  Damage,
  DamageInput,
  LowStockAlert,
  Purchase,
  PurchaseInput,
  Stock,
  StockAdjustment,
  StockAdjustmentInput,
  StockMovement,
  StockReturn,
  StockReturnInput,
  StockTransfer,
  StockTransferInput,
  Supplier,
  Warehouse,
} from "@/types/inventory";

export interface WarehouseInput {
  name: string;
  code: string;
  type: "main" | "branch" | "outlet";
  address?: string;
  phone?: string;
  is_default?: boolean;
  is_active?: boolean;
}

export const warehouseService = {
  async list(): Promise<Warehouse[]> {
    const { data } = await apiClient.get<ApiResource<Warehouse[]>>(
      API_ENDPOINTS.inventory.warehouses
    );
    return data.data;
  },

  async get(id: number): Promise<Warehouse> {
    const { data } = await apiClient.get<ApiResource<Warehouse>>(
      API_ENDPOINTS.inventory.warehouse(id)
    );
    return data.data;
  },

  async create(input: WarehouseInput): Promise<Warehouse> {
    const { data } = await apiClient.post<ApiResource<Warehouse>>(
      API_ENDPOINTS.inventory.warehouses,
      input
    );
    return data.data;
  },

  async update(id: number, input: Partial<WarehouseInput>): Promise<Warehouse> {
    const { data } = await apiClient.put<ApiResource<Warehouse>>(
      API_ENDPOINTS.inventory.warehouse(id),
      input
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.inventory.warehouse(id));
  },
};

export interface SupplierInput {
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  is_active?: boolean;
}

export const supplierService = {
  async list(page = 1, perPage = 15): Promise<PaginatedResponse<Supplier>> {
    const { data } = await apiClient.get<PaginatedResponse<Supplier>>(
      API_ENDPOINTS.inventory.suppliers,
      { params: { page, per_page: perPage } }
    );
    return data;
  },

  async get(id: number): Promise<Supplier> {
    const { data } = await apiClient.get<ApiResource<Supplier>>(
      API_ENDPOINTS.inventory.supplier(id)
    );
    return data.data;
  },

  async create(input: SupplierInput): Promise<Supplier> {
    const { data } = await apiClient.post<ApiResource<Supplier>>(
      API_ENDPOINTS.inventory.suppliers,
      input
    );
    return data.data;
  },

  async update(id: number, input: Partial<SupplierInput>): Promise<Supplier> {
    const { data } = await apiClient.put<ApiResource<Supplier>>(
      API_ENDPOINTS.inventory.supplier(id),
      input
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.inventory.supplier(id));
  },
};

export interface StockFilters {
  warehouse_id?: number;
  product_id?: number;
  page?: number;
  per_page?: number;
}

export const stockService = {
  async list(filters: StockFilters = {}): Promise<PaginatedResponse<Stock>> {
    const { data } = await apiClient.get<PaginatedResponse<Stock>>(
      API_ENDPOINTS.inventory.stock,
      { params: filters }
    );
    return data;
  },

  async lowStock(
    page = 1,
    perPage = 20
  ): Promise<PaginatedResponse<LowStockAlert>> {
    const { data } = await apiClient.get<PaginatedResponse<LowStockAlert>>(
      API_ENDPOINTS.inventory.lowStock,
      { params: { page, per_page: perPage } }
    );
    return data;
  },

  async movements(
    filters: { warehouse_id?: number; product_id?: number; type?: string; page?: number } = {}
  ): Promise<PaginatedResponse<StockMovement>> {
    const { data } = await apiClient.get<PaginatedResponse<StockMovement>>(
      API_ENDPOINTS.inventory.movements,
      { params: filters }
    );
    return data;
  },
};

export const purchaseService = {
  async list(page = 1, perPage = 15): Promise<PaginatedResponse<Purchase>> {
    const { data } = await apiClient.get<PaginatedResponse<Purchase>>(
      API_ENDPOINTS.inventory.purchases,
      { params: { page, per_page: perPage } }
    );
    return data;
  },

  async get(id: number): Promise<Purchase> {
    const { data } = await apiClient.get<ApiResource<Purchase>>(
      API_ENDPOINTS.inventory.purchase(id)
    );
    return data.data;
  },

  async create(input: PurchaseInput): Promise<Purchase> {
    const { data } = await apiClient.post<ApiResource<Purchase>>(
      API_ENDPOINTS.inventory.purchases,
      input
    );
    return data.data;
  },

  async receive(
    id: number,
    items: { item_id: number; received_quantity: number }[]
  ): Promise<Purchase> {
    const { data } = await apiClient.post<ApiResource<Purchase>>(
      API_ENDPOINTS.inventory.purchaseReceive(id),
      { items }
    );
    return data.data;
  },

  async cancel(id: number): Promise<Purchase> {
    const { data } = await apiClient.post<ApiResource<Purchase>>(
      API_ENDPOINTS.inventory.purchaseCancel(id)
    );
    return data.data;
  },
};

export const stockTransferService = {
  async list(page = 1, perPage = 15): Promise<PaginatedResponse<StockTransfer>> {
    const { data } = await apiClient.get<PaginatedResponse<StockTransfer>>(
      API_ENDPOINTS.inventory.stockTransfers,
      { params: { page, per_page: perPage } }
    );
    return data;
  },

  async get(id: number): Promise<StockTransfer> {
    const { data } = await apiClient.get<ApiResource<StockTransfer>>(
      API_ENDPOINTS.inventory.stockTransfer(id)
    );
    return data.data;
  },

  async create(input: StockTransferInput): Promise<StockTransfer> {
    const { data } = await apiClient.post<ApiResource<StockTransfer>>(
      API_ENDPOINTS.inventory.stockTransfers,
      input
    );
    return data.data;
  },

  async receive(
    id: number,
    items: { item_id: number; received_quantity: number }[]
  ): Promise<StockTransfer> {
    const { data } = await apiClient.post<ApiResource<StockTransfer>>(
      API_ENDPOINTS.inventory.stockTransferReceive(id),
      { items }
    );
    return data.data;
  },
};

export const stockAdjustmentService = {
  async list(
    page = 1,
    perPage = 15
  ): Promise<PaginatedResponse<StockAdjustment>> {
    const { data } = await apiClient.get<PaginatedResponse<StockAdjustment>>(
      API_ENDPOINTS.inventory.stockAdjustments,
      { params: { page, per_page: perPage } }
    );
    return data;
  },

  async get(id: number): Promise<StockAdjustment> {
    const { data } = await apiClient.get<ApiResource<StockAdjustment>>(
      API_ENDPOINTS.inventory.stockAdjustment(id)
    );
    return data.data;
  },

  async create(input: StockAdjustmentInput): Promise<StockAdjustment> {
    const { data } = await apiClient.post<ApiResource<StockAdjustment>>(
      API_ENDPOINTS.inventory.stockAdjustments,
      input
    );
    return data.data;
  },
};

export const stockReturnService = {
  async list(page = 1, perPage = 15): Promise<PaginatedResponse<StockReturn>> {
    const { data } = await apiClient.get<PaginatedResponse<StockReturn>>(
      API_ENDPOINTS.inventory.stockReturns,
      { params: { page, per_page: perPage } }
    );
    return data;
  },

  async get(id: number): Promise<StockReturn> {
    const { data } = await apiClient.get<ApiResource<StockReturn>>(
      API_ENDPOINTS.inventory.stockReturn(id)
    );
    return data.data;
  },

  async create(input: StockReturnInput): Promise<StockReturn> {
    const { data } = await apiClient.post<ApiResource<StockReturn>>(
      API_ENDPOINTS.inventory.stockReturns,
      input
    );
    return data.data;
  },
};

export const damageService = {
  async list(page = 1, perPage = 15): Promise<PaginatedResponse<Damage>> {
    const { data } = await apiClient.get<PaginatedResponse<Damage>>(
      API_ENDPOINTS.inventory.damages,
      { params: { page, per_page: perPage } }
    );
    return data;
  },

  async get(id: number): Promise<Damage> {
    const { data } = await apiClient.get<ApiResource<Damage>>(
      API_ENDPOINTS.inventory.damage(id)
    );
    return data.data;
  },

  async create(input: DamageInput): Promise<Damage> {
    const { data } = await apiClient.post<ApiResource<Damage>>(
      API_ENDPOINTS.inventory.damages,
      input
    );
    return data.data;
  },
};
