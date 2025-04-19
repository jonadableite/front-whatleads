// src/components/CRM/DocumentManager.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
	FileText,
	Download,
	Trash2,
	Upload,
	Search,
	Filter,
	Share2,
	Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos de documentos para exemplo
interface Document {
	id: string;
	name: string;
	type: string;
	size: string;
	lastModified: Date;
	createdBy: string;
}

const DocumentManager = () => {
	const [searchTerm, setSearchTerm] = useState('');

	// Dados de exemplo
	const documents: Document[] = [
		{
			id: '1',
			name: 'Contrato de Serviço.pdf',
			type: 'pdf',
			size: '2.4 MB',
			lastModified: new Date(2023, 6, 15),
			createdBy: 'Ana Silva',
		},
		{
			id: '2',
			name: 'Proposta Comercial.docx',
			type: 'docx',
			size: '1.8 MB',
			lastModified: new Date(2023, 7, 3),
			createdBy: 'Carlos Mendes',
		},
		{
			id: '3',
			name: 'Invoice #1234.xlsx',
			type: 'xlsx',
			size: '0.9 MB',
			lastModified: new Date(2023, 8, 10),
			createdBy: 'João Santos',
		},
		{
			id: '4',
			name: 'Reunião de Alinhamento.mp4',
			type: 'mp4',
			size: '25.7 MB',
			lastModified: new Date(2023, 8, 12),
			createdBy: 'Mariana Costa',
		},
		{
			id: '5',
			name: 'Identidade Visual.zip',
			type: 'zip',
			size: '16.2 MB',
			lastModified: new Date(2023, 8, 15),
			createdBy: 'Pedro Alves',
		}
	];

	const filteredDocuments = documents.filter(doc =>
		doc.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getFileIcon = (type: string) => {
		switch (type) {
			case 'pdf':
				return 'text-red-400';
			case 'docx':
				return 'text-blue-400';
			case 'xlsx':
				return 'text-green-400';
			case 'mp4':
				return 'text-purple-400';
			case 'zip':
				return 'text-yellow-400';
			default:
				return 'text-gray-400';
		}
	};

	const formatDate = (date: Date) => {
		return formatDistanceToNow(date, {
			addSuffix: true,
			locale: ptBR,
		});
	};

	return (
		<div className="bg-deep/30 rounded-2xl p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl font-bold text-white">Documentos do Cliente</h2>
				<Button className="bg-electric hover:bg-electric/80">
					<Upload size={16} className="mr-2" /> Novo Documento
				</Button>
			</div>

			<div className="flex items-center space-x-4 mb-6">
				<div className="relative flex-grow">
					<input
						type="text"
						placeholder="Buscar documentos..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full bg-deep/30 rounded-full pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-electric"
					/>
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
				</div>
				<motion.button whileHover={{ scale: 1.1 }} className="bg-deep/30 p-2 rounded-full">
					<Filter size={20} className="text-white/70" />
				</motion.button>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="text-white/70 text-sm font-medium border-b border-electric/20">
						<tr>
							<th className="py-3 px-4 text-left">Nome</th>
							<th className="py-3 px-4 text-left">Tipo</th>
							<th className="py-3 px-4 text-left">Tamanho</th>
							<th className="py-3 px-4 text-left">Modificado</th>
							<th className="py-3 px-4 text-left">Criado por</th>
							<th className="py-3 px-4 text-right">Ações</th>
						</tr>
					</thead>
					<tbody>
						{filteredDocuments.length === 0 ? (
							<tr>
								<td colSpan={6} className="py-6 text-center text-white/50">
									Nenhum documento encontrado
								</td>
							</tr>
						) : (
							filteredDocuments.map((doc) => (
								<motion.tr
									key={doc.id}
									className="border-b border-electric/10 hover:bg-electric/5"
									whileHover={{ backgroundColor: 'rgba(14, 165, 233, 0.05)' }}
								>
									<td className="py-3 px-4">
										<div className="flex items-center">
											<FileText size={20} className={getFileIcon(doc.type)} />
											<span className="ml-3 text-white">{doc.name}</span>
										</div>
									</td>
									<td className="py-3 px-4 text-white">
										<span className="bg-deep/40 px-2 py-1 rounded text-xs">
											{doc.type.toUpperCase()}
										</span>
									</td>
									<td className="py-3 px-4 text-white/70">{doc.size}</td>
									<td className="py-3 px-4">
										<div className="flex items-center text-white/70">
											<Clock size={14} className="mr-1" />
											{formatDate(doc.lastModified)}
										</div>
									</td>
									<td className="py-3 px-4 text-white/70">{doc.createdBy}</td>
									<td className="py-3 px-4">
										<div className="flex items-center justify-end space-x-2">
											<motion.button
												whileHover={{ scale: 1.1 }}
												className="p-1 rounded-full hover:bg-electric/20"
											>
												<Download size={16} className="text-electric" />
											</motion.button>
											<motion.button
												whileHover={{ scale: 1.1 }}
												className="p-1 rounded-full hover:bg-electric/20"
											>
												<Share2 size={16} className="text-electric" />
											</motion.button>
											<motion.button
												whileHover={{ scale: 1.1 }}
												className="p-1 rounded-full hover:bg-red-500/20"
											>
												<Trash2 size={16} className="text-red-400" />
											</motion.button>
										</div>
									</td>
								</motion.tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default DocumentManager;
