// src/hooks/useCrmConversations.ts
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface Conversation {
  id: string;
  contactName: string;
  contactPhone: string;
  lastMessageAt: string;
  status: string;
  unreadCount: number;
  lastMessage: {
    id: string;
    content: string;
    timestamp: string;
    status: string;
    sender: string;
  } | null;
  tags: string[];
  isGroup: boolean;
}

export interface ConversationsResponse {
  data: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ConversationFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  instanceName?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const useCrmConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<ConversationFilters>({
    page: 1,
    limit: 50,
  });

  const fetchConversations = useCallback(
    async (newFilters?: ConversationFilters) => {
      try {
        setLoading(true);
        const currentFilters = newFilters
          ? { ...filters, ...newFilters }
          : filters;
        setFilters(currentFilters);

        const params = new URLSearchParams();
        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value !== undefined) params.append(key, value.toString());
        });

        // Usando o cliente API corrigido com o prefixo /api
        const response = await api.main.get<ConversationsResponse>(
          `/crm/conversations?${params}`
        );
        setConversations(response.data.data);
        setPagination(response.data.pagination);
        return response.data;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast.error("Erro ao carregar conversas: " + error.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const updateConversationStatus = useCallback(
    async (conversationId: string, status: string) => {
      try {
        setLoading(true);
        await api.main.put(`/crm/conversations/${conversationId}/status`, {
          status,
        });

        // Atualizar lista local
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, status } : conv
          )
        );

        toast.success(`Status alterado para ${status}`);
        return true;
      } catch (err) {
        const error = err as Error;
        toast.error("Erro ao atualizar status: " + error.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateConversationTags = useCallback(
    async (conversationId: string, tags: string[]) => {
      try {
        setLoading(true);
        await api.main.put(`/crm/conversations/${conversationId}/tags`, {
          tags,
        });

        // Atualizar lista local
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, tags } : conv
          )
        );

        toast.success("Tags atualizadas com sucesso");
        return true;
      } catch (err) {
        const error = err as Error;
        toast.error("Erro ao atualizar tags: " + error.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchConversations();
  }, []);

  return {
    conversations,
    loading,
    error,
    pagination,
    filters,
    fetchConversations,
    updateConversationStatus,
    updateConversationTags,
    setFilters,
  };
};
