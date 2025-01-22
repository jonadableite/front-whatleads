// src/components/layout/DashboardLayout.tsx
import { Sidebar } from "@/components/layout/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";

export function DashboardLayout() {
	const { isCollapsed } = useSidebar();

	return (
		<div className="flex min-h-screen bg-gradient-to-br from-deep-purple to-deep-blue overflow-hidden">
			<Sidebar />
			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className={cn(
					"flex-1 transition-all duration-300 ease-in-out p-6",
					isCollapsed ? "ml-20" : "ml-64",
					"lg:p-8 xl:p-10",
				)}
			>
				<div className="relative">
					{/* Background Decoration */}
					<div className="absolute inset-0 bg-gradient-to-br from-electric/5 to-neon-green/5 rounded-3xl" />
					<div className="absolute inset-0 backdrop-blur-[120px] rounded-3xl" />

					{/* Content */}
					<div className="relative z-10">
						<Outlet />
					</div>
				</div>
			</motion.main>
		</div>
	);
}
