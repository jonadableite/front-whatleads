// src/hooks/useCrmConversations.ts (mantém apenas a lógica do hook)
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";

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
  const [socket, setSocket] = useState<Socket | null>(null);
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

  // Inicializar Socket.IO
  useEffect(() => {
    const socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    );
    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Configurar listeners de eventos do Socket.IO
  useEffect(() => {
    if (!socket) return;

    // Listener para atualização da lista de conversas
    const handleConversationsUpdate = (
      updatedConversations: Conversation[]
    ) => {
      // Mesclar com as conversas existentes mantendo a paginação
      setConversations((prevConversations) => {
        // Mapear por ID para atualização e inserção eficiente
        const conversationMap = new Map<string, Conversation>();
        // Adicionar conversas existentes ao mapa
        prevConversations.forEach((conv) => {
          conversationMap.set(conv.id, conv);
        });
        // Adicionar ou atualizar com as novas conversas
        updatedConversations.forEach((conv) => {
          conversationMap.set(conv.id, conv);
        });
        // Converter de volta para array e ordenar pelo mais recente
        const mergedConversations = Array.from(conversationMap.values());
        return mergedConversations
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime()
          )
          .slice(0, pagination.limit);
      });
    };

    // Listener para novas mensagens
    const handleNewMessage = (data: {
      conversationId: string;
      message: any;
    }) => {
      setConversations((prevConversations) => {
        return prevConversations
          .map((conv) => {
            if (conv.id === data.conversationId) {
              // Atualizar conversa com nova mensagem
              return {
                ...conv,
                lastMessage: {
                  id: data.message.id,
                  content: data.message.content,
                  timestamp: data.message.timestamp,
                  status: data.message.status,
                  sender: data.message.sender,
                },
                lastMessageAt: data.message.timestamp,
                unreadCount:
                  data.message.sender === "them"
                    ? conv.unreadCount + 1
                    : conv.unreadCount,
              };
            }
            return conv;
          })
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime()
          );
      });
    };

    // Listener para atualizações de status
    const handleStatusUpdate = (data: {
      conversationId: string;
      status: string;
    }) => {
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (conv.id === data.conversationId) {
            return { ...conv, status: data.status };
          }
          return conv;
        });
      });
    };

    // Listener para novas conversas
    const handleNewConversation = (newConversation: Conversation) => {
      setConversations((prevConversations) => {
        // Verificar se a conversa já existe
        const exists = prevConversations.some(
          (conv) => conv.id === newConversation.id
        );
        if (exists) return prevConversations;
        // Adicionar nova conversa e reordenar
        const updated = [newConversation, ...prevConversations];
        return updated
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime()
          )
          .slice(0, pagination.limit);
      });
    };

    // Registrar todos os listeners
    socket.on("conversations_list_update", handleConversationsUpdate);
    socket.on("new_message", handleNewMessage);
    socket.on("conversation_status_update", handleStatusUpdate);
    socket.on("new_conversation", handleNewConversation);
    // Listener de debug para webhooks (útil para desenvolvimento)
    socket.on("webhook_received", (data) => {
      console.debug("Webhook recebido:", data);
    });

    // Remover listeners ao desmontar
    return () => {
      socket.off("conversations_list_update", handleConversationsUpdate);
      socket.off("new_message", handleNewMessage);
      socket.off("conversation_status_update", handleStatusUpdate);
      socket.off("new_conversation", handleNewConversation);
      socket.off("webhook_received");
    };
  }, [socket, pagination.limit]);

  // Função para buscar conversas
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      // Adicionar todos os filtros aos parâmetros da URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, String(value));
        }
      });
      const response = await api.get<ConversationsResponse>(
        `/conversations?${params.toString()}`
      );
      setConversations(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Erro ao buscar conversas")
      );
      toast.error("Não foi possível carregar as conversas");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Atualizar status da conversa
  const updateConversationStatus = useCallback(
    async (conversationId: string, status: string) => {
      try {
        await api.patch(`/conversations/${conversationId}/status`, { status });
        setConversations((prevConversations) => {
          return prevConversations.map((conv) => {
            if (conv.id === conversationId) {
              return { ...conv, status };
            }
            return conv;
          });
        });
        toast.success("Status atualizado com sucesso");
        return true;
      } catch (error) {
        toast.error("Erro ao atualizar o status da conversa");
        return false;
      }
    },
    []
  );

  // Atualizar tags da conversa
  const updateConversationTags = useCallback(
    async (conversationId: string, tags: string[]) => {
      try {
        await api.patch(`/conversations/${conversationId}/tags`, { tags });
        setConversations((prevConversations) => {
          return prevConversations.map((conv) => {
            if (conv.id === conversationId) {
              return { ...conv, tags };
            }
            return conv;
          });
        });
        toast.success("Tags atualizadas com sucesso");
        return true;
      } catch (error) {
        toast.error("Erro ao atualizar as tags da conversa");
        return false;
      }
    },
    []
  );

  // Marcar conversa como lida
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      await api.post(`/conversations/${conversationId}/read`);
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (conv.id === conversationId) {
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        });
      });
      return true;
    } catch (error) {
      console.error("Erro ao marcar conversa como lida:", error);
      return false;
    }
  }, []);

  // Carregar conversas na montagem do componente
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Informações para depuração (sem o componente JSX)
  const debugInfo = {
    socketConnected: socket?.connected || false,
    totalConversations: pagination.total,
    currentFilters: filters,
  };

  return {
    conversations,
    loading,
    error,
    pagination,
    filters,
    fetchConversations,
    updateConversationStatus,
    updateConversationTags,
    markConversationAsRead,
    setFilters,
    debugInfo,
  };
};
