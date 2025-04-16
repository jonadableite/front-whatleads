// src/pages/WorkflowBuilderPage.tsx

import { SidebarChatbot } from "@/components/SidebarChatbot";
import { useToast } from "@/components/ui/use-toast";
import * as dagre from "dagre";
import { motion } from "framer-motion";
import type React from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import {
	Background,
	type Connection,
	ConnectionLineType,
	Controls,
	type Edge,
	EdgeLabelRenderer,
	type EdgeProps,
	Handle,
	MarkerType,
	MiniMap,
	type Node,
	type NodeProps,
	Panel,
	Position,
	ReactFlow,
	ReactFlowProvider,
	addEdge,
	getBezierPath,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
	ArrowRight,
	Edit,
	Folder,
	FolderPlus,
	Layers,
	LayoutGrid,
	Maximize,
	MessageSquare,
	Mic,
	Plus,
	Save,
	Trash2,
	Video,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import GroupNode from "@/components/GroupNode";
import { saveFlexBotNewSettings } from "../services/botSettings.service";

interface NodeResponse {
	key: string;
	next: string;
	value: string;
}

interface MessageObject {
	type: string;
	imageUrl: string;
	message: string;
}

interface NodeData {
	type: "text" | "image" | "video" | "audio" | "input";
	label: string;
	content?: string | MediaContent;
	responses?: NodeResponse[];
	responseCount?: number;
	group?: string;
	automaticNext?: string;
	dispatch?: string;
}

interface MediaContent {
	url: string;
	description?: string;
}

const CustomEdge = ({
	id,
	source,
	target,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	markerEnd,
	label,
	data,
}: EdgeProps) => {
	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	const GroupNode: React.FC<NodeProps> = ({ data }) => {
		return (
			<div className="p-4 bg-purple-100/20 border-2 border-purple-500/50 rounded-lg">
				<h3 className="text-purple-600 font-semibold">{data.label}</h3>
			</div>
		);
	};

	const handleAddIntermediateNode = (e: React.MouseEvent) => {
		e.stopPropagation();
		const event = new CustomEvent("edge:add-node", {
			detail: {
				sourceId: source,
				targetId: target,
				edgeId: id,
				position: { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 },
				label: label,
			},
		});
		window.dispatchEvent(event);
	};

	return (
		<>
			<path
				id={id}
				style={{
					...style,
					stroke: "#7c3aed",
					strokeWidth: 2,
					filter: "url(#glow)",
				}}
				className="react-flow__edge-path"
				d={edgePath}
				markerEnd="url(#arrow)"
			/>
			<EdgeLabelRenderer>
				<div
					style={{
						position: "absolute",
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
						fontSize: 12,
						pointerEvents: "all",
					}}
					className="nodrag nopan flex items-center gap-1 bg-white/10 backdrop-blur-md text-purple-100 px-2 py-1 rounded-md shadow-md border border-purple-500/30"
				>
					<span>{label}</span>
					<button
						className="w-4 h-4 flex items-center justify-center bg-purple-500/20 text-purple-300 rounded-full hover:bg-purple-500/40"
						onClick={handleAddIntermediateNode}
						title="Adicionar nó intermediário"
					>
						<Plus className="w-3 h-3" />
					</button>
					<button
						className="w-4 h-4 flex items-center justify-center bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/40"
						onClick={(e) => {
							e.stopPropagation();
							const event = new CustomEvent("connection:remove", {
								detail: {
									sourceId: source,
									targetId: target,
									edgeId: id,
									responseKey: label,
								},
							});
							window.dispatchEvent(event);
						}}
						title="Remover conexão"
					>
						<X className="w-3 h-3" />
					</button>
				</div>
			</EdgeLabelRenderer>
		</>
	);
};

const MessageNode = ({ id, data, selected }: NodeProps<NodeData>) => {
	const renderContent = () => {
		switch (data.type) {
			case "text":
				return (
					<div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
						<div className="line-clamp-2">{data.content as string}</div>
					</div>
				);
			case "image":
				const imageData = data.content as MediaContent;
				return (
					<div>
						<img
							src={imageData.url || "/placeholder.svg"}
							alt={imageData.description || "Imagem"}
							className="h-16 object-cover rounded-md mb-1"
						/>
						{imageData.description && (
							<div className="text-xs line-clamp-2">
								{imageData.description}
							</div>
						)}
					</div>
				);
			case "video":
				const videoData = data.content as MediaContent;
				return (
					<div>
						<video
							src={videoData.url}
							className="h-16 object-cover rounded-md mb-1"
							controls={false}
						/>
						{videoData.description && (
							<div className="text-xs line-clamp-2">
								{videoData.description}
							</div>
						)}
					</div>
				);
			case "audio":
				const audioData = data.content as MediaContent;
				return (
					<div>
						<audio
							src={audioData.url}
							className="w-full mb-1"
							controls={false}
						/>
						{audioData.description && (
							<div className="text-xs line-clamp-2">
								{audioData.description}
							</div>
						)}
					</div>
				);
			default:
				return null;
		}
	};

	const getBorderColor = () => {
		if (!data.group)
			return selected
				? "border-rose-500 dark:border-rose-500"
				: "border-gray-200 dark:border-[#1B1C22]";

		const groupColors: Record<string, string> = {
			inicio: "border-green-500 dark:border-green-500",
			menu: "border-blue-500 dark:border-blue-500",
			formulario: "border-purple-500 dark:border-purple-500",
			finalizacao: "border-amber-500 dark:border-amber-500",
		};

		return groupColors[data.group] || "border-gray-400 dark:border-gray-600";
	};

	return (
		<div
			className={`relative p-4 bg-white dark:bg-[#111217] rounded-lg shadow-md border-2 ${getBorderColor()} w-[300px]`}
		>
			<Handle
				type="target"
				position={Position.Top}
				className="w-3 h-3 bg-blue-500 border-2 border-white dark:border-[#111217]"
			/>

			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-2">
					{getNodeIcon(data.type)}
					<h3 className="font-medium text-gray-800 dark:text-gray-200">
						{data.label}
					</h3>
					{data.group && (
						<span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
							{data.group}
						</span>
					)}
					{data.dispatch === "automatic" && (
						<span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
							Automático
						</span>
					)}
				</div>
				<div className="flex gap-1">
					<button
						onClick={createConnectedNode}
						className="p-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/30"
						type="button"
						title="Criar nó conectado"
					>
						<Plus className="w-3.5 h-3.5" />
					</button>
					<button
						onClick={openEditModal}
						className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
						type="button"
					>
						<Edit className="w-3.5 h-3.5" />
					</button>
					<button
						onClick={deleteNode}
						className="p-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/30"
						type="button"
					>
						<Trash2 className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>

			{renderContent()}

			<div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
				{typeof data.message === "string" ? (
					<div className="line-clamp-2">{data.message}</div>
				) : (
					<div>
						{data.message &&
							data.message.type === "image" &&
							data.message.imageUrl && (
								<div className="mb-1">
									<img
										src={data.message.imageUrl || "/placeholder.svg"}
										alt="Imagem da mensagem"
										className="h-16 object-cover rounded-md mb-1"
									/>
								</div>
							)}
						{data.message && data.message.message && (
							<div className="line-clamp-2">{data.message.message}</div>
						)}
					</div>
				)}
			</div>

			<div className="text-xs text-gray-500 dark:text-gray-500 mb-2">
				{data.responseCount}{" "}
				{data.responseCount === 1 ? "resposta" : "respostas"}
			</div>

			{/* Mostrar vínculo automático se existir */}
			{data.automaticNext && (
				<div className="mt-2 mb-2 border-t border-gray-200 dark:border-gray-700 pt-2">
					<div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
						<span className="font-medium text-green-600 dark:text-green-400">
							Automático
						</span>
						<div className="flex items-center ml-1">
							<ArrowRight className="w-3 h-3 mx-1" />
							<span className="text-blue-500 dark:text-blue-400">
								{data.automaticNext}
							</span>
							<button
								onClick={(e) => {
									e.stopPropagation();
									const event = new CustomEvent("connection:remove-automatic", {
										detail: {
											sourceId: id,
											targetId: data.automaticNext,
										},
									});
									window.dispatchEvent(event);
								}}
								className="ml-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
								type="button"
							>
								<X className="w-3 h-3" />
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Lista de respostas com indicadores visuais */}
			{data.responses && data.responses.length > 0 && (
				<div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
					<div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
						Respostas:
					</div>
					<div className="space-y-1">
						{data.responses.map((resp, idx) => (
							<div
								key={idx}
								className="flex items-center text-xs text-gray-500 dark:text-gray-400"
							>
								<span className="font-medium">{resp.key}</span>
								{resp.next && (
									<div className="flex items-center ml-1">
										<ArrowRight className="w-3 h-3 mx-1" />
										<span className="text-blue-500 dark:text-blue-400">
											{resp.next}
										</span>
										<button
											onClick={(e) => {
												e.stopPropagation();
												const event = new CustomEvent("connection:remove", {
													detail: {
														sourceId: id,
														targetId: resp.next,
														responseKey: resp.key,
													},
												});
												window.dispatchEvent(event);
											}}
											className="ml-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
											type="button"
										>
											<X className="w-3 h-3" />
										</button>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			<Handle
				type="source"
				position={Position.Bottom}
				className="w-3 h-3 bg-blue-500 border-2 border-[#111217]"
			/>
		</div>
	);
};

// Função auxiliar para obter o ícone correto
const getNodeIcon = (type: string) => {
	const iconMap = {
		text: <MessageSquare className="w-4 h-4 text-blue-500" />,
		image: <Image className="w-4 h-4 text-green-500" />,
		video: <Video className="w-4 h-4 text-red-500" />,
		audio: <Mic className="w-4 h-4 text-purple-500" />,
	};
	return iconMap[type] || <MessageSquare className="w-4 h-4 text-blue-500" />;
};

interface NodeEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	node: Node | null;
	onSave: (node: Node) => void;
	availableNodes: Node[];
	availableGroups: string[];
}

interface Node {
	id: string;
	data: {
		label: string;
		message: string | MessageObject;
		responses: NodeResponse[];
		group?: string;
		automaticNext?: string;
		dispatch?: string;
	};
}

interface NodeResponse {
	key: string;
	next: string;
	value: string;
}

interface MessageObject {
	type: "text" | "image";
	imageUrl?: string;
	message?: string;
}

// Modal para editar nó
// Modifique o componente NodeEditModal para adicionar um campo para o ID do nó
// Dentro do componente NodeEditModal, adicione um novo estado para o ID
const NodeEditModal = ({
	isOpen,
	onClose,
	node,
	onSave,
	availableNodes,
	availableGroups,
}: NodeEditModalProps) => {
	const [error, setError] = useState<string | null>(null);

	const [label, setLabel] = useState("");
	const [messageType, setMessageType] = useState<"text" | "image">("text");
	const [textMessage, setTextMessage] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [imageMessage, setImageMessage] = useState("");
	const [responses, setResponses] = useState<NodeResponse[]>([]);
	const [group, setGroup] = useState<string>("");
	const [nodeId, setNodeId] = useState("");

	const [automaticNext, setAutomaticNext] = useState<string>("");
	const [dispatch, setDispatch] = useState<string>("");

	useEffect(() => {
		if (node && node.data && isOpen) {
			console.log("Carregando dados do nó no modal:", node);
			setLabel(node.data.label || "");

			if (typeof node.data.message === "string") {
				setMessageType("text");
				setTextMessage(node.data.message || "");
				setImageUrl("");
				setImageMessage("");
			} else if (node.data.message && typeof node.data.message === "object") {
				if (node.data.message.type === "image") {
					setMessageType("image");
					setTextMessage("");
					setImageUrl(node.data.message.imageUrl || "");
					setImageMessage(node.data.message.message || "");
				} else {
					setMessageType("text");
					setTextMessage(JSON.stringify(node.data.message));
					setImageUrl("");
					setImageMessage("");
				}
			}

			setResponses(node.data.responses || []);
			setGroup(node.data.group || "");
			setNodeId(node.id); // Inicializar o ID do nó
			setAutomaticNext(node.data.automaticNext || "");
			setDispatch(node.data.dispatch || "");
		}
	}, [node, isOpen]);

	const handleAddResponse = () => {
		setResponses([...responses, { key: "", next: "", value: "" }]);
	};

	const handleResponseChange = (
		index: number,
		field: keyof NodeResponse,
		value: string,
	) => {
		const newResponses = [...responses];
		newResponses[index][field] = value;
		setResponses(newResponses);
	};

	const handleRemoveResponse = (index: number) => {
		const newResponses = [...responses];
		newResponses.splice(index, 1);
		setResponses(newResponses);
	};

	const handleSave = () => {
		// Limpe qualquer erro anterior
		setError(null);

		if (!node) return;

		// Adicione as validações com setError
		if (!label.trim()) {
			setError("O nome do nó não pode estar vazio");
			return;
		}

		let finalMessage: string | MessageObject;
		if (messageType === "text") {
			if (!textMessage.trim()) {
				alert("A mensagem de texto não pode estar vazia");
				return;
			}
			finalMessage = textMessage;
		} else {
			if (!imageUrl.trim()) {
				alert("A URL da imagem não pode estar vazia");
				return;
			}
			finalMessage = {
				type: "image",
				imageUrl: imageUrl,
				message: imageMessage,
			};
		}

		const idChanged = nodeId !== node.id && nodeId.trim() !== "";
		if (idChanged) {
			const event = new CustomEvent("node:rename", {
				detail: { oldId: node.id, newId: nodeId.trim() },
			});
			window.dispatchEvent(event);
		} else {
			onSave({
				...node,
				data: {
					...node.data,
					label,
					message: finalMessage,
					responses,
					responseCount: responses.length,
					group: group || undefined,
					automaticNext: automaticNext || undefined,
					dispatch: dispatch || undefined,
				},
			});
		}
		onClose();
	};

	if (!isOpen || !node) return null;

	const isTemporaryNode = node.id.startsWith("node_");

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white dark:bg-[#111217] rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center justify-between">
						<span className="block sm:inline">{error}</span>
						<button
							onClick={() => setError(null)}
							className="ml-4 text-red-700 hover:text-red-900"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				)}

				<div className="space-y-6">
					{isTemporaryNode && (
						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								ID do Nó (usado para referência no sistema)
							</label>
							<input
								type="text"
								value={nodeId}
								onChange={(e) => setNodeId(e.target.value)}
								placeholder="Ex: menu_principal, confirmacao, etc."
								className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
							/>
							<p className="text-xs text-amber-600 dark:text-amber-400">
								Alterar o ID do nó atualizará todas as referências a ele. Use
								apenas letras, números e underscores.
							</p>
						</div>
					)}

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Nome do Nó
						</label>
						<input
							type="text"
							value={label}
							onChange={(e) => setLabel(e.target.value)}
							placeholder="Ex: Seleção de Categoria"
							className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
						/>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Grupo
						</label>
						<div className="flex gap-2">
							<select
								value={group}
								onChange={(e) => setGroup(e.target.value)}
								className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
							>
								<option value="">Sem grupo</option>
								{availableGroups.map((g) => (
									<option key={g} value={g}>
										{g}
									</option>
								))}
							</select>
							<button
								onClick={() => {
									const newGroup = prompt("Digite o nome do novo grupo:");
									if (newGroup && newGroup.trim() !== "") {
										setGroup(newGroup.trim());
									}
								}}
								className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
								type="button"
							>
								<FolderPlus className="w-5 h-5" />
							</button>
						</div>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Tipo de Mensagem
						</label>
						<div className="flex gap-4">
							<label className="flex items-center">
								<input
									type="radio"
									name="messageType"
									value="text"
									checked={messageType === "text"}
									onChange={() => setMessageType("text")}
									className="mr-2"
								/>
								<span>Texto</span>
							</label>
							<label className="flex items-center">
								<input
									type="radio"
									name="messageType"
									value="image"
									checked={messageType === "image"}
									onChange={() => setMessageType("image")}
									className="mr-2"
								/>
								<span>Imagem + Texto</span>
							</label>
						</div>
					</div>

					{messageType === "text" ? (
						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Mensagem
							</label>
							<textarea
								value={textMessage}
								onChange={(e) => setTextMessage(e.target.value)}
								placeholder="Digite a mensagem que será exibida neste nó..."
								rows={4}
								className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
							/>
						</div>
					) : (
						<div className="space-y-4">
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									URL da Imagem
								</label>
								<input
									type="text"
									value={imageUrl}
									onChange={(e) => setImageUrl(e.target.value)}
									placeholder="https://exemplo.com/imagem.jpg"
									className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
								/>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Texto da Mensagem
								</label>
								<textarea
									value={imageMessage}
									onChange={(e) => setImageMessage(e.target.value)}
									placeholder="Digite o texto que acompanhará a imagem..."
									rows={3}
									className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
								/>
							</div>
						</div>
					)}

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Vínculo Automático
						</label>
						<div className="flex gap-2">
							<select
								value={automaticNext}
								onChange={(e) => setAutomaticNext(e.target.value)}
								className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
							>
								<option value="">Sem vínculo automático</option>
								{availableNodes.map((n) => (
									<option key={n.id} value={n.id}>
										{n.id} - {n.data.label}
									</option>
								))}
							</select>
						</div>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							Se definido, após mostrar este nó, o fluxo seguirá automaticamente
							para o nó selecionado.
						</p>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Tipo de Despacho
						</label>
						<select
							value={dispatch}
							onChange={(e) => setDispatch(e.target.value)}
							className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
						>
							<option value="">Normal</option>
							<option value="automatic">Automático</option>
						</select>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							Se definido como "Automático", este nó será enviado
							automaticamente após o nó anterior.
						</p>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Respostas
							</label>
							<button
								onClick={handleAddResponse}
								className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium"
								type="button"
							>
								<Plus className="w-4 h-4" />
								<span>Adicionar Resposta</span>
							</button>
						</div>

						{responses.map((response, index) => (
							<div key={index} className="grid grid-cols-12 gap-2 items-center">
								<div className="col-span-3">
									<input
										type="text"
										value={response.key}
										onChange={(e) =>
											handleResponseChange(index, "key", e.target.value)
										}
										placeholder="Ex: 1, sim, opção"
										className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
									/>
								</div>
								<div className="col-span-4">
									<select
										value={response.next}
										onChange={(e) =>
											handleResponseChange(index, "next", e.target.value)
										}
										className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
									>
										<option value="">Selecione o próximo nó</option>
										{availableNodes.map((n) => (
											<option key={n.id} value={n.id}>
												{n.id} - {n.data.label}
											</option>
										))}
									</select>
								</div>
								<div className="col-span-4">
									<input
										type="text"
										value={response.value}
										onChange={(e) =>
											handleResponseChange(index, "value", e.target.value)
										}
										placeholder="Valor da resposta"
										className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
									/>
								</div>
								<div className="col-span-1 flex justify-center">
									<button
										onClick={() => handleRemoveResponse(index)}
										className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
										type="button"
									>
										<X className="w-5 h-5" />
									</button>
								</div>
							</div>
						))}
					</div>

					<div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
						<button
							onClick={onClose}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
							type="button"
						>
							Cancelar
						</button>
						<button
							onClick={handleSave}
							className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
							type="button"
						>
							Salvar
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

interface GroupManagerModalProps {
	isOpen: boolean;
	onClose: () => void;
	groups: string[];
	nodes: Node<NodeData>[];
	onAssignGroup: (nodeId: string, group: string) => void;
}

const GroupManagerModal = ({
	isOpen,
	onClose,
	groups,
	nodes,
	onAssignGroup,
}: GroupManagerModalProps) => {
	const [selectedGroup, setSelectedGroup] = useState<string>("");
	const [newGroupName, setNewGroupName] = useState<string>("");
	const [isAddingGroup, setIsAddingGroup] = useState<boolean>(false);

	if (!isOpen) return null;

	const nodesInGroup = selectedGroup
		? nodes.filter((node) => node.data.group === selectedGroup)
		: [];

	const nodesWithoutGroup = nodes.filter((node) => !node.data.group);

	const handleAddGroup = () => {
		if (newGroupName.trim() === "") return;
		const event = new CustomEvent("group:add", {
			detail: { name: newGroupName },
		});
		window.dispatchEvent(event);
		setNewGroupName("");
		setIsAddingGroup(false);
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white dark:bg-[#111217] rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
						Gerenciar Grupos
					</h3>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						type="button"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				<div className="space-y-6">
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Grupos
							</label>
							<button
								onClick={() => setIsAddingGroup(true)}
								className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium"
								type="button"
							>
								<Plus className="w-4 h-4" />
								<span>Novo Grupo</span>
							</button>
						</div>

						{isAddingGroup && (
							<div className="flex gap-2 mt-2">
								<input
									type="text"
									value={newGroupName}
									onChange={(e) => setNewGroupName(e.target.value)}
									placeholder="Nome do grupo"
									className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
								/>
								<button
									onClick={handleAddGroup}
									className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
									type="button"
								>
									Adicionar
								</button>
								<button
									onClick={() => setIsAddingGroup(false)}
									className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
									type="button"
								>
									Cancelar
								</button>
							</div>
						)}

						<div className="grid grid-cols-2 gap-2 mt-2">
							{groups.map((group) => (
								<button
									key={group}
									onClick={() => setSelectedGroup(group)}
									className={`p-3 text-left rounded-lg transition-colors ${
										selectedGroup === group
											? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
											: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
									}`}
									type="button"
								>
									<div className="flex items-center gap-2">
										<Folder className="w-4 h-4" />
										<span>{group}</span>
									</div>
									<div className="text-xs mt-1">
										{nodes.filter((node) => node.data.group === group).length}{" "}
										nós
									</div>
								</button>
							))}
							<button
								onClick={() => setSelectedGroup("")}
								className={`p-3 text-left rounded-lg transition-colors ${
									selectedGroup === ""
										? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
										: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
								}`}
								type="button"
							>
								<div className="flex items-center gap-2">
									<Folder className="w-4 h-4" />
									<span>Sem grupo</span>
								</div>
								<div className="text-xs mt-1">
									{nodesWithoutGroup.length} nós
								</div>
							</button>
						</div>
					</div>

					{selectedGroup && (
						<div className="space-y-2">
							<h4 className="font-medium text-gray-800 dark:text-gray-200">
								Nós no grupo: {selectedGroup}
							</h4>
							<div className="space-y-2 max-h-60 overflow-y-auto">
								{nodesInGroup.length > 0 ? (
									nodesInGroup.map((node) => (
										<div
											key={node.id}
											className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded-lg"
										>
											<div>
												<div className="font-medium text-gray-800 dark:text-gray-200">
													{node.id}
												</div>
												<div className="text-sm text-gray-600 dark:text-gray-400">
													{node.data.label}
												</div>
											</div>
											<button
												onClick={() => onAssignGroup(node.id, "")}
												className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
												type="button"
											>
												<X className="w-5 h-5" />
											</button>
										</div>
									))
								) : (
									<div className="text-gray-500 dark:text-gray-400">
										Nenhum nó neste grupo
									</div>
								)}
							</div>
						</div>
					)}

					{selectedGroup === "" && (
						<div className="space-y-2">
							<h4 className="font-medium text-gray-800 dark:text-gray-200">
								Nós sem grupo
							</h4>
							<div className="space-y-2 max-h-60 overflow-y-auto">
								{nodesWithoutGroup.length > 0 ? (
									nodesWithoutGroup.map((node) => (
										<div
											key={node.id}
											className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded-lg"
										>
											<div>
												<div className="font-medium text-gray-800 dark:text-gray-200">
													{node.id}
												</div>
												<div className="text-sm text-gray-600 dark:text-gray-400">
													{node.data.label}
												</div>
											</div>
											<select
												value=""
												onChange={(e) => onAssignGroup(node.id, e.target.value)}
												className="p-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
											>
												<option value="">Atribuir grupo</option>
												{groups.map((g) => (
													<option key={g} value={g}>
														{g}
													</option>
												))}
											</select>
										</div>
									))
								) : (
									<div className="text-gray-500 dark:text-gray-400">
										Todos os nós estão em grupos
									</div>
								)}
							</div>
						</div>
					)}

					<div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
						<button
							onClick={onClose}
							className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
							type="button"
						>
							Fechar
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

interface BotData {
	inicio?: any;
	steps?: Record<string, any>;
	finished?: Record<string, any>;
	_meta?: {
		nodePositions?: Record<string, { x: number; y: number }>;
		groups?: Record<string, string[]>; // Mapeamento de grupos para nós
	};
	[key: string]: any;
}

interface WorkflowBuilderProps {
	initialData: BotData | null;
	campaignId: string;
	companyDataState?: BotData;
}

const WorkflowBuilder = ({
	initialData = null,
	campaignId,
	companyDataState,
}: WorkflowBuilderProps) => {
	const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);

	const [editModalOpen, setEditModalOpen] = useState(false);
	const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);

	const [groupManagerOpen, setGroupManagerOpen] = useState(false);
	const [groups, setGroups] = useState<string[]>([]);

	const idCounter = useRef(1);

	const [dataLoaded, setDataLoaded] = useState(false);

	const reactFlowInstance = useReactFlow();

	useEffect(() => {
		const handleNodeEdit = (event: Event) => {
			const customEvent = event as CustomEvent<{ id: string }>;
			const nodeId = customEvent.detail.id;
			console.log("Evento de edição recebido para o nó:", nodeId);

			const node = nodes.find((n) => n.id === nodeId);
			if (node) {
				console.log("Nó encontrado para edição:", node);
				setSelectedNode(node);
				setEditModalOpen(true);
			} else {
				console.error("Nó não encontrado para edição:", nodeId);
				console.log(
					"Nós disponíveis:",
					nodes.map((n) => n.id),
				);
			}
		};

		const handleNodeDelete = (event: Event) => {
			const customEvent = event as CustomEvent<{ id: string }>;
			const nodeId = customEvent.detail.id;
			console.log("Evento de exclusão recebido para o nó:", nodeId);

			setNodes((nds) => nds.filter((n) => n.id !== nodeId));
			setEdges((eds) =>
				eds.filter((e) => e.source !== nodeId && e.target !== nodeId),
			);
		};

		const handleGroupAdd = (event: Event) => {
			const customEvent = event as CustomEvent<{ name: string }>;
			const groupName = customEvent.detail.name;
			console.log("Evento de adição de grupo recebido:", groupName);

			if (!groups.includes(groupName)) {
				setGroups((prevGroups) => [...prevGroups, groupName]);
			}
		};

		const handleNodeRename = (event: Event) => {
			const customEvent = event as CustomEvent<{
				oldId: string;
				newId: string;
			}>;
			const { oldId, newId } = customEvent.detail;

			if (oldId === newId || newId.trim() === "") return;

			console.log(`Renomeando nó de ${oldId} para ${newId}`);

			if (nodes.some((n) => n.id === newId)) {
				alert(
					`Já existe um nó com o ID "${newId}". Por favor, escolha outro ID.`,
				);
				return;
			}

			const nodeToRename = nodes.find((n) => n.id === oldId);
			if (!nodeToRename) return;

			const updatedNode = {
				...nodeToRename,
				id: newId,
				data: {
					...nodeToRename.data,
					label: nodeToRename.data.label || newId,
				},
			};

			const updatedEdges = edges.map((edge) => {
				if (edge.source === oldId) {
					return {
						...edge,
						id: edge.id.replace(oldId, newId),
						source: newId,
					};
				}
				if (edge.target === oldId) {
					return {
						...edge,
						id: edge.id.replace(oldId, newId),
						target: newId,
					};
				}
				return edge;
			});

			const updatedNodes = nodes.map((node) => {
				if (node.id === oldId) {
					return updatedNode;
				}

				const hasReferencesToOldId = node.data.responses.some(
					(r) => r.next === oldId,
				);

				if (hasReferencesToOldId) {
					const updatedResponses = node.data.responses.map((response) => {
						if (response.next === oldId) {
							return { ...response, next: newId };
						}
						return response;
					});

					return {
						...node,
						data: {
							...node.data,
							responses: updatedResponses,
						},
					};
				}

				return node;
			});

			setNodes(updatedNodes.filter((n) => n.id !== oldId));
			setEdges(updatedEdges);

			setTimeout(() => {
				const newNode = updatedNodes.find((n) => n.id === newId);
				if (newNode) {
					setSelectedNode(newNode);
					setEditModalOpen(true);
				}
			}, 100);
		};

		const handleCreateConnectedNode = (event: Event) => {
			const customEvent = event as CustomEvent<{ sourceId: string }>;
			const sourceId = customEvent.detail.sourceId;
			console.log("Criando nó conectado a:", sourceId);

			const sourceNode = nodes.find((n) => n.id === sourceId);
			if (!sourceNode) return;

			const newNodeId = `node_${idCounter.current}`;
			idCounter.current += 1;

			const newNodePosition = {
				x: sourceNode.position.x,
				y: sourceNode.position.y + 200,
			};

			const newNode: Node<NodeData> = {
				id: newNodeId,
				type: "message",
				position: newNodePosition,
				data: {
					label: `Nó ${newNodeId}`,
					message: "Digite sua mensagem aqui...",
					responses: [],
					responseCount: 0,
					group: sourceNode.data.group,
				},
			};

			setNodes((nds) => [...nds, newNode]);

			const newEdge: Edge = {
				id: `e-${sourceId}-${newNodeId}-auto`,
				source: sourceId,
				target: newNodeId,
				type: "custom",
				animated: true,
				label: "Próximo",
				style: { stroke: "#e11d48" },
				markerEnd: { type: MarkerType.ArrowClosed },
			};

			setEdges((eds) => [...eds, newEdge]);

			const updatedSourceNode = {
				...sourceNode,
				data: {
					...sourceNode.data,
					responses: [
						...sourceNode.data.responses,
						{
							key: "Próximo",
							next: newNodeId,
							value: "Próximo passo",
						},
					],
					responseCount: sourceNode.data.responses.length + 1,
				},
			};

			setNodes((nds) =>
				nds.map((n) => (n.id === sourceId ? updatedSourceNode : n)),
			);

			setTimeout(() => {
				setSelectedNode(newNode);
				setEditModalOpen(true);
			}, 100);
		};

		// Novo handler para remover conexões
		const handleRemoveConnection = (event: Event) => {
			const customEvent = event as CustomEvent<{
				sourceId: string;
				targetId: string;
				edgeId?: string;
				responseKey: string;
			}>;
			const { sourceId, targetId, edgeId, responseKey } = customEvent.detail;
			console.log(
				`Removendo conexão de ${sourceId} para ${targetId} (${responseKey})`,
			);

			// Remover a aresta
			if (edgeId) {
				setEdges((eds) => eds.filter((e) => e.id !== edgeId));
			} else {
				setEdges((eds) =>
					eds.filter(
						(e) =>
							!(
								e.source === sourceId &&
								e.target === targetId &&
								e.label === responseKey
							),
					),
				);
			}

			const sourceNode = nodes.find((n) => n.id === sourceId);
			if (sourceNode) {
				const updatedResponses = sourceNode.data.responses.filter(
					(r) => !(r.key === responseKey && r.next === targetId),
				);

				const updatedNode = {
					...sourceNode,
					data: {
						...sourceNode.data,
						responses: updatedResponses,
						responseCount: updatedResponses.length,
					},
				};

				setNodes((nds) =>
					nds.map((n) => (n.id === sourceId ? updatedNode : n)),
				);
			}
		};

		const handleRemoveAutomaticConnection = (event: Event) => {
			const customEvent = event as CustomEvent<{
				sourceId: string;
				targetId: string;
			}>;
			const { sourceId, targetId } = customEvent.detail;
			console.log(
				`Removendo conexão automática de ${sourceId} para ${targetId}`,
			);

			setEdges((eds) =>
				eds.filter(
					(e) =>
						!(
							e.source === sourceId &&
							e.target === targetId &&
							e.label === "Automático"
						),
				),
			);

			const sourceNode = nodes.find((n) => n.id === sourceId);
			if (sourceNode) {
				const updatedNode = {
					...sourceNode,
					data: {
						...sourceNode.data,
						automaticNext: undefined,
					},
				};

				setNodes((nds) =>
					nds.map((n) => (n.id === sourceId ? updatedNode : n)),
				);
			}
		};

		const handleAddIntermediateNode = (event: Event) => {
			const customEvent = event as CustomEvent<{
				sourceId: string;
				targetId: string;
				edgeId: string;
				position: { x: number; y: number };
				label: string;
			}>;
			const { sourceId, targetId, edgeId, position, label } =
				customEvent.detail;
			console.log(
				`Adicionando nó intermediário entre ${sourceId} e ${targetId}`,
			);

			const newNodeId = `node_${idCounter.current}`;
			idCounter.current += 1;

			const sourceNode = nodes.find((n) => n.id === sourceId);
			if (!sourceNode) return;

			const newNode: Node<NodeData> = {
				id: newNodeId,
				type: "message",
				position: position,
				data: {
					label: `Nó intermediário`,
					message: "Este nó foi inserido entre dois nós existentes",
					responses: [
						{
							key: "Próximo",
							next: targetId,
							value: "Continuar para o próximo nó",
						},
					],
					responseCount: 1,
					group: sourceNode.data.group,
				},
			};

			setNodes((nds) => [...nds, newNode]);

			setEdges((eds) => eds.filter((e) => e.id !== edgeId));

			const newEdge1: Edge = {
				id: `e-${sourceId}-${newNodeId}-intermediate`,
				source: sourceId,
				target: newNodeId,
				type: "custom",
				animated: true,
				label: label,
				style: { stroke: "#e11d48" },
				markerEnd: { type: MarkerType.ArrowClosed },
			};

			const newEdge2: Edge = {
				id: `e-${newNodeId}-${targetId}-intermediate`,
				source: newNodeId,
				target: targetId,
				type: "custom",
				animated: true,
				label: "Próximo",
				style: { stroke: "#e11d48" },
				markerEnd: { type: MarkerType.ArrowClosed },
			};

			setEdges((eds) => [...eds, newEdge1, newEdge2]);

			const updatedSourceNode = {
				...sourceNode,
				data: {
					...sourceNode.data,
					responses: sourceNode.data.responses.map((r) => {
						if (r.next === targetId && r.key === label) {
							return { ...r, next: newNodeId };
						}
						return r;
					}),
				},
			};

			setNodes((nds) =>
				nds.map((n) => (n.id === sourceId ? updatedSourceNode : n)),
			);

			setTimeout(() => {
				setSelectedNode(newNode);
				setEditModalOpen(true);
			}, 100);
		};

		window.addEventListener("node:edit", handleNodeEdit as EventListener);
		window.addEventListener("node:delete", handleNodeDelete as EventListener);
		window.addEventListener("group:add", handleGroupAdd as EventListener);
		window.addEventListener("node:rename", handleNodeRename as EventListener);
		window.addEventListener(
			"node:create-connected",
			handleCreateConnectedNode as EventListener,
		);
		window.addEventListener(
			"connection:remove",
			handleRemoveConnection as EventListener,
		);
		window.addEventListener(
			"connection:remove-automatic",
			handleRemoveAutomaticConnection as EventListener,
		);
		window.addEventListener(
			"edge:add-node",
			handleAddIntermediateNode as EventListener,
		);

		return () => {
			window.removeEventListener("node:edit", handleNodeEdit as EventListener);
			window.removeEventListener(
				"node:delete",
				handleNodeDelete as EventListener,
			);
			window.removeEventListener("group:add", handleGroupAdd as EventListener);
			window.removeEventListener(
				"node:rename",
				handleNodeRename as EventListener,
			); // Remover o event listener
			window.removeEventListener(
				"node:create-connected",
				handleCreateConnectedNode as EventListener,
			);
			window.removeEventListener(
				"connection:remove",
				handleRemoveConnection as EventListener,
			);
			window.removeEventListener(
				"connection:remove-automatic",
				handleRemoveAutomaticConnection as EventListener,
			);
			window.removeEventListener(
				"edge:add-node",
				handleAddIntermediateNode as EventListener,
			);
		};
	}, [nodes, setNodes, setEdges, groups]);

	useEffect(() => {
		if (initialData && !dataLoaded) {
			try {
				const flowNodes: Node<NodeData>[] = [];
				const flowEdges: Edge[] = [];

				if (initialData.inicio || initialData.steps) {
					const stepsData = initialData.steps || initialData;

					const savedPositions = initialData._meta?.nodePositions || {};

					const savedGroups = initialData._meta?.groups || {};
					const groupsList = Object.keys(savedGroups);
					setGroups(groupsList);

					Object.entries(stepsData).forEach(([stepId, stepData], index) => {
						if (typeof stepData !== "object" || stepId === "_meta") return;

						const nodeId = stepId;

						const nodePosition = savedPositions[nodeId] || {
							x: 250 * (index % 3),
							y: 200 * Math.floor(index / 3),
						};

						const nodeMessage = stepData.pergunta || stepData.mensagem || "";

						const responses: NodeResponse[] = [];

						if (
							stepData.next &&
							(typeof stepData.respostas !== "object" || stepData.inputLivre)
						) {
							responses.push({
								key: "Próximo",
								next: stepData.next,
								value:
									typeof stepData.respostas === "string"
										? stepData.respostas
										: "Próximo passo",
							});
						} else if (
							stepData.respostas &&
							typeof stepData.respostas === "object"
						) {
							Object.entries(stepData.respostas).forEach(([key, value]) => {
								let nextStep = "";
								let responseValue = "";

								if (typeof value === "object") {
									nextStep = (value as any).next || "";
									responseValue = (value as any).valor || "";
								} else if (typeof value === "string") {
									nextStep = value;
									responseValue = value;
								}

								responses.push({ key, next: nextStep, value: responseValue });
							});
						}

						if (
							stepData.mensagemFinal &&
							typeof stepData.mensagemFinal === "object"
						) {
							Object.entries(stepData.mensagemFinal).forEach(([key, value]) => {
								if (typeof value === "object") {
									responses.push({
										key,
										next: "",
										value: (value as any).mensagem || "",
									});
								}
							});
						}

						let nodeGroup: string | undefined = undefined;
						for (const [group, nodeIds] of Object.entries(savedGroups)) {
							if (nodeIds.includes(nodeId)) {
								nodeGroup = group;
								break;
							}
						}

						const nodeData: NodeData = {
							label: stepId,
							message: nodeMessage,
							responses: responses,
							responseCount: responses.length,
							group: nodeGroup,
						};

						if (stepData.next && typeof stepData.next === "string") {
							nodeData.automaticNext = stepData.next;
						}

						if (stepData.dispatch && stepData.dispatch === "automatic") {
							nodeData.dispatch = "automatic";
						}

						flowNodes.push({
							id: nodeId,
							type: "message",
							position: nodePosition,
							data: nodeData,
						});

						if (responses.length > 0) {
							responses.forEach((response) => {
								if (response.next) {
									flowEdges.push({
										id: `e-${nodeId}-${response.next}-${response.key}`,
										source: nodeId,
										target: response.next,
										label: response.key,
										type: "custom",
										animated: true,
										style: { stroke: "#e11d48" },
										markerEnd: {
											type: MarkerType.ArrowClosed,
										},
									});
								}
							});
						}

						if (nodeData.automaticNext) {
							flowEdges.push({
								id: `e-${nodeId}-${nodeData.automaticNext}-automatic`,
								source: nodeId,
								target: nodeData.automaticNext,
								label: "Automático",
								type: "custom",
								animated: true,
								style: { stroke: "#10b981" },
								markerEnd: {
									type: MarkerType.ArrowClosed,
								},
							});
						}
					});

					if (
						initialData.finished &&
						typeof initialData.finished === "object"
					) {
						const finishedNodeId = "finished";

						const finishedNodePosition = savedPositions[finishedNodeId] || {
							x: 500,
							y: 400,
						};

						let finishedGroup: string | undefined = undefined;
						for (const [group, nodeIds] of Object.entries(savedGroups)) {
							if (nodeIds.includes(finishedNodeId)) {
								finishedGroup = group;
								break;
							}
						}

						const finishedResponses: NodeResponse[] = [];
						Object.entries(initialData.finished).forEach(([key, value]) => {
							if (typeof value === "object") {
								finishedResponses.push({
									key,
									next: "",
									value: (value as any).mensagem || "",
								});
							}
						});

						flowNodes.push({
							id: finishedNodeId,
							type: "message",
							position: finishedNodePosition,
							data: {
								label: "Finalização",
								message: "Nó de finalização do fluxo",
								responses: finishedResponses,
								responseCount: finishedResponses.length,
								group: finishedGroup,
							},
						});
					}
				}

				console.log("Nós processados:", flowNodes);
				console.log("Arestas processadas:", flowEdges);

				setTimeout(() => {
					setNodes(flowNodes);
					setEdges(flowEdges);
					idCounter.current = flowNodes.length + 1;
					setDataLoaded(true);
				}, 100);
			} catch (error) {
				console.error("Error initializing flow data:", error);
				setDataLoaded(true);
			}
		}
	}, [initialData, setNodes, setEdges, dataLoaded]);

	const handleAddNode = () => {
		const id = `node_${idCounter.current}`;
		idCounter.current += 1;

		const newNode: Node<NodeData> = {
			id,
			type: "message",
			position: { x: 100, y: 100 },
			data: {
				label: `Nó ${id}`,
				message: "Digite sua mensagem aqui...",
				responses: [],
				responseCount: 0,
			},
		};

		setNodes((nds) => [...nds, newNode]);
		setSelectedNode(newNode);
		setEditModalOpen(true);
	};

	const handleUpdateNode = (updatedNode: Node<NodeData>) => {
		setNodes((nds) =>
			nds.map((node) => (node.id === updatedNode.id ? updatedNode : node)),
		);

		const nodeResponses = updatedNode.data.responses || [];

		setEdges((eds) => eds.filter((edge) => edge.source !== updatedNode.id));

		const newEdges: Edge[] = [];

		nodeResponses.forEach((response) => {
			if (response.next) {
				newEdges.push({
					id: `e-${updatedNode.id}-${response.next}-${response.key}`,
					source: updatedNode.id,
					target: response.next,
					label: response.key,
					type: "custom",
					animated: true,
					style: { stroke: "#e11d48" },
					markerEnd: {
						type: MarkerType.ArrowClosed,
					},
				});
			}
		});

		if (updatedNode.data.automaticNext) {
			newEdges.push({
				id: `e-${updatedNode.id}-${updatedNode.data.automaticNext}-automatic`,
				source: updatedNode.id,
				target: updatedNode.data.automaticNext,
				label: "Automático",
				type: "custom",
				animated: true,
				style: { stroke: "#10b981" },
				markerEnd: {
					type: MarkerType.ArrowClosed,
				},
			});
		}

		if (newEdges.length > 0) {
			setEdges((eds) => [...eds, ...newEdges]);
		}
	};

	const mergeWithOriginalData = (currentNodes: Node<NodeData>[]) => {
		if (!initialData || !initialData.steps) {
			return {
				steps: convertNodesToSteps(currentNodes),
			};
		}

		const mergedData: BotData = {
			steps: convertNodesToSteps(currentNodes),
		};

		if (initialData.expediente_off) {
			mergedData.expediente_off = initialData.expediente_off;
		}

		console.log("MERGED DATA BEFORE RETURN:", mergedData);
		return mergedData;
	};

	const convertNodesToSteps = (currentNodes: Node<NodeData>[]) => {
		const steps: Record<string, any> = {};

		currentNodes.forEach((node) => {
			const stepId = node.id;

			if (stepId === "finalizar") {
				const mensagemFinal: Record<string, any> = {};

				node.data.responses.forEach((response) => {
					if (response.key) {
						mensagemFinal[response.key] = {
							mensagem: response.value || `Mensagem para ${response.key}`,
							setorId: "67b8d47c5b7b4fa03aad2e2c",
						};
					}
				});

				steps[stepId] = { mensagemFinal };
				return;
			}

			if (
				stepId === "cidade" ||
				(typeof node.data.message === "string" &&
					node.data.message.includes("inputLivre"))
			) {
				const nextStep = node.data.responses.find((r) => r.next)?.next || "";
				const valorResposta =
					node.data.responses.find((r) => r.value)?.value || stepId;

				steps[stepId] = {
					mensagem: node.data.message,
					inputLivre: true,
					next: nextStep,
					respostas: valorResposta,
					naoentendi:
						"Desculpe, não consegui identificar. Pode repetir o nome da sua cidade? 📍",
				};
				return;
			}

			const respostas: Record<string, any> = {};

			node.data.responses.forEach((response) => {
				if (response.key) {
					if (response.next) {
						respostas[response.key] = {
							next: response.next,
							valor: response.value || response.key,
						};
					} else {
						respostas[response.key] = response.value || response.key;
					}
				}
			});

			steps[stepId] = {
				mensagem: node.data.message,
				respostas: respostas,
				naoentendi:
					"Não entendi. Por favor, escolha uma das opções disponíveis.",
			};

			if (node.data.automaticNext) {
				steps[stepId].next = node.data.automaticNext;
			}

			if (node.data.dispatch) {
				steps[stepId].dispatch = node.data.dispatch;
			}
		});

		console.log("CONVERTED STEPS:", steps);
		return steps;
	};

	const handleSaveFlow = async () => {
		try {
			console.log(campaignId, "campaignId fluxo...");

			const effectiveCompanyId = campaignId;

			if (effectiveCompanyId === undefined) {
				alert("ID da campanha não encontrado. Não é possível salvar o fluxo.");
				return;
			}

			if (!effectiveCompanyId) {
				alert("ID da campanha não encontrado. Não é possível salvar o fluxo.");
				return;
			}

			const currentNodes = [...nodes];

			const steps = convertNodesToSteps(currentNodes);

			const nodePositions: Record<string, { x: number; y: number }> = {};
			currentNodes.forEach((node) => {
				nodePositions[node.id] = {
					x: node.position.x,
					y: node.position.y,
				};
			});

			const groupsMap: Record<string, string[]> = {};
			groups.forEach((group) => {
				const nodesInGroup = currentNodes
					.filter((node) => node.data.group === group)
					.map((node) => node.id);

				if (nodesInGroup.length > 0) {
					groupsMap[group] = nodesInGroup;
				}
			});

			const updatedData = {
				steps: steps,
				_meta: {
					nodePositions: nodePositions,
					groups: groupsMap,
				},
			};

			if (initialData && initialData.expediente_off) {
				updatedData.expediente_off = initialData.expediente_off;
			}

			try {
				console.log(
					campaignId,
					"campaignId fluxo...",
					effectiveCompanyId,
					"effectiveCompanyIdeffectiveCompanyIdeffectiveCompanyId",
				);

				const result = await saveFlexBotNewSettings(
					effectiveCompanyId,
					updatedData,
					companyDataState,
				);

				console.log("Action response:", result);

				if (result && result.success) {
					alert("Fluxo salvo com sucesso!");
				} else {
					console.error(
						"Error saving flow:",
						result ? result.error : "No response from server",
					);
					alert(
						`Erro ao salvar: ${
							result && result.error ? result.error : "Sem resposta do servidor"
						}`,
					);
				}
			} catch (actionError) {
				console.error("Action execution error:", actionError);
				alert(
					`Erro ao executar ação de salvamento: ${
						actionError.message || "Erro desconhecido"
					}`,
				);
			}
		} catch (error) {
			console.error("Error in handleSaveFlow:", error);
			alert(
				"Ocorreu um erro ao tentar salvar o fluxo. Verifique o console para mais detalhes.",
			);
		}
	};

	const onConnect = useCallback(
		(params: Edge | Connection) => {
			const newEdge = {
				...params,
				id: `e-${params.source}-${params.target}-manual`,
				type: "custom",
				animated: true,
				style: { stroke: "#e11d48" },
				markerEnd: { type: MarkerType.ArrowClosed },
			};

			setEdges((eds) => addEdge(newEdge, eds));

			const sourceNode = nodes.find((n) => n.id === params.source);
			if (sourceNode) {
				const updatedNode = {
					...sourceNode,
					data: {
						...sourceNode.data,
						responses: [
							...sourceNode.data.responses,
							{
								key: "Nova conexão",
								next: params.target || "",
								value: params.target || "",
							},
						],
						responseCount: sourceNode.data.responses.length + 1,
					},
				};

				handleUpdateNode(updatedNode);
				setSelectedNode(updatedNode);
				setEditModalOpen(true);
			}
		},
		[nodes, setEdges],
	);

	const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
		console.log(`Nó ${node.id} movido para posição:`, node.position);
	}, []);

	const handleAutoLayout = useCallback(() => {
		if (!reactFlowInstance) return;

		const dagreGraph = new dagre.graphlib.Graph();
		dagreGraph.setDefaultEdgeLabel(() => ({}));
		dagreGraph.setGraph({ rankdir: "TB" });

		const nodes = reactFlowInstance.getNodes();
		const edges = reactFlowInstance.getEdges();

		// Adicione todos os nós ao grafo
		nodes.forEach((node) => {
			dagreGraph.setNode(node.id, {
				width: node.width || 300,
				height: node.height || 200,
			});
		});

		// Adicione todas as arestas ao grafo
		edges.forEach((edge) => {
			dagreGraph.setEdge(edge.source, edge.target);
		});

		// Calcule o layout
		dagre.layout(dagreGraph);

		// Atualize as posições dos nós
		const updatedNodes = nodes.map((node) => {
			const nodeWithPosition = dagreGraph.node(node.id);
			return {
				...node,
				position: {
					x: nodeWithPosition.x - (node.width || 300) / 2,
					y: nodeWithPosition.y - (node.height || 200) / 2,
				},
			};
		});

		// Defina os nós atualizados
		reactFlowInstance.setNodes(updatedNodes);
	}, [reactFlowInstance]);

	const handleFitView = useCallback(() => {
		if (reactFlowInstance) {
			reactFlowInstance.fitView({ padding: 0.2 });
		}
	}, [reactFlowInstance]);

	const handleAssignGroup = useCallback(
		(nodeId: string, groupName: string) => {
			setNodes((nds) =>
				nds.map((node) => {
					if (node.id === nodeId) {
						return {
							...node,
							data: {
								...node.data,
								group: groupName || undefined,
							},
						};
					}
					return node;
				}),
			);
		},
		[setNodes],
	);

	return (
		<>
			<div className="w-full h-[calc(100vh_-_125px)] min-h-[calc(100vh_-_125px)] bg-[#0d0e12] rounded-xl shadow-sm border border-[#1B1C22] overflow-hidden">
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					onNodeDragStop={onNodeDragStop}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					defaultEdgeOptions={{
						type: "custom",
					}}
					fitView
					connectionLineType={ConnectionLineType.SmoothStep}
					proOptions={{ hideAttribution: true }}
				>
					<Background />
					<Controls />
					<MiniMap
						nodeColor={(node) => {
							const nodeData = node.data as NodeData;
							if (nodeData.group) {
								switch (nodeData.group) {
									case "inicio":
										return "#10b981";
									case "menu":
										return "#3b82f6";
									case "formulario":
										return "#8b5cf6";
									case "finalizacao":
										return "#f59e0b";
									default:
										return "#6b7280";
								}
							}

							switch (node.id) {
								case "inicio":
									return "#10b981";
								case "finished":
									return "#ef4444";
								default:
									return "#3b82f6";
							}
						}}
					/>
					<Panel position="top-right">
						<div className="flex gap-2">
							<button
								onClick={handleAddNode}
								className="px-3 py-1 text-sm rounded-md bg-blue-900/30 text-blue-600 hover:bg-blue-800/30 transition-colors flex items-center gap-1"
								type="button"
							>
								<Plus className="w-4 h-4" />
								<span>Novo Nó</span>
							</button>
							<button
								onClick={() => setGroupManagerOpen(true)}
								className="px-3 py-1 text-sm rounded-md bg-blue-900/30 text-blue-600 hover:bg-blue-800/30 transition-colors flex items-center gap-1"
								type="button"
							>
								<Layers className="w-4 h-4" />
								<span>Grupos</span>
							</button>
							<button
								onClick={handleAutoLayout}
								className="px-3 py-1 text-sm rounded-md bg-purple-900/30 text-purple-600 hover:bg-purple-800/30 transition-colors flex items-center gap-1"
								type="button"
							>
								<LayoutGrid className="w-4 h-4" />
								<span>Organizar</span>
							</button>
							<button
								onClick={handleFitView}
								className="px-3 py-1 text-sm rounded-md bg-amber-900/30 text-amber-600 hover:bg-amber-800/30 transition-colors flex items-center gap-1"
								type="button"
							>
								<Maximize className="w-4 h-4" />
								<span>Ajustar</span>
							</button>
							<button
								onClick={handleSaveFlow}
								className="px-3 py-1 text-sm rounded-md bg-green-900/30 text-green-600 hover:bg-green-800/30 transition-colors flex items-center gap-1"
								type="button"
							>
								<Save className="w-4 h-4" />
								<span>Salvar</span>
							</button>
						</div>
					</Panel>
				</ReactFlow>
			</div>

			<NodeEditModal
				isOpen={editModalOpen}
				onClose={() => setEditModalOpen(false)}
				node={selectedNode}
				onSave={handleUpdateNode}
				availableNodes={nodes.filter((n) => n.id !== selectedNode?.id)}
				availableGroups={groups}
			/>

			<GroupManagerModal
				isOpen={groupManagerOpen}
				onClose={() => setGroupManagerOpen(false)}
				groups={groups}
				nodes={nodes}
				onAssignGroup={handleAssignGroup}
			/>
		</>
	);
};

interface WorkflowBuilderPageProps {
	botData?: BotData | null;
	campaignId: string;
	companyDataState?: BotData;
}

const nodeTypes = {
	custom: MessageNode,
	group: GroupNode,
};

const edgeTypes = {
	custom: CustomEdge,
};

const WorkflowBuilderPage = ({
	botData = null,
	campaignId,
	companyDataState,
}: WorkflowBuilderPageProps) => {
	const { toast } = useToast();
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const [flowName, setFlowName] = useState<string>("");
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

	// Novos estados adicionados
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [groupManagerOpen, setGroupManagerOpen] = useState(false);
	const [selectedNode, setSelectedNode] = useState<Node | null>(null);
	const [groups, setGroups] = useState<string[]>([]);

	// Função de Auto Layout usando Dagre
	const handleAutoLayout = useCallback(() => {
		if (!reactFlowInstance) return;

		const dagreGraph = new dagre.graphlib.Graph();
		dagreGraph.setDefaultEdgeLabel(() => ({}));
		dagreGraph.setGraph({ rankdir: "TB" });

		const nodes = reactFlowInstance.getNodes();
		const edges = reactFlowInstance.getEdges();

		// Adicione todos os nós ao grafo
		nodes.forEach((node) => {
			dagreGraph.setNode(node.id, {
				width: node.width || 300,
				height: node.height || 200,
			});
		});

		// Adicione todas as arestas ao grafo
		edges.forEach((edge) => {
			dagreGraph.setEdge(edge.source, edge.target);
		});

		// Calcule o layout
		dagre.layout(dagreGraph);

		// Atualize as posições dos nós
		const updatedNodes = nodes.map((node) => {
			const nodeWithPosition = dagreGraph.node(node.id);
			return {
				...node,
				position: {
					x: nodeWithPosition.x - (node.width || 300) / 2,
					y: nodeWithPosition.y - (node.height || 200) / 2,
				},
			};
		});

		// Defina os nós atualizados
		reactFlowInstance.setNodes(updatedNodes);
	}, [reactFlowInstance]);

	// Função para ajustar a visualização
	const handleFitView = useCallback(() => {
		if (reactFlowInstance) {
			reactFlowInstance.fitView({ padding: 0.2 });
		}
	}, [reactFlowInstance]);

	// Função para salvar o fluxo
	const handleSaveFlow = async () => {
		try {
			if (reactFlowInstance) {
				const flow = reactFlowInstance.toObject();

				// Exemplo de salvamento (adapte conforme sua necessidade)
				const response = await saveFlexBotNewSettings({
					campaignId,
					flowName,
					flowData: flow,
				});

				toast({
					title: "Fluxo Salvo",
					description: "Seu fluxo foi salvo com sucesso!",
					variant: "success",
				});
			}
		} catch (error) {
			toast({
				title: "Erro ao Salvar",
				description: "Não foi possível salvar o fluxo.",
				variant: "destructive",
			});
		}
	};

	// Função para atualizar nó
	const handleUpdateNode = (updatedNode: Node) => {
		setNodes((nds) =>
			nds.map((node) => (node.id === updatedNode.id ? updatedNode : node)),
		);
		setEditModalOpen(false);
	};

	// Função para atribuir grupo
	const handleAssignGroup = useCallback(
		(nodeId: string, groupName: string) => {
			setNodes((nds) =>
				nds.map((node) => {
					if (node.id === nodeId) {
						return {
							...node,
							data: {
								...node.data,
								group: groupName || undefined,
							},
						};
					}
					return node;
				}),
			);
			setGroupManagerOpen(false);
		},
		[setNodes],
	);

	// Restante do código original (onConnect, onDragOver, handleAddNode, etc.)
	const onConnect = useCallback(
		(params: Connection) => setEdges((eds) => addEdge(params, eds)),
		[setEdges],
	);

	const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const handleAddNode = useCallback(() => {
		const newNodeId = `node-${Date.now()}`;
		const newNode: Node<NodeData> = {
			id: newNodeId,
			type: "custom",
			position: {
				x: Math.random() * 500,
				y: Math.random() * 500,
			},
			data: {
				type: "text",
				label: "Novo Nó",
				content: "",
				responses: [],
				responseCount: 0,
			},
		};
		setNodes((currentNodes) => [...currentNodes, newNode]);
	}, [setNodes]);

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
			const newNode: Node = {
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
				description: "Seu fluxo foi salvo com sucesso!",
			});
		}
	}, [reactFlowInstance, toast]);

	const minimapNodeColor = useCallback((node: Node) => {
		switch (node.data.type) {
			case "message":
				return "#00ff00";
			case "condition":
				return "#ff00ff";
			case "input":
				return "#00ffff";
			default:
				return "#202024";
		}
	}, []);

	return (
		<div className="min-h-screen flex bg-gradient-to-br from-deep-purple to-deep-blue overflow-hidden">
			{/* Sidebar */}
			<SidebarChatbot />

			<div className="flex-grow flex flex-col ml-[316px]">
				{" "}
				{/* Adicionei margem à esquerda */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="flex-grow flex flex-col p-6"
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
										style={{
											backgroundColor: "rgba(24, 24, 36, 0.5)",
											border: "1px solid #7c3aed",
											borderRadius: "4px",
										}}
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
							</div>
						</div>
					</div>
				</motion.div>
			</div>
			{/* Modals */}
			<NodeEditModal
				isOpen={editModalOpen}
				onClose={() => setEditModalOpen(false)}
				node={selectedNode}
				onSave={handleUpdateNode}
				availableNodes={nodes.filter((n) => n.id !== selectedNode?.id)}
				availableGroups={groups}
			/>
			<GroupManagerModal
				isOpen={groupManagerOpen}
				onClose={() => setGroupManagerOpen(false)}
				groups={groups}
				nodes={nodes}
				onAssignGroup={handleAssignGroup}
			/>
		</div>
	);
};

const WorkflowBuilderWrapper: React.FC = () => (
	<ReactFlowProvider>
		<WorkflowBuilderPage campaignId={""} />
	</ReactFlowProvider>
);

export default WorkflowBuilderWrapper;
