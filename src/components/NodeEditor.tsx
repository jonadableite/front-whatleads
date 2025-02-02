import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// src/components/NodeEditor.tsx
import type React from "react";
import type { Node } from "reactflow";

interface NodeEditorProps {
	node: Node;
	updateNodeData: (nodeId: string, newData: any) => void;
	onClose: () => void;
}

const NodeEditor: React.FC<NodeEditorProps> = ({
	node,
	updateNodeData,
	onClose,
}) => {
	const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		updateNodeData(node.id, { label: e.target.value });
	};

	return (
		<div className="bg-deep/80 backdrop-blur-xl p-4 rounded-xl border border-electric">
			<h3 className="text-white text-lg font-bold mb-4">Editar Nó</h3>
			<Input
				type="text"
				value={node.data.label}
				onChange={handleLabelChange}
				placeholder="Rótulo do nó"
				className="mb-4"
			/>
			{/* Adicione mais campos de edição conforme necessário */}
			<div className="flex justify-end">
				<Button
					onClick={onClose}
					className="bg-neon-pink text-white hover:bg-neon-pink/80"
				>
					Fechar
				</Button>
			</div>
		</div>
	);
};

export default NodeEditor;
