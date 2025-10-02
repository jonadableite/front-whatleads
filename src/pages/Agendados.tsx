import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import type {
	ApiResponse,
	LoadingStateProps,
	StatsCardProps,
} from "@/interface";
import api from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import React, { useMemo, useState } from "react";
import {
	FiBarChart2,
	FiCalendar,
	FiClock,
	FiEdit2,
	FiPlay,
	FiSearch,
	FiTrash2,
	FiUsers,
} from "react-icons/fi";

export interface ScheduledCampaign {
	id: string;
	campaignId: string;
	name: string;
	scheduledDate: string;
	status: string;
	instance: string;
	message?: string;
	mediaType?: string;
	mediaUrl?: string;
	mediaCaption?: string;
	minDelay: number;
	maxDelay: number;
	startedAt?: string;
	completedAt?: string;
	totalLeads: number;
	statistics?: {
		sentCount: number;
		deliveredCount: number;
	};
}

const pageTransition = {
	out: { opacity: 0, y: 20 },
	in: { opacity: 1, y: 0 },
};

const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
	({ className = "", itemCount = 3 }, ref) => (
		<div
			ref={ref}
			className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
		>
			{[...Array(itemCount)].map((_, i) => (
				<motion.div
					key={i}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="bg-deep/30 rounded-xl p-6 border border-electric/30 backdrop-blur-xl"
				>
					<div className="animate-pulse space-y-4">
						<div className="h-6 bg-electric/20 rounded w-3/4"></div>
						<div className="h-4 bg-electric/20 rounded w-1/2"></div>
						<div className="space-y-2">
							<div className="h-3 bg-electric/20 rounded"></div>
							<div className="h-3 bg-electric/20 rounded w-5/6"></div>
						</div>
					</div>
				</motion.div>
			))}
		</div>
	),
);

LoadingState.displayName = "LoadingState";

const EmptyState = React.forwardRef<HTMLDivElement, { searchTerm: string }>(
	({ searchTerm }, ref) => (
		<motion.div
			ref={ref}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="text-center py-12 text-white/60"
		>
			{searchTerm
				? "Nenhum agendamento encontrado com este termo"
				: "Nenhum agendamento cadastrado"}
		</motion.div>
	),
);

EmptyState.displayName = "EmptyState";

const ErrorState = React.forwardRef<
	HTMLDivElement,
	{ error: unknown; onRetry: () => void }
>(({ error, onRetry }, ref) => (
	<motion.div
		ref={ref}
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		className="text-center space-y-4"
	>
		<p className="text-red-500">
			{error instanceof Error ? error.message : "Erro ao carregar campanhas"}
		</p>
		<Button onClick={onRetry} variant="outline">
			Tentar novamente
		</Button>
	</motion.div>
));

ErrorState.displayName = "ErrorState";

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
	({ title, value, icon }, ref) => (
		<div
			ref={ref}
			className="bg-deep/30 rounded-xl p-6 border border-electric/30 backdrop-blur-xl"
		>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-white/60">{title}</p>
					<p className="text-2xl font-bold text-white">{value}</p>
				</div>
				<div className="text-electric/60">{icon}</div>
			</div>
		</div>
	),
);

StatsCard.displayName = "StatsCard";

