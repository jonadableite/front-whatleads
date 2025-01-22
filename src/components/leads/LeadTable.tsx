// src/components/leads/LeadTable.tsx
import { Button } from "@/components/ui/button";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import type { LeadTableProps } from "@/interface";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useState } from "react";
import {
	FiChevronLeft,
	FiChevronRight,
	FiEdit2,
	FiMail,
	FiMoreHorizontal,
	FiPhone,
	FiTrash2,
	FiUser,
} from "react-icons/fi";

export const LeadTable: React.FC<LeadTableProps> = ({
	leads,
	currentPage,
	pageCount,
	onPageChange,
}) => {
	const [hoveredRow, setHoveredRow] = useState<string | null>(null);

	const tableVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.05,
			},
		},
	};

	const rowVariants = {
		hidden: { opacity: 0, x: -20 },
		show: { opacity: 1, x: 0 },
	};

	const getStatusColor = (status: string) => {
		const colors = {
			active: "bg-gradient-to-r from-green-400 to-green-600",
			pending: "bg-gradient-to-r from-yellow-400 to-yellow-600",
			inactive: "bg-gradient-to-r from-red-400 to-red-600",
		};
		return colors[status as keyof typeof colors] || colors.pending;
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="space-y-6"
		>
			<div className="bg-deep/80 backdrop-blur-xl rounded-xl border border-electric/30 overflow-hidden">
				<Table>
					<Thead>
						<Tr className="bg-electric/10">
							<Th className="text-electric font-bold">
								<div className="flex items-center gap-2">
									<FiUser className="text-lg" />
									Nome
								</div>
							</Th>
							<Th className="text-electric font-bold">
								<div className="flex items-center gap-2">
									<FiPhone className="text-lg" />
									Telefone
								</div>
							</Th>
							<Th className="text-electric font-bold">
								<div className="flex items-center gap-2">
									<FiMail className="text-lg" />
									E-mail
								</div>
							</Th>
							<Th className="text-electric font-bold">Status</Th>
							<Th className="text-electric font-bold">Ações</Th>
						</Tr>
					</Thead>
					<Tbody>
						<AnimatePresence>
							{leads.map((lead) => (
								<motion.tr
									key={lead.id}
									variants={rowVariants}
									initial="hidden"
									animate="show"
									exit="hidden"
									className={`
                                        transition-all duration-200
                                        ${hoveredRow === lead.id ? "bg-electric/5" : "hover:bg-electric/5"}
                                    `}
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
										<motion.span
											whileHover={{ scale: 1.05 }}
											className={`
                                                px-3 py-1 rounded-full text-xs font-medium
                                                ${getStatusColor(lead.status)}
                                                shadow-lg backdrop-blur-sm
                                            `}
										>
											{lead.status || "pending"}
										</motion.span>
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
												className="hover:bg-electric/20 hover:text-electric transition-all duration-200"
												onClick={() => {
													/* Adicionar ação de editar */
												}}
											>
												<FiEdit2 className="mr-1" />
												Editar
											</Button>
											<Button
												size="sm"
												variant="destructive"
												className="hover:bg-red-600 transition-all duration-200"
												onClick={() => {
													/* Adicionar ação de excluir */
												}}
											>
												<FiTrash2 className="mr-1" />
												Excluir
											</Button>
											<Button
												size="sm"
												variant="ghost"
												className="hover:bg-electric/20 transition-all duration-200"
											>
												<FiMoreHorizontal />
											</Button>
										</motion.div>
									</Td>
								</motion.tr>
							))}
						</AnimatePresence>
					</Tbody>
				</Table>
			</div>

			{/* Paginação */}
			<motion.div
				className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
			>
				<div className="flex gap-2">
					<Button
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1}
						variant="outline"
						className="flex items-center gap-2 hover:bg-electric/20 hover:text-electric disabled:opacity-50 transition-all duration-200"
					>
						<FiChevronLeft />
						Anterior
					</Button>
					<Button
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage === pageCount}
						variant="outline"
						className="flex items-center gap-2 hover:bg-electric/20 hover:text-electric disabled:opacity-50 transition-all duration-200"
					>
						Próxima
						<FiChevronRight />
					</Button>
				</div>

				<div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
					<motion.span
						className="text-white/80 bg-deep/50 px-4 py-2 rounded-lg backdrop-blur-sm"
						whileHover={{ scale: 1.05 }}
					>
						Página {currentPage} de {pageCount}
					</motion.span>

					<motion.div
						className="text-electric text-sm bg-electric/10 px-4 py-2 rounded-lg backdrop-blur-sm"
						whileHover={{ scale: 1.05 }}
					>
						Total de {leads.length} leads encontrados
					</motion.div>
				</div>
			</motion.div>
		</motion.div>
	);
};
