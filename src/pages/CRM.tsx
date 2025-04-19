// src/pages/CRM.tsx
import { motion, AnimatePresence } from "framer-motion";
import {
	BarChart2,
	FileText,
	MessageSquare,
	Plus,
	RefreshCw,
	Search,
	Bell,
	Filter,
	Users,
	Settings,
	HelpCircle,
	Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Hooks e Serviços
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

// Componentes de UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

	// Estados
	const [activeTab, setActiveTab] = useState("whatsapp");
	const [isClientProfileSidebarOpen, setIsClientProfileSidebarOpen] = useState(false);
	const [selectedClientProfile, setSelectedClientProfile] = useState<any | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [notificationsCount, setNotificationsCount] = useState(3);
	const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

	// Usando o hook para gerenciar conversas
	const {
		conversations,
		loading,
		filters,
		setFilters,
		fetchConversations,
		updateConversationStatus,
		updateConversationTags,
		markConversationAsRead,
	} = useCrmConversations();

	// Efeito para atualizar hora do último refresh
	useEffect(() => {
		setLastRefreshTime(new Date());
	}, [conversations]);

	// Handlers
	const handleOpenClientProfile = (conversation: Conversation) => {
		setSelectedClientProfile({
			id: conversation.id,
			name: conversation.contactName,
			phone: conversation.contactPhone,
			tags: conversation.tags || []
		});
		setIsClientProfileSidebarOpen(true);

		// Marcar a conversa como lida quando abrir o perfil
		markConversationAsRead(conversation.id);
	};

	const handleCloseClientProfile = () => {
		setIsClientProfileSidebarOpen(false);
		setSelectedClientProfile(null);
	};

	const handleUpdateClientProfile = (updatedClient: any) => {
		// Atualizar tags da conversa no backend
		if (updatedClient.tags) {
			updateConversationTags(updatedClient.id, updatedClient.tags);
			toast.success("Tags do cliente atualizadas com sucesso!");
		}
		setSelectedClientProfile(updatedClient);
	};

	const handleRefresh = () => {
		fetchConversations();
		setLastRefreshTime(new Date());
		toast.success("Atualizando conversas...", {
			description: "Buscando as conversas mais recentes"
		});
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setFilters({ ...filters, search: searchQuery });
		toast.info(`Pesquisando por "${searchQuery}"`);
	};

	const handleFilterChange = (status: string | null) => {
		setFilters({
			...filters,
			status: status || undefined,
			page: 1 // Resetar paginação ao mudar filtros
		});
		toast.info(`Filtro aplicado: ${status || 'Todos'}`);
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
			label: "Relatórios",
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
		"Em Atendimento": conversations.filter((conv) => conv.status === "OPEN").length,
		"Na Fila": conversations.filter((conv) => conv.status === "pending").length,
		"Resolvidos": conversations.filter((conv) => conv.status === "closed").length,
		"Não Lidos": conversations.filter((conv) => conv.unreadCount > 0).length,
	};

	// Formatação de tempo desde último refresh
	const getTimeAgo = () => {
		if (!lastRefreshTime) return "Nunca atualizado";

		const now = new Date();
		const diffMs = now.getTime() - lastRefreshTime.getTime();
		const diffSec = Math.floor(diffMs / 1000);

		if (diffSec < 60) return `há ${diffSec} segundos`;
		if (diffSec < 3600) return `há ${Math.floor(diffSec / 60)} minutos`;
		return `há ${Math.floor(diffSec / 3600)} horas`;
	};

	return (
		<TooltipProvider>
			<div className="flex h-full max-h-screen overflow-hidden">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className="container mx-auto px-2 pt-4 flex-grow overflow-hidden flex flex-col"
				>
					{/* Cabeçalho */}
					<motion.header
						className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4"
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
					>
						<div>
							<motion.h1
								className="text-2xl font-bold tracking-tight text-white flex items-center gap-2"
								initial={{ scale: 0.9 }}
								animate={{ scale: 1 }}
							>
								<MessageSquare className="text-electric h-7 w-7" />
								Central de Atendimento
								<Badge variant="outline" className="ml-2 bg-electric/10 text-electric border-electric/30">
									Pro
								</Badge>
							</motion.h1>
							<p className="text-muted-foreground text-sm mt-1">
								Gerencie suas conversas e atendimentos em um só lugar
							</p>
						</div>


						<div className="flex items-center gap-2 w-full sm:w-auto">
							{/* Notificações */}
							<Tooltip>
								<TooltipTrigger asChild>
									<Button size="icon" variant="outline" className="relative">
										<Bell className="h-5 w-5" />
										{notificationsCount > 0 && (
											<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
												{notificationsCount}
											</span>
										)}
									</Button>
								</TooltipTrigger>
								<TooltipContent>Notificações</TooltipContent>
							</Tooltip>

							{/* Menu de Configurações */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button size="icon" variant="outline">
										<Settings className="h-5 w-5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuLabel>Configurações</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem>
										<Users className="mr-2 h-4 w-4" /> Gerenciar Equipe
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Settings className="mr-2 h-4 w-4" /> Preferências
									</DropdownMenuItem>
									<DropdownMenuItem>
										<HelpCircle className="mr-2 h-4 w-4" /> Ajuda e Suporte
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</motion.header>

					{/* Separador de Status + Filtros */}
					<motion.div
						className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
					>
						{/* Status Cards */}
						<div className="md:col-span-8 flex flex-wrap gap-2 bg-deep/30 p-3 rounded-xl">
							{loading ? (
								<>
									<Skeleton className="h-10 w-[100px] rounded-full" />
									<Skeleton className="h-10 w-[100px] rounded-full" />
									<Skeleton className="h-10 w-[100px] rounded-full" />
								</>
							) : (
								Object.entries(statusCounts).map(([status, count]) => (
									<Tooltip key={status}>
										<TooltipTrigger asChild>
											<Button
												size="sm"
												variant="ghost"
												onClick={() => handleFilterChange(status)}
												className={`
                          rounded-full text-sm font-medium
                          ${status === "Em Atendimento"
														? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
														: status === "Na Fila"
															? "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
															: status === "Não Lidos"
																? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
																: "bg-green-500/20 text-green-300 hover:bg-green-500/30"
													}
                        `}
											>
												{count}{" "}{status}
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											Filtrar por {status.toLowerCase()}
										</TooltipContent>
									</Tooltip>
								))
							)}

							<Button
								size="sm"
								variant="ghost"
								className="rounded-full text-sm font-medium bg-white/10 text-white/70 hover:bg-white/20"
								onClick={() => handleFilterChange(null)}
							>
								Limpar Filtros
							</Button>
						</div>

						{/* Ações */}
						<div className="md:col-span-4 flex justify-end gap-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="gap-2">
										<Filter className="w-4 h-4" /> Filtros Avançados
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
									<DropdownMenuItem onClick={() => setFilters({ ...filters, sortBy: "lastMessageAt", sortOrder: "desc" })}>
										Mais recentes primeiro
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setFilters({ ...filters, sortBy: "lastMessageAt", sortOrder: "asc" })}>
										Mais antigos primeiro
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
									<DropdownMenuItem onClick={() => setFilters({ ...filters, status: "OPEN" })}>
										Em Atendimento
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setFilters({ ...filters, status: "pending" })}>
										Na Fila
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setFilters({ ...filters, status: "closed" })}>
										Resolvidos
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							<Tooltip>
								<TooltipTrigger asChild>
									<Button className="bg-electric hover:bg-electric/80 rounded-xl gap-2">
										<Plus className="w-5 h-5" /> Novo Atendimento
									</Button>
								</TooltipTrigger>
								<TooltipContent>Criar Novo Atendimento</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										className="rounded-xl relative"
										onClick={handleRefresh}
										disabled={loading}
									>
										<RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<div className="flex flex-col">
										<span>Atualizar Lista</span>
										<span className="text-xs text-muted-foreground flex items-center">
											<Clock className="w-3 h-3 mr-1" /> Última atualização: {getTimeAgo()}
										</span>
									</div>
								</TooltipContent>
							</Tooltip>
						</div>
					</motion.div>

					{/* Navegação de Tabs */}
					<motion.div
						className="mb-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						<Tabs
							defaultValue="whatsapp"
							value={activeTab}
							onValueChange={setActiveTab}
							className="w-full"
						>
							<TabsList className="grid w-full grid-cols-3 bg-deep/30 rounded-xl p-1">
								{tabs.map((tab) => (
									<TabsTrigger
										key={tab.name}
										value={tab.name}
										className="data-[state=active]:bg-electric data-[state=active]:shadow-sm rounded-lg flex items-center gap-2"
									>
										<tab.icon className="w-5 h-5" />
										<span className="hidden sm:inline">{tab.label}</span>
										{tab.name === "whatsapp" && statusCounts["Não Lidos"] > 0 && (
											<Badge className="bg-red-500 hover:bg-red-600 text-white">{statusCounts["Não Lidos"]}</Badge>
										)}
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</motion.div>

					{/* Conteúdo Dinâmico */}
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						className="flex-grow overflow-auto rounded-xl"
					>
						<AnimatePresence mode="wait">
							{tabs.find((tab) => tab.name === activeTab)?.component}
						</AnimatePresence>
					</motion.div>

					{/* Status de Carregamento */}
					{loading && (
						<div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-electric text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50">
							<RefreshCw className="w-4 h-4 animate-spin" />
							<span>Carregando conversas...</span>
						</div>
					)}
				</motion.div>

				{/* Sidebar de Perfil do Cliente */}
				<AnimatePresence>
					{isClientProfileSidebarOpen && selectedClientProfile && (
						<ClientProfileSidebar
							client={selectedClientProfile}
							onClose={handleCloseClientProfile}
							onUpdateClient={handleUpdateClientProfile}
						/>
					)}
				</AnimatePresence>
			</div>
		</TooltipProvider>
	);
}
