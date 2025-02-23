import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { TypebotConfig, TypebotConfigFormProps } from "@/interface";
import { motion } from "framer-motion";
import { Check, MessageSquare, Settings2, Zap } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "react-hot-toast";

const TypebotConfigForm: React.FC<TypebotConfigFormProps> = ({
	instance = {},
	onUpdate,
	onDelete,
	isEditing = false,
}) => {
	const [currentStep, setCurrentStep] = useState(1);
	const [isSaving, setIsSaving] = useState(false);

	const [config, setConfig] = useState<TypebotConfig>({
		instanceId: instance?.id || "",
		url: instance?.typebot?.url || "",
		typebot: {
			typebotId:
				typeof instance?.typebot === "object"
					? instance.typebot.typebotId || ""
					: "",
			name:
				typeof instance?.typebot === "object"
					? instance.typebot.name || ""
					: "",
		},
		description: instance?.typebot?.description || "",
		triggerType:
			(instance?.typebot?.triggerType as "keyword" | "all" | "none") ||
			"keyword",
		triggerOperator:
			(instance?.typebot?.triggerOperator as
				| "contains"
				| "equals"
				| "startsWith"
				| "endsWith") || "contains",
		triggerValue: instance?.typebot?.triggerValue || "",
		enabled: instance?.typebot?.enabled ?? true,
		expire: instance?.typebot?.expire || 0,
		keywordFinish: instance?.typebot?.keywordFinish || "#SAIR",
		delayMessage: instance?.typebot?.delayMessage || 1000,
		unknownMessage:
			instance?.typebot?.unknownMessage || "Mensagem não reconhecida",
		listeningFromMe: instance?.typebot?.listeningFromMe || false,
		stopBotFromMe: instance?.typebot?.stopBotFromMe || false,
		keepOpen: instance?.typebot?.keepOpen || false,
		debounceTime: instance?.typebot?.debounceTime || 10,
	});

	const steps = [
		{
			id: 1,
			title: "Configuração Básica",
			icon: <Settings2 className="w-6 h-6" />,
			description: "Configure a URL e nome do fluxo",
		},
		{
			id: 2,
			title: "Gatilhos",
			icon: <Zap className="w-6 h-6" />,
			description: "Defina os gatilhos de ativação",
		},
		{
			id: 3,
			title: "Mensagens",
			icon: <MessageSquare className="w-6 h-6" />,
			description: "Configure as mensagens do bot",
		},
	];

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value, type } = e.target;
		setConfig((prev) => ({
			...prev,
			[name]:
				type === "checkbox"
					? (e.target as HTMLInputElement).checked
					: type === "number"
						? Number(value)
						: value,
		}));
	};

	const validateForm = () => {
		return (
			config.url.trim() !== "" &&
			typeof config.typebot === "object" &&
			config.typebot.typebotId.trim() !== "" &&
			config.description.trim() !== "" &&
			(config.triggerType !== "keyword" || config.triggerValue.trim() !== "")
		);
	};

	const handleNextStep = () => {
		if (currentStep < steps.length) {
			setCurrentStep((prev) => prev + 1);
		}
	};

	const handlePreviousStep = () => {
		if (currentStep > 1) {
			setCurrentStep((prev) => prev - 1);
		}
	};

	const StepIndicator: React.FC<{
		step: (typeof steps)[number];
		isActive: boolean;
		isCompleted: boolean;
	}> = ({ step, isActive, isCompleted }) => (
		<div className="flex flex-col items-center w-full">
			<div
				className={`
          w-10 h-10 rounded-full flex items-center justify-center
          transition-colors duration-200
          ${
						isActive
							? "bg-neon-green text-white"
							: isCompleted
								? "bg-green-200 text-green-700"
								: "bg-gray-200 text-gray-500"
					}
        `}
			>
				{isCompleted ? <Check className="w-6 h-6" /> : step.icon}
			</div>
			<p className="mt-2 text-sm font-medium text-gray-600">{step.title}</p>
			<p className="text-xs text-gray-400">{step.description}</p>
		</div>
	);

	const InputField: React.FC<{
		label: string;
		name: string;
		type?: string;
		placeholder?: string;
	}> = ({ label, name, type = "text", placeholder = "" }) => (
		<div className="mb-4">
			<label className="block text-sm font-medium text-gray-600 mb-1">
				{label}
			</label>
			<Input
				type={type}
				name={name}
				value={typeof config[name] === "string" ? (config[name] as string) : ""}
				onChange={handleChange}
				placeholder={placeholder}
				className="w-full"
			/>
		</div>
	);

	const SelectField: React.FC<{
		label: string;
		name: string;
		options: { value: string; label: string }[];
	}> = ({ label, name, options }) => (
		<div className="mb-4">
			<label className="block text-sm font-medium text-gray-600 mb-1">
				{label}
			</label>
			<Select
				name={name}
				value={config[name] as string}
				onChange={handleChange}
				className="w-full"
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</Select>
		</div>
	);

	const handleSave = async () => {
		if (!validateForm()) {
			toast.error("Preencha todos os campos obrigatórios");
			return;
		}

		setIsSaving(true);
		try {
			await onUpdate(config);
			toast.success("Configurações do Typebot salvas com sucesso!");
		} catch (error) {
			console.error("Erro ao salvar as configurações:", error);
			toast.error("Erro ao salvar as configurações do Typebot");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		try {
			if (instance.id && instance.instanceName) {
				await onDelete(instance.id, instance.instanceName);
				toast.success("Configuração removida com sucesso");
			}
		} catch (error) {
			console.error("Erro ao excluir as configurações:", error);
			toast.error("Erro ao excluir as configurações do Typebot");
		}
	};

	const ActionButtons = () => (
		<div className="flex justify-end space-x-2 mb-4">
			{isEditing && (
				<Button
					variant="outline"
					onClick={handleDelete}
					className="text-red-600 hover:text-red-700"
				>
					Remover Fluxo
				</Button>
			)}
		</div>
	);

	return (
		<div className="max-w-3xl mx-auto bg-electric/10 rounded-xl shadow-lg p-6">
			<ActionButtons />

			<div className="flex justify-between mb-8 relative">
				<div className="absolute top-5 left-0 right-0 h-0.5 bg-neon-purple -z-10" />
				{steps.map((step) => (
					<StepIndicator
						key={step.id}
						step={step}
						isActive={currentStep === step.id}
						isCompleted={currentStep > step.id}
					/>
				))}
			</div>

			<form className="mt-8">
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.3 }}
				>
					{currentStep === 1 && (
						<div className="space-y-4">
							<InputField
								label="URL do Servidor Typebot"
								name="url"
								type="url"
								placeholder="https://seu-typebot.com"
							/>
							<InputField
								label="Nome do Fluxo"
								name="typebot"
								placeholder="Nome do seu fluxo"
							/>
							<InputField
								label="Descrição"
								name="description"
								placeholder="Breve descrição do fluxo"
							/>
						</div>
					)}

					{currentStep === 2 && (
						<div className="space-y-4">
							<SelectField
								label="Tipo de Gatilho"
								name="triggerType"
								options={[
									{ value: "keyword", label: "Palavra-chave" },
									{ value: "all", label: "Todas mensagens" },
									{ value: "none", label: "Nenhum" },
								]}
							/>
							<SelectField
								label="Operador do Gatilho"
								name="triggerOperator"
								options={[
									{ value: "contains", label: "Contém" },
									{ value: "equals", label: "Igual" },
									{ value: "startsWith", label: "Começa com" },
									{ value: "endsWith", label: "Termina com" },
								]}
							/>
							<InputField
								label="Palavra-chave"
								name="triggerValue"
								placeholder="Digite a palavra-chave"
							/>
						</div>
					)}

					{currentStep === 3 && (
						<div className="space-y-4">
							<InputField
								label="Mensagem de Erro"
								name="unknownMessage"
								placeholder="Mensagem não reconhecida"
							/>
							<InputField
								label="Atraso das Mensagens (ms)"
								name="delayMessage"
								type="number"
							/>
							<InputField
								label="Tempo para Expirar (min)"
								name="expire"
								type="number"
							/>
							<InputField
								label="Palavra-chave para Finalizar"
								name="keywordFinish"
							/>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									name="listeningFromMe"
									checked={config.listeningFromMe}
									onChange={handleChange}
								/>
								<label>Escutar minhas próprias mensagens</label>
							</div>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									name="stopBotFromMe"
									checked={config.stopBotFromMe}
									onChange={handleChange}
								/>
								<label>Parar bot com minhas mensagens</label>
							</div>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									name="keepOpen"
									checked={config.keepOpen}
									onChange={handleChange}
								/>
								<label>Manter sessão aberta</label>
							</div>
							<InputField
								label="Tempo de Debounce (segundos)"
								name="debounceTime"
								type="number"
							/>
						</div>
					)}
				</motion.div>

				<div className="mt-8 flex justify-between">
					<Button
						type="button"
						onClick={handlePreviousStep}
						variant="outline"
						className={currentStep === 1 ? "invisible" : ""}
					>
						Anterior
					</Button>

					{currentStep < steps.length ? (
						<Button type="button" onClick={handleNextStep}>
							Próximo
						</Button>
					) : (
						<Button type="button" onClick={handleSave} disabled={isSaving}>
							{isSaving ? "Salvando..." : "Salvar Configurações"}
						</Button>
					)}
				</div>
			</form>
		</div>
	);
};

export default TypebotConfigForm;
