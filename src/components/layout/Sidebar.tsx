// src/components/layout/Sidebar.tsx
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { AnimatePresence, motion } from "framer-motion";
import {
	Box,
	ChevronRight,
	FileText,
	Home,
	LogOut,
	Menu,
	MessageSquareText,
	Users,
	X,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface SidebarItem {
	title: string;
	icon: React.ReactNode;
	path: string;
	badge?: number;
	submenu?: {
		title: string;
		path: string;
	}[];
}

const sidebarItems: SidebarItem[] = [
	{
		title: "Dashboard",
		icon: <Home className="w-5 h-5" />,
		path: "/",
	},
	{
		title: "Disparos",
		icon: <MessageSquareText className="w-5 h-5" />,
		path: "/disparos",
		submenu: [
			// { title: "Histórico", path: "/disparos/historico" },
			{ title: "Agendados", path: "/disparos/agendados" },
		],
	},
	{
		title: "Contatos",
		icon: <Users className="w-5 h-5" />,
		path: "/contatos",
		badge: 5,
	},
	{
		title: "Automações",
		icon: <Zap className="w-5 h-5" />,
		path: "/automacoes",
	},
	{
		title: "Campanhas",
		icon: <FileText className="w-5 h-5" />,
		path: "/campanhas",
		submenu: [{ title: "Todas Campanhas", path: "/campanhas" }],
	},
	{
		title: "Instâncias",
		icon: <Box className="w-5 h-5" />,
		path: "/instancias",
	},
	// {
	// 	title: "Configurações",
	// 	icon: <Settings className="w-5 h-5" />,
	// 	path: "/configuracoes",
	// },
];

export function Sidebar() {
	const { isCollapsed, toggleSidebar } = useSidebar();
	const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
	const location = useLocation();
	const user = authService.getUser();

	const handleLogout = () => {
		authService.logout();
	};

	const toggleSubmenu = (path: string) => {
		setOpenSubmenu(openSubmenu === path ? null : path);
	};

	return (
		<motion.div
			initial={{ x: -300 }}
			animate={{ x: 0 }}
			className={cn(
				"fixed left-0 top-0 h-screen bg-deep/90 backdrop-blur-xl border-r border-electric/30",
				isCollapsed ? "w-20" : "w-64",
				"transition-all duration-300 ease-in-out z-50",
			)}
		>
			<div className="flex flex-col h-full">
				{/* Header */}
				<div className="relative border-b border-electric/30 p-4">
					<div className="flex items-center justify-between">
						<AnimatePresence mode="wait">
							{!isCollapsed && (
								<motion.img
									key="logo"
									src="/Logo.png"
									alt="Logo"
									initial={{ opacity: 0, scale: 0.3 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.3 }}
									transition={{ duration: 0.3 }}
									className="h-16 w-auto object-contain"
								/>
							)}
						</AnimatePresence>

						<Button
							variant="ghost"
							size="icon"
							onClick={toggleSidebar}
							className={cn(
								"text-neon-pink hover:bg-neon-pink/20 transition-colors duration-300",
								isCollapsed ? "w-full" : "ml-auto",
							)}
						>
							{isCollapsed ? (
								<Menu className="w-5 h-5" />
							) : (
								<motion.div
									whileHover={{ rotate: 90 }}
									transition={{ duration: 0.2 }}
								>
									<X className="w-5 h-5" />
								</motion.div>
							)}
						</Button>
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 overflow-y-auto scrollbar-none py-4">
					{sidebarItems.map((item) => (
						<div key={item.path} className="relative">
							{/* Active Route Indicator */}
							<AnimatePresence>
								{location.pathname === item.path && (
									<motion.div
										initial={{ opacity: 0, x: -5 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -5 }}
										className="absolute left-0 top-0 h-full w-1 bg-neon-green rounded-r-full"
									/>
								)}
							</AnimatePresence>

							<Link
								to={item.path}
								className={cn(
									"flex items-center gap-3 px-4 py-3 text-white/80 relative group",
									"transition-all duration-200",
									location.pathname === item.path && "text-white",
									isCollapsed && "justify-center",
								)}
								onClick={() => item.submenu && toggleSubmenu(item.path)}
							>
								{/* Hover Background Effect */}
								<motion.div
									className="absolute inset-0 bg-electric/10 rounded-lg opacity-0 group-hover:opacity-100"
									initial={{ scale: 0.95, opacity: 0 }}
									whileHover={{ scale: 1, opacity: 1 }}
									transition={{ duration: 0.2 }}
								/>

								{/* Icon with effects */}
								<motion.div
									className={cn(
										"relative z-10",
										location.pathname === item.path && "text-neon-green",
									)}
									whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
									transition={{ duration: 0.3 }}
								>
									{item.icon}
									<motion.div
										className="absolute inset-0 bg-neon-green/20 rounded-full blur-sm"
										initial={{ scale: 0 }}
										whileHover={{ scale: 1.5 }}
										transition={{ duration: 0.2 }}
									/>
								</motion.div>

								{!isCollapsed && (
									<>
										<motion.span
											className="flex-1 relative z-10 group-hover:text-white"
											whileHover={{ x: 5 }}
											transition={{ duration: 0.2 }}
										>
											{item.title}
										</motion.span>

										{item.badge && (
											<motion.span
												initial={{ scale: 0.8 }}
												animate={{ scale: 1 }}
												whileHover={{ scale: 1.1 }}
												className="bg-neon-green text-deep px-2 py-0.5 rounded-full text-xs z-10
                          shadow-[0_0_10px_rgba(0,255,106,0.5)]"
											>
												{item.badge}
											</motion.span>
										)}

										{item.submenu && (
											<motion.div
												animate={{
													rotate: openSubmenu === item.path ? 90 : 0,
													color:
														openSubmenu === item.path ? "#00FF6A" : "#ffffff",
												}}
												className="z-10"
											>
												<ChevronRight className="w-4 h-4" />
											</motion.div>
										)}
									</>
								)}

								{/* Tooltip for collapsed state */}
								{isCollapsed && (
									<motion.div
										initial={{ opacity: 0, x: 20 }}
										whileHover={{ opacity: 1, x: 0 }}
										className="absolute left-full ml-2 px-2 py-1 bg-deep/90 rounded-md
                      text-sm whitespace-nowrap z-50 hidden group-hover:block"
									>
										{item.title}
									</motion.div>
								)}
							</Link>

							{/* Submenu */}
							<AnimatePresence>
								{!isCollapsed && item.submenu && openSubmenu === item.path && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										className="overflow-hidden bg-deep/50"
									>
										{item.submenu.map((subItem) => (
											<Link
												key={subItem.path}
												to={subItem.path}
												className={cn(
													"flex items-center gap-3 px-12 py-2 text-white/70",
													"hover:text-white transition-all duration-200",
													location.pathname === subItem.path &&
														"bg-electric/30 text-white",
												)}
											>
												<span>{subItem.title}</span>
											</Link>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					))}
				</nav>

				{/* Footer */}
				<div className="border-t border-electric/30 p-4">
					<div
						className={cn(
							"flex items-center",
							isCollapsed ? "justify-center" : "gap-3",
						)}
					>
						{isCollapsed ? (
							<Button
								variant="ghost"
								size="icon"
								onClick={handleLogout}
								className="text-neon-pink hover:bg-neon-pink/20 transition-colors duration-300"
								title="Sair"
							>
								<motion.div
									whileHover={{ scale: 1.1 }}
									transition={{ duration: 0.2 }}
								>
									<LogOut className="w-5 h-5" />
								</motion.div>
							</Button>
						) : (
							<>
								<div className="w-10 h-10 rounded-full bg-electric text-white flex items-center justify-center flex-shrink-0">
									<span className="font-medium text-lg">
										{user?.name?.charAt(0).toUpperCase()}
									</span>
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-white text-sm font-medium truncate">
										{user?.name}
									</p>
									<p className="text-white/60 text-xs truncate">
										{user?.email}
									</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={handleLogout}
									className="text-neon-pink hover:bg-neon-pink/20 transition-colors duration-300 flex-shrink-0 group"
									title="Sair"
								>
									<motion.div
										whileHover={{ scale: 1.1 }}
										transition={{ duration: 0.2 }}
									>
										<LogOut className="w-5 h-5" />
									</motion.div>
									<motion.div
										className="absolute inset-0 bg-neon-pink/10 rounded-full opacity-0 group-hover:opacity-100"
										initial={{ scale: 0.8 }}
										whileHover={{ scale: 1 }}
										transition={{ duration: 0.2 }}
									/>
								</Button>
							</>
						)}
					</div>
				</div>
			</div>
		</motion.div>
	);
}
