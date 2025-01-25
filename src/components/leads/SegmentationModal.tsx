import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useLeadSegmentation } from "@/hooks/useLeadSegmentation"; // Importe o hook
import type { SegmentationModalProps, SegmentationRule } from "@/interface";
import { Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";

const SegmentationModal: React.FC<SegmentationModalProps> = ({
	isOpen,
	onClose,
	onSegment,
}) => {
	const { handleSegmentation, isSegmenting } = useLeadSegmentation();

	const [rules, setRules] = useState<SegmentationRule[]>([
		{ field: "", operator: "", value: "" },
	]);

	const createNewRule = () => {
		setRules([...rules, { field: "", operator: "", value: "" }]);
	};

	const updateRule = (
		index: number,
		key: keyof SegmentationRule,
		value: string,
	) => {
		const newRules = [...rules];
		newRules[index][key] = value;
		setRules(newRules);
	};

	const removeRule = (index: number) => {
		const newRules = rules.filter((_, i) => i !== index);
		setRules(newRules);
	};

	const handleSubmit = async () => {
		await handleSegmentation(rules);
		onSegment(rules);
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Configurar Segmentação de Leads"
		>
			<div className="bg-deep rounded-lg p-6 max-w-2xl w-full">
				<h2 className="text-2xl font-bold mb-6 text-electric">
					Configurar Segmentação de Leads
				</h2>
				{rules.map((rule, index) => (
					<div
						key={`rule-${index}`}
						className="mb-4 grid grid-cols-3 gap-2 bg-deep/50 p-4 rounded-lg relative"
					>
						<Select
							value={rule.field}
							onChange={(e) => updateRule(index, "field", e.target.value)}
							className="bg-deep border-electric text-white"
						>
							<option value="">Selecione um campo</option>
							<option value="name">Nome</option>
							<option value="email">E-mail</option>
							<option value="phone">Telefone</option>
							<option value="status">Status</option>
							<option value="segment">Segmento</option>
						</Select>
						<Select
							value={rule.operator}
							onChange={(e) => updateRule(index, "operator", e.target.value)}
							className="bg-deep border-electric text-white"
						>
							<option value="">Selecione um operador</option>
							<option value="equals">Igual a</option>
							<option value="contains">Contém</option>
							<option value="startsWith">Começa com</option>
							<option value="before">Antes de</option>
							<option value="after">Depois de</option>
						</Select>
						<div className="flex items-center">
							{rule.field === "status" || rule.field === "segment" ? (
								<Select
									value={rule.value}
									onChange={(e) => updateRule(index, "value", e.target.value)}
									className="flex-grow bg-deep border-electric text-white"
								>
									<option value="">Selecione um valor</option>
									<option value="READ">Lido</option>
									<option value="SENT">Enviado</option>
									<option value="MODERATE">Moderado</option>
									<option value="REGULAR_ENGAGEMENT">
										Engajamento Regular
									</option>
									<option value="HIGHLY_ENGAGED">Altamente Engajado</option>
									<option value="LOW_ENGAGEMENT">Baixo Engajamento</option>
									{/* Adicione outros status e segmentos conforme necessário */}
								</Select>
							) : (
								<Input
									type="text"
									value={rule.value}
									onChange={(e) => updateRule(index, "value", e.target.value)}
									placeholder="Valor"
									className="flex-grow bg-deep border-electric text-white"
								/>
							)}
							<Button
								onClick={() => removeRule(index)}
								className="ml-2 bg-red-500 hover:bg-red-600 text-white"
								title="Remover regra"
							>
								<Trash2 size={16} />
							</Button>
						</div>
					</div>
				))}
				<Button
					onClick={createNewRule}
					className="mb-6 bg-green-500 hover:bg-green-600 text-white"
				>
					Adicionar Regra
				</Button>
				<div className="flex justify-end space-x-2">
					<Button
						variant="outline"
						onClick={onClose}
						className="border-electric text-electric hover:bg-electric/10"
					>
						Cancelar
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isSegmenting}
						className="bg-electric hover:bg-electric/80 text-deep"
					>
						{isSegmenting ? "Segmentando..." : "Segmentar"}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default SegmentationModal;
