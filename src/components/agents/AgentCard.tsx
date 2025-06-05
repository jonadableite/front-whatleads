// src/components/Agents/AgentCard.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils"; // Assumindo que você tem a função cn
import type { Folder } from "@/services/agentService"; // Assumindo este caminho
import type { Agent, AgentType } from "@/types/agent"; // Assumindo este caminho
import type { MCPServer } from "@/types/mcpServer"; // Assumindo este caminho
import {
	Bot,
	ChevronDown,
	ChevronUp,
	Code,
	ExternalLink,
	GitBranch,
	MoveRight,
	Pencil,
	RefreshCw,
	Settings,
	Share2,
	TextSelect,
	Trash2,
	Workflow,
} from "lucide-react";
import { useState } from "react";

interface AgentCardProps {
	agent: Agent;
	onEdit: (agent: Agent) => void;
	onDelete: (agent: Agent) => void;
	onMove: (agent: Agent) => void;
	onShare?: (agent: Agent) => void;
	onWorkflow?: (agentId: string) => void;
	availableMCPs?: MCPServer[];
	getApiKeyNameById?: (id: string | undefined) => string | null;
	getAgentNameById?: (id: string) => string;
	folders?: Folder[];
}

export function AgentCard({
	agent,
	onEdit,
	onDelete,
	onMove,
	onShare,
	onWorkflow,
	availableMCPs = [],
	getApiKeyNameById = () => null,
	getAgentNameById = (id) => id,
	folders = [],
}: AgentCardProps) {
	const [expanded, setExpanded] = useState(false);

	const getAgentTypeIcon = (type: AgentType) => {
		const agentTypes = [
			{ value: "llm", icon: Code },
			{ value: "a2a", icon: ExternalLink },
			{ value: "sequential", icon: Workflow },
			{ value: "parallel", icon: GitBranch },
			{ value: "loop", icon: RefreshCw },
			{ value: "workflow", icon: Workflow },
			{ value: "task", icon: Bot },
		];
		const agentType = agentTypes.find((t) => t.value === type);
		const IconComponent = agentType ? agentType.icon : Bot;

		// Estilo futurista para o ícone: cor vibrante com sombra/brilho sutil
		return (
			<IconComponent className="h-6 w-6 text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]" />
		);
	};

	const getFolderNameById = (id: string) => {
		const folder = folders?.find((f) => f.id === id);
		return folder?.name || "N/A";
	};

	const getAgentTypeName = (type: AgentType) => {
		const agentTypes = [
			{ value: "llm", label: "Agente LLM" },
			{ value: "a2a", label: "Agente A2A" },
			{ value: "sequential", label: "Agente Sequencial" },
			{ value: "parallel", label: "Agente Paralelo" },
			{ value: "loop", label: "Agente Loop" },
			{ value: "workflow", label: "Workflow" },
			{ value: "task", label: "Agente Tarefa" },
		];
		return agentTypes.find((t) => t.value === type)?.label || type;
	};

	const getTotalTools = () => {
		if (agent.type === "llm" && agent.config?.mcp_servers) {
			return agent.config.mcp_servers.reduce(
				(total, mcp) => total + (mcp.tools?.length || 0),
				0,
			);
		}
		return 0;
	};

	const getCreatedAtFormatted = () => {
		return new Date(agent.created_at).toLocaleDateString("pt-BR");
	};

	const handleTestA2A = () => {
		const agentUrl = agent.agent_card_url?.replace("/.well-known/agent.json", "") || "";
		const apiKey = agent.config?.api_key || "";
		const documentationUrl = `/documentation?agent_url=${agentUrl}&api_key=${apiKey}`;
		// Usar window.open para abrir em uma nova aba/janela
		window.open(documentationUrl, '_blank');
	};


	return (
		<Card
			className={cn(
				"w-full overflow-hidden rounded-2xl", // Cantos mais arredondados
				"border border-electric/50", // Borda sutil
				"shadow-xl shadow-electric/20 dark:shadow-electric/30", // Sombra mais proeminente e com brilho
				"bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950", // Gradiente mais escuro e profundo
				"transform transition-all duration-500 ease-in-out", // Transição mais suave e longa
				"hover:scale-[1.03] hover:shadow-2xl hover:shadow-electric/40", // Efeito hover mais pronunciado
				"relative",
				"group", // Adicionado group para estilização potencial de elementos filhos no hover
			)}
		>
			{/* Efeito de brilho radial sutil no fundo */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(100,200,255,0.1)_0%,_transparent_50%)]"></div>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(150,100,255,0.1)_0%,_transparent_50%)]"></div>
			</div>

			{/* Header do Card */}
			<div
				className={cn(
					"p-4 flex justify-between items-center",
					"bg-gradient-to-r from-blue-800/40 to-purple-800/40 border-b border-electric/50 backdrop-blur-sm", // Header semi-transparente e borrado
				)}
			>
				<div className="flex items-center gap-4"> {/* Aumento do espaçamento */}
					{getAgentTypeIcon(agent.type)}
					<h3 className="font-bold text-xl text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.3)]"> {/* Texto mais negrito, com sombra/brilho sutil */}
						{agent.name}
					</h3>
				</div>
				<Badge
					className={cn(
						"text-xs px-3 py-1.5 rounded-full", // Badge arredondado
						"bg-cyan-600/30 text-cyan-300 border border-cyan-400/50 backdrop-blur-sm", // Badge semi-transparente e vibrante
					)}
				>
					{getAgentTypeName(agent.type)}
				</Badge>
			</div>

			<CardContent className="p-0">
				{/* Seção de Descrição */}
				<div
					className={cn(
						"p-4 border-b border-electric/30", // Borda sutil
					)}
				>
					<p className="text-sm italic text-blue-300 leading-relaxed"> {/* Cor do texto ajustada e altura da linha */}
						{agent.description
							? agent.description.length > 150 // Permite uma descrição um pouco maior antes de truncar
								? `${agent.description.substring(0, 150)}...`
								: agent.description
							: "Sem descrição."}
						{/* Opcionalmente adiciona um botão "Leia mais" se truncado */}
						{agent.description && agent.description.length > 150 && !expanded && (
							<span className="text-cyan-400 cursor-pointer hover:underline ml-1" onClick={() => setExpanded(true)}>
								Leia mais
							</span>
						)}
					</p>
				</div>

				{/* Seção Modelo e Botão Expandir */}
				<div
					className={cn(
						"p-4 flex justify-between items-center",
						"bg-gray-800/50", // Fundo sutil para esta seção
					)}
				>
					<div className="flex items-center gap-2">
						<span className="text-xs text-purple-400">
							Modelo:
						</span>
						<span className="text-xs font-medium text-cyan-400"> {/* Cor de texto vibrante */}
							{agent.type === "llm" ? agent.model : "N/A"}
						</span>
					</div>
					<Button
						variant="ghost"
						size="sm"
						className={cn(
							"p-0 h-auto transition-colors duration-300", // Transição mais suave
							"text-blue-300 hover:text-cyan-400", // Mudança de cor no hover
						)}
						onClick={() => setExpanded(!expanded)}
					>
						<span className="mr-1 text-xs">
							{expanded ? "Menos detalhes" : "Mais detalhes"}
						</span>
						{expanded ? (
							<ChevronUp className="h-4 w-4 transform transition-transform duration-300 rotate-180 text-cyan-400" /> // Cor do ícone
						) : (
							<ChevronDown className="h-4 w-4 transform transition-transform duration-300 text-cyan-400" /> // Cor do ícone
						)}
					</Button>
				</div>

				{/* Seção expandida com transição suave e fundo sutil */}
				<div
					className={cn(
						"p-4 text-xs space-y-3 overflow-hidden",
						"bg-gray-700/40", // Fundo sutil para a seção expandida
						"transition-all duration-500 ease-in-out", // Transição mais suave e longa
						expanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0",
					)}
				>
					{agent.folder_id && (
						<div className="flex justify-between items-center">
							<span className="text-blue-300">Pasta:</span>
							<Badge
								className={cn(
									"h-5 px-2 bg-blue-600/30 text-blue-300 border border-blue-400/50 backdrop-blur-sm", // Badge vibrante
								)}
							>
								{getFolderNameById(agent.folder_id)}
							</Badge>
						</div>
					)}
					{agent.type === "llm" && agent.api_key_id && (
						<div className="flex justify-between items-center">
							<span className="text-blue-300">
								Chave API:
							</span>
							<Badge
								className={cn(
									"h-5 px-2 bg-blue-600/30 text-blue-300 border border-blue-400/50 backdrop-blur-sm", // Badge vibrante
								)}
							>
								{getApiKeyNameById(agent.api_key_id) || "Não configurada"}
							</Badge>
						</div>
					)}
					{getTotalTools() > 0 && (
						<div className="flex justify-between items-center">
							<span className="text-blue-300">
								Ferramentas:
							</span>
							<span className="text-cyan-400"> {/* Cor de valor vibrante */}
								{getTotalTools()}
							</span>
						</div>
					)}
					{agent.config?.sub_agents && agent.config.sub_agents.length > 0 && (
						<div className="flex justify-between items-center">
							<span className="text-blue-300">
								Sub-agentes:
							</span>
							<span className="text-cyan-400"> {/* Cor de valor vibrante */}
								{agent.config.sub_agents.length}
							</span>
						</div>
					)}
					{agent.type === "workflow" && agent.config?.workflow && (
						<div className="flex justify-between items-center">
							<span className="text-blue-300">
								Elementos:
							</span>
							<span className="text-cyan-400"> {/* Cor de valor vibrante */}
								{agent.config.workflow.nodes?.length || 0} nós,{" "}
								{agent.config.workflow.edges?.length || 0} conexões
							</span>
						</div>
					)}
					<div className="flex justify-between items-center">
						<span className="text-blue-300">
							Criado em:
						</span>
						<span className="text-cyan-400"> {/* Cor de valor vibrante */}
							{getCreatedAtFormatted()}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-blue-300">ID:</span>
						<span className="text-purple-400 text-[10px] select-all cursor-text break-all"> {/* Tamanho de texto ajustado e quebra de linha */}
							{agent.id}
						</span>
					</div>
				</div>

				{/* Footer com Botão de Configuração */}
				<div
					className={cn(
						"flex",
						"border-t border-electric/30", // Borda sutil
					)}
				>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className={cn(
									"flex-1 rounded-none h-12 transition-colors duration-300", // Transição mais suave
									"text-blue-300 hover:bg-blue-700/30 hover:text-white", // Efeito hover
								)}
							>
								<Settings className="h-4 w-4 mr-2 text-cyan-400" /> {/* Cor do ícone */}
								Configurar
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className={cn(
								"shadow-xl shadow-electric/30", // Sombra com brilho
								"bg-gray-900 border border-electric/50 text-blue-200", // Fundo mais escuro, borda sutil, texto mais claro
							)}
						>
							{agent.type === "workflow" && onWorkflow && (
								<DropdownMenuItem
									className={cn(
										"cursor-pointer transition-colors duration-150",
										"hover:bg-blue-800/50 focus:bg-blue-800/50 text-blue-200 hover:text-white", // Efeito hover
									)}
									onClick={() => onWorkflow(agent.id)}
								>
									<Workflow className="h-4 w-4 mr-2 text-cyan-400" /> {/* Cor do ícone */}
									Abrir Workflow
								</DropdownMenuItem>
							)}
							{/* Item "Testar A2A" usando window.open */}
							<DropdownMenuItem
								className={cn(
									"cursor-pointer transition-colors duration-150",
									"hover:bg-blue-800/50 focus:bg-blue-800/50 text-blue-200 hover:text-white", // Efeito hover
								)}
								onClick={handleTestA2A}
							>
								<TextSelect className="h-4 w-4 mr-2 text-cyan-400" /> {/* Cor do ícone */}
								Testar A2A
							</DropdownMenuItem>
							<DropdownMenuItem
								className={cn(
									"cursor-pointer transition-colors duration-150",
									"hover:bg-blue-800/50 focus:bg-blue-800/50 text-blue-200 hover:text-white", // Efeito hover
								)}
								onClick={() => onEdit(agent)}
							>
								<Pencil className="h-4 w-4 mr-2 text-cyan-400" /> {/* Cor do ícone */}
								Editar
							</DropdownMenuItem>
							<DropdownMenuItem
								className={cn(
									"cursor-pointer transition-colors duration-150",
									"hover:bg-blue-800/50 focus:bg-blue-800/50 text-blue-200 hover:text-white", // Efeito hover
								)}
								onClick={() => onMove(agent)}
							>
								<MoveRight className="h-4 w-4 mr-2 text-cyan-400" /> {/* Cor do ícone */}
								Mover para Pasta
							</DropdownMenuItem>
							{onShare && (
								<DropdownMenuItem
									className={cn(
										"cursor-pointer transition-colors duration-150",
										"hover:bg-blue-800/50 focus:bg-blue-800/50 text-blue-200 hover:text-white", // Efeito hover
									)}
									onClick={() => onShare(agent)}
								>
									<Share2 className="h-4 w-4 mr-2 text-cyan-400" /> {/* Cor do ícone */}
									Compartilhar
								</DropdownMenuItem>
							)}
							<DropdownMenuItem
								className={cn(
									"cursor-pointer transition-colors duration-150",
									"text-red-500 hover:bg-red-900/50 hover:text-red-400 focus:bg-red-900/50", // Hover vermelho para exclusão
								)}
								onClick={() => onDelete(agent)}
							>
								<Trash2 className="h-4 w-4 mr-2 text-red-500" /> {/* Cor do ícone */}
								Excluir
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardContent>
		</Card>
	);
}