const Agendados = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [selectedCampaign, setSelectedCampaign] =
		useState<ScheduledCampaign | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	const {
		data: response,
		isLoading,
		error,
		refetch,
	} = useQuery<ApiResponse<ScheduledCampaign[]>>({
		queryKey: ["scheduled-campaigns"],
		queryFn: async () => {
			console.log("Buscando agendamentos...");
			const response = await api.get("/api/scheduler/scheduled");
			console.log("Resposta da busca:", response.data);
			return response.data;
		},
		refetchInterval: 30000,
	});

	const scheduledCampaigns = useMemo(() => {
		console.log("Processando campanhas agendadas:", response?.data);
		if (!response?.data) return [];
		return response.data;
	}, [response]);

	const filteredCampaigns = useMemo(() => {
		console.log("Filtrando campanhas:", scheduledCampaigns);
		return scheduledCampaigns.filter(
			(campaign) =>
				campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
				(!statusFilter || campaign.status === statusFilter),
		);
	}, [scheduledCampaigns, searchTerm, statusFilter]);

	const cancelCampaign = useMutation({
		mutationFn: (id: string) => api.post(`/api/campaigns/${id}/cancel`),
		onSuccess: () => {
			toast.success("Campanha cancelada com sucesso!");
			refetch();
			setIsDeleteModalOpen(false);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Erro ao cancelar campanha",
			);
		},
	});

	const updateCampaign = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Partial<ScheduledCampaign>;
		}) => api.patch(`/campaigns/${id}`, data),
		onSuccess: () => {
			toast.success("Campanha atualizada com sucesso!");
			refetch();
			setIsEditModalOpen(false);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Erro ao atualizar campanha",
			);
		},
	});

	return (
		<motion.div
			initial="out"
			animate="in"
			exit="out"
			variants={pageTransition}
			transition={{ duration: 0.5 }}
			className="p-8 space-y-8"
		>
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-4xl font-bold text-white">Agendamentos</h1>
					<p className="text-white/60 mt-2">
						Gerencie suas campanhas agendadas
					</p>
				</div>
			</div>

			{/* Filters */}
			<div className="flex gap-4 items-center bg-deep/30 p-4 rounded-xl backdrop-blur-xl">
				<div className="flex-1">
					<InputWithIcon
						type="text"
						placeholder="Buscar campanhas..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						icon={<FiSearch className="w-5 h-5" />}
					/>
				</div>
				<Select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					className="bg-deep/50 border-electric text-white"
				>
					<option value="" className=" text-gray-300">Todos os status</option>
					<option value="scheduled" className=" text-gray-300">Agendada</option>
					<option value="running" className=" text-gray-300">Em execução</option>
					<option value="paused" className=" text-gray-300">Pausada</option>
					<option value="cancelled" className=" text-gray-300">Cancelada</option>
					<option value="completed" className=" text-gray-300">Concluída</option>
				</Select>
			</div>

			{/* Content */}
			<AnimatePresence mode="popLayout">
				{isLoading ? (
					<LoadingState />
				) : error ? (
					<ErrorState error={error} onRetry={refetch} />
				) : filteredCampaigns.length === 0 ? (
					<EmptyState searchTerm={searchTerm} />
				) : (
					<>
						{/* Stats */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<StatsCard
								title="Total Agendadas"
								value={filteredCampaigns.length}
								icon={<FiCalendar className="w-6 h-6" />}
							/>
							<StatsCard
								title="Em Execução"
								value={
									filteredCampaigns.filter((c) => c.status === "running").length
								}
								icon={<FiPlay className="w-6 h-6" />}
							/>
							<StatsCard
								title="Total de Leads"
								value={filteredCampaigns.reduce(
									(acc, curr) => acc + (curr.totalLeads || 0),
									0,
								)}
								icon={<FiUsers className="w-6 h-6" />}
							/>
							<StatsCard
								title="Taxa de Entrega"
								value={`${calculateDeliveryRate(filteredCampaigns)}%`}
								icon={<FiBarChart2 className="w-6 h-6" />}
							/>
						</div>

						{/* Campaigns Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredCampaigns.map((campaign) => (
								<motion.div
									key={campaign.id}
									layout
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.9 }}
									className="bg-deep/30 rounded-xl p-6 border border-electric/30 backdrop-blur-xl"
								>
									{/* Campaign Card Content */}
									<div className="flex justify-between items-start mb-4">
										<h3 className="text-xl font-bold text-white">
											{campaign.name}
										</h3>
										<StatusBadge status={campaign.status} />
									</div>

									<div className="space-y-4">
										<div className="flex items-center gap-2 text-white/60">
											<FiCalendar />
											<span>
												{new Date(campaign.scheduledDate).toLocaleDateString()}
											</span>
											<FiClock />
											<span>
												{new Date(campaign.scheduledDate).toLocaleTimeString()}
											</span>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div>
												<p className="text-white/60">Total de Leads</p>
												<p className="text-xl font-bold text-white">
													{campaign.totalLeads}
												</p>
											</div>
											<div>
												<p className="text-white/60">Instância</p>
												<p className="text-xl font-bold text-white">
													{campaign.instance}
												</p>
											</div>
										</div>

										<div className="flex justify-end gap-2">
											<Button
												size="sm"
												variant="ghost"
												onClick={() => {
													setSelectedCampaign(campaign);
													setIsEditModalOpen(true);
												}}
											>
												<FiEdit2 />
											</Button>
											<Button
												size="sm"
												variant="destructive"
												onClick={() => {
													setSelectedCampaign(campaign);
													setIsDeleteModalOpen(true);
												}}
											>
												<FiTrash2 />
											</Button>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					</>
				)}
			</AnimatePresence>

			{/* Modals */}
			<Modal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				title="Editar Agendamento"
			>
				{selectedCampaign && (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							// Add form submission logic here
						}}
						className="space-y-6"
					>
						{/* Add form fields here */}
					</form>
				)}
			</Modal>

			<Modal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title="Cancelar Agendamento"
			>
				<div className="space-y-4">
					<p className="text-white/60">
						Tem certeza que deseja cancelar este agendamento?
					</p>
					<div className="flex justify-end gap-4">
						<Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								if (selectedCampaign) {
									cancelCampaign.mutate(selectedCampaign.id);
								}
							}}
						>
							Confirmar
						</Button>
					</div>
				</div>
			</Modal>
		</motion.div>
	);
};

const calculateDeliveryRate = (campaigns: ScheduledCampaign[]): string => {
	const totalSent = campaigns.reduce(
		(acc, curr) => acc + (curr.statistics?.sentCount || 0),
		0,
	);
	const totalDelivered = campaigns.reduce(
		(acc, curr) => acc + (curr.statistics?.deliveredCount || 0),
		0,
	);

	if (totalSent === 0) return "0";
	return ((totalDelivered / totalSent) * 100).toFixed(1);
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
	const statusConfig = {
		scheduled: {
			class: "bg-purple-500",
			label: "Agendada",
		},
		running: {
			class: "bg-green-500 animate-pulse",
			label: "Em execução",
		},
		paused: {
			class: "bg-yellow-500",
			label: "Pausada",
		},
		cancelled: {
			class: "bg-red-500",
			label: "Cancelada",
		},
		completed: {
			class: "bg-blue-500",
			label: "Concluída",
		},
	};

	const config = statusConfig[status] || statusConfig.scheduled;

	return (
		<span
			className={`px-3 py-1 rounded-full text-xs font-medium ${config.class} text-white`}
		>
			{config.label}
		</span>
	);
};

export default Agendados;
