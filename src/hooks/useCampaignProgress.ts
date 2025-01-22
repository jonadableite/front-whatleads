import { api } from "@/lib/api";
// src/hooks/useCampaignProgress.ts
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ProgressData {
	progress: number;
	status: string | null;
	numbersProcessed: number;
	totalNumbers: number;
	error: string | null;
}

export const useCampaignProgress = (campaignId: string) => {
	const [data, setData] = useState<ProgressData>({
		progress: 0,
		status: null,
		numbersProcessed: 0,
		totalNumbers: 0,
		error: null,
	});
	const [isPolling, setIsPolling] = useState<boolean>(true);

	useEffect(() => {
		if (!campaignId) return;

		const fetchProgress = async () => {
			try {
				const response = await api.main.get(
					`/campaigns/${campaignId}/progress`,
				);

				if (response.data.success) {
					const { progress, status, statistics } = response.data.data;

					// Atualizar os dados do progresso
					setData({
						progress,
						status,
						numbersProcessed: statistics.sentCount,
						totalNumbers: statistics.totalLeads,
						error: null,
					});

					// Parar o polling caso a campanha seja concluída ou falhe
					if (["completed", "failed"].includes(status)) {
						setIsPolling(false);
					}
				}
			} catch (error) {
				console.error("Erro ao buscar progresso:", error);
				setData((prev) => ({
					...prev,
					error: "Erro ao atualizar progresso",
				}));
			}
		};

		// Iniciar o polling
		const intervalId = setInterval(fetchProgress, 2000);
		fetchProgress(); // Primeira chamada imediata

		// Limpar intervalo ao desmontar
		return () => {
			clearInterval(intervalId);
			setIsPolling(false);
		};
	}, [campaignId]);

	// Função para pausar a campanha
	const handlePause = async () => {
		try {
			await api.main.post(`/campaigns/${campaignId}/pause`);
			toast.success("Campanha pausada com sucesso");
			setIsPolling(false);
		} catch (error) {
			console.error("Erro ao pausar campanha:", error);
			toast.error("Erro ao pausar campanha");
		}
	};

	// Função para retomar a campanha
	const handleResume = async (instanceName: string) => {
		try {
			await api.main.post(`/campaigns/${campaignId}/resume`, { instanceName });
			toast.success("Campanha retomada com sucesso");
			setIsPolling(true);
		} catch (error) {
			console.error("Erro ao retomar campanha:", error);
			toast.error("Erro ao retomar campanha");
		}
	};

	// Função para cancelar a campanha
	const handleCancel = async () => {
		try {
			await api.main.post(`/campaigns/${campaignId}/stop`);
			toast.success("Campanha cancelada com sucesso");
			setIsPolling(false);
		} catch (error) {
			console.error("Erro ao cancelar campanha:", error);
			toast.error("Erro ao cancelar campanha");
		}
	};

	return {
		progress: data.progress,
		status: data.status,
		numbersProcessed: data.numbersProcessed,
		totalNumbers: data.totalNumbers,
		error: data.error,
		isPolling,
		handlePause,
		handleResume,
		handleCancel,
	};
};
