import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import type { SegmentationModalProps, SegmentationRule } from "@/interface";
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
		const newRule = { field: "", operator: "", value: "" };
		setRules([...rules, newRule]);
	};

	const updateField = (index: number, value: string) => {
		const newRules = [...rules];
		newRules[index].field = value;
		setRules(newRules);
	};

	const updateOperator = (index: number, value: string) => {
		const newRules = [...rules];
		newRules[index].operator = value;
		setRules(newRules);
	};

	const updateValue = (index: number, value: string) => {
		const newRules = [...rules];
		newRules[index].value = value;
		setRules(newRules);
	};

	const handleSegmentation = async () => {
		await onSegment(rules);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<h2 className="text-2xl font-bold mb-4">
				Configurar Segmentação de Leads
			</h2>
			{rules.map((rule, index) => (
				<div
					key={rule.field + rule.operator + rule.value}
					className="mb-4 flex space-x-2"
				>
					<Select
						value={rule.field}
						onChange={(e) => updateField(index, e.target.value)}
					>
						<option value="">Selecione um campo</option>
						<option value="name">Nome</option>
						<option value="email">E-mail</option>
						<option value="phone">Telefone</option>
					</Select>
					<Select
						value={rule.operator}
						onChange={(e) => updateOperator(index, e.target.value)}
					>
						<option value="">Selecione um operador</option>
						<option value="contains">Contém</option>
						<option value="equals">Igual a</option>
						<option value="startsWith">Começa com</option>
					</Select>
					<Input
						type="text"
						value={rule.value}
						onChange={(e) => updateValue(index, e.target.value)}
						placeholder="Valor"
					/>
				</div>
			))}
			<Button onClick={createNewRule}>Adicionar Regra</Button>
			<div className="mt-4 flex justify-end space-x-2">
				<Button variant="outline" onClick={onClose}>
					Cancelar
				</Button>
				<Button onClick={handleSegmentation}>Segmentar</Button>
			</div>
		</Modal>
	);
};
