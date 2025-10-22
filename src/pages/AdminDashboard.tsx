import CustomDatePicker from "@/components/CustomDatePicker";
import EditPaymentModal from "@/components/EditPaymentModal";
import { UserManagementModal } from "@/components/admin/UserManagementModal";
import { BarChart, LineChart } from "@/components/charts";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/button";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import { toast } from "react-toastify";
import type { Affiliate, DashboardData, Payment } from "@/interface";
import { hotmartService, type HotmartCustomer, type HotmartStats } from "@/services/hotmart.service";
import api from "@/lib/api";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, CheckCircle, DollarSign, Download, Edit2, FileText, MessageSquare, PlusCircle, RefreshCw, Tag, TrendingUp, User, Users, X, XCircle } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

// Constants
const API_URL = import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br";

// Animation variants
const animations = {
	container: {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6, staggerChildren: 0.1 },
		},
	},
	item: {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	},
};

// Components
const StatCard = ({ icon: Icon, title, value }: { icon: React.ComponentType<{ className?: string }>; title: string; value: string | number }) => (
	<motion.div
		variants={animations.item}
		className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric shadow-lg hover:shadow-electric transition-all duration-300"
	>
		<div className="flex items-center mb-4">
			<div className="p-2 bg-electric/10 rounded-lg">
				<Icon className="text-electric w-6 h-6" />
			</div>
			<span className="text-2xl font-bold text-white">{value}</span>
		</div>
		<h3 className="text-lg text-white">{title}</h3>
	</motion.div>
);

// Função auxiliar para formatar valores monetários
const formatCurrency = (value: number) => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
};

