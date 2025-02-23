// @ts-nocheck

import { motion } from "framer-motion";
import { Save } from "lucide-react";
// ChatbotFlow.tsx
import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import ReactFlow, {
	addEdge,
	Background,
	Controls,
	MiniMap,
	ReactFlowProvider,
	useEdgesState,
	useNodesState,
	type Connection,
	type Edge,
	type EdgeTypes,
	type Node,
	type NodeTypes,
	type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

import CustomNode from "@/components/CustomNode";
import GroupNode from "@/components/GroupNode";
import { SidebarChatbot } from "@/components/SidebarChatbot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import type { NodeData } from "@/interface";

const nodeTypes: NodeTypes = {
	custom: CustomNode,
	group: GroupNode,
};

const CustomEdge: React.FC<Edge> = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	style = {},
}) => (
	<path
		id={id}
		style={{
			...style,
			stroke: "#7c3aed",
			strokeWidth: 2,
			filter: "url(#glow)",
		}}
		className="react-flow__edge-path"
		d={`M ${sourceX},${sourceY} C ${sourceX} ${targetY},${targetX} ${sourceY},${targetX} ${targetY}`}
		markerEnd="url(#arrow)"
	/>
);

const edgeTypes: EdgeTypes = {
	custom: CustomEdge,
};

const ChatbotFlow: React.FC = () => {
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const [flowName, setFlowName] = useState<string>("");
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const [reactFlowInstance, setReactFlowInstance] =
		useState<ReactFlowInstance | null>(null);
	const { toast } = useToast();

	const onConnect = useCallback(
		(params: Connection) => setEdges((eds) => addEdge(params, eds)),
		[setEdges],
	);

	const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const updateNodeData = useCallback(
		(nodeId: string, newData: Partial<NodeData>) => {
			setNodes((nds) =>
				nds.map((node) =>
					node.id === nodeId
						? { ...node, data: { ...node.data, ...newData } }
						: node,
				),
			);
		},
		[setNodes],
	);

	const onDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();

			const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
			const type = event.dataTransfer.getData("text/plain");

			if (!type || !reactFlowBounds || !reactFlowInstance) return;

			const position = reactFlowInstance.screenToFlowPosition({
				x: event.clientX - reactFlowBounds.left,
				y: event.clientY - reactFlowBounds.top,
			});

			const newNode: Node<NodeData> = {
				id: `${type.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`,
				type: "custom",
				position,
				data: {
					label: type,
					type,
					text: "",
					onChange: (id: string, newData: { text: string }) =>
						updateNodeData(id, newData),
				},
			};

			setNodes((nds) => nds.concat(newNode));
		},
		[reactFlowInstance, setNodes, updateNodeData],
	);

	const onNodeDragStop = useCallback(
		(event: React.MouseEvent, node: Node, nodes: Node[]) => {
			const overlappingNode = nodes.find(
				(n) =>
					n.id !== node.id &&
					n.position.x < node.position.x + (node.width || 0) &&
					n.position.x + (n.width || 0) > node.position.x &&
					n.position.y < node.position.y + (node.height || 0) &&
					n.position.y + (n.height || 0) > node.position.y,
			);

			if (overlappingNode) {
				const groupNode: Node = {
					id: `group-${Date.now()}`,
					type: "group",
					position: {
						x: Math.min(node.position.x, overlappingNode.position.x),
						y: Math.min(node.position.y, overlappingNode.position.y),
					},
					data: {
						label: "Group",
						children: [node.id, overlappingNode.id],
					},
				};

				setNodes((nds) => [
					...nds.filter((n) => n.id !== node.id && n.id !== overlappingNode.id),
					groupNode,
				]);
			}
		},
		[setNodes],
	);

	const onSave = useCallback(() => {
		if (reactFlowInstance) {
			const flow = reactFlowInstance.toObject();
			console.log(flow);
			toast({
				title: "Fluxo Salvo",
				description: "Seu fluxo de chatbot foi salvo com sucesso!",
			});
		}
	}, [reactFlowInstance, toast]);

	const minimapStyle = useMemo(
		() => ({
			backgroundColor: "rgba(24, 24, 36, 0.5)",
			border: "1px solid #7c3aed",
			borderRadius: "4px",
		}),
		[],
	);

	const minimapNodeColor = useCallback((node: Node) => {
		switch (node.data.type) {
			case "input":
				return "#00ffff";
			case "message":
				return "#00ff00";
			case "condition":
				return "#ff00ff";
			case "image":
				return "#0080ff";
			case "file":
				return "#ffff00";
			default:
				return "#ffffff";
		}
	}, []);

	return (
		<div className="min-h-screen flex bg-gradient-to-br from-deep-purple to-deep-blue overflow-hidden">
			<SidebarChatbot />
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="flex-grow flex flex-col ml-[316px] p-6"
			>
				<div className="relative flex-grow">
					<div className="absolute inset-0 bg-gradient-to-br from-electric/5 to-neon-green/5 rounded-3xl" />
					<div className="absolute inset-0 backdrop-blur-[120px] rounded-3xl" />

					<div className="relative z-10 flex flex-col h-full">
						<div className="flex items-center space-x-4 mb-4">
							<Input
								type="text"
								placeholder="Nome do Fluxo"
								value={flowName}
								onChange={(e) => setFlowName(e.target.value)}
								className="bg-deep/50 text-white border-electric flex-grow"
							/>
							<Button
								onClick={onSave}
								className="bg-neon-green text-white hover:bg-neon-green/80 px-4 py-2 h-full flex items-center justify-center whitespace-nowrap"
							>
								<Save className="mr-2 h-4 w-4" />
								<span>Salvar Fluxo</span>
							</Button>
						</div>

						<div className="flex-grow" ref={reactFlowWrapper}>
							<ReactFlowProvider>
								<ReactFlow
									nodes={nodes}
									edges={edges}
									onNodesChange={onNodesChange}
									onEdgesChange={onEdgesChange}
									onConnect={onConnect}
									onInit={setReactFlowInstance}
									onDrop={onDrop}
									onDragOver={onDragOver}
									onNodeDragStop={onNodeDragStop}
									nodeTypes={nodeTypes}
									edgeTypes={edgeTypes}
									defaultEdgeOptions={{ type: "custom" }}
									fitView
								>
									<Controls />
									<MiniMap
										style={minimapStyle}
										nodeColor={minimapNodeColor}
										nodeStrokeWidth={3}
										zoomable
										pannable
									/>
									<Background color="#aaa" gap={16} />
									<svg width="0" height="0">
										<defs>
											<filter id="glow">
												<feGaussianBlur stdDeviation="3" result="coloredBlur" />
												<feMerge>
													<feMergeNode in="coloredBlur" />
													<feMergeNode in="SourceGraphic" />
												</feMerge>
											</filter>
											<marker
												id="arrow"
												viewBox="0 0 10 10"
												refX="5"
												refY="5"
												markerWidth="5"
												markerHeight="5"
												orient="auto-start-reverse"
											>
												<path d="M 0 0 L 10 5 L 0 10 z" fill="#7c3aed" />
											</marker>
										</defs>
									</svg>
								</ReactFlow>
							</ReactFlowProvider>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default ChatbotFlow;
