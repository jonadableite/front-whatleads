// src/components/CRM/Conversation.tsx
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, ArrowLeft, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Message } from '@/hooks/useCrmMessages';

interface ConversationProps {
  conversationId: string;
  contactName: string;
  contactPhone: string;
  onBack: () => void;
}

export default function Conversation({ conversationId, contactName, contactPhone, onBack }: ConversationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await api.main.get(
        `/crm/conversations/${conversationId}/messages?page=1&limit=50`
      );
      setMessages(response.data.data);
    } catch (error) {
      toast.error('Erro ao carregar mensagens');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      setSending(true);
      await api.main.post(`/crm/conversations/${conversationId}/messages`, {
        content: messageText
      });
      setMessageText('');
      // Adicionar a mensagem no estado local primeiro para feedback imediato
      const newMessage: Message = {
        id: `temp-${Date.now()}`,
        messageId: `temp-${Date.now()}`,
        conversationId,
        content: messageText,
        type: 'text',
        sender: 'me',
        status: 'PENDING',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [newMessage, ...prev]);

      // Recarregar mensagens após um breve atraso
      setTimeout(() => {
        loadMessages();
      }, 1000);

    } catch (error) {
      toast.error('Erro ao enviar mensagem');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch (e) {
      return "Data inválida";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-deep/30 rounded-2xl overflow-hidden">
      {/* Cabeçalho da Conversa */}
      <div className="flex items-center p-4 border-b border-electric/10">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.1 }}
          className="p-2 rounded-full bg-deep/20 mr-3"
        >
          <ArrowLeft size={20} className="text-white" />
        </motion.button>
        <div className="w-12 h-12 rounded-full bg-electric/30 flex items-center justify-center mr-4 text-xl font-bold text-white">
          {contactName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold text-white">{contactName}</h3>
          <p className="text-sm text-white/60">{contactPhone}</p>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-deep/10">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-4 text-white/50">
            Nenhuma mensagem encontrada nesta conversa
          </div>
        ) : (
          <div className="flex flex-col-reverse">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`my-2 flex ${msg.sender === "me" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`rounded-2xl p-4 max-w-[80%] ${msg.sender === "me"
                      ? "bg-electric/80 text-white"
                      : "bg-deep/40 text-white"
                    }`}
                >
                  <p>{msg.content}</p>
                  <div className="text-xs mt-1 opacity-70 text-right">
                    {formatMessageTime(msg.timestamp)}
                    {msg.sender === "me" && (
                      <span className="ml-1">
                        {msg.status === "READ" ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input de Mensagem */}
      <div className="p-4 border-t border-electric/10 flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="text-white/70 hover:text-white"
        >
          <Smile size={24} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="text-white/70 hover:text-white"
        >
          <Paperclip size={24} />
        </motion.button>
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 bg-deep/30 rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-electric"
        />
        <motion.button
          onClick={handleSendMessage}
          disabled={sending || !messageText.trim()}
          whileHover={{ scale: 1.1 }}
          className={`p-2 rounded-full ${sending || !messageText.trim()
              ? "bg-electric/50 text-white/50"
              : "bg-electric text-white hover:bg-electric/80"
            } transition-colors`}
        >
          <Send size={20} />
        </motion.button>
      </div>
    </div>
  );
}
