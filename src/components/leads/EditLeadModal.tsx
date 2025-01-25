import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";
// src/components/leads/EditLeadModal.tsx
import type React from "react";
import { useEffect, useState } from "react";
import { FiCheckCircle, FiPhone, FiUser, FiX } from "react-icons/fi";

interface EditLeadModalProps {
	isOpen: boolean;
	onClose: () => void;
	lead: {
		id: string;
		name: string;
		phone: string;
		status: string;
	};
	onSave: (updatedLead: any) => void;
}

const EditLeadModal: React.FC<EditLeadModalProps> = ({
	isOpen,
	onClose,
	lead,
	onSave,
}) => {
	const [editedLead, setEditedLead] = useState(lead);

	useEffect(() => {
		setEditedLead(lead);
	}, [lead]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		setEditedLead({ ...editedLead, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave(editedLead);
		onClose();
	};

	const modalVariants = {
		hidden: { opacity: 0, scale: 0.8, y: 50 },
		visible: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: { type: "spring", damping: 25, stiffness: 500 },
		},
		exit: {
			opacity: 0,
			scale: 0.8,
			y: 50,
			transition: { duration: 0.2 },
		},
	};

	const overlayVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1 },
		exit: { opacity: 0 },
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 backdrop-blur-sm"
					initial="hidden"
					animate="visible"
					exit="exit"
					variants={overlayVariants}
				>
					<motion.div
						className="bg-deep rounded-2xl p-8 w-full max-w-md relative overflow-hidden border border-electric shadow-2xl"
						variants={modalVariants}
					>
						<motion.button
							className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
							onClick={onClose}
							whileHover={{ scale: 1.1, rotate: 90 }}
							whileTap={{ scale: 0.9 }}
						>
							<FiX size={24} />
						</motion.button>

						<h2 className="text-3xl font-bold text-electric mb-6">
							Editar Lead
						</h2>

						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="space-y-4">
								<div className="relative">
									<FiUser className="absolute top-3 left-3 text-electric" />
									<Input
										type="text"
										name="name"
										value={editedLead.name}
										onChange={handleChange}
										placeholder="Nome"
										className="pl-10 bg-deep/50 border-electric text-white placeholder-white/50"
									/>
								</div>

								<div className="relative">
									<FiPhone className="absolute top-3 left-3 text-electric" />
									<Input
										type="tel"
										name="phone"
										value={editedLead.phone}
										onChange={handleChange}
										placeholder="Telefone"
										className="pl-10 bg-deep/50 border-electric text-white placeholder-white/50"
									/>
								</div>

								<Select
									name="status"
									value={editedLead.status}
									onChange={handleChange}
									className="w-full bg-deep/50 border-electric text-white"
								>
									<option value="novo">Novo</option>
									<option value="SENT">Em Progresso</option>
									<option value="READ">Qualificado</option>
									<option value="DELIVERED">Desqualificado</option>
								</Select>
							</div>

							<motion.div className="flex justify-end">
								<motion.button
									type="submit"
									className="bg-electric text-deep hover:bg-electric/80 transition-all duration-300"
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<FiCheckCircle className="mr-2" />
									Salvar Alterações
								</motion.button>
							</motion.div>
						</form>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default EditLeadModal;
