import { ReactFlowProvider } from "@xyflow/react";
// src/components/ReactFlowWrapper.tsx
import "@xyflow/react/dist/style.css";
import type React from "react";
import { type ReactNode, useEffect, useState } from "react";

interface ReactFlowWrapperProps {
	children: ReactNode;
}

const ReactFlowWrapper: React.FC<ReactFlowWrapperProps> = ({ children }) => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="p-6 flex items-center justify-center h-[800px] bg-gray-50 dark:bg-[#0d0e12] rounded-xl shadow-sm border border-gray-200 dark:border-[#1B1C22]">
				<div className="text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
					<p className="mt-4 text-gray-600 dark:text-gray-400">
						Carregando editor visual...
					</p>
				</div>
			</div>
		);
	}

	return <ReactFlowProvider>{children}</ReactFlowProvider>;
};

export default ReactFlowWrapper;
