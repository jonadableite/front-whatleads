import type { BotData } from "@/interface";

export async function saveFlexBotNewSettings(
	campaignId: string,
	data: BotData,
) {
	try {
		if (!campaignId) throw new Error("ID do bot é obrigatório");
		if (!data) throw new Error("Dados do bot são obrigatórios");
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/companies-unities/bots/${campaignId}`,
			{
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			},
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.message || "Erro ao salvar configurações do bot",
			);
		}

		const updatedData = await response.json();

		return {
			success: true,
			data: updatedData,
			message: "Configurações salvas com sucesso",
		};
	} catch (error) {
		console.error("Erro ao salvar configurações do bot:", error);
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: "Erro desconhecido ao salvar configurações",
		};
	}
}