// Main Component
export default function AdminDashboard() {
	const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [showAddUserModal, setShowAddUserModal] = useState(false);

	// Estados para Hotmart
	const [hotmartCustomers, setHotmartCustomers] = useState<HotmartCustomer[]>([]);
	const [hotmartLoading, setHotmartLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<'dashboard' | 'hotmart' | 'users'>('dashboard');
	const [hotmartFilters, setHotmartFilters] = useState({
		page: 1,
		limit: 10,
		search: '',
		status: '',
		paymentStatus: '',
	});

	// Estados para Gerenciamento de Usuários
	const [allUsers, setAllUsers] = useState<any[]>([]);
	const [usersLoading, setUsersLoading] = useState(false);
	const [editingUser, setEditingUser] = useState<any | null>(null);
	const [usersFilters, setUsersFilters] = useState({
		page: 1,
		limit: 50,
		search: '',
		plan: '',
		status: '',
		trialOnly: false,
		expiringSoon: false,
	});
	const [usersPagination, setUsersPagination] = useState({
		page: 1,
		limit: 50,
		total: 0,
		totalPages: 0,
	});

	// Estados para Modal de Criação de Pagamento
	const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
	const [selectedUserForPayment, setSelectedUserForPayment] = useState<any | null>(null);
	const [paymentForm, setPaymentForm] = useState({
		amount: '',
		dueDate: '',
		plan: 'basic'
	});

	// SWR para dados do dashboard
	const { data, error: dashboardError, isLoading, mutate: mutateDashboard } = useSWR<DashboardData>(
		'/api/admin/dashboard',
		fetcher
	);

	// SWR para afiliados
	const { data: affiliates = [], error: affiliatesError, mutate: mutateAffiliates } = useSWR<Affiliate[]>(
		'/api/admin/affiliates',
		fetcher
	);

	// SWR para cadastros de usuários
	const { data: userSignupsData = [], error: signupsError, mutate: mutateSignups } = useSWR<{ date: string; count: number }[]>(
		'/api/admin/user-signups',
		fetcher
	);

	// SWR para receita por dia
	const { data: revenueData = [], error: revenueError, mutate: mutateRevenue } = useSWR<{ date: string; amount: number }[]>(
		'/api/admin/revenue-by-day',
		fetcher
	);

	// SWR para estatísticas Hotmart
	const { data: hotmartStats, error: hotmartStatsError, mutate: mutateHotmartStats } = useSWR<HotmartStats>(
		'/hotmart/stats',
		async () => {
			try {
				return await hotmartService.getCustomerStats();
			} catch (error) {
				console.error("Erro ao buscar estatísticas Hotmart:", error);
				toast.error("Erro ao carregar estatísticas Hotmart.");
				return {
					totalCustomers: 0,
					activeCustomers: 0,
					totalRevenue: 0,
					churnRate: 0
				};
			}
		}
	);

	// Processar dados de cadastros de usuários
	const userSignups = userSignupsData
		.map((item) => ({
			...item,
			date: new Date(item.date),
		}))
		.filter((item) => !isNaN(item.date.getTime()))
		.sort((a, b) => a.date.getTime() - b.date.getTime());

	// Processar dados de receita por dia
	const revenueByDay = revenueData
		.map((item) => ({
			...item,
			date: item.date.split("T")[0], // Pega apenas a parte da data
		}))
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	// Função para formatar datas
	const formatDate = (dateString: string | null | undefined) => {
		if (!dateString) return "N/A";
		try {
			const date = new Date(dateString);
			if (isNaN(date.getTime())) {
				throw new Error("Invalid date");
			}
			return format(date, "dd/MM/yyyy", { locale: ptBR });
		} catch (error) {
			console.error("Error formatting date:", dateString, error);
			return "Data inválida";
		}
	};

	// Formatar dados de cadastros de usuários para exibição
	const formattedUserSignups = userSignups.map((item) => ({
		...item,
		date: formatDate(item.date.toString()),
	}));

	// Funções para Hotmart
	const fetchHotmartCustomers = async () => {
		setHotmartLoading(true);
		try {
			const response = await hotmartService.getCustomers(hotmartFilters);
			if (response && response.customers) {
				setHotmartCustomers(response.customers);
			} else {
				console.warn("Resposta inesperada da API Hotmart:", response);
				setHotmartCustomers([]);
			}
		} catch (error: unknown) {
			console.error("Erro ao buscar clientes Hotmart:", error);
			toast.error("Erro ao carregar clientes Hotmart.");
			setHotmartCustomers([]);
		} finally {
			setHotmartLoading(false);
		}
	};

	const handleSyncHotmart = async () => {
		try {
			toast.info("Iniciando sincronização com Hotmart...");
			const result = await hotmartService.syncWithHotmart();
			const syncedCount = result?.syncedCount || 0;

			toast.success(`Sincronização concluída! ${syncedCount} registros sincronizados.`);
			mutateHotmartStats(); // Revalida estatísticas
			fetchHotmartCustomers(); // Recarrega clientes
		} catch (error: unknown) {
			console.error("Erro na sincronização Hotmart:", error);
			toast.error("Erro na sincronização com Hotmart.");
		}
	};

	const handleExportHotmart = async () => {
		try {
			toast.info("Gerando exportação...");
			const csvData = await hotmartService.exportCustomers(hotmartFilters);

			// Criar e baixar arquivo CSV
			const blob = new Blob([csvData], { type: 'text/csv' });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `hotmart-customers-${new Date().toISOString().split('T')[0]}.csv`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);

			toast.success("Exportação concluída!");
		} catch (error: unknown) {
			console.error("Erro na exportação:", error);
			toast.error("Erro ao exportar dados.");
		}
	};

	// Funções para Gerenciamento de Usuários
	const fetchAllUsers = async () => {
		setUsersLoading(true);
		try {
			const queryParams = new URLSearchParams({
				page: usersFilters.page.toString(),
				limit: usersFilters.limit.toString(),
				...(usersFilters.search && { search: usersFilters.search }),
				...(usersFilters.plan && { plan: usersFilters.plan }),
				...(usersFilters.status && { status: usersFilters.status }),
				trialOnly: usersFilters.trialOnly.toString(),
				expiringSoon: usersFilters.expiringSoon.toString(),
			});

			const response = await api.get(`/api/subscription/admin/users?${queryParams}`);

			if (response.data.success) {
				setAllUsers(response.data.data.users);
				setUsersPagination(response.data.data.pagination);
			} else {
				toast.error("Erro ao carregar usuários");
			}
		} catch (error) {
			console.error("Erro ao buscar usuários:", error);
			toast.error("Erro ao carregar usuários");
		} finally {
			setUsersLoading(false);
		}
	};

	const handleUpdateUser = async (userId: string, data: any) => {
		try {
			const response = await api.put(`/api/subscription/admin/users/${userId}`, data);

			if (response.data.success) {
				toast.success("Usuário atualizado com sucesso!");
				fetchAllUsers(); // Recarregar lista
				setEditingUser(null);
			} else {
				toast.error(response.data.error || "Erro ao atualizar usuário");
			}
		} catch (error) {
			console.error("Erro ao atualizar usuário:", error);
			toast.error("Erro ao atualizar usuário");
		}
	};

	// Funções para gerenciamento de pagamentos
	const handleConfirmPayment = async (userId: string, paymentId: string) => {
		try {
			const response = await api.post(`/api/subscription/admin/users/${userId}/payments/${paymentId}/confirm`);

			if (response.data.success) {
				toast.success("Pagamento confirmado! Assinatura ativada.");
				fetchAllUsers(); // Recarregar lista de usuários
				mutateDashboard(); // Recarregar dados do dashboard
			} else {
				toast.error(response.data.error || "Erro ao confirmar pagamento");
			}
		} catch (error) {
			console.error("Erro ao confirmar pagamento:", error);
			toast.error("Erro ao confirmar pagamento");
		}
	};

	const handleCancelPayment = async (userId: string, paymentId: string) => {
		try {
			const response = await api.post(`/api/subscription/admin/users/${userId}/payments/${paymentId}/cancel`);

			if (response.data.success) {
				toast.success("Pagamento cancelado com sucesso!");
				fetchAllUsers(); // Recarregar lista de usuários
				mutateDashboard(); // Recarregar dados do dashboard
			} else {
				toast.error(response.data.error || "Erro ao cancelar pagamento");
			}
		} catch (error) {
			console.error("Erro ao cancelar pagamento:", error);
			toast.error("Erro ao cancelar pagamento");
		}
	};

	const handleCreatePayment = (user: any) => {
		setSelectedUserForPayment(user);
		setPaymentForm({
			amount: user.plan === 'premium' ? '99' : '49', // valor padrão baseado no plano
			dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
			plan: user.plan || 'basic'
		});
		setShowCreatePaymentModal(true);
	};

	const handleSubmitCreatePayment = async () => {
		if (!selectedUserForPayment) return;

		try {
			const amountInCents = Math.round(parseFloat(paymentForm.amount) * 100); // converter para centavos
			const dueDate = new Date(paymentForm.dueDate);

			const response = await api.post(`/api/subscription/admin/users/${selectedUserForPayment.id}/payments`, {
				amount: amountInCents,
				dueDate: dueDate.toISOString(),
				plan: paymentForm.plan
			});

			if (response.data.success) {
				toast.success("Novo pagamento criado com sucesso!");
				fetchAllUsers(); // Recarregar lista de usuários
				mutateDashboard(); // Recarregar dados do dashboard
				setShowCreatePaymentModal(false);
				setSelectedUserForPayment(null);
			} else {
				toast.error(response.data.error || "Erro ao criar pagamento");
			}
		} catch (error) {
			console.error("Erro ao criar pagamento:", error);
			toast.error("Erro ao criar pagamento");
		}
	};

	// Processamento dos dados para o gráfico
	const processedRevenueByDay = revenueByDay.map((item) => ({
		date: item.date,
		count: item.amount, // Adiciona a propriedade count
		completed: item.amount, // Se precisar de múltiplas séries
		pending: 0,
		overdue: 0,
	}));

	if (isLoading) {
		return <div>Loading...</div>; // Exiba um carregando ou um esqueleto
	}

	const handleEditPayment = (payment: Payment) => {
		setEditingPayment(payment);
	};

	const handleUpdatePayment = async (
		paymentId: string,
		updatedData: Partial<Payment>,
	) => {
		try {
			await api.put(`/api/payments/${paymentId}`, updatedData);

			toast.success("Pagamento atualizado com sucesso");

			mutateDashboard(); // Recarregar os dados
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
			toast.error(`Erro ao atualizar pagamento: ${errorMessage}`);
		}
	};

	const handleAddUser = async (formData: FormData) => {
		try {
			// Solução para conversão de FormData
			const userData: Record<string, string> = {};
			formData.forEach((value, key) => {
				userData[key] = value.toString();
			});

			await api.post(`/api/admin/users`, userData);

			toast.success("Usuário cadastrado com sucesso");
			setShowAddUserModal(false);
			mutateDashboard();
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
			toast.error(`Erro ao cadastrar usuário: ${errorMessage}`);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-deep to-neon-purple/10 p-8">
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-32 bg-deep/80 mb-4" />
				))}
			</div>
		);
	}

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={animations.container}
			className="min-h-screen bg-gradient-to-br from-deep to-neon-purple/10 p-8"
		>
			<h1 className="text-3xl font-bold text-white mb-4">
				Painel de Administração
			</h1>

			{/* Tabs de navegação */}
			<div className="flex space-x-4 mb-6">
				<button
					onClick={() => setActiveTab('dashboard')}
					className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'dashboard'
						? 'bg-electric text-white'
						: 'bg-deep/60 text-gray-300 hover:bg-deep/80'
						}`}
				>
					Dashboard Geral
				</button>
				<button
					onClick={() => {
						setActiveTab('users');
						fetchAllUsers();
					}}
					className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'users'
						? 'bg-electric text-white'
						: 'bg-deep/60 text-gray-300 hover:bg-deep/80'
						}`}
				>
					📋 Gerenciar Usuários
				</button>
				<button
					onClick={() => setActiveTab('hotmart')}
					className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'hotmart'
						? 'bg-electric text-white'
						: 'bg-deep/60 text-gray-300 hover:bg-deep/80'
						}`}
				>
					Clientes Hotmart
				</button>
			</div>

			{activeTab === 'dashboard' && (
				<>
					<div className="mb-6">
						<CustomDatePicker
							selectedDate={selectedDate}
							onChange={setSelectedDate}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
						<StatCard
							icon={User}
							title="Total de Usuários"
							value={data?.totalUsers || 0}
						/>
						<StatCard
							icon={DollarSign}
							title="Total de Faturamento"
							value={formatCurrency(data?.totalRevenue || 0)}
						/>
						<StatCard
							icon={DollarSign}
							title="Faturamento com Descontos"
							value={formatCurrency(data?.revenueWithDiscount || 0)}
						/>
						<StatCard
							icon={Calendar}
							title="Pagamentos Vencidos"
							value={data?.overduePayments || 0}
						/>
						<StatCard
							icon={Calendar}
							title="Pagamentos Pendentes"
							value={formatCurrency(data?.pendingPaymentsTotal || 0)}
						/>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
						<motion.div
							variants={animations.item}
							className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric"
						>
							<h2 className="text-2xl font-bold text-white mb-6">
								Cadastros de Usuários
							</h2>
							<BarChart
								data={formattedUserSignups}
								xKey="date"
								yKey="count"
								fill="#7c3aed"
							/>
						</motion.div>

						<motion.div
							variants={animations.item}
							className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric"
						>
							<h2 className="text-2xl font-bold text-white mb-6">
								Faturamento por Dia
							</h2>
							{revenueByDay.length > 0 ? (
								<LineChart
									data={processedRevenueByDay}
									xKey="date"
									yKeys={["completed", "pending", "overdue"]}
									colors={["#19eb4e", "#fbbf24", "#ef4444"]}
								/>
							) : (
								<div className="text-white">
									Sem dados de faturamento disponíveis
								</div>
							)}
						</motion.div>
					</div>

					<div className="flex justify-between items-center mb-4">
						<h2 className="text-2xl font-bold text-white">Pagamentos Próximos</h2>
						<button
							onClick={() => setShowAddUserModal(true)}
							className="flex items-center bg-electric text-white px-4 py-2 rounded-md hover:bg-electric/80 transition"
						>
							<PlusCircle className="w-5 h-5 mr-2" />
							Adicionar Usuário
						</button>
					</div>

					<motion.div
						className="bg-deep/90 backdrop-blur-2xl rounded-2xl border border-electric/40 overflow-hidden shadow-2xl"
						variants={animations.item}
					>
						{data?.usersWithDuePayments && data.usersWithDuePayments.length > 0 ? (
							<Table className="[&_tr:hover]:!bg-transparent">
								<Thead>
									<Tr className="bg-electric/20">
										<Th className="text-electric font-bold">Nome</Th>
										<Th className="text-electric font-bold">Email</Th>
										<Th className="text-electric font-bold">Plano</Th>
										<Th className="text-electric font-bold">Valor</Th>
										<Th className="text-electric font-bold">Vencimento</Th>
										<Th className="text-electric font-bold">Status</Th>
										<Th className="text-electric font-bold">Afiliado</Th>
										<Th className="text-electric font-bold">Ações</Th>
									</Tr>
								</Thead>
								<Tbody className="[&_tr:hover]:bg-transparent">
									{data?.usersWithDuePayments &&
										[...data.usersWithDuePayments]
											.sort((a, b) => {
												const dateA = a.payments[0]?.dueDate
													? new Date(a.payments[0].dueDate).getTime()
													: 0;
												const dateB = b.payments[0]?.dueDate
													? new Date(b.payments[0].dueDate).getTime()
													: 0;
												return isNaN(dateA) || isNaN(dateB) ? 0 : dateA - dateB;
											})

											.map((user) => (
												<Tr key={user.id} className="hover:bg-electric/10">
													<Td className="font-medium">{user.name}</Td>
													<Td>{user.email}</Td>
													<Td>{user.plan}</Td>
													<Td>{formatCurrency(user.payments[0]?.amount || 0)}</Td>
													<Td>{formatDate(user.payments[0]?.dueDate)}</Td>
													<Td>
														<PaymentStatus
															dueDate={user.payments[0]?.dueDate}
															status={user.payments[0]?.status}
														/>
													</Td>
													<Td>{user.affiliate?.name || "Nenhum"}</Td>
													<Td>
														<div className="flex gap-2">
															<Button
																size="sm"
																variant="ghost"
																className="hover:bg-electric/30 hover:text-electric transition-all duration-200"
																onClick={() => handleEditPayment(user.payments[0])}
															>
																<Edit2 className="w-4 h-4 mr-1" />
																Editar
															</Button>
														</div>
													</Td>
												</Tr>
											))}
								</Tbody>
							</Table>
						) : (
							<div className="text-white text-center py-4">
								Nenhum pagamento pendente
							</div>
						)}
					</motion.div>
				</>
			)}

			{activeTab === 'hotmart' && (
				<>
					{/* Estatísticas Hotmart */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						<StatCard
							icon={Users}
							title="Total de Clientes"
							value={hotmartStats?.totalCustomers || 0}
						/>
						<StatCard
							icon={TrendingUp}
							title="Clientes Ativos"
							value={hotmartStats?.activeCustomers || 0}
						/>
						<StatCard
							icon={DollarSign}
							title="Receita Total"
							value={formatCurrency(hotmartStats?.totalRevenue || 0)}
						/>
						<StatCard
							icon={TrendingUp}
							title="Taxa de Churn"
							value={`${(hotmartStats?.churnRate || 0).toFixed(1)}%`}
						/>
					</div>

					{/* Ações Hotmart */}
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-white">Clientes Hotmart</h2>
						<div className="flex gap-2">
							<Button
								onClick={handleSyncHotmart}
								className="bg-blue-600 hover:bg-blue-700 text-white"
							>
								<RefreshCw className="w-4 h-4 mr-2" />
								Sincronizar
							</Button>
							<Button
								onClick={handleExportHotmart}
								className="bg-green-600 hover:bg-green-700 text-white"
							>
								<Download className="w-4 h-4 mr-2" />
								Exportar
							</Button>
						</div>
					</div>

					{/* Filtros */}
					<div className="bg-deep/60 p-4 rounded-lg mb-6">
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<input
								type="text"
								placeholder="Buscar por nome, email..."
								value={hotmartFilters.search}
								onChange={(e) => setHotmartFilters({ ...hotmartFilters, search: e.target.value })}
								className="px-3 py-2 bg-deep/80 border border-electric/30 rounded-md text-white placeholder-gray-400"
							/>
							<select
								value={hotmartFilters.status}
								onChange={(e) => setHotmartFilters({ ...hotmartFilters, status: e.target.value })}
								className="px-3 py-2 bg-deep/80 border border-electric/30 rounded-md text-white"
							>
								<option value="">Todos os status</option>
								<option value="ACTIVE">Ativo</option>
								<option value="CANCELLED">Cancelado</option>
								<option value="DELAYED">Atrasado</option>
								<option value="TRIAL">Trial</option>
							</select>
							<select
								value={hotmartFilters.paymentStatus}
								onChange={(e) => setHotmartFilters({ ...hotmartFilters, paymentStatus: e.target.value })}
								className="px-3 py-2 bg-deep/80 border border-electric/30 rounded-md text-white"
							>
								<option value="">Todos os pagamentos</option>
								<option value="APPROVED">Aprovado</option>
								<option value="PENDING">Pendente</option>
								<option value="CANCELLED">Cancelado</option>
								<option value="REFUNDED">Reembolsado</option>
							</select>
							<Button
								onClick={fetchHotmartCustomers}
								className="bg-electric hover:bg-electric/80 text-white"
							>
								Filtrar
							</Button>
						</div>
					</div>

					{/* Tabela de Clientes Hotmart */}
					<motion.div
						className="bg-deep/90 backdrop-blur-2xl rounded-2xl border border-electric/40 overflow-hidden shadow-2xl"
						variants={animations.item}
					>
						{hotmartLoading ? (
							<div className="text-white text-center py-8">Carregando clientes...</div>
						) : hotmartCustomers.length > 0 ? (
							<Table className="[&_tr:hover]:!bg-transparent">
								<Thead>
									<Tr className="bg-electric/20">
										<Th className="text-electric font-bold">Cliente</Th>
										<Th className="text-electric font-bold">Produto</Th>
										<Th className="text-electric font-bold">Status</Th>
										<Th className="text-electric font-bold">Valor</Th>
										<Th className="text-electric font-bold">Próxima Cobrança</Th>
										<Th className="text-electric font-bold">Tags</Th>
										<Th className="text-electric font-bold">Ações</Th>
									</Tr>
								</Thead>
								<Tbody className="[&_tr:hover]:bg-transparent">
									{hotmartCustomers.map((customer) => (
										<Tr key={customer.id} className="hover:bg-electric/10">
											<Td>
												<div>
													<div className="font-medium text-white">{customer.name || customer.customerName || 'N/A'}</div>
													<div className="text-sm text-gray-400">{customer.email || customer.customerEmail || 'N/A'}</div>
												</div>
											</Td>
											<Td>
												<div className="text-sm">
													<div className="font-medium">{customer.productName || 'N/A'}</div>
													<div className="text-gray-400">ID: {customer.productId || 'N/A'}</div>
												</div>
											</Td>
											<Td>
												<HotmartStatus status={customer.subscriptionStatus || 'UNKNOWN'} />
											</Td>
											<Td>
												<div className="text-sm">
													<div className="font-medium">{formatCurrency(customer.subscriptionValue || 0)}</div>
													<div className="text-gray-400">{customer.subscriptionFrequency || 'N/A'}</div>
												</div>
											</Td>
											<Td>
												{formatDate(customer.nextChargeDate)}
											</Td>
											<Td>
												<div className="flex flex-wrap gap-1">
													{(customer.tags || []).slice(0, 2).map((tag, index) => (
														<span
															key={index}
															className="px-2 py-1 text-xs bg-electric/20 text-electric rounded-full"
														>
															{tag}
														</span>
													))}
													{(customer.tags || []).length > 2 && (
														<span className="px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded-full">
															+{(customer.tags || []).length - 2}
														</span>
													)}
													{(!customer.tags || customer.tags.length === 0) && (
														<span className="text-xs text-gray-500">Sem tags</span>
													)}
												</div>
											</Td>
											<Td>
												<div className="flex gap-2">
													<Button
														size="sm"
														variant="ghost"
														className="hover:bg-electric/30 hover:text-electric transition-all duration-200"
														onClick={() => {/* Implementar visualização detalhada */ }}
													>
														<FileText className="w-4 h-4" />
													</Button>
													<Button
														size="sm"
														variant="ghost"
														className="hover:bg-electric/30 hover:text-electric transition-all duration-200"
														onClick={() => {/* Implementar adicionar tags */ }}
													>
														<Tag className="w-4 h-4" />
													</Button>
													<Button
														size="sm"
														variant="ghost"
														className="hover:bg-electric/30 hover:text-electric transition-all duration-200"
														onClick={() => {/* Implementar adicionar notas */ }}
													>
														<MessageSquare className="w-4 h-4" />
													</Button>
												</div>
											</Td>
										</Tr>
									))}
								</Tbody>
							</Table>
						) : (
							<div className="text-white text-center py-8">
								Nenhum cliente Hotmart encontrado
							</div>
						)}
					</motion.div>
				</>
			)}

			{/* Aba de Gerenciamento de Usuários */}
			{activeTab === 'users' && (
				<>
					{/* Estatísticas de Usuários */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						<StatCard
							icon={Users}
							title="Total de Usuários"
							value={usersPagination.total}
						/>
						<StatCard
							icon={TrendingUp}
							title="Usuários Ativos"
							value={allUsers.filter(u => u.isActive).length}
						/>
						<StatCard
							icon={Calendar}
							title="Em Trial"
							value={allUsers.filter(u => u.isInTrial).length}
						/>
						<StatCard
							icon={DollarSign}
							title="Expirando em breve"
							value={allUsers.filter(u => u.isExpiringSoon).length}
						/>
					</div>

					{/* Filtros Avançados */}
					<div className="bg-deep/60 p-6 rounded-lg mb-6 border border-electric/30">
						<h3 className="text-lg font-bold text-white mb-4">Filtros Avançados</h3>
						<div className="grid grid-cols-1 md:grid-cols-6 gap-4">
							<input
								type="text"
								placeholder="🔍 Buscar por nome ou email..."
								value={usersFilters.search}
								onChange={(e) => setUsersFilters({ ...usersFilters, search: e.target.value })}
								className="px-4 py-3 bg-deep/80 border border-electric/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric"
							/>
							<select
								value={usersFilters.plan}
								onChange={(e) => setUsersFilters({ ...usersFilters, plan: e.target.value })}
								className="px-4 py-3 bg-deep/80 border border-electric/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric"
							>
								<option value="">Todos os planos</option>
								<option value="free">Free</option>
								<option value="basic">Basic</option>
								<option value="premium">Premium</option>
								<option value="enterprise">Enterprise</option>
							</select>
							<select
								value={usersFilters.status}
								onChange={(e) => setUsersFilters({ ...usersFilters, status: e.target.value })}
								className="px-4 py-3 bg-deep/80 border border-electric/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric"
							>
								<option value="">Todos os status</option>
								<option value="ACTIVE">✅ Ativo</option>
								<option value="PENDING">⏳ Pendente</option>
								<option value="SUSPENDED">🚫 Suspenso</option>
								<option value="TRIAL">🎁 Trial</option>
								<option value="EXPIRED">⏰ Expirado</option>
								<option value="CANCELLED">❌ Cancelado</option>
							</select>
							<Button
								onClick={() => setUsersFilters({ ...usersFilters, trialOnly: !usersFilters.trialOnly })}
								variant={usersFilters.trialOnly ? 'default' : 'outline'}
								className={usersFilters.trialOnly ? 'bg-blue-600' : 'border-blue-600 text-blue-400'}
							>
								🎁 Apenas Trials
							</Button>
							<Button
								onClick={() => setUsersFilters({ ...usersFilters, expiringSoon: !usersFilters.expiringSoon })}
								variant={usersFilters.expiringSoon ? 'default' : 'outline'}
								className={usersFilters.expiringSoon ? 'bg-orange-600' : 'border-orange-600 text-orange-400'}
							>
								⏰ Expirando
							</Button>
							<Button
								onClick={fetchAllUsers}
								className="bg-electric hover:bg-electric/80 text-white"
							>
								<RefreshCw className="w-4 h-4 mr-2" />
								Aplicar
							</Button>
						</div>
					</div>

					{/* Tabela de Usuários */}
					<motion.div
						className="bg-deep/90 backdrop-blur-2xl rounded-2xl border border-electric/40 overflow-hidden shadow-2xl"
						variants={animations.item}
					>
						{usersLoading ? (
							<div className="text-white text-center py-12">
								<div className="w-16 h-16 border-4 border-electric border-t-transparent rounded-full animate-spin mx-auto mb-4" />
								<p>Carregando usuários...</p>
							</div>
						) : allUsers.length > 0 ? (
							<>
								<div className="overflow-x-auto">
									<Table className="[&_tr:hover]:!bg-transparent">
										<Thead>
											<Tr className="bg-electric/20">
												<Th className="text-electric font-bold">Usuário</Th>
												<Th className="text-electric font-bold">Plano</Th>
												<Th className="text-electric font-bold">Status</Th>
												<Th className="text-electric font-bold">Vencimento</Th>
												<Th className="text-electric font-bold">Trial</Th>
												<Th className="text-electric font-bold">Pagamentos</Th>
												<Th className="text-electric font-bold">Instâncias</Th>
												<Th className="text-electric font-bold">Msgs/Dia</Th>
												<Th className="text-electric font-bold">Ações</Th>
											</Tr>
										</Thead>
										<Tbody className="[&_tr:hover]:bg-transparent">
											{allUsers.map((user) => (
												<Tr key={user.id} className="hover:bg-electric/10">
													<Td>
														<div>
															<div className="font-medium text-white flex items-center gap-2">
																{user.name}
																{user.isInTrial && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">🎁 Trial</span>}
																{user.hasOverduePayment && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">⚠️  Vencido</span>}
																{user.isExpiringSoon && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">⏰ Expira em breve</span>}
															</div>
															<div className="text-sm text-gray-400">{user.email}</div>
														</div>
													</Td>
													<Td>
														<span className={`font-bold ${user.plan === 'enterprise' ? 'text-gold' :
															user.plan === 'premium' ? 'text-purple-400' :
																user.plan === 'basic' ? 'text-blue-400' :
																	'text-gray-400'
															}`}>
															{user.plan.toUpperCase()}
														</span>
													</Td>
													<Td>
														<span className={`px-2 py-1 rounded-full text-xs font-bold ${user.subscriptionStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
															user.subscriptionStatus === 'TRIAL' ? 'bg-blue-500/20 text-blue-400' :
																user.subscriptionStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
																	user.subscriptionStatus === 'SUSPENDED' ? 'bg-red-500/20 text-red-400' :
																		user.subscriptionStatus === 'EXPIRED' ? 'bg-orange-500/20 text-orange-400' :
																			'bg-gray-500/20 text-gray-400'
															}`}>
															{user.subscriptionStatus || 'N/A'}
														</span>
													</Td>
													<Td>
														{user.subscriptionEndDate ? (
															<div>
																<div className="text-white">{formatDate(user.subscriptionEndDate)}</div>
																{user.daysUntilExpiration !== null && (
																	<div className={`text-xs ${user.daysUntilExpiration < 0 ? 'text-red-400' :
																		user.daysUntilExpiration <= 7 ? 'text-orange-400' :
																			'text-green-400'
																		}`}>
																		{user.daysUntilExpiration < 0
																			? `Vencido há ${Math.abs(user.daysUntilExpiration)} dias`
																			: `${user.daysUntilExpiration} dias restantes`
																		}
																	</div>
																)}
															</div>
														) : (
															<span className="text-gray-500">N/A</span>
														)}
													</Td>
													<Td>
														{user.isInTrial ? (
															<div className="text-blue-400">
																<div>🎁 Ativo</div>
																<div className="text-xs">{user.daysUntilTrialEnd} dias</div>
															</div>
														) : (
															<span className="text-gray-500">-</span>
														)}
													</Td>
													<Td>
														{user.Payment && user.Payment.length > 0 ? (
															<div className="space-y-1">
																{user.Payment.slice(0, 2).map((payment: any, index: number) => (
																	<div key={payment.id || index} className="text-xs">
																		<div className={`flex items-center gap-1 ${payment.status === 'completed' ? 'text-green-400' :
																			payment.status === 'pending' ? 'text-yellow-400' :
																				payment.status === 'overdue' ? 'text-red-400' :
																					'text-gray-400'
																			}`}>
																			<span className={`w-2 h-2 rounded-full ${payment.status === 'completed' ? 'bg-green-400' :
																				payment.status === 'pending' ? 'bg-yellow-400' :
																					payment.status === 'overdue' ? 'bg-red-400' :
																						'bg-gray-400'
																				}`}></span>
																			<span>R$ {(payment.amount / 100).toFixed(2)}</span>
																			<span className="text-gray-400">-</span>
																			<span className="capitalize">{payment.status}</span>
																		</div>
																	</div>
																))}
																{user.Payment.length > 2 && (
																	<div className="text-xs text-gray-400">
																		+{user.Payment.length - 2} mais
																	</div>
																)}
															</div>
														) : (
															<span className="text-gray-500 text-xs">Nenhum pagamento</span>
														)}
													</Td>
													<Td className="text-white">{user.maxInstances}</Td>
													<Td className="text-white">{user.messagesPerDay}</Td>
													<Td>
														<div className="flex flex-col gap-2">
															{/* Botão Editar */}
															<Button
																size="sm"
																variant="ghost"
																className="hover:bg-electric/30 hover:text-electric transition-all duration-200"
																onClick={() => setEditingUser(user)}
															>
																<Edit2 className="w-4 h-4 mr-1" />
																Editar
															</Button>

															{/* Ações de Pagamento */}
															<div className="flex gap-1">
																{/* Botão Confirmar Pagamento - só aparece se tem pagamento pendente */}
																{user.Payment && user.Payment.length > 0 &&
																	user.Payment.some((p: any) => p.status === 'pending' || p.status === 'overdue') && (
																		<Button
																			size="sm"
																			variant="ghost"
																			className="hover:bg-green-500/30 hover:text-green-400 transition-all duration-200"
																			onClick={() => {
																				const pendingPayment = user.Payment.find((p: any) => p.status === 'pending' || p.status === 'overdue');
																				if (pendingPayment) {
																					handleConfirmPayment(user.id, pendingPayment.id);
																				}
																			}}
																			title="Confirmar Pagamento"
																		>
																			<CheckCircle className="w-4 h-4" />
																		</Button>
																	)}

																{/* Botão Cancelar Pagamento - só aparece se tem pagamento pendente */}
																{user.Payment && user.Payment.length > 0 &&
																	user.Payment.some((p: any) => p.status === 'pending' || p.status === 'overdue') && (
																		<Button
																			size="sm"
																			variant="ghost"
																			className="hover:bg-red-500/30 hover:text-red-400 transition-all duration-200"
																			onClick={() => {
																				const pendingPayment = user.Payment.find((p: any) => p.status === 'pending' || p.status === 'overdue');
																				if (pendingPayment) {
																					handleCancelPayment(user.id, pendingPayment.id);
																				}
																			}}
																			title="Cancelar Pagamento"
																		>
																			<XCircle className="w-4 h-4" />
																		</Button>
																	)}

																{/* Botão Criar Pagamento - só aparece se não tem pagamento pendente */}
																{(!user.Payment || user.Payment.length === 0 ||
																	!user.Payment.some((p: any) => p.status === 'pending' || p.status === 'overdue')) && (
																		<Button
																			size="sm"
																			variant="ghost"
																			className="hover:bg-blue-500/30 hover:text-blue-400 transition-all duration-200"
																			onClick={() => handleCreatePayment(user)}
																			title="Criar Novo Pagamento"
																		>
																			<DollarSign className="w-4 h-4" />
																		</Button>
																	)}
															</div>
														</div>
													</Td>
												</Tr>
											))}
										</Tbody>
									</Table>
								</div>

								{/* Paginação */}
								<div className="p-4 border-t border-electric/30 flex items-center justify-between">
									<div className="text-white/60 text-sm">
										Mostrando {((usersPagination.page - 1) * usersPagination.limit) + 1} a {Math.min(usersPagination.page * usersPagination.limit, usersPagination.total)} de {usersPagination.total} usuários
									</div>
									<div className="flex gap-2">
										<Button
											onClick={() => {
												setUsersFilters({ ...usersFilters, page: usersFilters.page - 1 });
												fetchAllUsers();
											}}
											disabled={usersFilters.page === 1}
											variant="outline"
											size="sm"
											className="border-electric/30 text-white"
										>
											Anterior
										</Button>
										<div className="px-4 py-2 bg-electric/20 rounded-lg text-white text-sm">
											Página {usersPagination.page} de {usersPagination.totalPages}
										</div>
										<Button
											onClick={() => {
												setUsersFilters({ ...usersFilters, page: usersFilters.page + 1 });
												fetchAllUsers();
											}}
											disabled={usersFilters.page >= usersPagination.totalPages}
											variant="outline"
											size="sm"
											className="border-electric/30 text-white"
										>
											Próxima
										</Button>
									</div>
								</div>
							</>
						) : (
							<div className="text-white text-center py-12">
								<Users className="w-16 h-16 mx-auto mb-4 text-white/30" />
								<p className="text-xl font-bold mb-2">Nenhum usuário encontrado</p>
								<p className="text-white/60">Ajuste os filtros ou carregue os usuários</p>
							</div>
						)}
					</motion.div>
				</>
			)}

			{/* Modal para editar pagamento */}
			{editingPayment && (
				<EditPaymentModal
					payment={editingPayment}
					onClose={() => setEditingPayment(null)}
					onSave={handleUpdatePayment}
				/>
			)}

			{/* Modal para editar usuário */}
			{editingUser && (
				<UserManagementModal
					user={editingUser}
					onClose={() => setEditingUser(null)}
					onSave={handleUpdateUser}
				/>
			)}

			{/* Modal para adicionar usuário */}
			<AnimatePresence>
				{showAddUserModal && (
					<motion.div
						className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<motion.div
							className="bg-deep/80 p-6 rounded-lg shadow-lg w-96"
							initial={{ scale: 0.8 }}
							animate={{ scale: 1 }}
							transition={{ duration: 0.2 }}
						>
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-bold text-white">
									Adicionar Usuário
								</h2>
								<X
									className="text-white cursor-pointer hover:text-red-500"
									onClick={() => setShowAddUserModal(false)}
								/>
							</div>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									const formData = new FormData(e.target as HTMLFormElement);
									handleAddUser(formData);
								}}
							>
								<div className="mb-4">
									<label className="block text-sm font-medium text-white">
										Nome
									</label>
									<input
										name="name"
										type="text"
										required
										className="mt-1 block w-full rounded-md border-gray-600 bg-deep/60 text-white shadow-sm focus:border-electric focus:ring-electric"
									/>
								</div>
								<div className="mb-4">
									<label className="block text-sm font-medium text-white">
										Email
									</label>
									<input
										name="email"
										type="email"
										required
										className="mt-1 block w-full rounded-md border-gray-600 bg-deep/60 text-white shadow-sm focus:border-electric focus:ring-electric"
									/>
								</div>
								<div className="mb-4">
									<label className="block text-sm font-medium text-white">
										Senha
									</label>
									<input
										name="password"
										type="password"
										required
										className="mt-1 block w-full rounded-md border-gray-600 bg-deep/60 text-white shadow-sm focus:border-electric focus:ring-electric"
									/>
								</div>
								<div className="mb-4">
									<label className="block text-sm font-medium text-white">
										Telefone (Opcional)
									</label>
									<input
										name="phone"
										type="text"
										className="mt-1 block w-full rounded-md border-gray-600 bg-deep/60 text-white shadow-sm focus:border-electric focus:ring-electric"
									/>
								</div>
								<div className="mb-4">
									<label className="block text-sm font-medium text-white">
										Plano (Opcional)
									</label>
									<input
										name="plan"
										type="text"
										className="mt-1 block w-full rounded-md border-gray-600 bg-deep/60 text-white shadow-sm focus:border-electric focus:ring-electric"
									/>
								</div>
								<div className="mb-4">
									<label className="block text-sm font-medium text-white">
										Valor do Pagamento
									</label>
									<input
										name="payment"
										type="number"
										required
										className="mt-1 block w-full rounded-md border-gray-600 bg-deep/60 text-white shadow-sm focus:border-electric focus:ring-electric"
									/>
								</div>
								<div className="mb-4">
									<label className="block text-sm font-medium text-white">
										Data de Vencimento
									</label>
									<input
										name="dueDate"
										type="date"
										required
										className="mt-1 block w-full rounded-md border-gray-600 bg-deep/60 text-white shadow-sm focus:border-electric focus:ring-electric"
									/>
								</div>
								<div className="mb-4">
									<label className="block text-sm font-medium text-white">
										Max Instances (Opcional)
									</label>
									<input
										name="maxInstances"
										type="number"
										className="mt-1 block w-full rounded-md border-gray-600 bg-deep/60 text-white shadow-sm focus:border-electric focus:ring-electric"
									/>
								</div>
								<div className="mb-4">
									<label className="block text-sm font-medium text-white">
										Mensagens por Dia (Opcional)
									</label>
									<input
										name="messagesPerDay"
										type="number"
										className="mt-1 block w-full rounded-md border-gray-600 bg-deep/60 text-white shadow-sm focus:border-electric focus:ring-electric"
									/>
								</div>
								<div className="mb-4">
									<label className="block text-sm font-medium text-white">
										Afiliado (Opcional)
									</label>
									<select
										name="referredBy"
										className="mt-1 block w-full rounded-md border-gray-600 bg-deep/60 text-white shadow-sm focus:border-electric focus:ring-electric"
									>
										<option value="">Nenhum</option>
										{affiliates.map((affiliate) => (
											<option key={affiliate.id} value={affiliate.id}>
												{affiliate.name}
											</option>
										))}
									</select>
								</div>
								<div className="flex justify-end">
									<button
										type="button"
										onClick={() => setShowAddUserModal(false)}
										className="mr-4 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
									>
										Cancelar
									</button>
									<button
										type="submit"
										className="px-4 py-2 bg-electric text-white rounded-md hover:bg-electric/80"
									>
										Salvar
									</button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}

				{/* Modal para Criar Pagamento */}
				<AnimatePresence>
					{showCreatePaymentModal && selectedUserForPayment && (
						<motion.div
							className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							<motion.div
								className="bg-deep/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-electric/30 w-96"
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.8, opacity: 0 }}
								transition={{ duration: 0.2 }}
							>
								<div className="flex justify-between items-center mb-6">
									<h2 className="text-2xl font-bold text-white">
										Criar Novo Pagamento
									</h2>
									<X
										className="text-white cursor-pointer hover:text-red-400 transition-colors"
										onClick={() => {
											setShowCreatePaymentModal(false);
											setSelectedUserForPayment(null);
										}}
									/>
								</div>

								<div className="mb-4">
									<label className="block text-sm font-medium text-white mb-2">
										Usuário
									</label>
									<div className="bg-deep/60 p-3 rounded-lg border border-electric/30">
										<div className="text-white font-medium">{selectedUserForPayment.name}</div>
										<div className="text-gray-400 text-sm">{selectedUserForPayment.email}</div>
									</div>
								</div>

								<div className="mb-4">
									<label className="block text-sm font-medium text-white mb-2">
										Valor (R$)
									</label>
									<input
										type="number"
										step="0.01"
										min="0"
										value={paymentForm.amount}
										onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
										className="w-full px-4 py-3 bg-deep/60 border border-electric/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric"
										placeholder="Ex: 49.00"
									/>
								</div>

								<div className="mb-4">
									<label className="block text-sm font-medium text-white mb-2">
										Data de Vencimento
									</label>
									<input
										type="date"
										value={paymentForm.dueDate}
										onChange={(e) => setPaymentForm({ ...paymentForm, dueDate: e.target.value })}
										className="w-full px-4 py-3 bg-deep/60 border border-electric/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric"
									/>
								</div>

								<div className="mb-6">
									<label className="block text-sm font-medium text-white mb-2">
										Plano
									</label>
									<select
										value={paymentForm.plan}
										onChange={(e) => setPaymentForm({ ...paymentForm, plan: e.target.value })}
										className="w-full px-4 py-3 bg-deep/60 border border-electric/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric"
									>
										<option value="free">Free</option>
										<option value="basic">Basic</option>
										<option value="premium">Premium</option>
										<option value="enterprise">Enterprise</option>
									</select>
								</div>

								<div className="flex justify-end gap-3">
									<Button
										variant="outline"
										onClick={() => {
											setShowCreatePaymentModal(false);
											setSelectedUserForPayment(null);
										}}
										className="bg-deep/50 border-electric text-white hover:bg-electric/20"
									>
										Cancelar
									</Button>
									<Button
										onClick={handleSubmitCreatePayment}
										disabled={!paymentForm.amount || !paymentForm.dueDate}
										className="bg-electric text-deep hover:bg-electric/80 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Criar Pagamento
									</Button>
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</AnimatePresence>
		</motion.div>
	);
}

const PaymentStatus = ({
	dueDate,
	status,
}: {
	dueDate: string | null | undefined;
	status: string;
}) => {
	const daysToDue = dueDate
		? differenceInDays(new Date(dueDate), new Date())
		: null;

	const getStatusConfig = () => {
		if (status === "pending") {
			return { color: "text-blue-500", text: "Pendente" };
		}
		if (
			!dueDate ||
			status === "overdue" ||
			(daysToDue !== null && daysToDue < 0)
		) {
			return { color: "text-red-500", text: "Vencido" };
		}
		if (daysToDue !== null && daysToDue <= 3) {
			return { color: "text-yellow-500", text: "Próximo do vencimento" };
		}
		return { color: "text-green-500", text: "Em dia" };
	};

	const statusConfig = getStatusConfig();

	return (
		<span className={`font-bold ${statusConfig.color}`}>
			{statusConfig.text}
			{dueDate &&
				daysToDue !== null &&
				daysToDue > 0 &&
				` (em ${daysToDue} dias)`}
		</span>
	);
};

const HotmartStatus = ({ status }: { status: string }) => {
	const getStatusConfig = () => {
		switch (status) {
			case 'ACTIVE':
				return { color: 'text-green-500', text: 'Ativo' };
			case 'CANCELLED':
				return { color: 'text-red-500', text: 'Cancelado' };
			case 'DELAYED':
				return { color: 'text-yellow-500', text: 'Atrasado' };
			case 'TRIAL':
				return { color: 'text-blue-500', text: 'Trial' };
			case 'UNKNOWN':
				return { color: 'text-gray-500', text: 'Desconhecido' };
			default:
				return { color: 'text-gray-500', text: status || 'N/A' };
		}
	};

	const statusConfig = getStatusConfig();

	return (
		<span className={`font-bold ${statusConfig.color}`}>
			{statusConfig.text}
		</span>
	);
};
