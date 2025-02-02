import type { NodeData } from "@/interface";
import { MessageCircle } from "lucide-react";
// CustomNode.tsx
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Handle, type NodeProps, Position } from "reactflow";
import TextEditor from "./TextEditor";

const CustomNode: React.FC<NodeProps<NodeData>> = ({ data, isConnectable }) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const nodeRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (nodeRef.current && !nodeRef.current.contains(event.target as Node)) {
				setIsExpanded(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleTextChange = (newText: string) => {
		if (data.onChange) {
			data.onChange(data.id, { text: newText });
		}
	};

	return (
		<div
			ref={nodeRef}
			className="rounded-lg shadow-lg overflow-hidden bg-[#18181b] w-[300px]"
		>
			<div
				className="bg-[#19191c] p-4 cursor-pointer"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<Handle
					type="target"
					position={Position.Top}
					isConnectable={isConnectable}
				/>
				<div className="text-white font-semibold mb-2 flex items-center">
					<MessageCircle size={20} className="mr-2" />
					<span>Group #{data.id}</span>
				</div>
				<div className="text-white/70 text-sm truncate">
					{data.text || "No text entered"}
				</div>
				<Handle
					type="source"
					position={Position.Bottom}
					isConnectable={isConnectable}
				/>
			</div>
			{isExpanded && data.type === "Text" && (
				<div className="p-4" onClick={(e) => e.stopPropagation()}>
					<TextEditor initialText={data.text} onTextChange={handleTextChange} />
				</div>
			)}
		</div>
	);
};

export default CustomNode;
