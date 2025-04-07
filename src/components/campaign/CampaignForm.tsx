import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Campaign } from "@/interface";
import { useEffect, useState } from "react";

interface CampaignFormProps {
	campaign?: Campaign | null;
	onSubmit: (data: Partial<Campaign>) => void;
	onCancel: () => void;
	isLoading?: boolean;
}

export const CampaignForm: React.FC<CampaignFormProps> = ({
	campaign,
	onSubmit,
	onCancel,
	isLoading,
}) => {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		type: "whatsapp",
		minDelay: 5,
		maxDelay: 30,
	});

	useEffect(() => {
		if (campaign) {
			setFormData({
				name: campaign.name,
				description: campaign.description || "",
				type: campaign.type,
				minDelay: campaign.minDelay || 5,
				maxDelay: campaign.maxDelay || 30,
			});
		}
	}, [campaign]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const fileInput = document.getElementById("fileInput") as HTMLInputElement;
		if (fileInput.files && fileInput.files[0]) {
			const fileSize = fileInput.files[0].size / 1024 / 1024; // Convert to MB
			if (fileSize > 5) {
				alert("O arquivo é muito grande. O tamanho máximo permitido é 5MB.");
				return;
			}
		}
		onSubmit(formData);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="space-y-4">
				<div>
					<label className="text-sm font-medium text-white">
						Nome da Campanha
					</label>
					<Input
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
						placeholder="Digite o nome da campanha"
						className="mt-1"
						required
					/>
				</div>

				<div>
					<label className="text-sm font-medium text-white">Descrição</label>
					<Textarea
						value={formData.description}
						onChange={(e) =>
							setFormData({ ...formData, description: e.target.value })
						}
						placeholder="Digite uma descrição para a campanha"
						className="mt-1"
					/>
				</div>

				<div>
					<label className="text-sm font-medium text-white">Tipo</label>
					<Select
						value={formData.type}
						onChange={(e) => setFormData({ ...formData, type: e.target.value })}
						className="mt-1"
					>
						<option value="whatsapp">WhatsApp</option>
						<option value="email">Email</option>
						<option value="sms">SMS</option>
					</Select>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="text-sm font-medium text-white">
							Delay Mínimo (segundos)
						</label>
						<Input
							type="number"
							value={formData.minDelay}
							onChange={(e) =>
								setFormData({ ...formData, minDelay: Number(e.target.value) })
							}
							min={1}
							max={60}
							className="mt-1"
						/>
					</div>
					<div>
						<label className="text-sm font-medium text-white">
							Delay Máximo (segundos)
						</label>
						<Input
							type="number"
							value={formData.maxDelay}
							onChange={(e) =>
								setFormData({ ...formData, maxDelay: Number(e.target.value) })
							}
							min={1}
							max={120}
							className="mt-1"
						/>
					</div>
				</div>
			</div>

			<div className="flex justify-end space-x-4">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					className="bg-deep/50 border-electric hover:bg-electric/20"
				>
					Cancelar
				</Button>
				<Button
					type="submit"
					disabled={isLoading}
					className="bg-neon-green text-deep hover:bg-neon-green/80"
				>
					{isLoading ? "Salvando..." : campaign ? "Atualizar" : "Criar"}
				</Button>
			</div>
		</form>
	);
};
