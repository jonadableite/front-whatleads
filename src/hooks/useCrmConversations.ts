// src/hooks/useCrmConversations.ts
import { useState, useEffect } from "react";
import axios from "axios";

export interface Conversation {
  contactName: string;
  lastMessage: {
    sender: string;
    content?: string;
  };
  lastMessageAt?: string;
  unreadCount: number;
  status: string;
  isGroup: boolean;
  tags: any[];
  contactPhone: string;
  id: string;
  remoteJid: string;
  pushName: string;
  profilePicUrl: string | null;
  timestamp: Date;
}

export const useCrmConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async (instanceName: string) => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = localStorage.getItem("evolutionApiKey");
      const response = await axios.post(
        `https://evo.whatlead.com.br/chat/findChats/${instanceName}`,
        {
          page: 1,
          limit: 50,
        },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: apiKey || "429683C4C977415CAAFCCE10F7D57E11",
          },
        }
      );

      // Transformar dados da resposta para o formato do Conversation
      const transformedConversations: Conversation[] = response.data.map(
        (chat: any) => ({
          contactName: chat.name || chat.pushName || "Contato Desconhecido",
          lastMessage: {
            content: chat.lastMessage?.message?.conversation || "Sem mensagem",
          },
          lastMessageAt: chat.lastMessageAt || new Date().toISOString(),
          unreadCount: chat.unreadCount || 0,
          status: "OPEN",
          isGroup: chat.isGroup || false,
          tags: [],
          contactPhone: chat.id?.replace("@s.whatsapp.net", "") || "",
          id: chat.id || "",
          remoteJid: chat.id || "",
          pushName: chat.pushName || "",
          profilePicUrl: null,
          timestamp: new Date(chat.lastMessageAt || Date.now()),
        })
      );

      setConversations(transformedConversations);
    } catch (err) {
      console.error("Erro ao buscar conversas:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao buscar conversas"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationMessages = async (
    instanceName: string,
    remoteJid: string
  ) => {
    try {
      const apiKey = localStorage.getItem("evolutionApiKey");
      const response = await axios.post(
        `https://evo.whatlead.com.br/chat/findMessages/${instanceName}`,
        {
          where: {
            key: {
              remoteJid: remoteJid,
            },
          },
          page: 1,
          offset: 50,
        },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: apiKey || "",
          },
        }
      );

      return response.data;
    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
      return [];
    }
  };

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    fetchConversationMessages,
  };
};
