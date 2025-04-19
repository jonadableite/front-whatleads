import { motion } from "framer-motion";
import {
	Filter,
	MoreVertical,
	Paperclip,
	Phone,
	Search,
	Send,
	Smile,
	Video,
} from "lucide-react";
// src/components/CRM/ChatCRM.tsx
import type React from "react";
import { useState } from "react";

// Tipos de dados
interface Conversation {
	id: string;
	lead: {
		name: string;
		avatar: string;
		lastSeen: Date;
	};
	messages: Message[];
	unreadCount: number;
}

interface Message {
	id: string;
	content: string;
	sender: "lead" | "agent";
	timestamp: Date;
}

const ChatCRM: React.FC = () => {
	// Estados
	const [conversations, setConversations] = useState<Conversation[]>([
		{
			id: "1",
			lead: {
				name: "João Silva",
				avatar: "https://exemplo.com/avatar1.jpg",
				lastSeen: new Date(),
			},
			messages: [
				{
					id: "m1",
					content: "Olá, gostaria de saber mais sobre seus serviços",
					sender: "lead",
					timestamp: new Date(),
				},
			],
			unreadCount: 1,
		},
		// Mais conversas...
	]);

	const [activeConversation, setActiveConversation] =
		useState<Conversation | null>(conversations[0] || null);

	const [newMessage, setNewMessage] = useState("");

	// Função para enviar mensagem
	const sendMessage = () => {
		if (!newMessage.trim() || !activeConversation) return;

		const message: Message = {
			id: `m${activeConversation.messages.length + 1}`,
			content: newMessage,
			sender: "agent",
			timestamp: new Date(),
		};

		const updatedConversations = conversations.map((conv) =>
			conv.id === activeConversation.id
				? { ...conv, messages: [...conv.messages, message] }
				: conv,
		);

		setConversations(updatedConversations);
		setNewMessage("");
		setActiveConversation(
			updatedConversations.find((conv) => conv.id === activeConversation.id) ||
				null,
		);
	};

	return (
		<div className="flex h-[calc(100vh-120px)] bg-deep/50 rounded-xl overflow-hidden">
			{/* Lista de Conversas */}
			<div className="w-80 border-r border-electric/20 bg-deep/30">
				<div className="p-4 border-b border-electric/20">
					<div className="flex items-center space-x-2 bg-deep/50 rounded-lg px-3 py-2">
						<Search className="text-white/50" size={18} />
						<input
							type="text"
							placeholder="Buscar conversas"
							className="bg-transparent text-white w-full focus:outline-none"
						/>
						<Filter className="text-white/50" size={18} />
					</div>
				</div>

				{conversations.map((conv) => (
					<motion.div
						key={conv.id}
						onClick={() => setActiveConversation(conv)}
						className={`
              flex items-center p-4 cursor-pointer
              ${
								activeConversation?.id === conv.id
									? "bg-electric/20"
									: "hover:bg-electric/10"
							}
            `}
					>
						<div className="relative">
							<img
								src={conv.lead.avatar}
								alt={conv.lead.name}
								className="w-12 h-12 rounded-full mr-4"
							/>
							{conv.unreadCount > 0 && (
								<span className="absolute top-0 right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
									{conv.unreadCount}
								</span>
							)}
						</div>
						<div className="flex-1">
							<h3 className="font-semibold text-white">{conv.lead.name}</h3>
							<p className="text-sm text-white/60 truncate">
								{conv.messages[conv.messages.length - 1]?.content}
							</p>
						</div>
						<span className="text-xs text-white/50">
							{conv.lead.lastSeen.toLocaleTimeString()}
						</span>
					</motion.div>
				))}
			</div>

			{/* Área de Chat */}
			{activeConversation ? (
				<div className="flex-1 flex flex-col">
					{/* Cabeçalho da Conversa */}
					<div className="flex justify-between items-center p-4 border-b border-electric/20">
						<div className="flex items-center">
							<img
								src={activeConversation.lead.avatar}
								alt={activeConversation.lead.name}
								className="w-10 h-10 rounded-full mr-4"
							/>
							<div>
								<h3 className="font-semibold text-white">
									{activeConversation.lead.name}
								</h3>
								<p className="text-sm text-white/60">Online</p>
							</div>
						</div>
						<div className="flex space-x-4">
							<button className="text-white/70 hover:text-white">
								<Phone size={20} />
							</button>
							<button className="text-white/70 hover:text-white">
								<Video size={20} />
							</button>
							<button className="text-white/70 hover:text-white">
								<MoreVertical size={20} />
							</button>
						</div>
					</div>

					{/* Mensagens */}
					<div className="flex-1 overflow-y-auto p-4 space-y-4">
						{activeConversation.messages.map((msg) => (
							<div
								key={msg.id}
								className={`flex ${
									msg.sender === "agent" ? "justify-end" : "justify-start"
								}`}
							>
								<div
									className={`
                    max-w-[70%] px-4 py-2 rounded-2xl
                    ${
											msg.sender === "agent"
												? "bg-electric text-white"
												: "bg-deep/30 text-white"
										}
                  `}
								>
									{msg.content}
									<div className="text-xs text-white/50 text-right mt-1">
										{msg.timestamp.toLocaleTimeString()}
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Barra de Envio */}
					<div className="p-4 border-t border-electric/20 flex items-center space-x-2">
						<button className="text-white/70 hover:text-white">
							<Paperclip size={20} />
						</button>
						<button className="text-white/70 hover:text-white">
							<Smile size={20} />
						</button>
						<input
							type="text"
							placeholder="Digite sua mensagem..."
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && sendMessage()}
							className="flex-1 bg-deep/30 rounded-full px-4 py-2 text-white focus:outline-none"
						/>
						<button
							onClick={sendMessage}
							className="bg-electric text-white rounded-full p-2 hover:bg-electric/80"
						>
							<Send size={20} />
						</button>
					</div>
				</div>
			) : (
				<div className="flex-1 flex items-center justify-center text-white/50">
					Selecione uma conversa
				</div>
			)}
		</div>
	);
};

export default ChatCRM;
