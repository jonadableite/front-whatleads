// src/components/fluxoflows/bot-workflow-integration.tsx
import { FileLineChartIcon as FlowChart, Settings } from "lucide-react";
import React, { Suspense, useEffect, useState } from "react";
import BotFixedSettingsEnhancedPage from "./bot-fixed-settings-enhanced-page";
// Carregue o WorkflowBuilderPage dinamicamente apenas no cliente
const WorkflowBuilderPage = React.lazy(() => import("./workflow-builder"));

const BotSettingsWithWorkflow = ({ companyId = "", botData = null }) => {
	const [activeView, setActiveView] = useState("form");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="w-full">
				<div className="mt-0">
					<BotFixedSettingsEnhancedPage
						companyId={companyId}
						botData={botData ?? undefined}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-deep w-full">
			<div className="mb-1 flex items-center justify-between px-6">
				<div className="mb-0 py-2 flex items-center justify-between">
					<div className="flex items-center justify-center gap-3">
						<div className="bg-electric/10 p-2 rounded-lg">
							<Settings className="w-6 h-6 text-electric" />
						</div>
						<h2 className="text-base font-medium leading-none text-white">
							{activeView === "form"
								? "Configuração do Bot Formulário"
								: "Editor de Fluxo Visual"}
						</h2>
					</div>
				</div>
				<div className="bg-deep/60 p-1 rounded-lg flex">
					<button
						onClick={() => setActiveView("form")}
						className={`px-4 py-0.5 text-sm rounded-md flex items-center gap-2 transition-all duration-300 ${
							activeView === "form"
								? "bg-electric hover:bg-electric/80 text-white shadow-md hover:shadow-lg"
								: "text-white/60 hover:bg-deep/50 transition-colors"
						}`}
					>
						<Settings className="w-4 h-4" />
						<span>Editor de Formulário</span>
					</button>
					<button
						onClick={() => setActiveView("workflow")}
						className={`px-4 py-0.5 text-sm rounded-md flex items-center gap-2 transition-all duration-300 ${
							activeView === "workflow"
								? "bg-electric hover:bg-electric/80 text-white shadow-md hover:shadow-lg"
								: "text-white/60 hover:bg-deep/50 transition-colors"
						}`}
					>
						<FlowChart className="w-4 h-4" />
						<span>Editor Visual</span>
					</button>
				</div>
			</div>
			<div className="mt-0">
				{activeView === "form" ? (
					<BotFixedSettingsEnhancedPage
						companyId={companyId}
						botData={botData ?? undefined}
					/>
				) : (
					<Suspense
						fallback={
							<div className="p-6 flex items-center justify-center h-[800px] bg-deep/80 rounded-xl shadow-sm border border-electric">
								<div className="text-center">
									<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-electric border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
									<p className="mt-4 text-white">Carregando editor visual...</p>
								</div>
							</div>
						}
					>
						<WorkflowBuilderPage
							botData={botData ?? undefined}
							companyId={companyId}
						/>
					</Suspense>
				)}
			</div>
		</div>
	);
};

export default BotSettingsWithWorkflow;
