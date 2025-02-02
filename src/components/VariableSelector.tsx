import { User } from "lucide-react";
// components/VariableSelector.tsx
import type React from "react";
import { useState } from "react";

interface Variable {
	id: string;
	name: string;
	value: string;
}

interface VariableSelectorProps {
	onSelectVariable: (variable: string) => void;
}

const VariableSelector: React.FC<VariableSelectorProps> = ({
	onSelectVariable,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	// Exemplo de variáveis predefinidas
	const variables: Variable[] = [
		{ id: "1", name: "Nome", value: "{{name}}" },
		{ id: "2", name: "Email", value: "{{email}}" },
		{ id: "3", name: "Score", value: "{{score}}" },
		// Adicione mais variáveis conforme necessário
	];

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center space-x-2 p-2 rounded-md hover:bg-[#2a2a2e] transition-colors"
			>
				<User size={20} className="text-white" />
				<span className="text-white text-sm">Variáveis</span>
			</button>

			{isOpen && (
				<div className="absolute z-50 top-full left-0 mt-1 w-48 bg-[#202024] rounded-md shadow-lg border border-electric/20">
					<div className="py-1">
						{variables.map((variable) => (
							<button
								key={variable.id}
								onClick={() => {
									onSelectVariable(variable.value);
									setIsOpen(false);
								}}
								className="w-full px-4 py-2 text-sm text-white hover:bg-electric/20 text-left"
							>
								{variable.name}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default VariableSelector;
