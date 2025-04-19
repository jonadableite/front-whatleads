import { motion } from "framer-motion";
import { Briefcase, Edit2, Mail, Plus, Save, X } from "lucide-react";
// src/components/CRM/ClientProfileModal.tsx
import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface SocialMedia {
	platform: string;
	username: string;
}

interface ClientProfile {
	id: string;
	name: string;
	phone: string;
	email: string;
	avatar?: string;
	tags?: string[];
	segment?: string;
	address?: string;
	company?: string;
	socialMedia?: SocialMedia[];
	interactions?: Array<{
		type: "message" | "call" | "email";
		date: Date;
		content: string;
	}>;
}

interface ClientProfileModalProps {
	client: ClientProfile;
	onClose: () => void;
	onUpdateClient: (updatedClient: ClientProfile) => void;
}

const ClientProfileModal: React.FC<ClientProfileModalProps> = ({
	client,
	onClose,
	onUpdateClient,
}) => {
	const [editMode, setEditMode] = useState(false);
	const [newTag, setNewTag] = useState("");
	const [editedClient, setEditedClient] = useState<ClientProfile>(client);

	const addTag = () => {
		if (newTag.trim() && !editedClient.tags?.includes(newTag.trim())) {
			const updatedTags = [...(editedClient.tags || []), newTag.trim()];
			setEditedClient((prev) => ({ ...prev, tags: updatedTags }));
			setNewTag("");
		}
	};

	const removeTag = (tagToRemove: string) => {
		const updatedTags = editedClient.tags?.filter((tag) => tag !== tagToRemove);
		setEditedClient((prev) => ({ ...prev, tags: updatedTags }));
	};

	const renderEditableField = (
		label: string,
		value: string,
		onChange: (val: string) => void,
		icon: React.ReactNode,
	) => (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="flex items-center space-x-3 mb-3 bg-deep/30 rounded-xl p-3"
		>
			{icon}
			{editMode ? (
				<input
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="flex-1 bg-transparent text-white focus:outline-none"
				/>
			) : (
				<span className="text-white flex-1">{value || "Não informado"}</span>
			)}
		</motion.div>
	);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
		>
			<motion.div
				initial={{ scale: 0.9 }}
				animate={{ scale: 1 }}
				className="bg-deep/90 rounded-2xl w-full max-w-2xl p-6 relative"
			>
				{/* Botões de Ação */}
				<div className="absolute top-4 right-4 flex space-x-2">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setEditMode(!editMode)}
							>
								{editMode ? <Save className="text-green-500" /> : <Edit2 />}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							{editMode ? "Salvar Alterações" : "Editar Perfil"}
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="ghost" size="icon" onClick={onClose}>
								<X />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Fechar</TooltipContent>
					</Tooltip>
				</div>

				{/* Cabeçalho com Avatar */}
				<motion.div
					initial={{ y: -20 }}
					animate={{ y: 0 }}
					className="flex items-center space-x-4 mb-6 border-b border-electric/20 pb-4"
				>
					<div className="relative">
						<img
							src={editedClient.avatar || "/default-avatar.png"}
							alt={editedClient.name}
							className="w-24 h-24 rounded-full object-cover border-4 border-electric/50"
						/>
						{editMode && (
							<motion.button
								initial={{ scale: 0.8 }}
								animate={{ scale: 1 }}
								className="absolute bottom-0 right-0 bg-electric rounded-full p-2"
							>
								<Edit2 className="w-4 h-4 text-white" />
							</motion.button>
						)}
					</div>

					<div>
						{editMode ? (
							<input
								value={editedClient.name}
								onChange={(e) =>
									setEditedClient((prev) => ({ ...prev, name: e.target.value }))
								}
								className="text-2xl font-bold text-white bg-transparent border-b border-electric/50 mb-2"
							/>
						) : (
							<h2 className="text-2xl font-bold text-white">
								{editedClient.name}
							</h2>
						)}
						<p className="text-white/70">{editedClient.phone}</p>
					</div>
				</motion.div>

				{/* Seção de Detalhes */}
				<div className="grid md:grid-cols-2 gap-4">
					<div>
						<h3 className="text-lg font-semibold text-white mb-3">
							Informações Pessoais
						</h3>
						{renderEditableField(
							"E-mail",
							editedClient.email,
							(val) => setEditedClient((prev) => ({ ...prev, email: val })),
							<Mail className="text-electric w-5 h-5" />,
						)}

						{renderEditableField(
							"Empresa",
							editedClient.company || "",
							(val) => setEditedClient((prev) => ({ ...prev, company: val })),
							<Briefcase className="text-electric w-5 h-5" />,
						)}
					</div>

					<div>
						<h3 className="text-lg font-semibold text-white mb-3">
							Tags e Segmentação
						</h3>
						<div className="flex flex-wrap gap-2 mb-3">
							{editedClient.tags?.map((tag) => (
								<motion.div
									key={tag}
									initial={{ scale: 0.9 }}
									animate={{ scale: 1 }}
									className="bg-electric/20 text-electric px-3 py-1 rounded-full text-sm flex items-center space-x-2"
								>
									<span>{tag}</span>
									{editMode && (
										<button
											onClick={() => removeTag(tag)}
											className="text-white/70 hover:text-white"
										>
											<X size={16} />
										</button>
									)}
								</motion.div>
							))}
						</div>

						{editMode && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="flex items-center space-x-2"
							>
								<input
									type="text"
									value={newTag}
									onChange={(e) => setNewTag(e.target.value)}
									onKeyPress={(e) => e.key === "Enter" && addTag()}
									placeholder="Nova tag"
									className="flex-1 bg-deep/30 rounded-full px-3 py-2 text-white"
								/>
								<Button size="icon" variant="outline" onClick={addTag}>
									<Plus size={16} />
								</Button>
							</motion.div>
						)}
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default ClientProfileModal;
