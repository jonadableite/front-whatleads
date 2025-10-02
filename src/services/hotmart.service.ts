// src/services/hotmart.service.ts
import axios from "axios";
import { authService } from "./auth.service";

// Interfaces para os tipos de dados Hotmart
export interface HotmartCustomer {
  id: string;
  subscriberCode: string;
  transaction: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerDocument?: string;
  customerCountry?: string;
  customerCity?: string;
  customerState?: string;
  customerZipCode?: string;
  customerAddress?: string;
  customerNumber?: string;
  customerComplement?: string;
  customerNeighborhood?: string;
  paymentType?: string;
  paymentMethod?: string;
  paymentStatus: string;
  subscriptionStatus: string;
  subscriptionValue: number;
  subscriptionCurrency: string;
  subscriptionFrequency?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  nextChargeDate?: string;
  cancelationDate?: string;
  cancelationReason?: string;
  affiliateCode?: string;
  affiliateName?: string;
  producerCode?: string;
  producerName?: string;
  isActive: boolean;
  isTrial: boolean;
  trialEndDate?: string;
  whatleadUserId?: string;
  hotmartUserId?: string;
  hotmartUserEmail?: string;
  hotmartUserName?: string;
  hotmartUserPhone?: string;
  hotmartUserDocument?: string;
  hotmartUserCountry?: string;
  hotmartUserCity?: string;
  hotmartUserState?: string;
  hotmartUserZipCode?: string;
  hotmartUserAddress?: string;
  hotmartUserNumber?: string;
  hotmartUserComplement?: string;
  hotmartUserNeighborhood?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  whatleadUser?: {
    id: string;
    name: string;
    email: string;
    active: boolean;
  };
  hotmartEvents?: HotmartEvent[];
  hotmartTransactions?: HotmartTransaction[];
}

export interface HotmartEvent {
  id: string;
  eventType: string;
  eventData: Record<string, unknown>;
  eventDate: string;
  transaction?: string;
  subscriberCode?: string;
  productId?: string;
  status: string;
  retryCount: number;
  errorMessage?: string;
  processedAt?: string;
  createdAt: string;
  customerId?: string;
}

export interface HotmartTransaction {
  id: string;
  transactionId: string;
  subscriberCode?: string;
  productId?: string;
  transactionType: string;
  transactionStatus: string;
  transactionValue: number;
  transactionCurrency: string;
  paymentType?: string;
  paymentMethod?: string;
  paymentStatus: string;
  paymentDate?: string;
  dueDate?: string;
  refundDate?: string;
  refundValue?: number;
  refundReason?: string;
  chargebackDate?: string;
  chargebackValue?: number;
  chargebackReason?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  affiliateCode?: string;
  affiliateName?: string;
  commissionValue?: number;
  commissionPercentage?: number;
  producerCode?: string;
  producerName?: string;
  producerValue?: number;
  producerPercentage?: number;
  platformValue?: number;
  platformPercentage?: number;
  createdAt: string;
  customerId?: string;
}

export interface HotmartSubscription {
  subscriberCode: string;
  status: string;
  productId: string;
  productName: string;
  subscriber: {
    name: string;
    email: string;
    document?: string;
    phone?: string;
    userId?: string;
    address?: {
      country?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      address?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
    };
  };
  payment: {
    type?: string;
    method?: string;
    status: string;
    value: number;
    currency: string;
  };
  subscription: {
    status: string;
    frequency?: string;
    startDate?: string;
    endDate?: string;
    nextChargeDate?: string;
    cancelationDate?: string;
    cancelationReason?: string;
  };
  affiliate?: {
    code?: string;
    name?: string;
    commissionValue?: number;
    commissionPercentage?: number;
  };
  producer?: {
    code?: string;
    name?: string;
    value?: number;
    percentage?: number;
  };
  platform?: {
    value?: number;
    percentage?: number;
  };
}

export interface HotmartStats {
  totalCustomers: number;
  activeCustomers: number;
  cancelledCustomers: number;
  delayedCustomers: number;
  trialCustomers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  churnRate: number;
}

