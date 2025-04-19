// src/components/CRM/WhatsAppCRM.tsx
import { motion } from "framer-motion";
import {
	Filter,
	MoreVertical,
	Paperclip,
	Search,
	Send,
	Smile,
} from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import { useCrmMessages } from "@/hooks/useCrmMessages";
import { Conversation } from "@/hooks/useCrmConversations";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/Skeleton";

interface WhatsAppCRMProps {
	conversations: Conversation[];
	onUpdateStatus: (conversationId: string, newStatus: string) => Promise<boolean>;
	onOpenClientProfile: (conversation: Conversation) => void;
	loading: boolean;
}

const WhatsAppCRM: React.FC<WhatsAppCRMProps> = ({
	conversations,
	onUpdateStatus,
	onOpenClientProfile,
	loading,
}) => {
	const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
	const [messageInput, setMessageInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	// Hook para gerenciar mensagens da conversa selecionada
	const {
		messages,
		loading: loadingMessages,
		sendMessage
	} = useCrmMessages(selectedChat?.id || null);

	// Filtrar conversas baseado no termo de busca
	const filteredConversations = conversations.filter((conv) =>
		conv.contactName.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Se a conversa selecionada mudou na lista, atualize o estado local
	useEffect(() => {
		if (selectedChat) {
			const updatedChat = conversations.find(c => c.id === selectedChat.id);
			if (updatedChat) {
				setSelectedChat(updatedChat);
			}
		}
	}, [conversations, selectedChat]);

	const renderStatusBadge = (status: string) => {
		const statusColors: Record<string, string> = {
			OPEN: "bg-blue-500/20 text-blue-500",
			pending: "bg-yellow-500/20 text-yellow-500",
			closed: "bg-green-500/20 text-green-500",
			resolved: "bg-green-500/20 text-green-500",
		};

		return (
			<span
				className={`px-2 py-1 rounded-full text-xs ${statusColors[status] || "bg-gray-500/20 text-gray-500"}`}
			>
				{status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
			</span>
		);
	};

	const handleSendMessage = async () => {
		if (messageInput.trim() && selectedChat) {
			try {
				await sendMessage(messageInput);
				setMessageInput("");
			} catch (error) {
				toast.error("Erro ao enviar mensagem");
			}
		}
	};

	const handleStatusChange = async (newStatus: string) => {
		if (selectedChat) {
			const success = await onUpdateStatus(selectedChat.id, newStatus);
			if (success) {
				toast.success(`Status alterado para ${newStatus}`);
			}
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
		<div className="flex h-[calc(100vh-200px)] bg-deep/30 rounded-2xl overflow-hidden">
			{/* Lista de Chats */}
			<div className="w-96 border-r border-electric/10 overflow-hidden flex flex-col">
				{/* Área de Busca e Filtro */}
				<div className="sticky top-0 bg-deep/90 z-10 p-4 border-b border-electric/10 flex items-center space-x-2">
					<div className="relative flex-grow">
						<input
							type="text"
							placeholder="Buscar conversas..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full bg-deep/30 rounded-full pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-electric"
						/>
						<Search
							className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
							size={20}
						/>
					</div>
					<motion.button
						whileHover={{ scale: 1.1 }}
						className="bg-deep/30 p-2 rounded-full"
					>
						<Filter size={20} className="text-white/70" />
					</motion.button>
				</div>

				{/* Lista de Conversas */}
				<div className="flex-grow overflow-y-auto">
					{loading && filteredConversations.length === 0 ? (
						// Esqueletos para carregamento
						Array(5).fill(0).map((_, index) => (
							<div key={index} className="p-4 border-b border-electric/10">
								<div className="flex items-center">
									<Skeleton className="w-12 h-12 rounded-full mr-4" />
									<div className="flex-1">
										<Skeleton className="h-5 w-32 mb-2" />
										<Skeleton className="h-4 w-40" />
									</div>
								</div>
							</div>
						))
					) : filteredConversations.length === 0 ? (
						<div className="p-8 text-center text-white/50">
							Nenhuma conversa encontrada
						</div>
					) : (
						filteredConversations.map((conv) => (
							<motion.div
								key={conv.id}
								onClick={() => setSelectedChat(conv)}
								className={`
                  flex items-center p-4 cursor-pointer transition-colors duration-200 border-b border-electric/10
                  ${selectedChat?.id === conv.id
										? "bg-electric/20"
										: "hover:bg-electric/10"
									}
                `}
								whileHover={{ scale: 1.01 }}
								whileTap={{ scale: 0.99 }}
							>
								<div className="w-12 h-12 rounded-full bg-electric/30 flex items-center justify-center mr-4 text-xl font-bold text-white">
									{conv.contactName.charAt(0).toUpperCase()}
								</div>
								<div className="flex-1">
									<div className="flex justify-between items-center">
										<h3
											className="font-semibold text-white cursor-pointer"
											onClick={(e) => {
												e.stopPropagation();
												onOpenClientProfile(conv);
											}}
										>
											{conv.contactName}
										</h3>
										<span className="text-xs text-white/50">
											{formatMessageTime(conv.lastMessageAt)}
										</span>
									</div>
									<div className="flex justify-between items-center mt-1">
										<p className="text-sm text-white/60 truncate max-w-[180px]">
											{conv.lastMessage?.content || "Sem mensagens"}
										</p>
										<div className="flex items-center gap-2">
											{conv.unreadCount > 0 && (
												<span className="bg-electric rounded-full px-2 py-0.5 text-xs">
													{conv.unreadCount}
												</span>
											)}
											{renderStatusBadge(conv.status)}
										</div>
									</div>
								</div>
							</motion.div>
						))
					)}
				</div>
			</div>

			{/* Área de Chat */}
			{selectedChat ? (
				<div className="flex-1 flex flex-col">
					{/* Cabeçalho do Chat */}
					<div className="flex justify-between items-center p-4 border-b border-electric/10">
						<div className="flex items-center">
							<div className="w-12 h-12 rounded-full bg-electric/30 flex items-center justify-center mr-4 text-xl font-bold text-white">
								{selectedChat.contactName.charAt(0).toUpperCase()}
							</div>
							<div>
								<h3 className="font-semibold text-white">
									{selectedChat.contactName}
								</h3>
								<div className="flex items-center space-x-2">
									<p className="text-sm text-white/60">{selectedChat.contactPhone}</p>
									<div className="flex space-x-2">
										{["OPEN", "pending", "closed"].map((status) => (
											<button
												key={status}
												onClick={() => handleStatusChange(status)}
												className={`
                          px-2 py-1 rounded-full text-xs font-medium transition-all
                          ${selectedChat.status === status
														? "bg-electric text-white"
														: "bg-deep/30 text-white/60 hover:bg-electric/20"
													}
                        `}
											>
												{status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
											</button>
										))}
									</div>
								</div>
							</div>
						</div>
						<motion.button
							whileHover={{ scale: 1.1 }}
							onClick={() => onOpenClientProfile(selectedChat)}
							className="text-white/70 hover:text-white"
						>
							<MoreVertical size={20} />
						</motion.button>
					</div>

					{/* Área de Mensagens */}
					<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-deep/10">
						{loadingMessages ? (
							<div className="space-y-4">
								{Array(3).fill(0).map((_, index) => (
									<div
										key={index}
										className={`flex ${index % 2 === 0 ? 'justify-end' : ''}`}
									>
										<Skeleton
											className={`rounded-2xl p-4 max-w-[80%] h-20 ${index % 2 === 0 ? 'bg-electric/20' : 'bg-deep/20'
												}`}
										/>
									</div>
								))}
							</div>
						) : messages.length === 0 ? (
							<div className="text-center text-white/50">
								Nenhuma mensagem ainda
							</div>
						) : (
							<div className="flex flex-col-reverse">
								{messages.map((message) => (
									<div
										key={message.id}
										className={`my-2 flex ${message.sender === "me" ? "justify-end" : "justify-start"
											}`}
									>
										<div
											className={`rounded-2xl p-4 max-w-[80%] ${message.sender === "me"
												? "bg-electric/80 text-white"
												: "bg-deep/40 text-white"
												}`}
										>
											<p>{message.content}</p>
											<div className="text-xs mt-1 opacity-70 text-right">
												{formatMessageTime(message.timestamp)}
												{message.sender === "me" && (
													<span className="ml-1">
														{message.status === "READ" ? "✓✓" : "✓"}
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
							value={messageInput}
							onChange={(e) => setMessageInput(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
							className="flex-1 bg-deep/30 rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-electric"
						/>
						<motion.button
							onClick={handleSendMessage}
							whileHover={{ scale: 1.1 }}
							className="bg-electric text-white p-2 rounded-full hover:bg-electric/80 transition-colors"
						>
							<Send size={20} />
						</motion.button>
					</div>
				</div>
			) : (
				<div className="flex-1 flex items-center justify-center text-white/50">
					Selecione uma conversa para iniciar
				</div>
			)}
		</div>
	);
};

export default WhatsAppCRM;
