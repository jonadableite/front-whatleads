// src/components/CRM/LeadDetails.tsx;

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
	Briefcase,
	Mail,
	MapPin,
	MessageSquare,
	Phone,
	Send,
	Tag,
} from "lucide-react";

const detailVariants = {
	hidden: { opacity: 0, x: 50 },
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			type: "spring",
			stiffness: 300,
		},
	},
};

const LeadDetails = ({ lead }) => {
	if (!lead) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric text-center"
			>
				<p className="text-white/60">Selecione um lead para ver detalhes</p>
			</motion.div>
		);
	}

	return (
		<motion.div
			variants={detailVariants}
			initial="hidden"
			animate="visible"
			className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric"
		>
			{/* Cabeçalho do Lead */}
			<div className="flex items-center mb-6">
				<img
					src={lead.avatar}
					alt={lead.name}
					className="w-16 h-16 rounded-full object-cover border-4 border-electric mr-4"
				/>
				<div>
					<h2 className="text-2xl font-bold text-white">{lead.name}</h2>
					<div
						className={`
              inline-block px-3 py-1 rounded-full text-xs font-bold mt-2
              ${
								lead.status === "Qualificação"
									? "bg-yellow-500/20 text-yellow-500"
									: "bg-green-500/20 text-green-500"
							}
            `}
					>
						{lead.status}
					</div>
				</div>
			</div>

			{/* Informações de Contato */}
			<div className="space-y-4 mb-6">
				<div className="flex items-center text-white/80">
					<Mail className="mr-3 text-electric" />
					{lead.email}
				</div>
				<div className="flex items-center text-white/80">
					<Phone className="mr-3 text-electric" />
					{lead.phone}
				</div>
				<div className="flex items-center text-white/80">
					<MapPin className="mr-3 text-electric" />
					São Paulo, Brasil
				</div>
			</div>

			{/* Detalhes Adicionais */}
			<div className="grid grid-cols-2 gap-4 mb-6">
				<div className="bg-deep/50 p-3 rounded-lg">
					<div className="flex items-center text-white/60 mb-2">
						<Briefcase className="mr-2 text-electric" />
						Empresa
					</div>
					<p className="font-bold text-white">TechSolutions</p>
				</div>
				<div className="bg-deep/50 p-3 rounded-lg">
					<div className="flex items-center text-white/60 mb-2">
						<Tag className="mr-2 text-electric" />
						Segmento
					</div>
					<p className="font-bold text-white">Tecnologia</p>
				</div>
			</div>

			{/* Ações */}
			<div className="grid grid-cols-2 gap-4">
				<Button
					variant="outline"
					className="bg-deep/50 border-electric/30 text-white hover:bg-electric/10"
				>
					<MessageSquare className="mr-2" /> Enviar Mensagem
				</Button>
				<Button className="bg-electric hover:bg-electric/80">
					<Send className="mr-2" /> Iniciar Proposta
				</Button>
			</div>
		</motion.div>
	);
};

export default LeadDetails;
