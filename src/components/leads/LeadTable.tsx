import { Button } from "@/components/ui/button";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import type { LeadTableProps } from "@/interface";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
	FiCheckCircle,
	FiChevronLeft,
	FiChevronRight,
	FiClock,
	FiEdit2,
	FiHelpCircle,
	FiMail,
	FiPhone,
	FiTrash2,
	FiUser,
	FiXCircle,
} from "react-icons/fi";

const statusMap = {
	novo: {
		color:
			"bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-blue-500 to-blue-600",
		icon: <FiClock className="text-blue-400" />,
		label: "Novo",
	},
	SENT: {
		color:
			"bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-yellow-400 via-yellow-500 to-yellow-600",
		icon: <FiClock className="text-yellow-400" />,
		label: "Em Progresso",
	},
	READ: {
		color:
			"bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-green-400 via-green-500 to-green-600",
		icon: <FiCheckCircle className="text-green-400" />,
		label: "Qualificado",
	},
	DELIVERED: {
		color:
			"bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-red-400 via-red-500 to-red-600",
		icon: <FiXCircle className="text-red-400" />,
		label: "Desqualificado",
	},
	default: {
		color:
			"bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-gray-400 via-gray-500 to-gray-600",
		icon: <FiHelpCircle className="text-gray-400" />,
		label: "Desconhecido",
	},
};

const getStatusInfo = (status: string) =>
	statusMap[status as keyof typeof statusMap] || statusMap.default;

export const LeadTable: React.FC<LeadTableProps> = ({
	leads,
	currentPage,
	pageCount,
	onPageChange,
	onEdit,
	onDelete,
}) => {
	const [hoveredRow, setHoveredRow] = useState<string | null>(null);
	const [animateTable, setAnimateTable] = useState(false);

	useEffect(() => {
		setAnimateTable(true);
	}, []);

	const handleEditLead = useCallback(
		(leadId: string) => {
			if (typeof onEdit === "function") {
				onEdit(leadId);
			} else {
				console.warn("onEdit não é uma função ou não foi fornecida");
			}
		},
		[onEdit],
	);

	const handleDeleteLead = useCallback(
		(leadId: string) => {
			if (typeof onDelete === "function") {
				onDelete(leadId);
			} else {
				console.error("onDelete is not a function");
			}
		},
		[onDelete],
	);

	const tableVariants = {
		hidden: { opacity: 0, scale: 0.9 },
		show: {
			opacity: 1,
			scale: 1,
			transition: {
				duration: 0.5,
				staggerChildren: 0.1,
			},
		},
	};

	const rowVariants = {
		hidden: { opacity: 0, y: -20 },
		show: { opacity: 1, y: 0 },
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8, ease: "easeOut" }}
			className="space-y-8"
		>
			<motion.div
				className="bg-deep/90 backdrop-blur-2xl rounded-2xl border border-electric/40 overflow-hidden shadow-2xl"
				variants={tableVariants}
				initial="hidden"
				animate={animateTable ? "show" : "hidden"}
			>
				<Table>
					<Thead>
						<Tr className="bg-electric/20">
							{["Nome", "Telefone", "E-mail", "Status", "Ações"].map(
								(header, index) => (
									<Th key={index} className="text-electric font-bold">
										<motion.div
											className="flex items-center gap-2"
											whileHover={{ scale: 1.05, color: "#00FFFF" }}
										>
											{index === 0 && <FiUser className="text-lg" />}
											{index === 1 && <FiPhone className="text-lg" />}
											{index === 2 && <FiMail className="text-lg" />}
											{header}
										</motion.div>
									</Th>
								),
							)}
						</Tr>
					</Thead>
					<Tbody>
						<AnimatePresence>
							{leads.map((lead) => (
								<motion.tr
									key={lead.id}
									variants={rowVariants}
									className={`transition-all duration-300 ${
										hoveredRow === lead.id
											? "bg-electric/20"
											: "hover:bg-electric/10"
									}`}
									onMouseEnter={() => setHoveredRow(lead.id)}
									onMouseLeave={() => setHoveredRow(null)}
								>
									<Td className="font-medium">{lead.name || "-"}</Td>
									<Td>
										<motion.div
											whileHover={{ scale: 1.05 }}
											className="flex items-center gap-2"
										>
											<FiPhone className="text-electric" />
											{lead.phone || "-"}
										</motion.div>
									</Td>
									<Td>
										<motion.div
											whileHover={{ scale: 1.05 }}
											className="flex items-center gap-2"
										>
											<FiMail className="text-electric" />
											{lead.email || "-"}
										</motion.div>
									</Td>
									<Td>
										<motion.div
											whileHover={{ scale: 1.05 }}
											className="flex items-center gap-2"
										>
											{(() => {
												const statusInfo = getStatusInfo(lead.status);
												return (
													<div
														className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color} shadow-lg backdrop-blur-sm`}
													>
														{statusInfo.icon}
														<span>{statusInfo.label}</span>
													</div>
												);
											})()}
										</motion.div>
									</Td>
									<Td>
										<motion.div
											className="flex gap-2"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
										>
											<Button
												size="sm"
												variant="ghost"
												className="hover:bg-electric/30 hover:text-electric transition-all duration-200"
												onClick={() => handleEditLead(lead.id)}
											>
												<FiEdit2 className="mr-1" />
												Editar
											</Button>
											<Button
												size="sm"
												variant="destructive"
												className="hover:bg-red-600 transition-all duration-200"
												onClick={() => handleDeleteLead(lead.id)}
											>
												<FiTrash2 className="mr-1" />
												Excluir
											</Button>
										</motion.div>
									</Td>
								</motion.tr>
							))}
						</AnimatePresence>
					</Tbody>
				</Table>
			</motion.div>

			<motion.div
				className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3, duration: 0.5 }}
			>
				<div className="flex gap-2">
					<Button
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1}
						variant="outline"
						className="flex items-center gap-2 hover:bg-electric/30 hover:text-electric disabled:opacity-50 transition-all duration-200"
					>
						<FiChevronLeft />
						Anterior
					</Button>
					<Button
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage === pageCount}
						variant="outline"
						className="flex items-center gap-2 hover:bg-electric/30 hover:text-electric disabled:opacity-50 transition-all duration-200"
					>
						Próxima
						<FiChevronRight />
					</Button>
				</div>

				<div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
					<motion.span
						className="text-white/90 bg-deep/70 px-4 py-2 rounded-lg backdrop-blur-sm"
						whileHover={{ scale: 1.05 }}
					>
						Página {currentPage} de {pageCount}
					</motion.span>

					<motion.div
						className="text-electric text-sm bg-electric/20 px-4 py-2 rounded-lg backdrop-blur-sm"
						whileHover={{ scale: 1.05 }}
					>
						Total de {leads.length} leads encontrados
					</motion.div>
				</div>
			</motion.div>
		</motion.div>
	);
};
