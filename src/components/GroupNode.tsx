import { Handle, type NodeProps, Position } from "@xyflow/react";
// GroupNode.tsx
import type React from "react";

const GroupNode: React.FC<NodeProps> = ({ data }) => {
	return (
		<div className="border-2 border-dashed border-gray-400 p-4 rounded-lg">
			<Handle type="target" position={Position.Top} />
			<div className="font-bold mb-2">{data.label}</div>
			<div className="text-sm">Children: {data.children.join(", ")}</div>
			<Handle type="source" position={Position.Bottom} />
		</div>
	);
};

export default GroupNode;
