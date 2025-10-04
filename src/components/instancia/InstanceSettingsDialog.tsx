// src/components/instancia/InstanceSettingsDialog.tsx

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { HelpCircle, Save, Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface InstanceSettings {
	rejectCall: boolean;
	msgCall: string;
	groupsIgnore: boolean;
	alwaysOnline: boolean;
	readMessages: boolean;
	syncFullHistory: boolean;
	readStatus: boolean;
}

interface InstanceSettingsDialogProps {
	instanceName: string;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onUpdate?: () => void;
}

const defaultSettings: InstanceSettings = {
	rejectCall: true,
	msgCall:
		"Oi! No momento não posso atender a ligação. Por favor, me envie uma mensagem e assim que possível eu retorno o contato.",
	groupsIgnore: true, // Importante: padrão true para evitar spam em grupos
	alwaysOnline: true,
	readMessages: false,
	syncFullHistory: false,
	readStatus: false,
};

export function InstanceSettingsDialog({
	instanceName,
	isOpen,
	onOpenChange,
	onUpdate,
}: InstanceSettingsDialogProps) {
	const [settings, setSettings] = useState<InstanceSettings | null>(null);
	const [loading, setLoading] = useState(false); // Estado de loading para salvar
	const [loadingGet, setLoadingGet] = useState(false);

	const apiKey = import.meta.env.VITE_PUBLIC_API_KEY || "429683C4C977415CAAFCCE10F7D57E11";
	const apiUrl = import.meta.env.VITE_EVOLUTION_API_URL || "http://localhost:8080";

	// Função para buscar configurações atuais da instância
	const fetchCurrentSettings = useCallback(async () => {
		if (!instanceName || !apiKey || !apiUrl) {
			setSettings(defaultSettings);
			setLoadingGet(false);
			return;
		}

		setLoadingGet(true);
		setSettings(null);

		const url = `${apiUrl}/settings/find/${instanceName}`;

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					apikey: apiKey,
				},
			});

			if (response.ok) {
				const data = await response.json();

				if (data) {
					const loadedSettings: InstanceSettings = {
						rejectCall: data.rejectCall ?? defaultSettings.rejectCall,
						msgCall: data.msgCall ?? defaultSettings.msgCall,
						groupsIgnore: data.groupsIgnore ?? defaultSettings.groupsIgnore,
						alwaysOnline: data.alwaysOnline ?? defaultSettings.alwaysOnline,
						readMessages: data.readMessages ?? defaultSettings.readMessages,
						syncFullHistory:
							data.syncFullHistory ?? defaultSettings.syncFullHistory,
						readStatus: data.readStatus ?? defaultSettings.readStatus,
					};
					setSettings(loadedSettings);
				} else {
					setSettings(defaultSettings);
				}
			} else {
				const errorData = await response.text().catch(() => "No error message");
				setSettings(defaultSettings);
			}
		} catch (error: unknown) {
			setSettings(defaultSettings);
		} finally {
			setLoadingGet(false);
		}
	}, [instanceName, apiKey, apiUrl]);

	// Carregar configurações quando abrir o dialog
	useEffect(() => {
		if (isOpen && instanceName) {
			fetchCurrentSettings();
		} else if (!isOpen) {
			setSettings(null);
		}
	}, [isOpen, instanceName, fetchCurrentSettings]);

	// Handler para mudanças nos campos
	const handleSettingChange = useCallback(
		(
			field: keyof InstanceSettings,
			value: InstanceSettings[keyof InstanceSettings],
		) => {
			setSettings((prev) => {
				if (prev === null) return null;
				return { ...prev, [field]: value };
			});
		},
		[],
	);

	// Função para salvar configurações
	const saveSettings = useCallback(async () => {
		if (!settings) {
			toast({
				title: "Erro",
				description: "Configurações ainda não foram carregadas.",
				variant: "destructive",
			});
			return;
		}

		if (!instanceName || !apiKey || !apiUrl) {
			toast({
				title: "Erro",
				description:
					"Nome da instância, chave API ou URL da API não encontrados. Verifique as variáveis de ambiente VITE_PUBLIC_API_KEY e VITE_EVOLUTION_API_URL.",
				variant: "destructive",
			});
			return;
		}

		// Usando optional chaining para verificar msgCall de forma mais segura
		if (settings.rejectCall && !settings.msgCall?.trim()) {
			toast({
				title: "Campo obrigatório",
				description:
					"Mensagem para chamadas rejeitadas é obrigatória quando 'Rejeitar Chamadas' está ativo.",
				variant: "destructive",
			});
			return;
		}

		setLoading(true);
		try {
			const response = await fetch(`${apiUrl}/settings/set/${instanceName}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					apikey: apiKey,
				},
				body: JSON.stringify(settings),
			});

			if (response.ok) {
				toast({
					title: "Sucesso",
					description: "Configurações da instância atualizadas com sucesso!",
				});
				onUpdate?.();
				onOpenChange(false);
			} else {
				const errorData = await response
					.json()
					.catch(() => ({ message: "Erro desconhecido ao salvar" }));
				throw new Error(errorData.message || "Falha ao salvar configurações");
			}
		} catch (error: unknown) {
			let errorMessage =
				"Não foi possível salvar as configurações da instância";
			if (error instanceof Error) {
				errorMessage = error.message;
			}
			toast({
				title: "Erro",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}, [instanceName, apiKey, apiUrl, settings, onUpdate, onOpenChange]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			{/* max-h-[90vh] e overflow-y-auto para responsividade e rolagem */}
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-2xl font-bold text-white">
						{/* Added <title> for accessibility */}
						<Settings className="w-6 h-6 text-electric">
							<title>Ícone de Configurações</title>
						</Settings>
						Configurações do WhatsApp
					</DialogTitle>
					<DialogDescription className="text-blue-400">
						Ajuste o comportamento da sua instância "{instanceName}".
					</DialogDescription>
				</DialogHeader>

				{loadingGet || settings === null ? (
					<div className="flex flex-col items-center justify-center py-8 flex-grow">
						{/* Made div self-closing */}
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-shock" />
						<span className="mt-4 text-blue-300">
							Carregando configurações...
						</span>
					</div>
				) : (
					<div className="space-y-6 flex-grow overflow-x-hidden">
						{/* Configurações de Chamadas */}
						<div className="space-y-4 p-4 bg-deep rounded-lg shadow-inner">
							<h4 className="font-semibold text-lg text-blue-200 border-b pb-2 border-blue-700">
								<span className="flex items-center gap-2">
									{/* Added <title> for accessibility */}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="lucide lucide-phone text-electric"
									>
										<title>Ícone de Telefone</title>
										<path d="M22 16.92v3a2 2 0 0 1-2.18 2.02 14.66 14.66 0 0 1-7.9-4.86L5.82 9.09a14.66 14.66 0 0 1-4.86-7.9A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
									</svg>
									Chamadas
								</span>
							</h4>

							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<Switch
										id="rejectCall"
										checked={settings.rejectCall}
										onCheckedChange={(checked) =>
											handleSettingChange("rejectCall", checked)
										}
									/>
									<Label
										htmlFor="rejectCall"
										className="font-medium text-blue-300 cursor-pointer"
									>
										Rejeitar Chamadas
									</Label>
								</div>
								{/* Tooltip for Reject Call - Positioned to the left of the icon */}
								<div className="group relative ml-2">
									{" "}
									{/* Added ml-2 for spacing */}
									<HelpCircle className="w-5 h-5 text-blue-400 cursor-help" />
									<div className="absolute bottom-6 right-full mr-2 hidden group-hover:block bg-deep text-white text-xs rounded-md p-2 opacity-95 whitespace-normal max-w-xs w-max z-50 shadow-lg">
										Quando ativo, a instância rejeitará chamadas e enviará a
										mensagem configurada abaixo.
									</div>
								</div>
							</div>

							{settings.rejectCall && (
								<div className="space-y-2">
									<div className="flex items-center space-x-2">
										<Label
											htmlFor="msgCall"
											className="font-medium text-blue-300"
										>
											Mensagem para Chamadas Rejeitadas
										</Label>
										{/* Tooltip for Message Call - Centered above the icon */}
										<div className="group relative">
											<HelpCircle className="w-4 h-4 text-blue-400 cursor-help" />
											<div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-deep text-white text-xs rounded-md p-2 opacity-95 whitespace-normal max-w-xs w-max z-50 shadow-lg">
												Esta mensagem será enviada automaticamente quando uma
												chamada for rejeitada.
											</div>
										</div>
									</div>
									<Input
										id="msgCall"
										value={settings.msgCall}
										onChange={(e) =>
											handleSettingChange("msgCall", e.target.value)
										}
										placeholder="Ex: Não aceito chamadas, envie mensagem de texto"
										className="mt-1 bg-blue-700 border-blue-600 text-blue-200"
									/>
								</div>
							)}
						</div>

						{/* Configurações Gerais */}
						<div className="space-y-4 p-4 bg-deep rounded-lg shadow-inner">
							<h4 className="font-semibold text-lg text-blue-200 border-b pb-2 border-blue-700">
								<span className="flex items-center gap-2">
									{/* Added <title> for accessibility */}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="lucide lucide-settings text-electric"
									>
										<title>Ícone de Configurações Gerais</title>
										<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.09.15a2 2 0 0 1 0 2l-.08.15a2 2 0 0 0-.73 2.73l-.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.39a2 2 0 0 0-.73-2.73l-.09-.15a2 2 0 0 1 0-2l.08-.15a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
										<circle cx="12" cy="12" r="3" />
									</svg>
									Gerais
								</span>
							</h4>

							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<Switch
										id="groupsIgnore"
										checked={settings.groupsIgnore}
										onCheckedChange={(checked) =>
											handleSettingChange("groupsIgnore", checked)
										}
									/>
									<Label
										htmlFor="groupsIgnore"
										className="font-medium text-blue-300 cursor-pointer"
									>
										Ignorar Grupos
									</Label>
								</div>
								{/* Tooltip for Ignore Groups - Positioned to the left of the icon */}
								<div className="group relative ml-2">
									{" "}
									{/* Added ml-2 for spacing */}
									<HelpCircle className="w-5 h-5 text-blue-400 cursor-help" />
									<div className="absolute bottom-6 right-full mr-2 hidden group-hover:block bg-deep text-white text-xs rounded-md p-2 opacity-95 whitespace-normal max-w-xs w-max z-50 shadow-lg">
										<span className="text-yellow-300 font-semibold">
											⚠️ IMPORTANTE:
										</span>
										<br />
										Se DESATIVADO e houver agente de IA ativo, o bot responderá
										em TODOS os grupos! Recomendado manter ATIVADO para evitar
										spam.
									</div>
								</div>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<Switch
										id="alwaysOnline"
										checked={settings.alwaysOnline}
										onCheckedChange={(checked) =>
											handleSettingChange("alwaysOnline", checked)
										}
									/>
									<Label
										htmlFor="alwaysOnline"
										className="font-medium text-blue-300 cursor-pointer"
									>
										Sempre Online
									</Label>
								</div>
								{/* Tooltip for Always Online - Positioned to the left of the icon */}
								<div className="group relative ml-2">
									{" "}
									{/* Added ml-2 for spacing */}
									<HelpCircle className="w-5 h-5 text-blue-400 cursor-help" />
									<div className="absolute bottom-6 right-full mr-2 hidden group-hover:block bg-deep text-white text-xs rounded-md p-2 opacity-95 whitespace-normal max-w-xs w-max z-50 shadow-lg">
										Mantém o status como online permanentemente no WhatsApp.
									</div>
								</div>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<Switch
										id="readMessages"
										checked={settings.readMessages}
										onCheckedChange={(checked) =>
											handleSettingChange("readMessages", checked)
										}
									/>
									<Label
										htmlFor="readMessages"
										className="font-medium text-blue-300 cursor-pointer"
									>
										Marcar Mensagens como Lidas
									</Label>
								</div>
								{/* Tooltip for Read Messages - Positioned to the left of the icon */}
								<div className="group relative ml-2">
									{" "}
									{/* Added ml-2 for spacing */}
									<HelpCircle className="w-5 h-5 text-blue-400 cursor-help" />
									<div className="absolute bottom-6 right-full mr-2 hidden group-hover:block bg-deep text-white text-xs rounded-md p-2 opacity-95 whitespace-normal max-w-xs w-max z-50 shadow-lg">
										Marca automaticamente as mensagens recebidas como lidas.
									</div>
								</div>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<Switch
										id="syncFullHistory"
										checked={settings.syncFullHistory}
										onCheckedChange={(checked) =>
											handleSettingChange("syncFullHistory", checked)
										}
									/>
									<Label
										htmlFor="syncFullHistory"
										className="font-medium text-blue-300 cursor-pointer"
									>
										Sincronizar Histórico Completo
									</Label>
								</div>
								{/* Tooltip for Sync Full History - Positioned to the left of the icon */}
								<div className="group relative ml-2">
									{" "}
									{/* Added ml-2 for spacing */}
									<HelpCircle className="w-5 h-5 text-blue-400 cursor-help" />
									<div className="absolute bottom-6 right-full mr-2 hidden group-hover:block bg-deep text-white text-xs rounded-md p-2 opacity-95 whitespace-normal max-w-xs w-max z-50 shadow-lg">
										Sincroniza todo o histórico de conversas ao conectar.
									</div>
								</div>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<Switch
										id="readStatus"
										checked={settings.readStatus}
										onCheckedChange={(checked) =>
											handleSettingChange("readStatus", checked)
										}
									/>
									<Label
										htmlFor="readStatus"
										className="font-medium text-blue-300 cursor-pointer"
									>
										Confirmar Leitura
									</Label>
								</div>
								{/* Tooltip for Read Status - Positioned to the left of the icon */}
								<div className="group relative ml-2">
									{" "}
									{/* Added ml-2 for spacing */}
									<HelpCircle className="w-5 h-5 text-blue-400 cursor-help" />
									<div className="absolute bottom-6 right-full mr-2 hidden group-hover:block bg-deep text-white text-xs rounded-md p-2 opacity-95 whitespace-normal max-w-xs w-max z-50 shadow-lg">
										Envia confirmação de leitura (tique azul) para o remetente.
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Form Actions - Removed border-t and bg-color, added blur  */}
				<div className="flex justify-end gap-3 mt-6 pt-4 sticky bottom-0 bg-deep/95 backdrop-blur supports-[backdrop-filter]:bg-deep/60">
					{" "}
					{/* Increased gap, adjusted margin/padding, added blur  */}
					<Button
						onClick={() => onOpenChange(false)}
						disabled={loading || loadingGet}
						variant="outline"
						className="px-6 py-2 rounded-md bg-shock/20 text-blue-300 border-shock/50 hover:bg-shock-dark/80 hover:border-shock/80 hover:text-white transition-colors duration-200"
					>
						Cancelar
					</Button>
					<Button
						onClick={saveSettings}
						disabled={
							loading ||
							loadingGet ||
							settings === null ||
							(settings.rejectCall && !settings.msgCall?.trim())
						}
						className="px-6 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-electric text-white font-semibold hover:from-blue-700 hover:to-blue-900 hover:shadow-lg hover:shadow-eleto-electric/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
					>
						{loading ? (
							<>
								<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
								Salvando...
							</>
						) : (
							<>
								<Save className="mr-2 h-5 w-5" /> Salvar Configurações
							</>
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
