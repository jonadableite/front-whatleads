// src/components/CRM/LeadList.tsx
import { AnimatePresence, motion } from "framer-motion";
import { Filter, Phone, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLeadsData } from "@/hooks/useLeadsData";

const leadVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 300,
		},
	},
	hover: {
		scale: 1.02,
		boxShadow: "0 10px 20px rgba(124, 58, 237, 0.2)",
	},
};

const LeadList = ({ onSelectLead, selectedLead }) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterOpen, setFilterOpen] = useState(false);

	// Usar o hook personalizado para buscar leads
	const { leads, isLoading, error } = useLeadsData();

	// Filtrar leads baseado no termo de busca
	const filteredLeads = leads.filter(
		(lead) =>
			lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			lead.email?.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	// Estado de carregamento
	if (isLoading) {
		return (
			<div className="text-white text-center py-8">Carregando leads...</div>
		);
	}

	// Tratamento de erro
	if (error) {
		return (
			<div className="text-red-500 text-center py-8">
				Erro ao carregar leads: {error.message}
			</div>
		);
	}

	// Verificar se não há leads
	if (filteredLeads.length === 0) {
		return (
			<div className="text-white/70 text-center py-8">
				Nenhum lead encontrado
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric"
		>
			{/* Cabeçalho de Busca e Filtro */}
			<div className="flex mb-6 space-x-4">
				<div className="relative flex-grow">
					<Input
						placeholder="Buscar leads..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 bg-deep/50 border-electric/30 text-white"
					/>
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
				</div>
				<Button
					onClick={() => setFilterOpen(!filterOpen)}
					variant="outline"
					className="bg-deep/50 border-electric/30 text-white hover:bg-electric/10"
				>
					<Filter className="mr-2" /> Filtros
				</Button>
			</div>

			{/* Lista de Leads */}
			<AnimatePresence>
				{filteredLeads.map((lead) => (
					<motion.div
						key={lead.id}
						variants={leadVariants}
						initial="hidden"
						animate="visible"
						whileHover="hover"
						onClick={() => onSelectLead(lead)}
						className={`
              flex items-center p-4 mb-4 rounded-xl cursor-pointer
              transition-all duration-300
              ${
								selectedLead?.id === lead.id
									? "bg-electric/20 border border-electric"
									: "bg-deep/50 hover:bg-electric/10"
							}
            `}
					>
						{/* Conteúdo do lead */}
						<div className="flex-grow">
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-bold text-white">
									{lead.name || "Nome não disponível"}
								</h3>
								<div
									className={`
                    px-2 py-1 rounded-full text-xs font-bold
                    ${
											lead.status === "active"
												? "bg-green-500/20 text-green-500"
												: "bg-yellow-500/20 text-yellow-500"
										}
                  `}
								>
									{lead.status}
								</div>
							</div>
							<p className="text-white/70 text-sm">
								{lead.email || "E-mail não disponível"}
							</p>
							<div className="flex items-center text-white/60 text-xs mt-2">
								<Phone className="w-4 h-4 mr-2" />
								{lead.phone || "Telefone não disponível"}
							</div>
						</div>
					</motion.div>
				))}
			</AnimatePresence>
		</motion.div>
	);
};

export default LeadList;
