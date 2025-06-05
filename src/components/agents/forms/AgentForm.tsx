// app/agents/forms/AgentForm.tsx

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ApiKey } from "@/services/agentService";
import type { Agent } from "@/types/agent";
import type { MCPServer } from "@/types/mcpServer";
import { useEffect, useState } from "react";
import { CustomMCPDialog } from "../dialogs/CustomMCPDialog";
import { MCPDialog } from "../dialogs/MCPDialog";
import { BasicInfoTab } from "./BasicInfoTab";
import { ConfigurationTab } from "./ConfigurationTab";
import { SubAgentsTab } from "./SubAgentsTab";

interface ModelOption {
	value: string;
	label: string;
	provider: string;
}

interface AgentFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialValues: Partial<Agent>;
	apiKeys: ApiKey[];
	availableModels: ModelOption[];
	availableMCPs: MCPServer[];
	agents: Agent[];
	onOpenApiKeysDialog: () => void;
	onOpenMCPDialog: (mcp?: any) => void;
	onOpenCustomMCPDialog: (customMCP?: any) => void;
	onSave: (values: Partial<Agent>) => Promise<void>;
	isLoading?: boolean;
	getAgentNameById: (id: string) => string;
	clientId: string;
}

export function AgentForm({
	open,
	onOpenChange,
	initialValues,
	apiKeys,
	availableModels,
	availableMCPs,
	agents,
	onOpenApiKeysDialog,
	onOpenMCPDialog: externalOnOpenMCPDialog,
	onOpenCustomMCPDialog: externalOnOpenCustomMCPDialog,
	onSave,
	isLoading = false,
	getAgentNameById,
	clientId,
}: AgentFormProps) {
	const [values, setValues] = useState<Partial<Agent>>(initialValues);
	const [activeTab, setActiveTab] = useState("basic");

	const [mcpDialogOpen, setMcpDialogOpen] = useState(false);
	const [selectedMCP, setSelectedMCP] = useState<any>(null);
	const [customMcpDialogOpen, setCustomMcpDialogOpen] = useState(false);
	const [selectedCustomMCP, setSelectedCustomMCP] = useState<any>(null);

	useEffect(() => {
		if (open) {
			setValues(initialValues);
			setActiveTab("basic");
		}
	}, [open, initialValues]);

	const handleOpenMCPDialog = (mcpConfig: any = null) => {
		setSelectedMCP(mcpConfig);
		setMcpDialogOpen(true);
	};

	const handleOpenCustomMCPDialog = (customMCP: any = null) => {
		setSelectedCustomMCP(customMCP);
		setCustomMcpDialogOpen(true);
	};

	const handleConfigureMCP = (mcpConfig: any) => {
		handleOpenMCPDialog(mcpConfig);
	};

	const handleRemoveMCP = (mcpId: string) => {
		setValues({
			...values,
			config: {
				...values.config,
				mcp_servers:
					values.config?.mcp_servers?.filter((mcp) => mcp.id !== mcpId) || [],
			},
		});
	};

	const handleConfigureCustomMCP = (customMCP: any) => {
		handleOpenCustomMCPDialog(customMCP);
	};

	const handleRemoveCustomMCP = (url: string) => {
		setValues({
			...values,
			config: {
				...values.config,
				custom_mcp_servers:
					values.config?.custom_mcp_servers?.filter(
						(customMCP) => customMCP.url !== url
					) || [],
			},
		});
	};

	const handleSaveMCP = (mcpConfig: any) => {
		const updatedMcpServers = [...(values.config?.mcp_servers || [])];
		const existingIndex = updatedMcpServers.findIndex(
			(mcp) => mcp.id === mcpConfig.id
		);

		if (existingIndex >= 0) {
			updatedMcpServers[existingIndex] = mcpConfig;
		} else {
			updatedMcpServers.push(mcpConfig);
		}

		setValues({
			...values,
			config: {
				...(values.config || {}),
				mcp_servers: updatedMcpServers,
			},
		});
	};

	const handleSaveCustomMCP = (customMCP: any) => {
		const updatedCustomMCPs = [...(values.config?.custom_mcp_servers || [])];
		const existingIndex = updatedCustomMCPs.findIndex(
			(mcp) => mcp.url === customMCP.url
		);

		if (existingIndex >= 0) {
			updatedCustomMCPs[existingIndex] = customMCP;
		} else {
			updatedCustomMCPs.push(customMCP);
		}

		setValues({
			...values,
			config: {
				...(values.config || {}),
				custom_mcp_servers: updatedCustomMCPs,
			},
		});
	};

	const handleSave = async () => {
		const finalValues = {
			...values,
			client_id: clientId,
			name: values.name,
		};

		await onSave(finalValues);
	};

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col bg-[#0d0c14] border-[#16151D]">
					<DialogHeader>
						<DialogTitle className="text-white">
							{/* Adiciona verificação se initialValues existe antes de acessar .id */}
							{initialValues && initialValues.id
								? "Editar Agente"
								: "Novo Agente"}
						</DialogTitle>
						<DialogDescription className="text-gray-400">
							{/* Adiciona verificação também na descrição */}
							{initialValues && initialValues.id
								? "Editar as informações do agente existente"
								: "Preencha as informações para criar um novo agente"}
						</DialogDescription>
					</DialogHeader>

					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="flex-1 overflow-hidden flex flex-col"
					>
						<TabsList className="grid grid-cols-3 bg-[#16151D]">
							<TabsTrigger
								value="basic"
								className="data-[state=active]:bg-[#222030] data-[state=active]:text-[#3534FF]"
							>
								Basic Information
							</TabsTrigger>
							<TabsTrigger
								value="config"
								className="data-[state=active]:bg-[#222030] data-[state=active]:text-[#3534FF]"
							>
								Configuration
							</TabsTrigger>
							<TabsTrigger
								value="subagents"
								className="data-[state=active]:bg-[#222030] data-[state=active]:text-[#3534FF]"
							>
								Sub-Agents
							</TabsTrigger>
						</TabsList>

						<ScrollArea className="flex-1 overflow-auto">
							<TabsContent value="basic" className="p-4 space-y-4">
								<BasicInfoTab
									values={values}
									onChange={setValues}
									apiKeys={apiKeys}
									availableModels={availableModels}
									onOpenApiKeysDialog={onOpenApiKeysDialog}
									clientId={clientId}
								/>
							</TabsContent>

							<TabsContent value="config" className="p-4 space-y-4">
								<ConfigurationTab
									values={values}
									onChange={setValues}
									agents={agents}
									availableMCPs={availableMCPs}
									apiKeys={apiKeys}
									availableModels={availableModels}
									getAgentNameById={getAgentNameById}
									onOpenApiKeysDialog={onOpenApiKeysDialog}
									onConfigureMCP={handleConfigureMCP}
									onRemoveMCP={handleRemoveMCP}
									onConfigureCustomMCP={handleConfigureCustomMCP}
									onRemoveCustomMCP={handleRemoveCustomMCP}
									onOpenMCPDialog={handleOpenMCPDialog}
									onOpenCustomMCPDialog={handleOpenCustomMCPDialog}
									clientId={clientId}
								/>
							</TabsContent>

							<TabsContent value="subagents" className="p-4 space-y-4">
								<SubAgentsTab
									values={values}
									onChange={setValues}
									agents={agents}
									getAgentNameById={getAgentNameById}
									editingAgentId={initialValues?.id} // Usa optional chaining aqui também
									clientId={clientId}
								/>
							</TabsContent>
						</ScrollArea>
					</Tabs>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="bg-[#222030] border-[#222030] text-gray-300 hover:bg-[#242238] hover:text-white"
						>
							Cancel
						</Button>
						<Button
							onClick={handleSave}
							className="bg-[#3534FF] text-black hover:bg-[#222030]"
							// CORREÇÃO: Usa optional chaining para acessar values?.name
							disabled={!values?.name || isLoading}
						>
							{isLoading && (
								<div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full mr-2"></div>
							)}
							{initialValues && initialValues.id
								? "Salvar alterações"
								: "Adicionar agente"}{" "}
							{/* Aplica a verificação aqui também */}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* MCP Dialog */}
			<MCPDialog
				open={mcpDialogOpen}
				onOpenChange={setMcpDialogOpen}
				onSave={handleSaveMCP}
				availableMCPs={availableMCPs}
				selectedMCP={
					availableMCPs.find((m) => selectedMCP?.id === m.id) || null
				}
				initialEnvs={selectedMCP?.envs || {}}
				initialTools={selectedMCP?.tools || []}
				clientId={clientId}
			/>

			{/* Custom MCP Dialog */}
			<CustomMCPDialog
				open={customMcpDialogOpen}
				onOpenChange={setCustomMcpDialogOpen}
				onSave={handleSaveCustomMCP}
				initialCustomMCP={selectedCustomMCP}
				clientId={clientId}
			/>
		</>
	);
}
