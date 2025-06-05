// app/agents/workflows/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { DnDProvider } from "@/contexts/DnDContext";
import { NodeDataProvider } from "@/contexts/NodeDataContext";
import { SourceClickProvider } from "@/contexts/SourceClickContext";
import { useToast } from "@/hooks/use-toast";
import { getAgent, updateAgent } from "@/services/agentService";
import type { Agent } from "@/types/agent";
import { ReactFlowProvider } from "@xyflow/react";
import { ArrowLeft, Download, PlayIcon, Save } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import Canva from "./Canva";
import { AgentTestChatModal } from "./nodes/components/agent/AgentTestChatModal";

function WorkflowsContent() {
	const searchParams = useSearchParams();
	const agentId = searchParams.get("agentId");
	const [agent, setAgent] = useState<Agent | null>(null);
	const [loading, setLoading] = useState(false);
	const canvaRef = useRef<any>(null);
	const { toast } = useToast();
	const [isTestModalOpen, setIsTestModalOpen] = useState(false);

	const user =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("user") || "{}")
			: {};
	const clientId = user?.client_id || "";

	useEffect(() => {
		if (agentId && clientId) {
			setLoading(true);
			getAgent(agentId, clientId)
				.then((res) => {
					setAgent(res.data);
					if (typeof window !== "undefined") {
						localStorage.setItem(
							"current_workflow_agent",
							JSON.stringify(res.data),
						);
					}
				})
				.catch((err) => {
					console.error("Error loading agent:", err);
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [agentId, clientId]);

	useEffect(() => {
		return () => {
			if (typeof window !== "undefined") {
				localStorage.removeItem("current_workflow_agent");
			}
		};
	}, []);

	const handleExportFlow = () => {
		if (!canvaRef.current) return;

		const { nodes, edges } = canvaRef.current.getFlowData();

		const flowData = {
			nodes,
			edges,
		};

		const jsonString = JSON.stringify(flowData, null, 2);
		const blob = new Blob([jsonString], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = `flow.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleSaveWorkflow = async () => {
		if (!agent || !canvaRef.current) return;

		try {
			const { nodes, edges } = canvaRef.current.getFlowData();

			const workflow = {
				nodes,
				edges,
			};

			await updateAgent(agent.id, {
				...agent,
				config: {
					...agent.config,
					workflow,
				},
			});

			toast({
				title: "Workflow saved",
				description: "The changes were saved successfully",
			});

			canvaRef.current.setHasChanges(false);
		} catch (error) {
			console.error("Error saving workflow:", error);
			toast({
				title: "Error saving workflow",
				description: "Unable to save the changes",
				variant: "destructive",
			});
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6 bg-[#121212] min-h-screen rounded-lg flex items-center justify-center">
				<div className="text-white text-xl">Loading...</div>
			</div>
		);
	}

	return (
		<div className="relative">
			<div className="absolute top-4 left-4 z-10 flex items-center gap-2">
				<Link href="/agents">
					<Button
						variant="outline"
						className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Agents
					</Button>
				</Link>

				<Button
					variant="outline"
					className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
					onClick={handleSaveWorkflow}
				>
					<Save className="mr-2 h-4 w-4" />
					Save
				</Button>

				<Button
					variant="outline"
					className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
					onClick={handleExportFlow}
				>
					<Download className="mr-2 h-4 w-4" />
					Export
				</Button>
				{agent && (
					<Button
						variant="outline"
						className="bg-green-800 border-green-700 text-green-200 hover:bg-green-700"
						onClick={() => setIsTestModalOpen(true)}
					>
						<PlayIcon className="h-4 w-4 mr-2" />
						Test Workflow
					</Button>
				)}
			</div>
			{agent && isTestModalOpen && (
				<AgentTestChatModal
					open={isTestModalOpen}
					onOpenChange={setIsTestModalOpen}
					agent={agent}
				/>
			)}
			{agent && (
				<div className="absolute top-4 right-4 z-10 bg-gray-800 px-4 py-2 rounded-md">
					<h2 className="text-gray-200 font-medium">{agent.name}</h2>
					<p className="text-gray-400 text-sm">{agent.type}</p>
				</div>
			)}
			<NodeDataProvider>
				<SourceClickProvider>
					<DnDProvider>
						<ReactFlowProvider>
							<Canva agent={agent} ref={canvaRef} />
						</ReactFlowProvider>
					</DnDProvider>
				</SourceClickProvider>
			</NodeDataProvider>
		</div>
	);
}

export default function WorkflowsPage() {
	return (
		<Suspense
			fallback={
				<div className="container mx-auto p-6 bg-[#121212] min-h-screen rounded-lg flex items-center justify-center">
					<div className="text-white text-xl">Loading...</div>
				</div>
			}
		>
			<WorkflowsContent />
		</Suspense>
	);
}
