import { motion } from "framer-motion";
import { Check, MessageSquare, Settings2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

const TypebotConfigForm = ({
	instance = {},
	onUpdate,
	onDelete,
	isEditing = false,
}) => {
	const [currentStep, setCurrentStep] = useState(1);
	const [isSaving, setIsSaving] = useState(false);

	// Adicionando verificação de segurança para instance.typebot
	const [config, setConfig] = useState({
		enabled: true,
		url: instance?.typebot?.url || "",
		typebot: instance?.typebot?.typebot || "",
		description: instance?.typebot?.description || "",
		triggerType: instance?.typebot?.triggerType || "keyword",
		triggerOperator: instance?.typebot?.triggerOperator || "contains",
		triggerValue: instance?.typebot?.triggerValue || "",
		expire: instance?.typebot?.expire || 0,
		keywordFinish: instance?.typebot?.keywordFinish || "#SAIR",
		delayMessage: instance?.typebot?.delayMessage || 1000,
		unknownMessage:
			instance?.typebot?.unknownMessage || "Message not recognized",
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

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setConfig((prev) => ({
			...prev,
			[name]:
				type === "checkbox"
					? checked
					: type === "number"
						? Number(value)
						: value,
		}));
	};
	// Função para validar os campos obrigatórios
	const validateForm = () => {
		return (
			config.url.trim() !== "" &&
			config.typebot.trim() !== "" &&
			config.description.trim() !== "" &&
			(config.triggerType !== "keyword" || config.triggerValue.trim() !== "")
		);
	};

	// Função para lidar com a navegação entre etapas
	const handleNextStep = () => {
		if (currentStep < steps.length) {
			setCurrentStep((prev) => prev + 1);
		}
	};

	// Função para lidar com o retorno entre etapas
	const handlePreviousStep = () => {
		if (currentStep > 1) {
			setCurrentStep((prev) => prev - 1);
		}
	};

	const StepIndicator = ({ step, isActive, isCompleted }) => (
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

	const InputField = ({ label, name, type = "text", placeholder = "" }) => (
		<div className="mb-4">
			<label className="block text-sm font-medium text-gray-600 mb-1">
				{label}
			</label>
			<input
				type={type}
				name={name}
				value={config[name]}
				onChange={handleChange}
				placeholder={placeholder}
				className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-dark focus:border-transparent"
			/>
		</div>
	);

	const SelectField = ({ label, name, options }) => (
		<div className="mb-4">
			<label className="block text-sm font-medium text-gray-600 mb-1">
				{label}
			</label>
			<select
				name={name}
				value={config[name]}
				onChange={handleChange}
				className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-dark focus:border-transparent"
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);

	const handleDelete = async () => {
		try {
			await onDelete(instance.id);
			// A notificação de sucesso será mostrada no componente pai
		} catch (error) {
			console.error("Erro ao excluir as configurações:", error);
			// A notificação de erro será mostrada no componente pai
		}
	};

	const handleSave = async () => {
		if (!validateForm()) {
			toast.error("Preencha todos os campos obrigatórios");
			return;
		}

		setIsSaving(true);
		try {
			await onUpdate(config);
		} finally {
			setIsSaving(false);
		}
	};

	const ActionButtons = () => (
		<div className="flex justify-end space-x-2 mb-4">
			{isEditing && (
				<button
					type="button"
					onClick={() => onDelete(instance.instanceId, instance.instanceName)}
					className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
				>
					Remover Fluxo
				</button>
			)}
		</div>
	);

	return (
		<div className="max-w-3xl mx-auto bg-electric/10 rounded-xl shadow-lg p-6">
			<ActionButtons />

			{/* Progress Steps */}
			<div className="flex justify-between mb-8 relative">
				<div className="absolute top-5 left-0 right-0 h-0.5 bg-neon-purple -z-10" />
				{steps.map((step, idx) => (
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
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-600 mb-1">
									URL do Servidor Typebot
								</label>
								<input
									type="url"
									name="url"
									value={config.url}
									onChange={handleChange}
									placeholder="https://seu-typebot.com"
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-dark focus:border-transparent"
								/>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-600 mb-1">
									Nome do Fluxo
								</label>
								<input
									type="text"
									name="typebot"
									value={config.typebot}
									onChange={handleChange}
									placeholder="Nome do seu fluxo"
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-dark focus:border-transparent"
								/>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-600 mb-1">
									Descrição
								</label>
								<input
									type="text"
									name="description"
									value={config.description}
									onChange={handleChange}
									placeholder="Breve descrição do fluxo"
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-dark focus:border-transparent"
								/>
							</div>
						</div>
					)}

					{currentStep === 2 && (
						<div className="space-y-4">
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-600 mb-1">
									Tipo de Gatilho
								</label>
								<select
									name="triggerType"
									value={config.triggerType}
									onChange={handleChange}
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-dark focus:border-transparent"
								>
									<option value="keyword">Palavra-chave</option>
									<option value="all">Todas mensagens</option>
									<option value="none">Nenhum</option>
								</select>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-600 mb-1">
									Operador do Gatilho
								</label>
								<select
									name="triggerOperator"
									value={config.triggerOperator}
									onChange={handleChange}
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-dark focus:border-transparent"
								>
									<option value="contains">Contém</option>
									<option value="equals">Igual</option>
									<option value="startsWith">Começa com</option>
									<option value="endsWith">Termina com</option>
								</select>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-600 mb-1">
									Palavra-chave
								</label>
								<input
									type="text"
									name="triggerValue"
									value={config.triggerValue}
									onChange={handleChange}
									placeholder="Digite a palavra-chave"
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-dark focus:border-transparent"
								/>
							</div>
						</div>
					)}

					{currentStep === 3 && (
						<div className="space-y-4">
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-600 mb-1">
									Mensagem de Erro
								</label>
								<input
									type="text"
									name="unknownMessage"
									value={config.unknownMessage}
									onChange={handleChange}
									placeholder="Mensagem não reconhecida"
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-dark focus:border-transparent"
								/>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-600 mb-1">
									Atraso das Mensagens (ms)
								</label>
								<input
									type="number"
									name="delayMessage"
									value={config.delayMessage}
									onChange={handleChange}
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-dark focus:border-transparent"
								/>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-600 mb-1">
									Tempo para Expirar (min)
								</label>
								<input
									type="number"
									name="expire"
									value={config.expire}
									onChange={handleChange}
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-dark focus:border-transparent"
								/>
							</div>
						</div>
					)}
				</motion.div>

				<div className="mt-8 flex justify-between">
					{/* Botão Anterior */}
					<button
						type="button"
						onClick={handlePreviousStep}
						className={`px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 ${
							currentStep === 1 ? "invisible" : ""
						}`}
					>
						Anterior
					</button>

					{/* Botões Próximo/Salvar */}
					{currentStep < steps.length ? (
						<button
							type="button"
							onClick={handleNextStep}
							className="px-6 py-2 rounded-lg bg-neon-green text-white hover:bg-neon-green/50"
						>
							Próximo
						</button>
					) : (
						<button
							type="button" // Mudado para type="button"
							onClick={handleSave} // Usa handleSave em vez de submit
							disabled={isSaving}
							className="px-6 py-2 rounded-lg bg-neon-green text-white hover:bg-neon-green/50 disabled:opacity-50"
						>
							{isSaving ? "Salvando..." : "Salvar Configurações"}
						</button>
					)}
				</div>
			</form>
		</div>
	);
};

export default TypebotConfigForm;
