// src/services/hotmart.service.ts

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
  eventData: any;
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

class HotmartService {
  // Removido getAuthHeaders pois agora o interceptor cuida da autenticação

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

      const response = await api.get(`/api/hotmart/customers?${params.toString()}`);

      return response.data.data;
    } catch (error: any) {
      console.error("Erro ao buscar clientes Hotmart:", error);
      throw new Error(error.response?.data?.error || "Erro ao buscar clientes");
    }
  }

  /**
   * Busca estatísticas dos clientes
   */
  async getCustomerStats(): Promise<HotmartStats> {
    try {
      const response = await api.get('/api/hotmart/customers/stats');

      return response.data.data;
    } catch (error: any) {
      console.error("Erro ao buscar estatísticas:", error);
      throw new Error(error.response?.data?.error || "Erro ao buscar estatísticas");
    }
  }

  /**
   * Busca um cliente específico
   */
  async getCustomer(id: string): Promise<HotmartCustomer> {
    try {
      const response = await axios.get(
        `${API_URL}/api/hotmart/customers/${id}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error("Erro ao buscar cliente:", error);
      throw new Error(error.response?.data?.error || "Erro ao buscar cliente");
    }
  }

  /**
   * Atualiza dados de um cliente
   */
  async updateCustomer(id: string, updateData: Partial<HotmartCustomer>): Promise<HotmartCustomer> {
    try {
      const response = await axios.put(
        `${API_URL}/api/hotmart/customers/${id}`,
        updateData,
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error("Erro ao atualizar cliente:", error);
      throw new Error(error.response?.data?.error || "Erro ao atualizar cliente");
    }
  }

  /**
   * Lista eventos de um cliente
   */
  async getCustomerEvents(customerId: string, page = 1, limit = 20): Promise<any> {
    try {
      const response = await axios.get(
        `${API_URL}/api/hotmart/customers/${customerId}/events?page=${page}&limit=${limit}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error("Erro ao buscar eventos do cliente:", error);
      throw new Error(error.response?.data?.error || "Erro ao buscar eventos");
    }
  }

  /**
   * Lista transações de um cliente
   */
  async getCustomerTransactions(customerId: string, page = 1, limit = 20): Promise<any> {
    try {
      const response = await axios.get(
        `${API_URL}/api/hotmart/customers/${customerId}/transactions?page=${page}&limit=${limit}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error("Erro ao buscar transações do cliente:", error);
      throw new Error(error.response?.data?.error || "Erro ao buscar transações");
    }
  }

  /**
   * Lista assinaturas da API da Hotmart
   */
  async listSubscriptions(filters: any = {}): Promise<any> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${API_URL}/api/hotmart/subscriptions?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error("Erro ao listar assinaturas:", error);
      throw new Error(error.response?.data?.error || "Erro ao listar assinaturas");
    }
  }

  /**
   * Busca detalhes de uma assinatura
   */
  async getSubscriptionDetails(subscriberCode: string): Promise<HotmartSubscription> {
    try {
      const response = await axios.get(
        `${API_URL}/api/hotmart/subscriptions/${subscriberCode}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error("Erro ao buscar detalhes da assinatura:", error);
      throw new Error(error.response?.data?.error || "Erro ao buscar detalhes da assinatura");
    }
  }

  /**
   * Cancela uma assinatura
   */
  async cancelSubscription(subscriberCode: string, sendEmail = true): Promise<any> {
    try {
      const response = await axios.post(
        `${API_URL}/api/hotmart/subscriptions/${subscriberCode}/cancel`,
        { sendEmail },
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error("Erro ao cancelar assinatura:", error);
      throw new Error(error.response?.data?.error || "Erro ao cancelar assinatura");
    }
  }

  /**
   * Reativa uma assinatura
   */
  async reactivateSubscription(subscriberCode: string, chargeNow = false): Promise<any> {
    try {
      const response = await axios.post(
        `${API_URL}/api/hotmart/subscriptions/${subscriberCode}/reactivate`,
        { chargeNow },
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error("Erro ao reativar assinatura:", error);
      throw new Error(error.response?.data?.error || "Erro ao reativar assinatura");
    }
  }

  /**
   * Sincroniza dados com a API da Hotmart
   */
  async syncWithHotmart(): Promise<any> {
    try {
      const response = await axios.post(
        `${API_URL}/api/hotmart/sync`,
        {},
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error("Erro na sincronização:", error);
      throw new Error(error.response?.data?.error || "Erro na sincronização");
    }
  }

  /**
   * Adiciona notas a um cliente
   */
  async addCustomerNote(customerId: string, notes: string): Promise<HotmartCustomer> {
    try {
      const response = await axios.post(
        `${API_URL}/api/hotmart/customers/${customerId}/notes`,
        { notes },
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error("Erro ao adicionar nota:", error);
      throw new Error(error.response?.data?.error || "Erro ao adicionar nota");
    }
  }

  /**
   * Adiciona tags a um cliente
   */
  async addCustomerTags(customerId: string, tags: string[]): Promise<HotmartCustomer> {
    try {
      const response = await axios.post(
        `${API_URL}/api/hotmart/customers/${customerId}/tags`,
        { tags },
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error("Erro ao adicionar tags:", error);
      throw new Error(error.response?.data?.error || "Erro ao adicionar tags");
    }
  }

  /**
   * Remove tags de um cliente
   */
  async removeCustomerTags(customerId: string, tags: string[]): Promise<HotmartCustomer> {
    try {
      const response = await axios.delete(
        `${API_URL}/api/hotmart/customers/${customerId}/tags`,
        {
          headers: this.getAuthHeaders(),
          data: { tags },
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error("Erro ao remover tags:", error);
      throw new Error(error.response?.data?.error || "Erro ao remover tags");
    }
  }

  /**
   * Exporta dados dos clientes
   */
  async exportCustomers(filters: any = {}, format = "csv"): Promise<string> {
    try {
      const response = await axios.post(
        `${API_URL}/api/hotmart/export?format=${format}`,
        filters,
        {
          headers: this.getAuthHeaders(),
          responseType: "text"
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Erro ao exportar clientes:", error);
      throw new Error(error.response?.data?.error || "Erro ao exportar clientes");
    }
  }

  /**
   * Gera relatório de análise
   */
  async generateAnalyticsReport(params: any): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${API_URL}/api/hotmart/analytics/report?${queryParams.toString()}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error("Erro ao gerar relatório:", error);
      throw new Error(error.response?.data?.error || "Erro ao gerar relatório");
    }
  }
}

export const hotmartService = new HotmartService();