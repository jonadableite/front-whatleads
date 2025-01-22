// src/components/leads/ImportLeadsModal.tsx
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { campaignsApi } from "@/services/api/campaigns";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FiCheck, FiPlus, FiUpload, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface ImportLeadsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onImport: (campaignId: string, file: File) => Promise<void>;
}

export function ImportLeadsModal({
	isOpen,
	onClose,
	onImport,
}: ImportLeadsModalProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
	const [isUploading, setIsUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	// Buscar campanhas do usuário
	const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery({
		queryKey: ["campaigns"],
		queryFn: campaignsApi.fetchCampaigns,
		enabled: isOpen,
		staleTime: 1000 * 60, // Cache por 1 minuto
	});

	const hasCampaigns = Array.isArray(campaigns) && campaigns.length > 0;

	// Reset do estado quando o modal fecha
	useEffect(() => {
		if (!isOpen) {
			setSelectedFile(null);
			setSelectedCampaignId("");
			setIsDragging(false);
		}
	}, [isOpen]);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
		}
	};

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files?.[0];
		if (file) {
			setSelectedFile(file);
		}
	};

	const handleImport = async () => {
		if (!selectedFile || !selectedCampaignId) return;

		try {
			setIsUploading(true);
			await onImport(selectedCampaignId, selectedFile);
			onClose();
		} catch (error) {
			console.error("Erro ao importar leads:", error);
		} finally {
			setIsUploading(false);
		}
	};

	const navigateToCampaigns = () => {
		onClose();
		navigate("/campanhas");
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				className="bg-deep border border-electric text-white"
				aria-describedby="modal-description"
			>
				<div id="modal-description" className="sr-only">
					Modal para importação de leads com seleção de campanha
				</div>
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold text-white">
						Importar Leads
					</DialogTitle>
					<DialogDescription className="text-white/70">
						Selecione uma campanha e importe seus leads através de um arquivo
						CSV.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{isLoadingCampaigns ? (
						<div className="text-center py-4">Carregando campanhas...</div>
					) : !hasCampaigns ? (
						<div className="text-center py-4">
							<p className="text-white/70 mb-4">
								Você precisa criar uma campanha antes de importar leads.
							</p>
							<Button
								onClick={navigateToCampaigns}
								className="bg-neon-green text-deep hover:bg-neon-green/80"
							>
								<FiPlus className="mr-2" />
								Criar Campanha
							</Button>
						</div>
					) : (
						<>
							<div className="space-y-2">
								<label className="text-sm font-medium text-white">
									Selecione a Campanha
								</label>
								<Select
									value={selectedCampaignId}
									onChange={(e) => setSelectedCampaignId(e.target.value)}
									className="w-full bg-deep/50 border-electric text-white"
								>
									<option value="">Selecione uma campanha</option>
									{campaigns?.map((campaign) => (
										<option key={campaign.id} value={campaign.id}>
											{campaign.name}
										</option>
									))}
								</Select>
							</div>

							<motion.div
								className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
									isDragging ? "border-neon-green" : "border-electric"
								}`}
								onDragEnter={handleDragEnter}
								onDragLeave={handleDragLeave}
								onDragOver={(e) => e.preventDefault()}
								onDrop={handleDrop}
								onClick={() => fileInputRef.current?.click()}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<input
									type="file"
									accept=".csv"
									onChange={handleFileChange}
									className="hidden"
									ref={fileInputRef}
								/>
								<FiUpload className="mx-auto text-4xl text-electric mb-4" />
								<p className="text-white text-lg">
									{selectedFile
										? selectedFile.name
										: "Arraste e solte seu arquivo aqui ou clique para selecionar"}
								</p>
								<p className="text-white/60 text-sm mt-2">
									Formatos aceitos: CSV
								</p>
							</motion.div>

							<AnimatePresence>
								{selectedFile && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										className="mt-4 p-3 bg-electric/20 rounded-lg flex items-center justify-between"
									>
										<span className="text-white">{selectedFile.name}</span>
										<FiCheck className="text-neon-green text-xl" />
									</motion.div>
								)}
							</AnimatePresence>

							<div className="flex justify-end space-x-2">
								<Button
									onClick={onClose}
									variant="outline"
									className="border-electric text-white hover:bg-electric/20"
								>
									<FiX className="mr-2" /> Cancelar
								</Button>
								<Button
									onClick={handleImport}
									disabled={!selectedFile || !selectedCampaignId || isUploading}
									className="bg-neon-green text-deep hover:bg-neon-green/80"
								>
									{isUploading ? "Importando..." : "Importar"}
								</Button>
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