export interface HotmartFilters {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  productId?: string;
  isActive?: boolean;
  search?: string;
}

export interface HotmartCustomersResponse {
  customers: HotmartCustomer[];
  total: number;
  page: number;
  totalPages: number;
}

export interface HotmartEventResponse {
  events: HotmartEvent[];
  total: number;
  page: number;
  totalPages: number;
}

export interface HotmartTransactionResponse {
  transactions: HotmartTransaction[];
  total: number;
  page: number;
  totalPages: number;
}

export interface HotmartSubscriptionResponse {
  subscriptions: HotmartSubscription[];
  total: number;
  page: number;
  totalPages: number;
}

export interface HotmartSyncResponse {
  syncedCount: number;
  message: string;
}

export interface HotmartNoteResponse {
  customer: HotmartCustomer;
  message: string;
}

export interface HotmartTagsResponse {
  customer: HotmartCustomer;
  message: string;
}

export interface HotmartExportResponse {
  data: string;
  filename: string;
}

export interface HotmartAnalyticsResponse {
  totalRevenue: number;
  totalTransactions: number;
  averageTicket: number;
  conversionRate: number;
  churnRate: number;
  monthlyRecurringRevenue: number;
  customerLifetimeValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    revenue: number;
    transactions: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  customersByStatus: Array<{
    status: string;
    count: number;
  }>;
}

// Interfaces para os novos endpoints de vendas
export interface HotmartSalesHistoryParams {
  start_date: string;
  end_date: string;
  product_id?: string;
  buyer_email?: string;
  transaction_status?: string;
  max_results?: number;
  page_token?: string;
}

export interface HotmartSalesHistoryResponse {
  items: Array<{
    transaction: string;
    product: {
      id: number;
      name: string;
      ucode: string;
    };
    buyer: {
      name: string;
      email: string;
      document?: string;
      phone?: string;
    };
    purchase: {
      order_date: number;
      approved_date?: number;
      status: string;
      price: {
        value: number;
        currency_value: string;
      };
      payment: {
        method: string;
        type: string;
        installments_number?: number;
      };
    };
    subscription?: {
      subscriber: {
        code: string;
      };
      plan: {
        name: string;
        id: number;
      };
      status: string;
      date_next_charge?: number;
    };
    commissions?: Array<{
      source: string;
      value: number;
      currency_value: string;
    }>;
  }>;
  page_info: {
    next_page_token?: string;
    total_results: number;
  };
}

export interface HotmartSalesSummaryParams {
  start_date: string;
  end_date: string;
  product_id?: string;
  currency_code?: string;
}

export interface HotmartSalesSummaryResponse {
  items: Array<{
    currency_code: string;
    total_value: number;
    total_commissions: number;
    total_transactions: number;
  }>;
}

export interface HotmartSalesUsersParams {
  start_date: string;
  end_date: string;
  product_id?: string;
  buyer_email?: string;
  max_results?: number;
  page_token?: string;
}

export interface HotmartSalesUsersResponse {
  items: Array<{
    user_id: string;
    name: string;
    email: string;
    document?: string;
    phone?: string;
    address?: {
      country?: string;
      state?: string;
      city?: string;
      zip_code?: string;
      address?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
    };
    role: string; // BUYER, PRODUCER, AFFILIATE, CO_PRODUCER
    transactions: Array<{
      transaction: string;
      product_id: number;
      value: number;
      currency_code: string;
      date: number;
    }>;
  }>;
  page_info: {
    next_page_token?: string;
    total_results: number;
  };
}

export interface HotmartSalesCommissionsParams {
  start_date: string;
  end_date: string;
  product_id?: string;
  max_results?: number;
  page_token?: string;
}

export interface HotmartSalesCommissionsResponse {
  items: Array<{
    transaction: string;
    product: {
      id: number;
      name: string;
    };
    commissions: Array<{
      source: string;
      source_name: string;
      value: number;
      percentage: number;
      currency_code: string;
      type: string; // PRODUCER, AFFILIATE, CO_PRODUCER
    }>;
    purchase_date: number;
    total_value: number;
    currency_code: string;
  }>;
  page_info: {
    next_page_token?: string;
    total_results: number;
  };
}

