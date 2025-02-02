import type React from "react";
import { type EdgeProps, getBezierPath } from "reactflow";

const CustomEdge: React.FC<EdgeProps> = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	markerEnd,
}) => {
	const [edgePath] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	return (
		<>
			<defs>
				<linearGradient
					id={`flowGradient-${id}`}
					x1="0%"
					y1="0%"
					x2="100%"
					y2="0%"
				>
					<stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2">
						<animate
							attributeName="offset"
							values="0;1"
							dur="2s"
							repeatCount="indefinite"
						/>
					</stop>
					<stop offset="50%" stopColor="#7c3aed" stopOpacity="1">
						<animate
							attributeName="offset"
							values="0;1"
							dur="2s"
							repeatCount="indefinite"
						/>
					</stop>
					<stop offset="100%" stopColor="#7c3aed" stopOpacity="0.2">
						<animate
							attributeName="offset"
							values="0;1"
							dur="2s"
							repeatCount="indefinite"
						/>
					</stop>
				</linearGradient>
				<marker
					id="arrowhead"
					viewBox="0 0 10 10"
					refX="5"
					refY="5"
					markerWidth="6"
					markerHeight="6"
					orient="auto-start-reverse"
				>
					<path d="M 0 0 L 10 5 L 0 10 z" fill="#7c3aed" />
				</marker>
			</defs>
			<path
				id={id}
				style={{
					...style,
					strokeWidth: 2,
					stroke: `url(#flowGradient-${id})`,
				}}
				className="react-flow__edge-path"
				d={edgePath}
				markerEnd="url(#arrowhead)"
			/>
		</>
	);
};

export default CustomEdge;
