// src/lib/api.extended.ts
import { api as originalApi } from "@/lib/api";

// Extensão do cliente de API com métodos específicos para o CRM
export const crmApi = {
  conversations: {
    getAll: async (params: any = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });

      return originalApi.main.get(`/crm/conversations?${queryParams}`);
    },

    updateStatus: async (conversationId: string, status: string) => {
      return originalApi.main.put(
        `/crm/conversations/${conversationId}/status`,
        { status }
      );
    },

    updateTags: async (conversationId: string, tags: string[]) => {
      return originalApi.main.put(`/crm/conversations/${conversationId}/tags`, {
        tags,
      });
    },

    getMessages: async (conversationId: string, page = 1, limit = 50) => {
      return originalApi.main.get(
        `/crm/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
      );
    },

    sendMessage: async (
      conversationId: string,
      content: string,
      attachments?: any[]
    ) => {
      return originalApi.main.post(
        `/crm/conversations/${conversationId}/messages`,
        {
          content,
          attachments,
        }
      );
    },

    getContact: async (contactId: string) => {
      return originalApi.main.get(`/crm/contacts/${contactId}`);
    },
  },
};

// Exportar o API original junto com a extensão do CRM
export const api = {
  ...originalApi,
  crm: crmApi,
};
