import axios from "axios";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, DollarSign, Edit2, PlusCircle, User, X } from "lucide-react";
import { useEffect, useState } from "react";

import CustomDatePicker from "@/components/CustomDatePicker";
import EditPaymentModal from "@/components/EditPaymentModal";
import { BarChart, LineChart } from "@/components/charts";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/button";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import type { Affiliate, DashboardData, Payment } from "@/interface";
import { authService } from "@/services/auth.service";

// Constants
const API_URL = import.meta.env.VITE_API_URL || "https://api.whatlead.com.br";

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
const StatCard = ({ icon: Icon, title, value }: any) => (
	<motion.div
		variants={animations.item}
		className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric shadow-lg hover:shadow-electric transition-all duration-300"
	>
		<div className="flex items-center mb-4">
			<div className="p-2 bg-electric/10 rounded-lg">
				<Icon className="text-electric w-6 h-6" />
			</div>
			<span className="text-2xl font-bold text-white ml-3">{value}</span>
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
	const { toast } = useToast();

	useEffect(() => {
		const initializeDashboard = async () => {
			await Promise.all([
				fetchAdminData(),
				fetchAffiliates(),
				fetchUserSignups(),
				fetchRevenueByDay(),
			]);
		};

		initializeDashboard();
	}, []);

	const fetchAdminData = async () => {
		setIsLoading(true);
		try {
			const token = authService.getToken();
			if (!token) throw new Error("Token não encontrado");

			const { data } = await axios.get<DashboardData>(
				`${API_URL}/api/admin/dashboard`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			console.log("Dados recebidos do backend:", data);
			setData(data);
		} catch (error: any) {
			console.error("Erro ao buscar dados:", error);
			toast({
				title: "Erro",
				description: error.response?.data?.error || "Falha ao carregar dados",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const fetchAffiliates = async () => {
		try {
			const token = authService.getToken();
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
			const token = authService.getToken();
			if (!token) throw new Error("Token não encontrado");
			const resposta = await axios.get(`${API_URL}/api/admin/user-signups`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			console.log("Dados de cadastros de usuários:", resposta.data);

			// Ordena os dados por data
			const sortedData = resposta.data
				.map((item) => ({
					...item,
					date: new Date(item.date),
				}))
				.filter((item) => !isNaN(item.date.getTime()))
				.sort((a, b) => a.date.getTime() - b.date.getTime());

			setUserSignups(sortedData);
		} catch (error) {
			console.error("Erro ao buscar cadastros de usuários:", error);
		}
	};

	const fetchRevenueByDay = async () => {
		try {
			const token = authService.getToken();
			if (!token) throw new Error("Token não encontrado");
			const resposta = await axios.get(`${API_URL}/api/admin/revenue-by-day`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			console.log("Dados de faturamento por dia:", resposta.data);

			const formattedData = resposta.data
				.map((item) => ({
					...item,
					date: formatDate(item.date),
				}))
				.filter((item) => item.date !== "Data inválida");

			setRevenueByDay(formattedData);
		} catch (error) {
			console.error("Erro ao buscar faturamento por dia:", error);
		}
	};

	const handleEditPayment = (payment: Payment) => {
		setEditingPayment(payment);
	};

	const handleUpdatePayment = async (
		paymentId: string,
		updatedData: Partial<Payment>,
	) => {
		try {
			const token = authService.getToken();
			await axios.put(`${API_URL}/api/payments/${paymentId}`, updatedData, {
				headers: { Authorization: `Bearer ${token}` },
			});

			toast({
				title: "Sucesso",
				description: "Pagamento atualizado com sucesso",
			});

			fetchAdminData(); // Recarregar os dados
		} catch (error: any) {
			toast({
				title: "Erro",
				description:
					error.response?.data?.error || "Falha ao atualizar pagamento",
				variant: "destructive",
			});
		}
	};

	const handleAddUser = async (formData: FormData) => {
		try {
			const token = authService.getToken();
			const userData = Object.fromEntries(formData.entries());

			await axios.post(`${API_URL}/api/admin/users`, userData, {
				headers: { Authorization: `Bearer ${token}` },
			});

			toast({
				title: "Sucesso",
				description: "Usuário cadastrado com sucesso",
			});

			setShowAddUserModal(false);
			fetchAdminData();
		} catch (error: any) {
			toast({
				title: "Erro",
				description:
					error.response?.data?.error || "Falha ao cadastrar usuário",
				variant: "destructive",
			});
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
					<LineChart
						data={revenueByDay}
						xKey="date"
						yKeys={["completed", "pending", "overdue"]}
						colors={["#19eb4e", "#fbbf24", "#ef4444"]}
					/>
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
