// src/contexts/SidebarContext.tsx
import type React from "react";
import { createContext, useContext, useState } from "react";

interface SidebarContextType {
	isCollapsed: boolean;
	toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
	const [isCollapsed, setIsCollapsed] = useState(false);

	const toggleSidebar = () => setIsCollapsed(!isCollapsed);

	return (
		<SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
			{children}
		</SidebarContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSidebar() {
	const context = useContext(SidebarContext);
	if (context === undefined) {
		throw new Error("useSidebar must be used within a SidebarProvider");
	}
	return context;
}
