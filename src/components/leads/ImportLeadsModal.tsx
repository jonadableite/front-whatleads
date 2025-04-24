// src/components/leads/ImportLeadsModal.tsx
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import type { Campaign } from "@/interface";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
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
	// Estados
	const [selectedCampaign, setSelectedCampaign] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Handlers de Drag and Drop
	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const file = e.dataTransfer.files[0];
		validateAndSetFile(file);
	}, []);

	// Validação de arquivo
	const validateAndSetFile = useCallback((file: File) => {
		setError(null);

		if (!file) return;

		const extension = file.name.split(".").pop()?.toLowerCase();
		const allowedExtensions = ["csv", "xlsx", "txt"];

		if (!extension || !allowedExtensions.includes(extension)) {
			setError("Por favor, selecione um arquivo CSV, Excel ou TXT");
			return;
		}

		// Validação de tamanho
		const maxSize = extension === "txt" ? 1 * 1024 * 1024 : 50 * 1024 * 1024;
		if (file.size > maxSize) {
			setError(
				extension === "txt"
					? "Arquivos TXT devem ter no máximo 1MB"
					: "O arquivo deve ter no máximo 50MB",
			);
			return;
		}

		setSelectedFile(file);
	}, []);

	// Manipulador de mudança de arquivo
	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (file) {
				validateAndSetFile(file);
			}
		},
		[validateAndSetFile],
	);

	// Submissão do formulário
	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
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
				console.error("Erro detalhado ao importar leads:", {
					message: error instanceof Error ? error.message : "Erro desconhecido",
					campaignId: selectedCampaign,
					fileInfo: selectedFile
						? {
							name: selectedFile.name,
							size: selectedFile.size,
							type: selectedFile.type,
						}
						: null,
				});
				setError(
					error instanceof Error
						? error.message
						: "Erro ao importar leads. Tente novamente.",
				);
			} finally {
				setIsLoading(false);
			}
		},
		[selectedCampaign, selectedFile, onImport],
	);

	// Fechamento do modal e reset
	const handleClose = useCallback(() => {
		setSelectedCampaign("");
		setSelectedFile(null);
		setError(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		onClose();
	}, [onClose]);

	// Status de limite de leads
	const getLimitStatus = useCallback(() => {
		const percentage = (totalLeads / maxLeads) * 100;

		if (percentage >= 100) return "text-red-500";
		if (percentage >= 90) return "text-yellow-500";
		return "text-green-500";
	}, [totalLeads, maxLeads]);

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
					{/* Seleção de Campanha */}
					<div>
						<label
							htmlFor="campaign"
							className="block text-sm font-medium text-white/70 mb-2"
						>
							Selecione a Campanha
						</label>
						<select
							value={selectedCampaign}
							onChange={(e) => setSelectedCampaign(e.target.value)}
							className="w-full bg-deep/50 border-electric/30 text-white"
						>
							<option value="">Selecione uma campanha</option>
							{campaigns.map((campaign) => (
								<option key={campaign.id} value={campaign.id}>
									{campaign.name}
								</option>
							))}
						</select>

					</div>

					{/* Upload de Arquivo */}
					<div>
						<label className="block text-sm font-medium text-white/70 mb-2">
							Arquivo de Leads
						</label>
						<div
							className={`relative mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragging ? "border-electric" : "border-electric/30"
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

				{/* Tratamento de Erros */}
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

				{/* Rodapé do Formulário */}
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
							className={`${disableImport
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

export default ImportLeadsModal;