export interface HotmartSalesPriceDetailsParams {
  start_date: string;
  end_date: string;
  product_id?: string;
  transaction_id?: string;
  max_results?: number;
  page_token?: string;
}

export interface HotmartSalesPriceDetailsResponse {
  items: Array<{
    transaction: string;
    product: {
      id: number;
      name: string;
    };
    price_details: {
      total_value: number;
      base_value: number;
      discount_value: number;
      tax_value: number;
      currency_code: string;
      discounts: Array<{
        type: string;
        value: number;
        percentage?: number;
      }>;
      taxes: Array<{
        type: string;
        value: number;
        percentage?: number;
      }>;
    };
    purchase_date: number;
  }>;
  page_info: {
    next_page_token?: string;
    total_results: number;
  };
}

class HotmartService {
  private getAuthHeaders() {
    const token = authService.getTokenInterno();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Lista todos os clientes Hotmart
   */
  async getCustomers(filters: HotmartFilters = {}): Promise<HotmartCustomersResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
      if (filters.productId) params.append("productId", filters.productId);
      if (filters.isActive !== undefined) params.append("isActive", filters.isActive.toString());
      if (filters.search) params.append("search", filters.search);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/customers?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: unknown) {
      console.error("Erro ao buscar clientes Hotmart:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar clientes";
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca estatísticas dos clientes
   */
  async getCustomerStats(): Promise<HotmartStats> {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/stats`,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: unknown) {
      console.error("Erro ao buscar estatísticas:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar estatísticas";
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca um cliente específico
   */
  async getCustomer(id: string): Promise<HotmartCustomer> {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/customers/${id}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error("Erro ao buscar cliente:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar cliente";
      throw new Error(errorMessage);
    }
  }

  /**
   * Atualiza dados de um cliente
   */
  async updateCustomer(id: string, updateData: Partial<HotmartCustomer>): Promise<HotmartCustomer> {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/customers/${id}`,
        updateData,
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error("Erro ao atualizar cliente:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar cliente";
      throw new Error(errorMessage);
    }
  }

  /**
   * Lista eventos de um cliente
   */
  async getCustomerEvents(customerId: string, page = 1, limit = 20): Promise<HotmartEventResponse> {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/customers/${customerId}/events?page=${page}&limit=${limit}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error("Erro ao buscar eventos do cliente:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar eventos";
      throw new Error(errorMessage);
    }
  }

  /**
   * Lista transações de um cliente
   */
  async getCustomerTransactions(customerId: string, page = 1, limit = 20): Promise<HotmartTransactionResponse> {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/customers/${customerId}/transactions?page=${page}&limit=${limit}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error("Erro ao buscar transações do cliente:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar transações";
      throw new Error(errorMessage);
    }
  }

  /**
   * Lista assinaturas da API da Hotmart
   */
  async listSubscriptions(filters: Record<string, unknown> = {}): Promise<HotmartSubscriptionResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/subscriptions?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error("Erro ao listar assinaturas:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao listar assinaturas";
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca detalhes de uma assinatura
   */
  async getSubscriptionDetails(subscriberCode: string): Promise<HotmartSubscription> {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/subscriptions/${subscriberCode}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error("Erro ao buscar detalhes da assinatura:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar detalhes da assinatura";
      throw new Error(errorMessage);
    }
  }

  /**
   * Cancela uma assinatura
   */
  async cancelSubscription(subscriberCode: string, sendEmail = true): Promise<Record<string, unknown>> {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/subscriptions/${subscriberCode}/cancel`,
        { sendEmail },
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error("Erro ao cancelar assinatura:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao cancelar assinatura";
      throw new Error(errorMessage);
    }
  }

  /**
   * Reativa uma assinatura
   */
  async reactivateSubscription(subscriberCode: string, chargeNow = false): Promise<Record<string, unknown>> {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/subscriptions/${subscriberCode}/reactivate`,
        { chargeNow },
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error("Erro ao reativar assinatura:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao reativar assinatura";
      throw new Error(errorMessage);
    }
  }

  /**
   * Sincroniza dados com a API da Hotmart
   */
  async syncWithHotmart(): Promise<HotmartSyncResponse> {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/sync`,
        {},
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: unknown) {
      console.error("Erro na sincronização:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro na sincronização";
      throw new Error(errorMessage);
    }
  }

  /**
   * Adiciona notas a um cliente
   */
  async addCustomerNote(customerId: string, notes: string): Promise<HotmartCustomer> {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/customers/${customerId}/notes`,
        { notes },
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error("Erro ao adicionar nota:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao adicionar nota";
      throw new Error(errorMessage);
    }
  }

  /**
   * Adiciona tags a um cliente
   */
  async addCustomerTags(customerId: string, tags: string[]): Promise<HotmartCustomer> {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/customers/${customerId}/tags`,
        { tags },
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error("Erro ao adicionar tags:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao adicionar tags";
      throw new Error(errorMessage);
    }
  }

  /**
   * Remove tags de um cliente
   */
  async removeCustomerTags(customerId: string, tags: string[]): Promise<HotmartCustomer> {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/customers/${customerId}/tags`,
        {
          headers: this.getAuthHeaders(),
          data: { tags },
        }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error("Erro ao remover tags:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao remover tags";
      throw new Error(errorMessage);
    }
  }

  /**
   * Exporta dados dos clientes
   */
  async exportCustomers(filters: Record<string, unknown> = {}, format = "csv"): Promise<string> {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/export?format=${format}`,
        filters,
        {
          headers: this.getAuthHeaders(),
          responseType: "text"
        }
      );

      return response.data;
    } catch (error: unknown) {
      console.error("Erro ao exportar clientes:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao exportar clientes";
      throw new Error(errorMessage);
    }
  }

  /**
   * Gera relatório de análise
   */
  async generateAnalyticsReport(params: Record<string, unknown>): Promise<HotmartAnalyticsResponse> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/analytics/report?${queryParams.toString()}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error("Erro ao gerar relatório:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao gerar relatório";
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca histórico de vendas da Hotmart
   */
  async getSalesHistory(params: HotmartSalesHistoryParams): Promise<HotmartSalesHistoryResponse> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/sales/history?${queryParams.toString()}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: unknown) {
      console.error("Erro ao buscar histórico de vendas:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar histórico de vendas";
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca sumário de vendas da Hotmart
   */
  async getSalesSummary(params: HotmartSalesSummaryParams): Promise<HotmartSalesSummaryResponse> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/sales/summary?${queryParams.toString()}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: unknown) {
      console.error("Erro ao buscar sumário de vendas:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar sumário de vendas";
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca participantes de vendas da Hotmart
   */
  async getSalesUsers(params: HotmartSalesUsersParams): Promise<HotmartSalesUsersResponse> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/sales/users?${queryParams.toString()}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: unknown) {
      console.error("Erro ao buscar participantes de vendas:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar participantes de vendas";
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca comissões de vendas da Hotmart
   */
  async getSalesCommissions(params: HotmartSalesCommissionsParams): Promise<HotmartSalesCommissionsResponse> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/sales/commissions?${queryParams.toString()}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: unknown) {
      console.error("Erro ao buscar comissões de vendas:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar comissões de vendas";
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca detalhes de preços de vendas da Hotmart
   */
  async getSalesPriceDetails(params: HotmartSalesPriceDetailsParams): Promise<HotmartSalesPriceDetailsResponse> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br"}/api/hotmart/sales/price-details?${queryParams.toString()}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: unknown) {
      console.error("Erro ao buscar detalhes de preços:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar detalhes de preços";
      throw new Error(errorMessage);
    }
  }
}

export const hotmartService = new HotmartService();