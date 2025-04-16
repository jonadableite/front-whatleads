// src/components/fluxoflows/react-flow-wrapper.tsx
"use client";
import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { type ReactNode, useEffect, useState } from "react";

interface ReactFlowWrapperProps {
	children: ReactNode;
}

export default function ReactFlowWrapper({ children }: ReactFlowWrapperProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="p-6 flex items-center justify-center h-[800px] bg-deep/80 rounded-xl shadow-sm border border-electric">
				<div className="text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-electric border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
					<p className="mt-4 text-white">Carregando editor visual...</p>
				</div>
			</div>
		);
	}

	return <ReactFlowProvider>{children}</ReactFlowProvider>;
}
