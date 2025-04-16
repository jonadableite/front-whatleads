import { FileLineChartIcon as FlowChart, Settings } from "lucide-react";
import dynamic, { Suspense, useEffect, useState } from "react";
import BotFixedSettingsEnhancedPage from "./bot-fixed-settings-enhanced-page";

// Carregue o WorkflowBuilderPage dinamicamente apenas no cliente com fallback
const WorkflowBuilderPage = dynamic(
	() => import("./workflow-builder").then((mod) => mod.default),
	{
		ssr: false,
		loading: () => (
			<div className="p-6 flex items-center justify-center h-[800px] bg-gray-50 dark:bg-[#0d0e12] rounded-xl shadow-sm border border-gray-200 dark:border-[#1B1C22]">
				<div className="text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
					<p className="mt-4 text-gray-600 dark:text-gray-400">
						Carregando editor visual...
					</p>
				</div>
			</div>
		),
	},
);

// Componente que integra as duas interfaces usando apenas Tailwind CSS
const BotSettingsWithWorkflow = ({ companyId = "", botData = null }) => {
	const [activeView, setActiveView] = useState("form");
	const [mounted, setMounted] = useState(false);

	// Garantir que o componente só renderize no cliente
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
		<div className="w-full">
			<div className="mb-1 flex items-center justify-between px-6 ">
				<div className="mb-0  py-2 flex items-center justify-between">
					<div className="flex items-center justify-center gap-3">
						<div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-lg">
							<Settings className="w-6 h-6 text-rose-600 dark:text-rose-600" />
						</div>
						<h2 className="text-base font-medium leading-none text-gray-900 dark:text-gray-200">
							{activeView === "form"
								? "Configuração do Bot Formulário"
								: "Editor de Fluxo Visual"}
						</h2>
					</div>
				</div>
				<div className="bg-gray-100 dark:bg-neutral-800 p-1 rounded-lg flex">
					<button
						onClick={() => setActiveView("form")}
						// className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
						//   activeView === "form"
						//     ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
						//     : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
						// }`}
						className={` px-4 py-0.5 text-sm rounded-md flex items-center gap-2 transition-all duration-300 ${
							activeView === "form"
								? "bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg"
								: " text-gray-500  dark:text-gray-300 dark:hover:bg-neutral-900 transition-color"
						}`}
					>
						<Settings className="w-4 h-4" />
						<span>Editor de Formulário</span>
					</button>
					<button
						onClick={() => setActiveView("workflow")}
						// className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
						//   activeView === "workflow"
						//     ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
						//     : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
						// }`}
						className={` px-4 py-0.5 text-sm rounded-md flex items-center gap-2 transition-all duration-300 ${
							activeView === "workflow"
								? "bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg"
								: " text-gray-500  dark:text-gray-300 dark:hover:bg-neutral-800 transition-color"
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
							<div className="p-6 flex items-center justify-center h-[800px] bg-gray-50 dark:bg-[#0d0e12] rounded-xl shadow-sm border border-gray-200 dark:border-[#1B1C22]">
								<div className="text-center">
									<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
									<p className="mt-4 text-gray-600 dark:text-gray-400">
										Carregando editor visual...
									</p>
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
