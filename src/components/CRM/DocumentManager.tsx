import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Download, FileText, Search, Trash2, Upload } from "lucide-react";
// src/components/CRM/DocumentManager.tsx
import type React from "react";
import { useState } from "react";

interface Document {
	id: string;
	name: string;
	type: string;
	uploadDate: Date;
	size: number;
}

const DocumentManager: React.FC = () => {
	const [documents, setDocuments] = useState<Document[]>([
		{
			id: "1",
			name: "Contrato_Cliente_2024.pdf",
			type: "PDF",
			uploadDate: new Date(),
			size: 1024 * 250, // 250KB
		},
		{
			id: "2",
			name: "Proposta_Comercial.docx",
			type: "DOCX",
			uploadDate: new Date(),
			size: 1024 * 150, // 150KB
		},
	]);

	const [searchTerm, setSearchTerm] = useState("");

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const newDocument: Document = {
				id: String(documents.length + 1),
				name: file.name,
				type: file.type.split("/")[1].toUpperCase(),
				uploadDate: new Date(),
				size: file.size,
			};
			setDocuments([...documents, newDocument]);
		}
	};

	const handleDeleteDocument = (id: string) => {
		setDocuments(documents.filter((doc) => doc.id !== id));
	};

	const filteredDocuments = documents.filter((doc) =>
		doc.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="bg-deep/50 rounded-xl p-6"
		>
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-white">
					Gerenciador de Documentos
				</h2>

				<div className="flex space-x-4">
					<div className="relative">
						<Input
							placeholder="Buscar documentos"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 bg-deep/30 border-electric/30"
						/>
						<Search
							className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
							size={18}
						/>
					</div>

					<Button
						variant="outline"
						className="bg-electric/20 hover:bg-electric/30 text-white"
					>
						<Upload className="mr-2" size={18} /> Upload
						<input type="file" className="hidden" onChange={handleFileUpload} />
					</Button>
				</div>
			</div>

			<motion.div
				className="grid gap-4"
				initial="hidden"
				animate="visible"
				variants={{
					hidden: { opacity: 0 },
					visible: {
						opacity: 1,
						transition: {
							delayChildren: 0.2,
							staggerChildren: 0.1,
						},
					},
				}}
			>
				{filteredDocuments.map((doc) => (
					<motion.div
						key={doc.id}
						variants={{
							hidden: { opacity: 0, y: 20 },
							visible: { opacity: 1, y: 0 },
						}}
						className="flex items-center justify-between bg-deep/30 p-4 rounded-lg"
					>
						<div className="flex items-center space-x-4">
							<FileText className="text-electric" />
							<div>
								<p className="font-semibold">{doc.name}</p>
								<p className="text-sm text-white/50">
									{doc.type} • {(doc.size / 1024).toFixed(2)} KB
								</p>
							</div>
						</div>
						<div className="flex space-x-2">
							<Button
								variant="ghost"
								size="icon"
								className="text-white/70 hover:text-white"
							>
								<Download size={18} />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="text-red-500/70 hover:text-red-500"
								onClick={() => handleDeleteDocument(doc.id)}
							>
								<Trash2 size={18} />
							</Button>
						</div>
					</motion.div>
				))}
			</motion.div>
		</motion.div>
	);
};

export default DocumentManager;
