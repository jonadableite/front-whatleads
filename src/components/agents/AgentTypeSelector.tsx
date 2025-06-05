//app/agents/AgentTypeSelector.tsx
"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { AgentType } from "@/types/agent";
import {
	BookOpenCheck,
	Code,
	ExternalLink,
	GitBranch,
	RefreshCw,
	Workflow,
} from "lucide-react";

interface AgentTypeSelectorProps {
	value: AgentType;
	onValueChange: (value: AgentType) => void;
	className?: string;
}

export function AgentTypeSelector({
	value,
	onValueChange,
	className = "",
}: AgentTypeSelectorProps) {
	const agentTypes = [
		{ value: "llm", label: "LLM Agent", icon: Code },
		{ value: "a2a", label: "A2A Agent", icon: ExternalLink },
		{ value: "sequential", label: "Sequential Agent", icon: Workflow },
		{ value: "parallel", label: "Parallel Agent", icon: GitBranch },
		{ value: "loop", label: "Loop Agent", icon: RefreshCw },
		{ value: "workflow", label: "Workflow Agent", icon: Workflow },
		{ value: "task", label: "Task Agent", icon: BookOpenCheck },
	];

	return (
		<Select
			value={value}
			onValueChange={(value: AgentType) => onValueChange(value)}
		>
			<SelectTrigger
				className={`bg-[#16151D] border-[#16151D] text-white ${className}`}
			>
				<SelectValue placeholder="Select type" />
			</SelectTrigger>
			<SelectContent className="bg-[#16151D] border-[#16151D] text-white">
				{agentTypes.map((type) => (
					<SelectItem
						key={type.value}
						value={type.value}
						className="data-[selected]:bg-[#16151D] data-[highlighted]:bg-[#16151D] text-white focus:!text-white hover:text-[#9238c7] data-[selected]:!text-[#9238c7]"
					>
						<div className="flex items-center gap-2">
							<type.icon className="h-4 w-4 text-[#9238c7]" />
							{type.label}
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
