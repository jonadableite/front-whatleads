/* eslint-disable react-hooks/rules-of-hooks */
// @ts-nocheck

import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Select } from "@/components/ui/select";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { FiAlertCircle, FiCalendar, FiClock, FiSearch } from "react-icons/fi";
import { useParams } from "react-router-dom";
import type { Dispatch } from "../interface";

const pageTransition = {
	out: { opacity: 0, y: 20 },
	in: { opacity: 1, y: 0 },
};

const LoadingState = () => (
	<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{[1, 2, 3].map((i) => (
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
);

const EmptyState = ({ searchTerm }: { searchTerm: string }) => (
	<div className="text-center py-12">
		<FiAlertCircle className="w-12 h-12 text-electric/50 mx-auto mb-4" />
		<h3 className="text-xl font-medium text-white mb-2">
			Nenhuma campanha encontrada
		</h3>
		<p className="text-white/60">
			{searchTerm
				? `Nenhuma campanha encontrada para "${searchTerm}"`
				: "Nenhuma campanha agendada no momento"}
		</p>
	</div>
);

const SyncButton: React.FC<{ onClick: () => void; loading: boolean }> = ({
	onClick,
	loading,
}) => {
	return (
		<motion.button
			onClick={onClick}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			className={`
        flex items-center gap-2 px-4 py-2
        rounded-lg text-sm font-medium
        transition-all duration-300
        ${loading
					? "bg-gradient-to-r from-neon-green/20 to-neon-green/10"
					: "bg-gradient-to-r from-neon-green/10 to-neon-green/5 hover:from-neon-green/20 hover:to-neon-green/10"
				}
        border border-deep/30
        text-whatsapp-eletrico
        shadow-lg hover:shadow-xl
        backdrop-blur-sm
      `}
			disabled={loading}
		>
			<motion.div
				animate={{ rotate: loading ? 360 : 0 }}
				transition={{
					duration: 1,
					ease: "linear",
					repeat: loading ? Number.POSITIVE_INFINITY : 0,
					repeatType: "loop",
				}}
				className="w-5 h-5"
			>
				{loading ? (
					<svg
						className="animate-spin"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
				) : (
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M21 2v6h-6" />
						<path d="M3 12a9 9 0 0115-6.7L21 8" />
						<path d="M3 22v-6h6" />
						<path d="M21 12a9 9 0 01-15 6.7L3 16" />
					</svg>
				)}
			</motion.div>
			<span>{loading ? "Sincronizando..." : "Sincronizar"}</span>
		</motion.button>
	);
};

const Historico: React.FC = () => {
	const { campaignId } = useParams<{ campaignId: string }>();
	const [searchTerm, setSearchTerm] = useState("");
	const [instanceFilter, setInstanceFilter] = useState("");
	const [dateFilter, setDateFilter] = useState("");
	const [isSyncing, setIsSyncing] = useState(false);

	// Verificar se campaignId existe
	if (!campaignId) {
		return (
			<div className="text-center py-12">
				<FiAlertCircle className="w-12 h-12 text-electric/50 mx-auto mb-4" />
				<h3 className="text-xl font-medium text-white mb-2">
					ID da campanha não fornecido
				</h3>
				<p className="text-white/60">
					Não foi possível carregar o histórico sem um ID de campanha válido
				</p>
			</div>
		);
	}

	const {
		data: response,
		isLoading,
		error,
		refetch,
	} = useQuery<{ success: boolean; data: Dispatch[] }>({
		queryKey: ["dispatches", campaignId],
		queryFn: async () => {
			try {
				console.log("Buscando dispatches para campanha:", campaignId);
				const response = await api.get(
					`/campaigns/${campaignId}/dispatches`,
				);
				console.log("Resposta da API:", response.data);
				return response.data;
			} catch (error) {
				console.error("Erro ao buscar dispatches:", error);
				throw error;
			}
		},
		enabled: Boolean(campaignId), // Só executa se campaignId existir
		retry: 1, // Tenta uma vez em caso de erro
	});

	const handleSync = async () => {
		if (!campaignId) {
			console.error("Tentativa de sincronização sem campaignId");
			return;
		}

		setIsSyncing(true);
		try {
			await refetch();
		} catch (error) {
			console.error("Erro ao sincronizar:", error);
		} finally {
			setIsSyncing(false);
		}
	};

	const dispatches = useMemo(() => {
		if (!response?.data) return [];
		return [...response.data].sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
	}, [response?.data]);

	const filteredDispatches = useMemo(() => {
		return dispatches.filter((dispatch) => {
			const searchMatch = searchTerm
				? dispatch.instanceName
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				dispatch.id.toLowerCase().includes(searchTerm.toLowerCase())
				: true;

			const instanceMatch = instanceFilter
				? dispatch.instanceName === instanceFilter
				: true;

			const dateMatch = dateFilter
				? new Date(dispatch.createdAt).toDateString() ===
				new Date(dateFilter).toDateString()
				: true;

			return searchMatch && instanceMatch && dateMatch;
		});
	}, [dispatches, searchTerm, instanceFilter, dateFilter]);

	const instances = useMemo(() => {
		if (!dispatches) return [];
		return [...new Set(dispatches.map((d) => d.instanceName))];
	}, [dispatches]);

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
					<h1 className="text-4xl font-bold text-white">
						Histórico de Disparos
					</h1>
					<p className="text-white/60 mt-2">
						Visualize o histórico completo de disparos realizados
					</p>
				</div>
				<SyncButton onClick={handleSync} loading={isSyncing || isLoading} />
			</div>

			{/* Filters */}
			<div className="flex gap-4 items-center bg-deep/30 p-4 rounded-xl backdrop-blur-xl">
				<div className="flex-1">
					<InputWithIcon
						type="text"
						placeholder="Buscar por instância..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						icon={<FiSearch className="w-5 h-5" />}
					/>
				</div>
				<Select
					value={instanceFilter}
					onChange={(e) => setInstanceFilter(e.target.value)}
					className="bg-deep/50 border-electric text-white"
				>
					<option value="">Todas as instâncias</option>
					{instances.map((instance) => (
						<option key={instance} value={instance}>
							{instance}
						</option>
					))}
				</Select>
				<input
					type="date"
					value={dateFilter}
					onChange={(e) => setDateFilter(e.target.value)}
					className="bg-deep/50 border-electric text-white rounded-lg p-2"
				/>
			</div>

			{/* Content */}
			<AnimatePresence mode="wait">
				{isLoading ? (
					<LoadingState />
				) : error ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="text-center text-red-500"
					>
						Erro ao carregar histórico
					</motion.div>
				) : filteredDispatches.length === 0 ? (
					<EmptyState searchTerm={searchTerm} />
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
					>
						{filteredDispatches.map((dispatch) => (
							<motion.div
								key={dispatch.id}
								layout
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								className="bg-deep/30 rounded-xl p-6 border border-electric/30 backdrop-blur-xl"
							>
								<div className="flex justify-between items-start mb-4">
									<h3 className="text-xl font-bold text-white">
										{dispatch.instanceName}
									</h3>
									<StatusBadge status={dispatch.status} />
								</div>

								<div className="space-y-4">
									<div className="flex items-center gap-2 text-white/60">
										<FiCalendar />
										<span>
											{new Date(dispatch.startedAt).toLocaleDateString()}
										</span>
										<FiClock />
										<span>
											{new Date(dispatch.startedAt).toLocaleTimeString()}
										</span>
									</div>

									<div className="text-sm text-white/60">
										<p>ID: {dispatch.id}</p>
										<p>Campanha ID: {dispatch.campaignId}</p>
									</div>

									{dispatch.completedAt && (
										<div className="text-sm text-white/60">
											<p>Concluído em:</p>
											<p>{new Date(dispatch.completedAt).toLocaleString()}</p>
										</div>
									)}
								</div>
							</motion.div>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

export default Historico;
