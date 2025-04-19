// src/pages/CRM.tsx
import { motion } from "framer-motion";
import {
	BarChart2,
	FileText,
	MessageSquare,
	Plus,
	RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

// Import hooks de API
import { useCrmConversations, Conversation } from "@/hooks/useCrmConversations";

export default function CRMPage() {
	// Autenticação e Rota Protegida
	useProtectedRoute();

	const [activeTab, setActiveTab] = useState("whatsapp");
	const [isClientProfileSidebarOpen, setIsClientProfileSidebarOpen] = useState(false);
	const [selectedClientProfile, setSelectedClientProfile] = useState<any | null>(null);

	// Usando o hook para gerenciar conversas
	const {
		conversations,
		loading,
		fetchConversations,
		updateConversationStatus,
		updateConversationTags
	} = useCrmConversations();

	// Handlers
	const handleOpenClientProfile = (conversation: Conversation) => {
		setSelectedClientProfile({
			id: conversation.id,
			name: conversation.contactName,
			phone: conversation.contactPhone,
			tags: conversation.tags || []
			// Outros dados seriam carregados de uma API específica de cliente/contato
		});
		setIsClientProfileSidebarOpen(true);
	};

	const handleCloseClientProfile = () => {
		setIsClientProfileSidebarOpen(false);
		setSelectedClientProfile(null);
	};

	const handleUpdateClientProfile = (updatedClient: any) => {
		// Atualizar tags da conversa no backend
		if (updatedClient.tags) {
			updateConversationTags(updatedClient.id, updatedClient.tags);
		}
		setSelectedClientProfile(updatedClient);
	};

	const handleRefresh = () => {
		fetchConversations();
		toast.success("Atualizando conversas...");
	};

	// Tabs disponíveis
	const tabs = [
		{
			name: "whatsapp",
			icon: MessageSquare,
			label: "WhatsApp",
			component: (
				<WhatsAppCRM
					conversations={conversations}
					onUpdateStatus={updateConversationStatus}
					onOpenClientProfile={handleOpenClientProfile}
					loading={loading}
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
		OPEN: conversations.filter((conv) => conv.status === "OPEN").length,
		pending: conversations.filter((conv) => conv.status === "pending").length,
		closed: conversations.filter((conv) => conv.status === "closed").length,
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
                          ${status === "OPEN"
														? "bg-blue-500/20 text-blue-500"
														: status === "pending"
															? "bg-yellow-500/20 text-yellow-500"
															: "bg-green-500/20 text-green-500"
													}
                        `}
											>
												{count}{" "}
												{status.charAt(0).toUpperCase() + status.slice(1)}
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											{count} conversas com status {status.toLowerCase()}
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
									<Button
										variant="outline"
										className="rounded-full"
										onClick={handleRefresh}
										disabled={loading}
									>
										<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
                  ${activeTab === tab.name
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
