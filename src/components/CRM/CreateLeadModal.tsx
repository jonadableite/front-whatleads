import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
//src/components/CRM/CreateLeadModal.tsx;
import { AnimatePresence, motion } from "framer-motion";
import { UserPlus, X } from "lucide-react";
import { useState } from "react";

const modalVariants = {
	hidden: {
		opacity: 0,
		scale: 0.9,
	},
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			type: "spring",
			stiffness: 300,
		},
	},
	exit: {
		opacity: 0,
		scale: 0.9,
	},
};

const segments = [
	"Tecnologia",
	"Saúde",
	"Educação",
	"Varejo",
	"Serviços",
	"Indústria",
];

export const CreateLeadModal = ({ isOpen, onClose }) => {
	const [leadData, setLeadData] = useState({
		name: "",
		email: "",
		phone: "",
		company: "",
		segment: "",
	});

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setLeadData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Lead criado:", leadData);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
			>
				<motion.div
					variants={modalVariants}
					initial="hidden"
					animate="visible"
					exit="exit"
					className="bg-deep/80 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-electric"
				>
					<div className="flex justify-between items-center mb-6">
						<div className="flex items-center">
							<UserPlus className="text-electric mr-3 w-8 h-8" />
							<h2 className="text-2xl font-bold text-white">Novo Lead</h2>
						</div>
						<motion.button
							whileHover={{ rotate: 90 }}
							onClick={onClose}
							className="text-white/60 hover:text-white"
						>
							<X className="w-6 h-6" />
						</motion.button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Campos de input com ícones e estilos */}
						{/* ... (código anterior mantido) ... */}

						<Select
							name="segment"
							value={leadData.segment}
							onValueChange={(value) =>
								setLeadData((prev) => ({
									...prev,
									segment: value,
								}))
							}
							required
						>
							<SelectTrigger className="pl-10 bg-deep/50 border-electric/30 text-white">
								<SelectValue placeholder="Selecione o segmento" />
							</SelectTrigger>
							<SelectContent className="bg-deep/80 border-electric/30">
								{segments.map((segment) => (
									<SelectItem
										key={segment}
										value={segment}
										className="hover:bg-electric/10 focus:bg-electric/20 text-white"
									>
										{segment}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Button
							type="submit"
							className="w-full bg-electric hover:bg-electric/80 text-white"
						>
							Criar Lead
						</Button>
					</form>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default CreateLeadModal;
