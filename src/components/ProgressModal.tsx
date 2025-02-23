//src/components/ProgressModal.tsx
import type { ProgressModalProps, StatsGridProps } from "@/interface";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
	FiCheckCircle,
	FiClock,
	FiPause,
	FiPlay,
	FiSend,
	FiUsers,
	FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useCampaignProgress } from "../hooks/useCampaignProgress";
import { DialogContent, DialogTitle, Modal } from "./ui/modal";

export const ProgressModal: React.FC<ProgressModalProps> = ({
	isOpen,
	onClose,
	campaignId,
	instanceName: propInstanceName,
	onPause: externalOnPause,
	onResume: externalOnResume,
	onCancel: externalOnCancel,
}) => {
	const {
		progress,
		status: campaignStatus,
		numbersProcessed,
		totalNumbers,
		error,
		handlePause: internalHandlePause,
		handleResume: internalHandleResume,
		handleCancel: internalHandleCancel,
		instanceName: hookInstanceName,
	} = useCampaignProgress(campaignId);

	const [isInitializing, setIsInitializing] = useState(true);

	// Prioriza instanceName da prop, depois do hook
	const instanceName = propInstanceName || hookInstanceName;

	// Efeito para exibir inicialização
	useEffect(() => {
		if (isOpen) {
			setIsInitializing(true);
			const timer = setTimeout(() => {
				setIsInitializing(false);
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	// Função de resumo com tratamento de erro
	const handleResumeWithInstanceName = async () => {
		try {
			if (instanceName) {
				if (externalOnResume) {
					await externalOnResume();
				} else if (internalHandleResume) {
					await internalHandleResume(instanceName);
				}
			} else {
				toast.error("Nome da instância não disponível");
			}
		} catch (err) {
			console.error("Erro ao retomar campanha:", err);
			toast.error("Não foi possível retomar a campanha");
		}
	};

	// Renderização condicional de botões de ação
	const renderActionButtons = () => {
		return (
			<div className="flex gap-2">
				{campaignStatus === "running" && (
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
						onClick={async (e) => {
							e.preventDefault();
							try {
								if (externalOnPause) {
									await externalOnPause();
								} else if (internalHandlePause) {
									await internalHandlePause();
								}
							} catch (err) {
								console.error("Erro ao pausar campanha:", err);
								toast.error("Não foi possível pausar a campanha");
							}
						}}
					>
						<FiPause />
					</motion.button>
				)}
				{campaignStatus === "paused" && (
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="p-2 rounded-lg bg-electric/20 text-electric hover:bg-electric/30"
						onClick={(e) => {
							e.preventDefault();
							handleResumeWithInstanceName();
						}}
					>
						<FiPlay />
					</motion.button>
				)}
				{campaignStatus !== "completed" && (
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
						onClick={async (e) => {
							e.preventDefault();
							try {
								if (externalOnCancel) {
									await externalOnCancel();
								} else if (internalHandleCancel) {
									await internalHandleCancel();
								}
							} catch (err) {
								console.error("Erro ao cancelar campanha:", err);
								toast.error("Não foi possível cancelar a campanha");
							}
						}}
					>
						<FiX />
					</motion.button>
				)}
			</div>
		);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<DialogTitle className="sr-only">Status do Disparo</DialogTitle>
			<DialogContent>
				<div className="p-8 bg-deep/95 backdrop-blur-xl rounded-xl border-none">
					{/* Cabeçalho */}
					<div className="flex justify-between items-center mb-6">
						<motion.h2
							initial={{ y: -20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-neon-purple to-electric"
						>
							Status do Disparo
						</motion.h2>
						{renderActionButtons()}
					</div>

					{/* Corpo principal */}
					{error ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-red-500 text-center py-4"
						>
							{error}
						</motion.div>
					) : (
						<AnimatePresence mode="wait">
							{isInitializing ? (
								<InitializingView key="initializing" />
							) : (
								<ProgressView
									key="progress"
									progress={progress}
									numbersProcessed={numbersProcessed}
									totalNumbers={totalNumbers}
									campaignStatus={campaignStatus}
									onPause={externalOnPause || internalHandlePause}
									onResume={handleResumeWithInstanceName}
									onCancel={externalOnCancel || internalHandleCancel}
								/>
							)}
						</AnimatePresence>
					)}
				</div>
			</DialogContent>
		</Modal>
	);
};

// Componentes auxiliares
const InitializingView: React.FC = () => (
	<motion.div
		initial={{ scale: 0.8, opacity: 0 }}
		animate={{ scale: 1, opacity: 1 }}
		exit={{ scale: 0.8, opacity: 0 }}
		className="flex flex-col items-center py-8"
	>
		<div className="relative w-24 h-24">
			<motion.div
				animate={{
					scale: [1, 1.2, 1],
					opacity: [0.5, 0.8, 0.5],
				}}
				transition={{
					duration: 2,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
				}}
				className="absolute inset-0 rounded-full bg-electric/20"
			/>
			<motion.div
				animate={{ rotate: 360 }}
				transition={{
					duration: 2,
					repeat: Number.POSITIVE_INFINITY,
					ease: "linear",
				}}
				className="absolute inset-0 rounded-full border-4 border-electric border-t-transparent"
			/>
			<div className="absolute inset-0 flex items-center justify-center">
				<FiSend className="text-3xl text-electric" />
			</div>
		</div>
		<motion.p
			animate={{
				opacity: [0.5, 1, 0.5],
			}}
			transition={{
				duration: 1.5,
				repeat: Number.POSITIVE_INFINITY,
				ease: "easeInOut",
			}}
			className="mt-4 text-electric font-medium"
		>
			Preparando envios...
		</motion.p>
	</motion.div>
);

const ProgressView: React.FC<{
	progress: number;
	numbersProcessed: number;
	totalNumbers: number;
	campaignStatus: string | null;
	onPause?: () => Promise<void>;
	onResume?: () => Promise<void>;
	onCancel?: () => Promise<void>;
}> = ({
	progress,
	numbersProcessed,
	totalNumbers,
	campaignStatus,
	onPause,
	onResume,
	onCancel,
}) => (
	<motion.div
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		className="space-y-8"
	>
		{/* Progresso */}
		<div className="relative">
			<div className="flex justify-between mb-2 text-white/80">
				<span className="font-medium">{getStatusText(campaignStatus)}</span>
				<motion.span
					key={progress}
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					className="text-electric font-bold"
				>
					{progress.toFixed(1)}%
				</motion.span>
			</div>
			{/* Barra de progresso */}
			<div className="h-4 bg-deep/50 rounded-full overflow-hidden">
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: `${progress}%` }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="h-full bg-gradient-to-r from-electric via-neon-green to-electric"
				/>
			</div>
		</div>

		{/* Estatísticas */}
		<StatsGrid
			totalNumbers={totalNumbers}
			numbersProcessed={numbersProcessed}
			remaining={totalNumbers - numbersProcessed}
		/>

		{/* Mensagem de conclusão */}
		{campaignStatus === "completed" && (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="text-center text-neon-green"
			>
				<FiCheckCircle className="text-4xl mx-auto mb-2" />
				<p className="font-medium">Envios concluídos com sucesso!</p>
			</motion.div>
		)}
	</motion.div>
);

// Grid de Estatísticas
const StatsGrid: React.FC<StatsGridProps> = ({
	totalNumbers,
	numbersProcessed,
	remaining,
}) => (
	<div className="grid grid-cols-3 gap-4">
		<StatsCard
			icon={<FiUsers />}
			label="Total"
			value={totalNumbers}
			color="text-electric"
		/>
		<StatsCard
			icon={<FiCheckCircle />}
			label="Enviadas"
			value={numbersProcessed}
			color="text-neon-green"
		/>
		<StatsCard
			icon={<FiClock />}
			label="Restantes"
			value={remaining}
			color="text-electric"
		/>
	</div>
);

const StatsCard: React.FC<{
	icon: React.ReactNode;
	label: string;
	value: number;
	color: string;
}> = ({ icon, label, value, color }) => (
	<div className="bg-deep/50 p-4 rounded-lg border border-electric/20">
		<div className={`text-2xl mb-2 ${color}`}>{icon}</div>
		<div className="text-white/60 text-sm">{label}</div>
		<div className="text-white font-bold text-lg">{value}</div>
	</div>
);

const getStatusText = (campaignStatus: string | null): string => {
	switch (campaignStatus) {
		case "running":
			return "Em andamento";
		case "completed":
			return "Concluído";
		case "paused":
			return "Pausado";
		case "failed":
			return "Falhou";
		default:
			return "Preparando";
	}
};

export default ProgressModal;
