import { motion } from "framer-motion";
import {
	Briefcase,
	Edit2,
	Mail,
	MapPin,
	Phone,
	Plus,
	Save,
	Tag,
	X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

// Interfaces (se não estiverem em outro arquivo, mantenha-as aqui)
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

interface ClientProfileSidebarProps {
	client: ClientProfile;
	onClose: () => void;
	onUpdateClient: (updatedClient: ClientProfile) => void;
}

const ClientProfileSidebar: React.FC<ClientProfileSidebarProps> = ({
	client,
	onClose,
	onUpdateClient,
}) => {
	const [editMode, setEditMode] = useState(false);
	const [editedClient, setEditedClient] = useState<ClientProfile>({
		...client,
	});
	const [newTag, setNewTag] = useState("");

	const addTag = () => {
		if (newTag.trim() && !editedClient.tags?.includes(newTag.trim())) {
			setEditedClient((prev) => ({
				...prev,
				tags: [...(prev.tags || []), newTag.trim()],
			}));
			setNewTag("");
		}
	};

	const removeTag = (tagToRemove: string) => {
		setEditedClient((prev) => ({
			...prev,
			tags: prev.tags?.filter((tag) => tag !== tagToRemove),
		}));
	};

	const handleSave = () => {
		onUpdateClient(editedClient);
		setEditMode(false);
	};

	const renderEditableField = (
		label: string,
		value: string,
		onChangeHandler: (newValue: string) => void,
		icon: React.ReactNode,
	) => (
		<div className="flex items-center space-x-3 mb-3">
			{icon}
			{editMode ? (
				<input
					type="text"
					value={value}
					onChange={(e) => onChangeHandler(e.target.value)}
					className="flex-1 bg-deep/30 rounded-full px-3 py-2 text-white"
				/>
			) : (
				<span className="text-white/80">{value || "Não informado"}</span>
			)}
		</div>
	);

	return (
		<motion.div
			initial={{ x: "100%" }}
			animate={{ x: 0 }}
			exit={{ x: "100%" }}
			transition={{ type: "tween" }}
			className="fixed top-0 right-0 w-96 h-full bg-deep/90 backdrop-blur-lg shadow-2xl z-50 overflow-y-auto"
		>
			<div className="p-6 relative">
				{/* Botões de Ação */}
				<div className="absolute top-4 right-4 flex space-x-2">
					<motion.button
						whileHover={{ scale: 1.1 }}
						onClick={() => setEditMode(!editMode)}
						className="text-white/70 hover:text-white"
					>
						{editMode ? (
							<Save className="text-green-500" />
						) : (
							<Edit2 className="w-5 h-5" />
						)}
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.1 }}
						onClick={onClose}
						className="text-white/70 hover:text-white"
					>
						<X className="w-5 h-5" />
					</motion.button>
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

				{/* Seções de Informações */}
				<div className="space-y-6">
					{/* Informações de Contato */}
					<div>
						<h3 className="text-lg font-semibold text-white mb-3 flex items-center">
							<Mail className="mr-2 text-electric" /> Informações de Contato
						</h3>
						{renderEditableField(
							"E-mail",
							editedClient.email,
							(val) => setEditedClient((prev) => ({ ...prev, email: val })),
							<Mail className="text-electric w-5 h-5" />,
						)}
						{renderEditableField(
							"Telefone",
							editedClient.phone,
							(val) => setEditedClient((prev) => ({ ...prev, phone: val })),
							<Phone className="text-electric w-5 h-5" />,
						)}
					</div>

					{/* Informações Profissionais */}
					<div>
						<h3 className="text-lg font-semibold text-white mb-3 flex items-center">
							<Briefcase className="mr-2 text-electric" /> Informações
							Profissionais
						</h3>
						{renderEditableField(
							"Empresa",
							editedClient.company || "",
							(val) => setEditedClient((prev) => ({ ...prev, company: val })),
							<Briefcase className="text-electric w-5 h-5" />,
						)}
						{renderEditableField(
							"Segmento",
							editedClient.segment || "",
							(val) => setEditedClient((prev) => ({ ...prev, segment: val })),
							<Tag className="text-electric w-5 h-5" />,
						)}
					</div>

					{/* Endereço */}
					<div>
						<h3 className="text-lg font-semibold text-white mb-3 flex items-center">
							<MapPin className="mr-2 text-electric" /> Endereço
						</h3>
						{renderEditableField(
							"Endereço",
							editedClient.address || "",
							(val) => setEditedClient((prev) => ({ ...prev, address: val })),
							<MapPin className="text-electric w-5 h-5" />,
						)}
					</div>

					{/* Tags */}
					<div>
						<h3 className="text-lg font-semibold text-white mb-3 flex items-center">
							<Tag className="mr-2 text-electric" /> Tags
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
										<motion.button
											whileHover={{ scale: 1.1 }}
											onClick={() => removeTag(tag)}
											className="text-white/70 hover:text-white"
										>
											<X size={16} />
										</motion.button>
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
								<motion.button
									whileHover={{ scale: 1.1 }}
									onClick={addTag}
									className="bg-electric text-white p-2 rounded-full"
								>
									<Plus size={16} />
								</motion.button>
							</motion.div>
						)}
					</div>

					{/* Botão de Salvar em Modo de Edição */}
					{editMode && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="mt-6"
						>
							<button
								onClick={handleSave}
								className="w-full bg-electric text-white py-3 rounded-full hover:bg-electric/80 transition-all"
							>
								Salvar Alterações
							</button>
						</motion.div>
					)}
				</div>
			</div>
		</motion.div>
	);
};

export default ClientProfileSidebar;
