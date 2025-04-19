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
import { useState } from "react";

// Tipos e Interfaces (manter as mesmas do código anterior)
type ChatStatus = "fila" | "atendimento" | "resolvido";

interface SocialMedia {
	platform: string;
	username: string;
}

interface ClientProfile {
	id: string;
	name: string;
	phone: string;
	email: string;
	avatar?: string;
	tags?: string[];
	segment?: string;
	company?: string;
	socialMedia?: SocialMedia[];
	interactions?: Array<{
		type: "message" | "call" | "email";
		date: Date;
		content: string;
	}>;
}

interface ChatItem {
	id: string;
	clientName: string;
	phone: string;
	status: ChatStatus;
	lastMessage: string;
	timestamp: Date;
	avatar?: string;
	clientProfile?: ClientProfile;
}

interface WhatsAppCRMProps {
	chats: ChatItem[];
	onUpdateStatus: (chatId: string, newStatus: ChatStatus) => void;
	onOpenClientProfile: (client: ClientProfile) => void;
}

const WhatsAppCRM: React.FC<WhatsAppCRMProps> = ({
	chats,
	onUpdateStatus,
	onOpenClientProfile,
}) => {
	const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
	const [messageInput, setMessageInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	const filteredChats = chats.filter((chat) =>
		chat.clientName.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const renderStatusBadge = (status: ChatStatus) => {
		const statusColors = {
			fila: "bg-yellow-500/20 text-yellow-500",
			atendimento: "bg-blue-500/20 text-blue-500",
			resolvido: "bg-green-500/20 text-green-500",
		};

		return (
			<span
				className={`px-2 py-1 rounded-full text-xs ${statusColors[status]}`}
			>
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</span>
		);
	};

	const handleSendMessage = () => {
		if (messageInput.trim() && selectedChat) {
			// Implementar lógica de envio de mensagem
			setMessageInput("");
		}
	};

	const handleStatusChange = (newStatus: ChatStatus) => {
		if (selectedChat) {
			onUpdateStatus(selectedChat.id, newStatus);
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
					{filteredChats.map((chat) => (
						<motion.div
							key={chat.id}
							onClick={() => setSelectedChat(chat)}
							className={`
                flex items-center p-4 cursor-pointer transition-colors duration-200
                ${
									selectedChat?.id === chat.id
										? "bg-electric/20"
										: "hover:bg-electric/10"
								}
              `}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<img
								src={chat.avatar}
								alt={chat.clientName}
								className="w-12 h-12 rounded-full mr-4 object-cover"
							/>
							<div className="flex-1">
								<div className="flex justify-between items-center">
									<h3
										className="font-semibold text-white cursor-pointer"
										onClick={() => {
											if (chat.clientProfile) {
												onOpenClientProfile(chat.clientProfile);
											}
										}}
									>
										{chat.clientName}
									</h3>
									<span className="text-xs text-white/50">
										{chat.timestamp.toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<p className="text-sm text-white/60 truncate">
										{chat.lastMessage}
									</p>
									{renderStatusBadge(chat.status)}
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>

			{/* Área de Chat */}
			{selectedChat ? (
				<div className="flex-1 flex flex-col">
					{/* Cabeçalho do Chat */}
					<div className="flex justify-between items-center p-4 border-b border-electric/10">
						<div className="flex items-center">
							<img
								src={selectedChat.avatar}
								alt={selectedChat.clientName}
								className="w-12 h-12 rounded-full mr-4 object-cover"
							/>
							<div>
								<h3 className="font-semibold text-white">
									{selectedChat.clientName}
								</h3>
								<div className="flex items-center space-x-2">
									<p className="text-sm text-white/60">{selectedChat.phone}</p>
									<div className="flex space-x-2">
										{["fila", "atendimento", "resolvido"].map((status) => (
											<button
												key={status}
												onClick={() => handleStatusChange(status as ChatStatus)}
												className={`
                          px-2 py-1 rounded-full text-xs font-medium transition-all
                          ${
														selectedChat.status === status
															? "bg-electric text-white"
															: "bg-deep/30 text-white/60 hover:bg-electric/20"
													}
                        `}
											>
												{status.charAt(0).toUpperCase() + status.slice(1)}
											</button>
										))}
									</div>
								</div>
							</div>
						</div>

						<motion.button
							whileHover={{ scale: 1.1 }}
							onClick={() => {
								if (selectedChat.clientProfile) {
									onOpenClientProfile(selectedChat.clientProfile);
								}
							}}
							className="text-white/70 hover:text-white"
						>
							<MoreVertical size={20} />
						</motion.button>
					</div>

					{/* Área de Mensagens */}
					<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-deep/10">
						<div className="text-center text-white/50">
							Nenhuma mensagem ainda
						</div>
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
