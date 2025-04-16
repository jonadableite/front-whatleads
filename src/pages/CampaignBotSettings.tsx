import type { Campaign } from "@/interface";
// src/pages/CampaignBotSettings.tsx
import type React from "react";
import { useEffect, useState } from "react";
import BotSettingsWithWorkflow from "../components/BotSettingsWithWorkflow";
import { getAuthenticatedUser, getCurrentUserCampaigns } from "../services/api";

const CampaignBotSettings: React.FC = () => {
	const [campaignData, setCampaignData] = useState<Campaign | null>(null);
	const [userData, setUserData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const user = await getAuthenticatedUser();
				setUserData(user);

				if (user) {
					const campaigns = await getCurrentUserCampaigns();

					// Encontrar campanha com AI Responder ativo
					const aiResponderCampaign = campaigns?.find(
						(campaign: Campaign) => campaign.isAiResponder,
					);

					if (aiResponderCampaign) {
						setCampaignData(aiResponderCampaign);
					}
				}
			} catch (err) {
				setError("Erro ao carregar dados da campanha");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) return <div>Carregando...</div>;
	if (error) return <div>{error}</div>;
	if (!userData) return <div>Usuário não autenticado</div>;

	return (
		<div className="mx-auto max-w-screen px-0 py-0 overflow-hidden bg-[#0d0e12] min-h-screen">
			{campaignData?.isAiResponder && (
				<BotSettingsWithWorkflow
					botData={campaignData.isAiResponder}
					campaignId={campaignData.id}
				/>
			)}
		</div>
	);
};

export default CampaignBotSettings;
