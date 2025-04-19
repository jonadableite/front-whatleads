import { motion } from "framer-motion";
import {
	BarChart2,
	FileText,
	MessageSquare,
	Plus,
	RefreshCw,
} from "lucide-react";
// src/pages/CRM.tsx
import { useState } from "react";

// Hooks e Serviços
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

// Componentes de UI
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

// Componentes CRM
import ClientProfileSidebar from "@/components/CRM/ClientProfileSidebar";
import DocumentManager from "@/components/CRM/DocumentManager";
import PerformanceAnalytics from "@/components/CRM/PerformanceAnalytics";
import WhatsAppCRM from "@/components/CRM/WhatsAppCRM";

// Tipos
type ChatStatus = "fila" | "atendimento" | "resolvido";

// Interfaces
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
	address?: string;
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

export default function CRMPage() {
	// Autenticação e Rota Protegida
	const isAuthenticated = useProtectedRoute();
	const [activeTab, setActiveTab] = useState("whatsapp");
	const [selectedClientProfile, setSelectedClientProfile] =
		useState<ClientProfile | null>(null);
	const [isClientProfileSidebarOpen, setIsClientProfileSidebarOpen] =
		useState(false);

	// Estado de chats simulados com perfis de cliente expandidos
	const [chats, setChats] = useState<ChatItem[]>([
		{
			id: "1",
			clientName: "João Silva",
			phone: "+55 (11) 99999-9999",
			status: "fila",
			lastMessage: "Preciso de um orçamento",
			timestamp: new Date(),
			avatar: "https://exemplo.com/avatar1.jpg",
			clientProfile: {
				id: "1",
				name: "João Silva",
				phone: "+55 (11) 99999-9999",
				email: "joao.silva@email.com",
				tags: ["Prospect", "Pequena Empresa"],
				segment: "Tecnologia",
				company: "Startup Tech",
				socialMedia: [{ platform: "LinkedIn", username: "joaosilva" }],
				interactions: [
					{
						type: "message",
						date: new Date(),
						content: "Primeiro contato sobre orçamento",
					},
				],
			},
		},
		{
			id: "2",
			clientName: "Paulo Silva",
			phone: "+55 (11) 95599-2299",
			status: "fila",
			lastMessage: "Preciso de um orçamento",
			timestamp: new Date(),
			avatar: "https://exemplo.com/avatar1.jpg",
			clientProfile: {
				id: "2",
				name: "Paulo Silva",
				phone: "+55 (11) 95599-2299",
				email: "paulo.silva@email.com",
				tags: ["Prospect", "Pequena Empresa"],
				segment: "Tecnologia",
				company: "Startup Tech",
				socialMedia: [{ platform: "LinkedIn", username: "joaosilva" }],
				interactions: [
					{
						type: "message",
						date: new Date(),
						content: "Primeiro contato sobre orçamento",
					},
				],
			},
		},
		{
			id: "3",
			clientName: "Brayan Leite",
			phone: "+55 (11) 98888-9223",
			status: "fila",
			lastMessage: "Preciso de um orçamento",
			timestamp: new Date(),
			avatar: "https://exemplo.com/avatar1.jpg",
			clientProfile: {
				id: "3",
				name: "Brayan Silva",
				phone: "+55 (11) 98888-9223",
				email: "brayan.silva@email.com",
				tags: ["Prospect", "Pequena Empresa"],
				segment: "Tecnologia",
				company: "Startup Tech",
				socialMedia: [{ platform: "LinkedIn", username: "joaosilva" }],
				interactions: [
					{
						type: "message",
						date: new Date(),
						content: "Primeiro contato sobre orçamento",
					},
				],
			},
		},
		{
			id: "4",
			clientName: "Fernando Silva",
			phone: "+55 (11) 94499-9329",
			status: "fila",
			lastMessage: "Preciso de um orçamento",
			timestamp: new Date(),
			avatar: "https://exemplo.com/avatar1.jpg",
			clientProfile: {
				id: "4",
				name: "Fernando Silva",
				phone: "+55 (11) 94499-9329",
				email: "fernando.silva@email.com",
				tags: ["Prospect", "Pequena Empresa"],
				segment: "Tecnologia",
				company: "Startup Tech",
				socialMedia: [{ platform: "LinkedIn", username: "joaosilva" }],
				interactions: [
					{
						type: "message",
						date: new Date(),
						content: "Primeiro contato sobre orçamento",
					},
				],
			},
		},
		{
			id: "5",
			clientName: "Neymar Silva",
			phone: "+55 (11) 98979-9799",
			status: "fila",
			lastMessage: "Preciso de um orçamento",
			timestamp: new Date(),
			avatar: "https://exemplo.com/avatar1.jpg",
			clientProfile: {
				id: "5",
				name: "Neymar Silva",
				phone: "+55 (11) 98979-9799",
				email: "neymar.silva@email.com",
				tags: ["Prospect", "Pequena Empresa"],
				segment: "Tecnologia",
				company: "Startup Tech",
				socialMedia: [{ platform: "LinkedIn", username: "joaosilva" }],
				interactions: [
					{
						type: "message",
						date: new Date(),
						content: "Primeiro contato sobre orçamento",
					},
				],
			},
		},
	]);

	// Funções de gerenciamento
	const updateChatStatus = (chatId: string, newStatus: ChatStatus) => {
		setChats(
			chats.map((chat) =>
				chat.id === chatId ? { ...chat, status: newStatus } : chat,
			),
		);
	};

	const handleOpenClientProfile = (client: ClientProfile) => {
		setSelectedClientProfile(client);
		setIsClientProfileSidebarOpen(true);
	};

	const handleCloseClientProfile = () => {
		setIsClientProfileSidebarOpen(false);
		setSelectedClientProfile(null);
	};

	const handleUpdateClientProfile = (updatedClient: ClientProfile) => {
		// Atualizar perfil do cliente
		setChats(
			chats.map((chat) =>
				chat.clientProfile?.id === updatedClient.id
					? { ...chat, clientProfile: updatedClient }
					: chat,
			),
		);
		setSelectedClientProfile(updatedClient);
	};

	// Tabs disponíveis
	const tabs = [
		{
			name: "whatsapp",
			icon: MessageSquare,
			label: "WhatsApp",
			component: (
				<WhatsAppCRM
					chats={chats}
					onUpdateStatus={updateChatStatus}
					onOpenClientProfile={handleOpenClientProfile}
				/>
			),
		},
		{
			name: "analytics",
			icon: BarChart2,
			label: "Analytics",
			component: <PerformanceAnalytics />,
		},
		{
			name: "documents",
			icon: FileText,
			label: "Documentos",
			component: <DocumentManager />,
		},
	];

	// Contadores de status
	const statusCounts = {
		fila: chats.filter((chat) => chat.status === "fila").length,
		atendimento: chats.filter((chat) => chat.status === "atendimento").length,
		resolvido: chats.filter((chat) => chat.status === "resolvido").length,
	};

	return (
		<TooltipProvider>
			<div className="flex">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className="container mx-auto px-2 pt-4 flex-grow"
				>
					{/* Cabeçalho */}
					<motion.header
						className="flex justify-between items-center mb-4"
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
					>
						<div>
							<motion.h1
								className="text-2xl font-bold tracking-tight text-white"
								initial={{ scale: 0.9 }}
								animate={{ scale: 1 }}
							>
								Painel de Atendimento
							</motion.h1>
						</div>
						{/* Ações Principais */}
						<div className="flex space-x-2">
							{/* Status dos Chats */}
							<div className="flex space-x-2 bg-deep/30 rounded-full p-1">
								{Object.entries(statusCounts).map(([status, count]) => (
									<Tooltip key={status}>
										<TooltipTrigger asChild>
											<Button
												size="sm"
												variant="ghost"
												className={`
                          rounded-full
                          ${
														status === "fila"
															? "bg-yellow-500/20 text-yellow-500"
															: status === "atendimento"
																? "bg-blue-500/20 text-blue-500"
																: "bg-green-500/20 text-green-500"
													}
                        `}
											>
												{count}{" "}
												{status.charAt(0).toUpperCase() + status.slice(1)}
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											{count} chats em {status}
										</TooltipContent>
									</Tooltip>
								))}
							</div>
							{/* Botões de Ação */}
							<Tooltip>
								<TooltipTrigger asChild>
									<Button className="bg-electric hover:bg-electric/80 rounded-full">
										<Plus className="mr-2" /> Novo Lead
									</Button>
								</TooltipTrigger>
								<TooltipContent>Adicionar Novo Lead</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="outline" className="rounded-full">
										<RefreshCw className="w-4 h-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Atualizar Lista</TooltipContent>
							</Tooltip>
						</div>
					</motion.header>
					{/* Navegação de Tabs */}
					<motion.nav
						className="flex space-x-2 bg-deep/30 rounded-full p-1 mb-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
					>
						{tabs.map((tab) => (
							<motion.button
								key={tab.name}
								onClick={() => setActiveTab(tab.name)}
								className={`
                  flex items-center space-x-2 px-4 py-2 rounded-full
                  transition-all duration-300 relative
                  ${
										activeTab === tab.name
											? "text-white bg-electric shadow-lg"
											: "text-white/60 hover:text-white"
									}
                `}
							>
								<tab.icon className="w-5 h-5" />
								<span className="hidden md:block">{tab.label}</span>
							</motion.button>
						))}
					</motion.nav>
					{/* Conteúdo Dinâmico */}
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						{tabs.find((tab) => tab.name === activeTab)?.component}
					</motion.div>
				</motion.div>

				{/* Sidebar de Perfil do Cliente */}
				{isClientProfileSidebarOpen && selectedClientProfile && (
					<ClientProfileSidebar
						client={selectedClientProfile}
						onClose={handleCloseClientProfile}
						onUpdateClient={handleUpdateClientProfile}
					/>
				)}
			</div>
		</TooltipProvider>
	);
}
