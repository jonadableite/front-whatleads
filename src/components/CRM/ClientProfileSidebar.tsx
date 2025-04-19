// src/components/CRM/ClientProfileSidebar.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Edit, Save, Phone, Mail, Tag, Star, Navigation, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ClientProfile {
	id: string;
	name: string;
	phone: string;
	email?: string;
	tags?: string[];
	segment?: string;
	address?: string;
	company?: string;
	notes?: string;
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
	const [isEditing, setIsEditing] = useState(false);
	const [editedClient, setEditedClient] = useState<ClientProfile>(client);
	const [newTag, setNewTag] = useState("");

	// Atualizar dados locais quando o cliente mudar
	useEffect(() => {
		setEditedClient(client);
	}, [client]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setEditedClient({
			...editedClient,
			[e.target.name]: e.target.value,
		});
	};

	const handleAddTag = () => {
		if (newTag && (!editedClient.tags?.includes(newTag))) {
			setEditedClient({
				...editedClient,
				tags: [...(editedClient.tags || []), newTag],
			});
			setNewTag("");
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setEditedClient({
			...editedClient,
			tags: editedClient.tags?.filter(tag => tag !== tagToRemove) || [],
		});
	};

	const handleSave = () => {
		onUpdateClient(editedClient);
		setIsEditing(false);
		toast.success("Perfil do cliente atualizado");
	};

	const handleCancel = () => {
		setEditedClient(client);
		setIsEditing(false);
	};

	return (
		<motion.div
			initial={{ x: "100%" }}
			animate={{ x: 0 }}
			exit={{ x: "100%" }}
			transition={{ type: "spring", stiffness: 300, damping: 30 }}
			className="w-80 bg-deep/60 border-l border-electric/20 h-screen overflow-y-auto fixed right-0 top-0 p-6 shadow-2xl backdrop-blur-md"
		>
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl font-bold text-white">Perfil do Cliente</h2>
				<button onClick={onClose} className="text-white/70 hover:text-white">
					<X size={20} />
				</button>
			</div>

			{/* Avatar & Main Info */}
			<div className="flex flex-col items-center mb-6">
				<div className="w-24 h-24 rounded-full bg-electric/30 flex items-center justify-center text-3xl font-bold text-white mb-4">
					{client.name.charAt(0).toUpperCase()}
				</div>

				{!isEditing ? (
					<h3 className="text-xl font-semibold text-white">{client.name}</h3>
				) : (
					<Input
						name="name"
						value={editedClient.name}
						onChange={handleChange}
						className="bg-deep/30 border-electric/30 text-white text-lg text-center font-semibold"
					/>
				)}
			</div>

			{/* Actions */}
			<div className="flex justify-center space-x-2 mb-6">
				{isEditing ? (
					<>
						<Button
							onClick={handleSave}
							className="bg-electric hover:bg-electric/80"
							size="sm"
						>
							<Save size={16} className="mr-1" /> Salvar
						</Button>
						<Button
							onClick={handleCancel}
							variant="outline"
							size="sm"
						>
							Cancelar
						</Button>
					</>
				) : (
					<Button
						onClick={() => setIsEditing(true)}
						variant="outline"
						size="sm"
					>
						<Edit size={16} className="mr-1" /> Editar Perfil
					</Button>
				)}
			</div>

			{/* Contact Information */}
			<div className="space-y-4 mb-6">
				<h3 className="text-lg font-semibold text-white">Informações de Contato</h3>

				<div className="flex items-center space-x-2">
					<Phone size={16} className="text-electric" />
					{isEditing ? (
						<Input
							name="phone"
							value={editedClient.phone}
							onChange={handleChange}
							className="bg-deep/30 border-electric/30 text-white"
							placeholder="Telefone"
						/>
					) : (
						<span className="text-white">{client.phone}</span>
					)}
				</div>

				<div className="flex items-center space-x-2">
					<Mail size={16} className="text-electric" />
					{isEditing ? (
						<Input
							name="email"
							value={editedClient.email || ""}
							onChange={handleChange}
							className="bg-deep/30 border-electric/30 text-white"
							placeholder="Email"
						/>
					) : (
						<span className="text-white">{client.email || "Não informado"}</span>
					)}
				</div>

				<div className="flex items-center space-x-2">
					<Building size={16} className="text-electric" />
					{isEditing ? (
						<Input
							name="company"
							value={editedClient.company || ""}
							onChange={handleChange}
							className="bg-deep/30 border-electric/30 text-white"
							placeholder="Empresa"
						/>
					) : (
						<span className="text-white">{client.company || "Não informado"}</span>
					)}
				</div>

				<div className="flex items-center space-x-2">
					<Navigation size={16} className="text-electric" />
					{isEditing ? (
						<Input
							name="address"
							value={editedClient.address || ""}
							onChange={handleChange}
							className="bg-deep/30 border-electric/30 text-white"
							placeholder="Endereço"
						/>
					) : (
						<span className="text-white">{client.address || "Não informado"}</span>
					)}
				</div>
			</div>

			{/* Segment */}
			<div className="mb-6">
				<h3 className="text-lg font-semibold text-white mb-2">Segmento</h3>
				{isEditing ? (
					<Input
						name="segment"
						value={editedClient.segment || ""}
						onChange={handleChange}
						className="bg-deep/30 border-electric/30 text-white"
						placeholder="Segmento"
					/>
				) : (
					<div className="bg-deep/30 py-1 px-3 rounded inline-block text-white">
						<Star size={16} className="inline mr-1 text-yellow-500" />
						{client.segment || "Não categorizado"}
					</div>
				)}
			</div>

			{/* Tags */}
			<div className="mb-6">
				<h3 className="text-lg font-semibold text-white mb-2">Tags</h3>
				<div className="flex flex-wrap gap-2 mb-2">
					{(editedClient.tags || []).map((tag) => (
						<div key={tag} className="bg-electric/20 text-electric px-2 py-1 rounded-full text-sm flex items-center">
							<Tag size={12} className="mr-1" />
							{tag}
							{isEditing && (
								<button
									onClick={() => handleRemoveTag(tag)}
									className="ml-1 text-white/70 hover:text-white"
								>
									<X size={12} />
								</button>
							)}
						</div>
					))}
				</div>
				{isEditing && (
					<div className="flex space-x-2">
						<Input
							value={newTag}
							onChange={(e) => setNewTag(e.target.value)}
							className="bg-deep/30 border-electric/30 text-white"
							placeholder="Nova tag"
						/>
						<Button
							onClick={handleAddTag}
							size="sm"
							variant="outline"
						>
							Adicionar
						</Button>
					</div>
				)}
			</div>

			{/* Notes */}
			<div className="mb-6">
				<h3 className="text-lg font-semibold text-white mb-2">Anotações</h3>
				{isEditing ? (
					<Textarea
						name="notes"
						value={editedClient.notes || ""}
						onChange={handleChange}
						className="bg-deep/30 border-electric/30 text-white"
						placeholder="Adicione notas sobre este cliente"
						rows={4}
					/>
				) : (
					<p className="text-white/80 bg-deep/30 p-3 rounded">
						{client.notes || "Nenhuma anotação ainda."}
					</p>
				)}
			</div>
		</motion.div>
	);
};

export default ClientProfileSidebar;
