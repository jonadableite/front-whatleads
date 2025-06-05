//app/agents/AgentList.tsx
"use client";

import type { ApiKey, Folder } from "@/services/agentService";
import type { Agent } from "@/types/agent";
import type { MCPServer } from "@/types/mcpServer";
import { AgentCard } from "./AgentCard";
import { EmptyState } from "./EmptyState";

interface AgentListProps {
	agents: Agent[];
	isLoading: boolean;
	searchTerm: string;
	selectedFolderId: string | null;
	availableMCPs: MCPServer[];
	getApiKeyNameById: (id: string | undefined) => string | null;
	getAgentNameById: (id: string) => string;
	onEdit: (agent: Agent) => void;
	onDelete: (agent: Agent) => void;
	onMove: (agent: Agent) => void;
	onShare?: (agent: Agent) => void;
	onWorkflow?: (agentId: string) => void;
	onClearSearch?: () => void;
	onCreateAgent?: () => void;
	apiKeys: ApiKey[];
	folders: Folder[];
}

export function AgentList({
	agents,
	isLoading,
	searchTerm,
	selectedFolderId,
	availableMCPs,
	getApiKeyNameById,
	getAgentNameById,
	onEdit,
	onDelete,
	onMove,
	onShare,
	onWorkflow,
	onClearSearch,
	onCreateAgent,
	apiKeys,
	folders,
}: AgentListProps) {
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[60vh]">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ff9d]"></div>
			</div>
		);
	}

	if (agents.length === 0) {
		if (searchTerm) {
			return (
				<EmptyState
					type="search-no-results"
					searchTerm={searchTerm}
					onAction={onClearSearch}
				/>
			);
		} else if (selectedFolderId) {
			return (
				<EmptyState
					type="empty-folder"
					onAction={onCreateAgent}
					actionLabel="Create Agent"
				/>
			);
		} else {
			return (
				<EmptyState
					type="no-agents"
					onAction={onCreateAgent}
					actionLabel="Create Agent"
				/>
			);
		}
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{agents.map((agent) => (
				<AgentCard
					key={agent.id}
					agent={agent}
					onEdit={onEdit}
					onDelete={onDelete}
					onMove={onMove}
					onShare={onShare}
					onWorkflow={onWorkflow}
					availableMCPs={availableMCPs}
					getApiKeyNameById={getApiKeyNameById}
					getAgentNameById={getAgentNameById}
					folders={folders}
				/>
			))}
		</div>
	);
}
