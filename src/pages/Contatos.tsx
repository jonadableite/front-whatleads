import EditLeadModal from "@/components/leads/EditLeadModal";
import { ImportLeadsModal } from "@/components/leads/ImportLeadsModal";
import { LeadTable } from "@/components/leads/LeadTable";
import SegmentationModal from "@/components/leads/SegmentationModal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toast } from "@/components/ui/toast";
import type { SegmentationRule } from "@/interface";
import { leadsApi } from "@/services/api/leads";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type React from "react";
import { useMemo, useState } from "react";
import { FiPieChart, FiUsers } from "react-icons/fi";

const Contatos: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedSegment, setSelectedSegment] = useState("");
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [leadsPerPage] = useState(20);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [selectedLead, setSelectedLead] = useState(null);

	const {
		data: leadsData,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["leads"],
		queryFn: async () => {
			try {
				return await leadsApi.fetchLeads();
			} catch (error) {
				Toast.error(`Erro ao carregar leads: ${(error as Error).message}`);
				throw error;
			}
		},
	});

	const { data: userPlan } = useQuery({
		queryKey: ["userPlan"],
		queryFn: async () => {
			try {
				const response = await leadsApi.fetchUserPlan();
				return response.data;
			} catch (error) {
				Toast.error(`Erro ao carregar plano: ${(error as Error).message}`);
				throw error;
			}
		},
	});

	const importLeadsMutation = useMutation({
		mutationFn: ({ campaignId, file }: { campaignId: string; file: File }) =>
			leadsApi.importLeads(campaignId, file),
		onSuccess: () => {
			Toast.success("Leads importados com sucesso!");
			refetch();
		},
		onError: (error: Error) => {
			Toast.error(`Erro ao importar leads: ${error.message}`);
		},
	});

	const segmentLeadsMutation = useMutation({
		mutationFn: (rules: SegmentationRule[]) => leadsApi.segmentLeads(rules),
		onSuccess: () => {
			Toast.success("Segmentação realizada com sucesso!");
			refetch();
		},
		onError: (error: Error) => {
			Toast.error(`Erro ao segmentar leads: ${error.message}`);
		},
	});

	const filteredLeads = useMemo(() => {
		let leads = leadsData?.data?.leads || [];

		if (selectedSegment) {
			leads = leads.filter((lead) => lead.status === selectedSegment);
		}

		if (searchTerm) {
			leads = leads.filter((lead) => {
				const searchLower = searchTerm.toLowerCase();
				return (
					(lead.name?.toLowerCase() || "").includes(searchLower) ||
					(lead.phone || "").includes(searchTerm)
				);
			});
		}

		return leads;
	}, [leadsData?.data?.leads, searchTerm, selectedSegment]);

	const paginatedLeads = useMemo(() => {
		return filteredLeads.slice(
			(currentPage - 1) * leadsPerPage,
			currentPage * leadsPerPage,
		);
	}, [filteredLeads, currentPage, leadsPerPage]);

	const pageCount = Math.ceil((filteredLeads?.length || 0) / leadsPerPage);

	const handleImportLeads = async (campaignId: string, file: File) => {
		if (totalLeads >= maxLeads) {
			Toast.error(
				"Limite de leads atingido. Não é possível importar mais leads.",
			);
			return;
		}
		await importLeadsMutation.mutateAsync({ campaignId, file });
	};

	const handleSegmentLeads = async (segmentationRules: any) => {
		await segmentLeadsMutation.mutateAsync(segmentationRules);
		refetch();
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				type: "spring",
				stiffness: 100,
			},
		},
	};

	function handleDeleteLead(leadId: string): void {
		if (window.confirm("Tem certeza que deseja deletar este lead?")) {
			leadsApi
				.deleteLead(leadId)
				.then(() => {
					Toast.success("Lead deletado com sucesso!");
					refetch();
				})
				.catch((error: Error) => {
					Toast.error(`Erro ao deletar lead: ${error.message}`);
				});
		}
	}

	function handleEditLead(leadId: string): void {
		const leadToEdit = leadsData?.data?.leads.find(
			(lead) => lead.id === leadId,
		);
		if (leadToEdit) {
			setSelectedLead(leadToEdit);
			setIsEditModalOpen(true);
		} else {
			Toast.error("Lead não encontrado para edição.");
		}
	}

	const handleSaveEditedLead = async (updatedLead: {
		id: string;
		name: string;
		phone: string;
		status: string;
	}) => {
		try {
			const dataToUpdate = {
				name: updatedLead.name,
				phone: updatedLead.phone,
				status: updatedLead.status,
			};
			await leadsApi.updateLead(updatedLead.id, dataToUpdate);
			Toast.success("Lead atualizado com sucesso!");
			refetch();
		} catch (error) {
			Toast.error(`Erro ao atualizar lead: ${(error as Error).message}`);
		}
	};

	function handlePageChange(page: number): void {
		setCurrentPage(page);
	}

	const totalLeads = leadsData?.data?.total || 0;
	const activeLeads =
		leadsData?.data?.leads.filter((lead) => lead.status === "READ").length || 0;
	const conversionRate =
		totalLeads > 0 ? ((activeLeads / totalLeads) * 100).toFixed(2) : "0.00";
	const maxLeads = userPlan?.limits?.maxLeads || 0;

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={containerVariants}
			className="min-h-screen bg-gradient-to-br from-deep to-neon-purple/10 p-8"
		>
			<div className="max-w-7xl mx-auto">
				<motion.div
					variants={itemVariants}
					className="flex justify-between items-center mb-12"
				>
					<h1 className="text-4xl font-bold text-white">Contatos</h1>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
					{[
						{
							title: "Total de Leads",
							icon: <FiUsers />,
							value: totalLeads,
						},
						{
							title: "Leads Ativos",
							icon: <FiPieChart />,
							value: activeLeads,
						},
						{
							title: "Taxa de Visualização",
							icon: <FiPieChart />,
							value: `${conversionRate}%`,
						},
						{
							title: "Limite de Leads",
							icon: <FiUsers />,
							value: `${totalLeads}/${maxLeads}`,
						},
					].map((stat) => (
						<motion.div
							key={stat.title}
							variants={itemVariants}
							className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric shadow-lg hover:shadow-electric transition-all duration-300"
						>
							<div className="flex items-center justify-between">
								<div className="text-electric text-3xl">{stat.icon}</div>
								<div className="text-right">
									<p className="text-white/70 text-sm">{stat.title}</p>
									<p className="text-white text-2xl font-bold">{stat.value}</p>
								</div>
							</div>
						</motion.div>
					))}
				</div>

				<motion.div variants={itemVariants} className="mb-8">
					<div className="flex flex-wrap gap-4 items-center">
						<Input
							type="text"
							placeholder="Buscar leads..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-64 bg-deep/50 text-white placeholder-white/50 border-electric"
						/>
						<Select
							value={selectedSegment}
							onChange={(e) => setSelectedSegment(e.target.value)}
							className="flex-grow bg-deep border-electric text-white"
						>
							<option value="">Todos os status</option>
							<option value="SENT">Enviado</option>
							<option value="READ">Lido</option>
							<option value="DELIVERED">Entregue</option>
						</Select>
					</div>
				</motion.div>

				<motion.div
					variants={itemVariants}
					className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric"
				>
					{isLoading ? (
						<div className="flex justify-center items-center h-64">
							<motion.div
								animate={{
									scale: [1, 1.2, 1],
									rotate: [0, 360],
								}}
								transition={{
									duration: 2,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
								className="w-16 h-16 border-4 border-electric rounded-full border-t-transparent"
							/>
						</div>
					) : (
						<LeadTable
							leads={paginatedLeads}
							currentPage={currentPage}
							pageCount={pageCount}
							onPageChange={handlePageChange}
							onEdit={handleEditLead}
							onDelete={handleDeleteLead}
						/>
					)}
				</motion.div>
			</div>

			{selectedLead && (
				<EditLeadModal
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					lead={selectedLead}
					onSave={handleSaveEditedLead}
				/>
			)}

			<ImportLeadsModal
				isOpen={isImportModalOpen}
				onClose={() => setIsImportModalOpen(false)}
				onImport={handleImportLeads}
			/>

			<SegmentationModal
				isOpen={isSegmentModalOpen}
				onClose={() => setIsSegmentModalOpen(false)}
				onSegment={handleSegmentLeads}
			/>
		</motion.div>
	);
};

export default Contatos;
