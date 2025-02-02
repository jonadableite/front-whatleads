import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
	Calendar,
	Database,
	GitMerge,
	Globe,
	Hash,
	Home,
	Image,
	MessageCircle,
	Mic,
	RefreshCw,
	Type,
	Upload,
	Video,
	Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const sidebarItems = [
	{
		title: "Bubbles",
		items: [
			{ name: "Text", icon: <MessageCircle size={24} /> },
			{ name: "Image", icon: <Image size={24} /> },
			{ name: "Video", icon: <Video size={24} /> },
			{ name: "Audio", icon: <Mic size={24} /> },
		],
		color: "#3177f7",
	},
	{
		title: "Inputs",
		items: [
			{ name: "Text Input", icon: <Type size={24} /> },
			{ name: "Number Input", icon: <Hash size={24} /> },
			{ name: "Date Input", icon: <Calendar size={24} /> },
			{ name: "File Upload", icon: <Upload size={24} /> },
		],
		color: "#ff5b24",
	},
	{
		title: "Condicionais",
		items: [
			{ name: "If/Else", icon: <GitMerge size={24} /> },
			{ name: "Switch", icon: <GitMerge size={24} /> },
			{ name: "Loop", icon: <RefreshCw size={24} /> },
		],
		color: "#7f56fc",
	},
	{
		title: "Integrações",
		items: [
			{ name: "API Call", icon: <Zap size={24} /> },
			{ name: "Database", icon: <Database size={24} /> },
			{ name: "External Service", icon: <Globe size={24} /> },
		],
		color: "#00c853",
	},
];

export function SidebarChatbot() {
	return (
		<motion.div
			className="fixed left-4 top-4 bottom-4 w-[300px] bg-deep/90 backdrop-blur-xl border border-electric/30 rounded-lg z-50 flex flex-col"
			initial={{ x: -300 }}
			animate={{ x: 0 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
		>
			<div className="border-b border-electric/30 p-4">
				<Logo variant="default" />
			</div>
			<div className="p-4">
				<Link to="/dashboard">
					<Button
						variant="outline"
						className="w-full bg-blue-900 text-white hover:bg-electric/50 hover:text-white border-electric/20 transition-colors"
					>
						<Home className="mr-2 h-4 w-4" /> Voltar ao Início
					</Button>
				</Link>
			</div>
			<div className="flex-grow overflow-y-auto">
				{sidebarItems.map((category, index) => (
					<div key={index} className="mb-6 px-4 mt-4">
						<h3 className="text-white font-semibold mb-2 text-sm">
							{category.title}
						</h3>
						<div className="grid grid-cols-2 gap-3">
							{category.items.map((item, itemIndex) => (
								<motion.div
									key={itemIndex}
									className="cursor-move"
									whileHover={{ scale: 1.05 }}
									draggable
									onDragStart={(e) =>
										e.dataTransfer.setData("text/plain", item.name)
									}
								>
									<div className="flex flex-col items-center justify-center px-2 py-2 rounded-lg bg-[#202024] text-white h-[70px]">
										<div
											className="flex items-center justify-center mb-1"
											style={{ color: category.color }}
										>
											{item.icon}
										</div>
										<span className="text-xs leading-4 text-center text-white text-opacity-92">
											{item.name}
										</span>
									</div>
								</motion.div>
							))}
						</div>
					</div>
				))}
			</div>
		</motion.div>
	);
}
