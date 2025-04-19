// src/hooks/useCrmMessages.ts
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api"; // Usando seu cliente API existente
import { toast } from "sonner";

export interface Message {
  id: string;
  messageId: string;
  conversationId: string;
  content: string;
  type: string;
  sender: string;
  status: string;
  timestamp: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: string;
  url: string;
  name: string;
  mimeType: string;
  filename: string;
  size?: number;
}

export interface MessagesResponse {
  data: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useCrmMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const fetchMessages = useCallback(
    async (page = 1, limit = 50) => {
      if (!conversationId) return null;

      try {
        setLoading(true);
        const response = await api.main.get<MessagesResponse>(
          `/crm/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
        );
        setMessages(response.data.data);
        setPagination(response.data.pagination);
        return response.data;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast.error("Erro ao carregar mensagens: " + error.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [conversationId]
  );

  const sendMessage = useCallback(
    async (content: string, attachments?: any[]) => {
      if (!conversationId) return null;

      try {
        setLoading(true);
        const response = await api.main.post(
          `/crm/conversations/${conversationId}/messages`,
          {
            content,
            attachments,
          }
        );

        // Adicionar a nova mensagem à lista
        setMessages((prev) => [{ ...response.data.data }, ...prev]);

        return response.data;
      } catch (err) {
        const error = err as Error;
        toast.error("Erro ao enviar mensagem: " + error.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [conversationId]
  );

  // Carregar mensagens quando o ID da conversa mudar
  useEffect(() => {
    if (conversationId) {
      fetchMessages(1, 50);
    } else {
      setMessages([]);
    }
  }, [conversationId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    pagination,
    fetchMessages,
    sendMessage,
  };
};
