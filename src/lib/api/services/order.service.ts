import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type { ApiResource, PaginatedResponse } from "@/types/common";
import type {
  FacebookOrderInput,
  Order,
  OrderFilters,
  PlaceOrderInput,
} from "@/types/order";
import type { RecordPaymentInput, PaymentMethod } from "@/types/payment";
import type { Payment, Invoice } from "@/types/order";

export const customerOrderService = {
  async list(page = 1, perPage = 15): Promise<PaginatedResponse<Order>> {
    const { data } = await apiClient.get<PaginatedResponse<Order>>(
      API_ENDPOINTS.customer.orders,
      { params: { page, per_page: perPage } }
    );
    return data;
  },

  async get(id: number): Promise<Order> {
    const { data } = await apiClient.get<ApiResource<Order>>(
      API_ENDPOINTS.customer.order(id)
    );
    return data.data;
  },

  async checkout(input: PlaceOrderInput): Promise<Order> {
    const { data } = await apiClient.post<ApiResource<Order>>(
      API_ENDPOINTS.customer.checkout,
      input
    );
    return data.data;
  },

  async cancel(id: number, reason: string): Promise<Order> {
    const { data } = await apiClient.post<ApiResource<Order>>(
      API_ENDPOINTS.customer.cancelOrder(id),
      { reason }
    );
    return data.data;
  },
};

export const adminOrderService = {
  async list(filters: OrderFilters = {}): Promise<PaginatedResponse<Order>> {
    const { data } = await apiClient.get<PaginatedResponse<Order>>(
      API_ENDPOINTS.admin.orders,
      { params: filters }
    );
    return data;
  },

  async get(id: number): Promise<Order> {
    const { data } = await apiClient.get<ApiResource<Order>>(
      API_ENDPOINTS.admin.order(id)
    );
    return data.data;
  },

  async createFacebookOrder(input: FacebookOrderInput): Promise<Order> {
    const { data } = await apiClient.post<ApiResource<Order>>(
      API_ENDPOINTS.admin.orderFacebook,
      input
    );
    return data.data;
  },

  async updateStatus(id: number, status: string, note?: string): Promise<Order> {
    const { data } = await apiClient.put<ApiResource<Order>>(
      API_ENDPOINTS.admin.orderStatus(id),
      { status, note }
    );
    return data.data;
  },

  async cancel(id: number, reason: string): Promise<Order> {
    const { data } = await apiClient.post<ApiResource<Order>>(
      API_ENDPOINTS.admin.orderCancel(id),
      { reason }
    );
    return data.data;
  },

  async recordPayment(id: number, input: RecordPaymentInput): Promise<Payment> {
    const { data } = await apiClient.post<ApiResource<Payment>>(
      API_ENDPOINTS.admin.orderPayments(id),
      input
    );
    return data.data;
  },

  async generateInvoice(id: number): Promise<Invoice> {
    const { data } = await apiClient.post<ApiResource<Invoice>>(
      API_ENDPOINTS.admin.orderInvoice(id)
    );
    return data.data;
  },
};

export const paymentMethodService = {
  async list(): Promise<PaymentMethod[]> {
    const { data } = await apiClient.get<ApiResource<PaymentMethod[]>>(
      API_ENDPOINTS.admin.paymentMethods
    );
    return data.data;
  },

  async create(input: {
    name: string;
    code: string;
    is_active?: boolean;
  }): Promise<PaymentMethod> {
    const { data } = await apiClient.post<ApiResource<PaymentMethod>>(
      API_ENDPOINTS.admin.paymentMethods,
      input
    );
    return data.data;
  },

  async update(
    id: number,
    input: Partial<{ name: string; is_active: boolean }>
  ): Promise<PaymentMethod> {
    const { data } = await apiClient.put<ApiResource<PaymentMethod>>(
      API_ENDPOINTS.admin.paymentMethod(id),
      input
    );
    return data.data;
  },
};

export const invoiceService = {
  downloadUrl(id: number): string {
    return `${apiClient.defaults.baseURL}${API_ENDPOINTS.invoices.download(id)}`;
  },

  async download(id: number): Promise<Blob> {
    const { data } = await apiClient.get(API_ENDPOINTS.invoices.download(id), {
      responseType: "blob",
    });
    return data;
  },
};
