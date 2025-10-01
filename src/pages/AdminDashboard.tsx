import CustomDatePicker from "@/components/CustomDatePicker";
import EditPaymentModal from "@/components/EditPaymentModal";
import { BarChart, LineChart } from "@/components/charts";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/button";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import type { Affiliate, DashboardData, Payment } from "@/interface";
import { authService } from "@/services/auth.service";
import { hotmartService, type HotmartCustomer, type HotmartStats } from "@/services/hotmart.service";
import axios from "axios";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, DollarSign, Download, Edit2, FileText, MessageSquare, PlusCircle, RefreshCw, Tag, TrendingUp, User, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

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
	const [isLoading, setIsLoading] = useState(true);
	const [data, setData] = useState<DashboardData | null>(null);
	const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [showAddUserModal, setShowAddUserModal] = useState(false);
	const [userSignups, setUserSignups] = useState<
		{ date: string; count: number }[]
	>([]);
	const [revenueByDay, setRevenueByDay] = useState<
		{ date: string; amount: number }[]
	>([]);

	// Estados para Hotmart
	const [hotmartStats, setHotmartStats] = useState<HotmartStats | null>(null);
	const [hotmartCustomers, setHotmartCustomers] = useState<HotmartCustomer[]>([]);
	const [hotmartLoading, setHotmartLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<'dashboard' | 'hotmart'>('dashboard');
	const [hotmartFilters, setHotmartFilters] = useState({
		page: 1,
		limit: 10,
		search: '',
		status: '',
		paymentStatus: '',
	});

	const { toast } = useToast();

	useEffect(() => {
		const initializeDashboard = async () => {
			await Promise.all([
				fetchAdminData(),
				fetchAffiliates(),
				fetchUserSignups(),
				fetchRevenueByDay(),
				fetchHotmartStats(),
				fetchHotmartCustomers(),
			]);
		};

		initializeDashboard();
	}, []);

	const fetchRevenueByDay = async () => {
		try {
			const token = authService.getTokenInterno();
			if (!token) throw new Error("Token não encontrado");

			const response = await axios.get(`${API_URL}/api/admin/revenue-by-day`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			// Ordena os dados por data e garante que as datas estão no formato correto
			const sortedData = response.data
				.map((item: { date: string; amount: number }) => ({
					...item,
					date: item.date.split("T")[0], // Pega apenas a parte da data, removendo a hora se existir
				}))
				.sort(
					(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
				);

			console.log("Dados de faturamento por dia:", sortedData);
			setRevenueByDay(sortedData);
		} catch (error: unknown) {
			console.error("Erro ao buscar faturamento por dia:", error);
			toast.error("Erro ao carregar dados de faturamento.");
		} finally {
			setIsLoading(false);
		}
	};

	const fetchAdminData = async () => {
		setIsLoading(true);
		try {
			const token = authService.getTokenInterno();
			if (!token) throw new Error("Token não encontrado");

			const { data } = await axios.get<DashboardData>(
				`${API_URL}/api/admin/dashboard`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			console.log("Dados recebidos do backend:", data);
			setData(data);
		} catch (error: unknown) {
			console.error("Erro ao buscar dados:", error);
			const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
			toast.error(`Erro ao carregar dados: ${errorMessage}`);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchAffiliates = async () => {
		try {
			const token = authService.getTokenInterno();
			const { data } = await axios.get<Affiliate[]>(
				`${API_URL}/api/admin/affiliates`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			setAffiliates(data);
		} catch (error) {
			console.error("Erro ao buscar afiliados:", error);
		}
	};

	const formatDate = (dateString: string | null | undefined) => {
		if (!dateString) return "N/A";
		try {
			const date = new Date(dateString);
			// biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
			if (isNaN(date.getTime())) {
				throw new Error("Invalid date");
			}
			return format(date, "dd/MM/yyyy", { locale: ptBR });
		} catch (error) {
			console.error("Error formatting date:", dateString, error);
			return "Data inválida";
		}
	};

	const formattedUserSignups = userSignups.map((item) => ({
		...item,
		date: formatDate(item.date),
	}));

	const fetchUserSignups = async () => {
		try {
			const token = authService.getTokenInterno();
			if (!token) throw new Error("Token não encontrado");
			const resposta = await axios.get(`${API_URL}/api/admin/user-signups`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			console.log("Dados de cadastros de usuários:", resposta.data);

			// Ordena os dados por data
			const sortedData = resposta.data
				.map((item: { date: string; count: number }) => ({
					...item,
					date: new Date(item.date),
				}))
				// biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
				.filter((item: { date: Date; count: number }) => !isNaN(item.date.getTime()))
				.sort((a, b) => a.date.getTime() - b.date.getTime());

			setUserSignups(sortedData);
		} catch (error) {
			console.error("Erro ao buscar cadastros de usuários:", error);
		}
	};

	// Funções para Hotmart
	const fetchHotmartStats = async () => {
		try {
			const stats = await hotmartService.getCustomerStats();
			setHotmartStats(stats);
		} catch (error: unknown) {
			console.error("Erro ao buscar estatísticas Hotmart:", error);
			toast.error("Erro ao carregar estatísticas Hotmart.");
			// Definir valores padrão em caso de erro
			setHotmartStats({
				totalCustomers: 0,
				activeCustomers: 0,
				totalRevenue: 0,
				churnRate: 0
			});
		}
	};

	const fetchHotmartCustomers = async () => {
		setHotmartLoading(true);
		try {
			const response = await hotmartService.getCustomers(hotmartFilters);
			// Verificar se a resposta tem a estrutura esperada
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
			// Verificar se o resultado tem a estrutura esperada
			const syncedCount = result?.syncedCount || 0;
			toast.success(`Sincronização concluída: ${syncedCount} sincronizados`);
			fetchHotmartStats();
			fetchHotmartCustomers();
		} catch (error: unknown) {
			console.error("Erro na sincronização:", error);
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
			const token = authService.getTokenInterno();
			await axios.put(`${API_URL}/api/payments/${paymentId}`, updatedData, {
				headers: { Authorization: `Bearer ${token}` },
			});

			toast.success("Pagamento atualizado com sucesso");

			fetchAdminData(); // Recarregar os dados
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
			toast.error(`Erro ao atualizar pagamento: ${errorMessage}`);
		}
	};

	const handleAddUser = async (formData: FormData) => {
		try {
			const token = authService.getTokenInterno();

			// Solução para conversão de FormData
			const userData: Record<string, string> = {};
			formData.forEach((value, key) => {
				userData[key] = value.toString();
			});

			await axios.post(`${API_URL}/api/admin/users`, userData, {
				headers: { Authorization: `Bearer ${token}` },
			});

			toast.success("Usuário cadastrado com sucesso");
			setShowAddUserModal(false);
			fetchAdminData();
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

			{/* Modal para editar pagamento */}
			{editingPayment && (
				<EditPaymentModal
					payment={editingPayment}
					onClose={() => setEditingPayment(null)}
					onSave={handleUpdatePayment}
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
