// src/components/CRM/Conversation.tsx
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, ArrowLeft, Paperclip, Smile, Badge, Camera, Check, Contact, Copy, FileText, Flag, MapPin, MessageSquare, Mic, MoreVertical, Phone, Star, Trash, User, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Conversation } from '@/hooks/useCrmConversations';
import { sendMessage } from '@/lib/bot';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { TooltipProvider, TooltipTrigger, TooltipContent, Tooltip } from '@radix-ui/react-tooltip';
// Removed Tooltip from 'recharts' as it is not compatible
import { Skeleton } from '../ui/Skeleton';
// Define the Message interface locally if it is not exported from '@/hooks/useCrmMessages'
interface Message {
  id: string;
  messageId: string;
  conversationId: string;
  content: string;
  type: string;
  sender: string;
  status: string;
  timestamp: string;
}


interface ConversationViewProps {
  conversation: Conversation;
  onBack: () => void;
  onUpdateStatus: (conversationId: string, newStatus: string) => Promise<boolean>;
  onOpenClientProfile: (conversation: Conversation) => void;
  messages: any[]; // Recebe as mensagens como prop
  loadingMessages: boolean; // Recebe o estado de carregamento
}

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  onBack,
  onUpdateStatus,
  onOpenClientProfile,
  messages, // Recebe as mensagens como prop
  loadingMessages // Recebe o estado de carregamento
}) => {
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rolar para a mensagem mais recente quando as mensagens forem carregadas
  useEffect(() => {
    if (messages.length > 0 && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    try {
      await sendMessage(conversation.id, messageInput);
      setMessageInput("");
      // Focar no input após enviar
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const success = await onUpdateStatus(conversation.id, newStatus);
    if (success) {
      toast.success(`Status alterado para ${formatStatus(newStatus)}`);
    }
  };

  const handleTagsUpdate = async (tag: string) => {
    // Verificar se a tag já existe
    const currentTags = conversation.tags || [];
    const hasTag = currentTags.includes(tag);
    let updatedTags;
    if (hasTag) {
      updatedTags = currentTags.filter(t => t !== tag);
      toast.info(`Tag "${tag}" removida`);
    } else {
      updatedTags = [...currentTags, tag];
      toast.success(`Tag "${tag}" adicionada`);
    }
    try {
      await updateConversationTags(conversation.id, updatedTags);
    } catch (error) {
      toast.error("Erro ao atualizar tags");
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessageInput(prev => prev + emoji.native);
    setShowEmojiPicker(false);
    // Focar no input após adicionar emoji
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleAttachment = (type: string) => {
    toast.info(`Funcionalidade de anexo ${type} em desenvolvimento`);
    setAttachmentMenuOpen(false);
  };

  // Verificar se o contato tem nome para mostrar
  const contactName = conversation?.contactName || "Contato";
  const contactPhone = conversation?.contactPhone || "";

  function formatStatus(status: string): import("react").ReactNode {
    throw new Error('Function not implemented.');
  }

  function formatMessageTime(timestamp: any): import("react").ReactNode {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-deep/30 rounded-2xl overflow-hidden">
      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center p-4 border-b border-electric/10 bg-deep/40 backdrop-blur-sm"
      >
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mr-3 hover:bg-deep/50 rounded-full p-2"
          >
            <ArrowLeft size={20} className="text-white" />
          </Button>
          <div
            className="w-12 h-12 rounded-full bg-electric/30 flex items-center justify-center mr-4 text-xl font-bold text-white"
            onClick={() => onOpenClientProfile(conversation)}
          >
            {contactName.charAt(0).toUpperCase()}
          </div>
          <div className="cursor-pointer" onClick={() => onOpenClientProfile(conversation)}>
            <h3 className="font-semibold text-white hover:text-electric transition-colors">
              {contactName}
            </h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-white/60">{contactPhone}</p>
              {conversation.isGroup && (
                <Badge variant="outline" className="text-xs bg-deep/50 text-white/70 border-electric/30">
                  Grupo
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Botões de status */}
          <div className="hidden md:flex space-x-2 mr-2">
            {["OPEN", "pending", "closed"].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`
                                   px-3 py-1 rounded-full text-xs font-medium transition-all
                                   ${conversation.status === status
                    ? "bg-electric text-white"
                    : "bg-deep/30 text-white/70 hover:bg-electric/20"
                  }
                              `}
              >
                {formatStatus(status)}
              </button>
            ))}
          </div>
          {/* Botões de ação */}
          <div className="flex items-center">
            <TooltipProvider>
              <TooltipProvider>Tooltip
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full text-white/70 hover:bg-deep/50 hover:text-white">
                    <Phone size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-deep/90 text-white border-electric/30">
                  <p>Chamada de voz</p>
                </TooltipContent>
              </TooltipProvider>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full text-white/70 hover:bg-deep/50 hover:text-white">
                    <Video size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-deep/90 text-white border-electric/30">
                  <p>Chamada de vídeo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full text-white/70 hover:bg-deep/50 hover:text-white">
                  <MoreVertical size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-deep/90 text-white border-electric/30">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onOpenClientProfile(conversation)} className="focus:bg-electric/20 cursor-pointer">
                  <User size={16} className="mr-2" /> Ver perfil do cliente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTagsUpdate('importante')} className="focus:bg-electric/20 cursor-pointer">
                  <Star size={16} className="mr-2" /> Marcar como importante
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTagsUpdate('spam')} className="focus:bg-electric/20 cursor-pointer">
                  <Flag size={16} className="mr-2" /> Marcar como spam
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(contactPhone)} className="focus:bg-electric/20 cursor-pointer">
                  <Copy size={16} className="mr-2" /> Copiar número
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Apagando conversa...")} className="focus:bg-red-500/20 cursor-pointer text-red-400">
                  <Trash size={16} className="mr-2" /> Apagar conversa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>
      {/* Área de Mensagens - usando div overflow em vez de ScrollArea */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-deep/10">
        {loadingMessages ? (
          <div className="space-y-4 py-10">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className={`flex ${index % 2 === 0 ? "justify-end" : "justify-start"}`}
                >
                  <Skeleton
                    className={`rounded-2xl p-4 max-w-[80%] ${index % 2 === 0 ? "w-64 h-16 bg-electric/10" : "w-72 h-24 bg-deep/20"
                      }`}
                  />
                </div>
              ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="bg-deep/30 p-6 rounded-full mb-4">
              <MessageSquare size={40} className="text-electric/50" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Nenhuma mensagem</h3>
            <p className="text-white/50 max-w-md">
              Inicie a conversa enviando uma mensagem para este contato.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                {message.sender !== "me" && (
                  <div className="w-8 h-8 rounded-full bg-electric/30 flex items-center justify-center mr-2 text-sm font-bold text-white self-end">
                    {contactName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div
                  className={`rounded-2xl p-3 max-w-[80%] shadow-sm ${message.sender === "me"
                    ? "bg-electric text-white rounded-tr-none"
                    : "bg-deep/40 text-white rounded-tl-none"
                    }`}
                >
                  {message.sender !== "me" && message.senderName && (
                    <p className="text-xs font-medium text-electric/80 mb-1">
                      {message.senderName}
                    </p>
                  )}
                  <p className="break-words">{message.content}</p>
                  <div className="text-xs mt-1 opacity-70 text-right flex items-center justify-end gap-1">
                    {formatMessageTime(message.timestamp)}
                    {message.sender === "me" && (
                      <span className="ml-1">
                        {message.status === "READ" ? (
                          <Check size={14} className="text-white inline-block fill-current" />
                        ) : (
                          <Check size={14} className="text-white/60 inline-block" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messageEndRef} />
          </div>
        )}
      </div>
      {/* Input de Mensagem */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-t border-electric/10 bg-deep/40 backdrop-blur-sm relative"
      >
        <div className="flex items-center space-x-2">
          {/* Emoji Picker */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-white/70 hover:text-white p-2 rounded-full hover:bg-deep/50"
            >
              <Smile size={24} />
            </motion.button>
            {showEmojiPicker && (
              <div className="absolute bottom-14 left-0 z-10">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} theme="dark" />
              </div>
            )}
          </div>
          {/* Attachment Picker */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
              className="text-white/70 hover:text-white p-2 rounded-full hover:bg-deep/50"
            >
              <Paperclip size={24} />
            </motion.button>
            {attachmentMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-14 left-0 bg-deep/90 backdrop-blur-md border border-electric/20 rounded-lg shadow-xl p-2 z-10"
              >
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Image, label: "Imagem", type: "image" },
                    { icon: Camera, label: "Câmera", type: "camera" },
                    { icon: FileText, label: "Documento", type: "document" },
                    { icon: Mic, label: "Áudio", type: "audio" },
                    { icon: MapPin, label: "Localização", type: "location" },
                    { icon: Contact, label: "Contato", type: "contact" }
                  ].map(item => (
                    <Button
                      key={item.type}
                      variant="ghost"
                      size="sm"
                      className="flex flex-col items-center p-2 hover:bg-electric/20 rounded-lg h-auto"
                      onClick={() => handleAttachment(item.type)}
                    >
                      <item.icon size={20} className="mb-1 text-electric" />
                      <span className="text-xs text-white/80">{item.label}</span>
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
          {/* Input de texto */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Digite sua mensagem..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 bg-deep/50 rounded-full px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-electric placeholder-white/50"
          />
          {/* Botão de envio animado */}
          <motion.button
            onClick={handleSendMessage}
            whileHover={{ scale: 1.1, rotate: -10 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 rounded-full ${!messageInput.trim()
              ? "bg-electric/50 text-white/50 cursor-not-allowed"
              : "bg-electric text-white hover:bg-electric/80"
              } transition-colors`}
            disabled={!messageInput.trim()}
          >
            <Send size={20} />
          </motion.button>
        </div>
        {/* Sugestões de resposta rápida */}
        <div className="px-4 py-2 border-t border-electric/10">
          <div className="flex flex-wrap gap-2">
            {["Olá, como posso ajudar?", "Aguarde um momento", "Obrigado pelo contato", "Vou verificar isso para você"].map((text) => (
              <motion.button
                key={text}
                onClick={() => {
                  setMessageInput(text);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-deep/40 hover:bg-electric/20 text-white/80 rounded-full px-3 py-1 text-sm transition-colors"
              >
                {text}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConversationView;
function formatStatus(newStatus: string) {
  throw new Error('Function not implemented.');
}

function updateConversationTags(id: string, updatedTags: any) {
  throw new Error('Function not implemented.');
}

