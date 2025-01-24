import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import type { SegmentationModalProps, SegmentationRule } from "@/interface";
import { Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";

export const SegmentationModal: React.FC<SegmentationModalProps> = ({
	isOpen,
	onClose,
	onSegment,
}) => {
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

	const handleSegmentation = async () => {
		await onSegment(rules);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
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
						</Select>
						<Select
							value={rule.operator}
							onChange={(e) => updateRule(index, "operator", e.target.value)}
							className="bg-deep border-electric text-white"
						>
							<option value="">Selecione um operador</option>
							<option value="contains">Contém</option>
							<option value="equals">Igual a</option>
							<option value="startsWith">Começa com</option>
						</Select>
						<div className="flex items-center">
							<Input
								type="text"
								value={rule.value}
								onChange={(e) => updateRule(index, "value", e.target.value)}
								placeholder="Valor"
								className="flex-grow bg-deep border-electric text-white"
							/>
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
						onClick={handleSegmentation}
						className="bg-electric hover:bg-electric/80 text-deep"
					>
						Segmentar
					</Button>
				</div>
			</div>
		</Modal>
	);
};
