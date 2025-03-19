// src/components/campaign/ImportLeadsModal.tsx
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import type { Campaign } from "@/interface";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { FiFile, FiUpload, FiX } from "react-icons/fi";

interface ImportLeadsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onImport: (campaignId: string, file: File) => Promise<void>;
	campaigns: Campaign[];
	disableImport: boolean;
	totalLeads: number;
	maxLeads: number;
}

export const ImportLeadsModal: React.FC<ImportLeadsModalProps> = ({
	isOpen,
	onClose,
	onImport,
	campaigns,
	disableImport,
	totalLeads,
	maxLeads,
}) => {
	const [selectedCampaign, setSelectedCampaign] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const file = e.dataTransfer.files[0];
		validateAndSetFile(file);
	};

	const validateAndSetFile = (file: File) => {
		setError(null);

		if (!file) return;

		const extension = file.name.split(".").pop()?.toLowerCase();
		// Atualiza a validação para incluir .txt
		if (extension !== "csv" && extension !== "xlsx" && extension !== "txt") {
			setError("Por favor, selecione um arquivo CSV, Excel ou TXT");
			return;
		}

		// Validação específica de tamanho para TXT
		if (extension === "txt" && file.size > 1 * 1024 * 1024) {
			// 1MB para TXT
			setError("Arquivos TXT devem ter no máximo 1MB");
			return;
		} else if (file.size > 50 * 1024 * 1024) {
			// 50MB para outros formatos
			setError("O arquivo deve ter no máximo 50MB");
			return;
		}

		setSelectedFile(file);
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			validateAndSetFile(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!selectedCampaign || !selectedFile) {
			setError("Selecione uma campanha e um arquivo válido");
			return;
		}

		setIsLoading(true);
		try {
			await onImport(selectedCampaign, selectedFile);
			handleClose();
		} catch (error) {
			console.error("Erro ao importar leads:", error);
			setError(
				error instanceof Error ? error.message : "Erro ao importar leads",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setSelectedCampaign("");
		setSelectedFile(null);
		setError(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		onClose();
	};

	const getLimitStatus = () => {
		const percentage = (totalLeads / maxLeads) * 100;
		if (percentage >= 100) return "text-red-500";
		if (percentage >= 90) return "text-yellow-500";
		return "text-green-500";
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Importar Leads"
			description="Selecione um arquivo CSV, Excel ou TXT com as colunas 'phone' e 'name' para importar seus leads."
			className="max-w-xl"
		>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-4">
					<div>
						<label
							htmlFor="campaign"
							className="block text-sm font-medium text-white/70 mb-2"
						>
							Selecione a Campanha
						</label>
						<Select
							id="campaign"
							value={selectedCampaign}
							onChange={(e) => setSelectedCampaign(e.target.value)}
							className="w-full bg-deep/50 border-electric/30 text-white focus:ring-2 focus:ring-electric focus:border-transparent"
							required
						>
							<option value="">Selecione uma campanha</option>
							{campaigns.map((campaign) => (
								<option key={campaign.id} value={campaign.id}>
									{campaign.name}
								</option>
							))}
						</Select>
					</div>

					<div>
						<label className="block text-sm font-medium text-white/70 mb-2">
							Arquivo de Leads
						</label>
						<div
							className={`relative mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
								isDragging ? "border-electric" : "border-electric/30"
							} border-dashed rounded-lg transition-colors cursor-pointer
                        ${isDragging ? "bg-electric/10" : "hover:border-electric/50"}`}
							onDragEnter={handleDragEnter}
							onDragOver={handleDragEnter}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							onClick={() => fileInputRef.current?.click()}
						>
							<input
								ref={fileInputRef}
								type="file"
								accept=".csv,.xlsx,.txt"
								onChange={handleFileChange}
								className="sr-only"
								aria-label="Selecione um arquivo"
							/>

							<div className="space-y-1 text-center">
								{selectedFile ? (
									<div className="flex items-center space-x-2">
										<FiFile className="w-8 h-8 text-electric" />
										<div className="flex flex-col items-start">
											<span className="text-sm font-medium text-white">
												{selectedFile.name}
											</span>
											<span className="text-xs text-white/50">
												{(selectedFile.size / 1024).toFixed(2)} KB
											</span>
										</div>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												setSelectedFile(null);
												if (fileInputRef.current) {
													fileInputRef.current.value = "";
												}
											}}
											className="p-1 hover:bg-electric/20 rounded-full"
										>
											<FiX className="w-4 h-4 text-white/70" />
										</button>
									</div>
								) : (
									<>
										<FiUpload className="mx-auto h-12 w-12 text-electric" />
										<div className="flex flex-col items-center">
											<span className="text-sm text-white">
												Arraste e solte seu arquivo aqui ou
											</span>
											<span className="text-sm text-electric font-medium">
												clique para selecionar
											</span>
										</div>
										<p className="text-xs text-white/50">
											CSV, Excel ou TXT até 5MB
										</p>
									</>
								)}
							</div>
						</div>
					</div>
				</div>

				<AnimatePresence>
					{error && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500"
						>
							{error}
						</motion.div>
					)}
				</AnimatePresence>

				<div className="flex flex-col items-end gap-3">
					<div className={`text-sm ${getLimitStatus()}`}>
						Limite de Leads: {totalLeads}/{maxLeads}
					</div>
					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isLoading}
							className="border-electric/30 text-white hover:bg-electric/20"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={
								!selectedCampaign || !selectedFile || isLoading || disableImport
							}
							className={`${
								disableImport
									? "bg-gray-400"
									: "bg-neon-green hover:bg-neon-green/80"
							} text-white`}
						>
							{isLoading ? (
								<div className="flex items-center">
									<div className="animate-spin mr-2 h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />
									Importando...
								</div>
							) : disableImport ? (
								"Limite Atingido"
							) : (
								<>
									<FiUpload className="mr-2" />
									Importar Leads
								</>
							)}
						</Button>
					</div>
				</div>
			</form>
		</Modal>
	);
};
