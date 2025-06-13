// src/components/AgentConfigModal.tsx
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { listAgents } from "@/services/agentService"; // Mantém a importação para agentes do backend
// Importa as funções do novo serviço para a Evolution API
import {
  createBot,
  deleteBot,
  fetchBots,
  updateBot,
} from "@/services/evolutionApi.service"; // Ajuste o caminho conforme a estrutura do seu projeto


import type { Agent } from "@/types/agent";
import { Edit, HelpCircle, Plus, Save, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";


// Tipos para Evolution API (Compatíveis com os payloads do serviço)
interface EvoAIConfig {
  enabled: boolean;
  description: string;
  agentUrl: string;
  apiKey: string;
  expire: number;
  keywordFinish: string;
  delayMessage: number;
  unknownMessage: string;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
  ignoreJids: string[];
  splitMessages: boolean;
  timePerChar: number;
  triggerType: "all" | "keyword";
  triggerOperator: "contains" | "equals" | "startsWith" | "endsWith";
  triggerValue: string;
}


// Interface para representar um bot retornado pela Evolution API (compatível com GetBotsResponse item)
interface EvoAI {
  id: string;
  name?: string; // O serviço pode não retornar 'name', mas 'description' é usado para exibição
  description: string; // Campo usado pela API para nome/descrição
  enabled: boolean;
  agentUrl: string;
  apiKey: string;
  expire: number;
  keywordFinish: string;
  delayMessage: number;
  unknownMessage: string;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
  ignoreJids: string[];
  splitMessages: boolean;
  timePerChar: number;
  triggerType: "all" | "keyword";
  triggerOperator: "contains" | "equals" | "startsWith" | "endsWith";
  triggerValue: string;
  updatedAt: string;
}


// Interface para o formulário, inclui campos da EvoAIConfig
interface EvoAIFormData extends EvoAIConfig {
  name: string; // Nome do agente backend (para exibição e link)
  description: string; // Campo usado pela API para nome/descrição
}


interface AIAgentDialogProps {
  instanceName: string;
  onUpdate: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}


const defaultFormData: EvoAIFormData = {
  // EvoAI Config (campos enviados para a Evolution API)
  enabled: true,
  description: "", // Usado para o "Nome" ou identificação do bot na EvoAI
  agentUrl: "",
  apiKey: "",
  expire: 0,
  keywordFinish: "sair",
  delayMessage: 1,
  unknownMessage: "Desculpe, não consegui entender sua solicitação.",
  listeningFromMe: false,
  stopBotFromMe: true,
  keepOpen: false,
  debounceTime: 0,
  ignoreJids: [],
  splitMessages: false,
  timePerChar: 0,
  triggerType: "all",
  triggerOperator: "contains",
  triggerValue: "",
};


// Componente para tooltip responsivo
const HelpTooltip = ({ content }: { content: string }) => (
  <div className="group relative inline-flex">
    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-nowrap z-50 max-w-xs text-center">
      {content}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
    </div>
  </div>
);


export function AIAgentDialog({
  instanceName,
  isOpen,
  onOpenChange,
  onUpdate,
}: AIAgentDialogProps) {
  // Estados
  const [agents, setAgents] = useState<Agent[]>([]); // Agentes do backend do usuário
  const [availableAgents, setAvailableAgents] = useState<EvoAI[]>([]); // Bots configurados na Evolution API para esta instância
  const [selectedAgent, setSelectedAgent] = useState<EvoAI | null>(null); // Bot da Evolution API selecionado para edição
  const [selectedAgentId, setSelectedAgentId] = useState<string>(""); // ID do agente backend selecionado para criar um novo bot
  const [formData, setFormData] = useState<EvoAIFormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [ignoreJidInput, setIgnoreJidInput] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);


  // Obter informações do usuário
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};
  const clientId = user?.client_id || "";


  // Carregar agentes do usuário (do backend)
  const loadUserAgents = useCallback(async () => {
    if (!clientId) return;


    try {
      console.log("Carregando agentes do usuário...");
      const response = await listAgents(clientId, 0, 100); // Usa listAgents do agentService
      console.log("Agentes carregados:", response);
      setAgents(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar agentes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus agentes",
        variant: "destructive",
      });
    }
  }, [clientId]);


  // Carregar EvoAIs da instância (da Evolution API usando fetchBots)
  const loadAvailableAgents = useCallback(async () => {
    if (!instanceName) return;

    setLoading(true);
    try {
      console.log("Carregando agentes da instância:", instanceName);
      const response = await fetchBots(instanceName);
      console.log("Resposta bruta da API (fetchBots):", response); // Log da resposta bruta

      const agentsData = response || [];
      console.log("Dados dos agentes após verificação (fetchBots):", agentsData); // Log após verificação inicial

      // Log antes da filtragem/mapeamento
      console.log("Dados antes da filtragem/mapeamento:", agentsData);

      const filteredAgents = Array.isArray(agentsData)
        ? agentsData.filter(
          (agent: any) =>
            agent.triggerType === "all" || agent.triggerType === "keyword"
        )
        : [];

      // Log após a filtragem
      console.log("Dados após a filtragem:", filteredAgents);


      setAvailableAgents(
        filteredAgents.map((agent: any) => ({
          ...agent,
          triggerType:
            agent.triggerType === "all" || agent.triggerType === "keyword"
              ? agent.triggerType
              : "all",
          triggerOperator:
            agent.triggerOperator === "contains" ||
              agent.triggerOperator === "equals" ||
              agent.triggerOperator === "startsWith" ||
              agent.triggerOperator === "endsWith"
              ? agent.triggerOperator
              : "contains",
        }))
      );

      // Log do estado final
      console.log("Estado availableAgents atualizado:", availableAgents); // Note: this will log the *previous* state due to closure

    } catch (error) {
      console.error("Erro ao carregar agentes da instância:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agentes da instância",
        variant: "destructive",
      });
      setAvailableAgents([]);
    } finally {
      setLoading(false);
    }
  }, [availableAgents, instanceName]); // Adicione availableAgents aqui se quiser ver o estado atualizado no log subsequente



  // Carregar dados quando abrir o dialog
  useEffect(() => {
    if (isOpen) {
      loadUserAgents();
      loadAvailableAgents();
      // Reseta os estados ao abrir
      setSelectedAgent(null);
      setIsCreatingNew(false);
      setFormData(defaultFormData);
      setSelectedAgentId("");
      setIgnoreJidInput(""); // Resetar input de ignoreJids
    }
  }, [isOpen, loadUserAgents, loadAvailableAgents]);


  // Handlers
  const handleFormChange = useCallback(
    (field: keyof EvoAIFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );


  const handleAgentSelection = useCallback(
    (agentId: string) => {
      const agent = agents.find((a) => a.id === agentId);
      if (agent) {
        setSelectedAgentId(agentId);
        // Constrói a agentUrl com base no ID do agente backend selecionado
        const agentUrl = `${process.env.VITE_API_AI_URL}/api/v1/a2a/${agentId}`;


        // Inicializa o formulário com os valores padrão e sobrescreve com os dados do agente backend
        setFormData({
          ...defaultFormData,
          name: agent.name,
          model: agent.model,
          agentUrl: agentUrl,
          description: agent.name,
        });
        setIsCreatingNew(true); // Entra no modo de criação
        setSelectedAgent(null); // Garante que não está editando um existente
      }
    },
    [agents]
  );


  const editAgent = useCallback(
    (agent: EvoAI) => {
      setSelectedAgent(agent);
      setIsCreatingNew(false); // Não está criando um novo, está editando
      setSelectedAgentId(""); // Limpa o ID do agente backend selecionado
      setFormData({
        ...defaultFormData, // Começa com os defaults
        ...agent, // Sobrescreve com os dados do bot da EvoAI
        // Campos que podem não vir da EvoAI, mas são necessários para o formulário
        // Se a EvoAI retornar 'description', usá-lo como 'name' no formulário
        name: agent.description || "",
        // Campos do agente backend não são editáveis aqui, então usamos defaults ou vazios
        systemMessage: "",
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1,
        triggerKeywords: [],
        onlyBusinessHours: false,
        businessHoursStart: "09:00",
        businessHoursEnd: "18:00",
        welcomeMessage: "",
        fallbackMessage: "",
      });
      setIgnoreJidInput(agent.ignoreJids.join(", ")); // Preenche o input de ignoreJids
    },
    []
  );


  const addIgnoreJid = useCallback(() => {
    const jid = ignoreJidInput.trim();
    if (jid && !formData.ignoreJids.includes(jid)) {
      setFormData((prev) => ({
        ...prev,
        ignoreJids: [...prev.ignoreJids, jid],
      }));
      setIgnoreJidInput("");
    }
  }, [ignoreJidInput, formData.ignoreJids]);


  const removeIgnoreJid = useCallback(
    (jidToRemove: string) => {
      setFormData((prev) => ({
        ...prev,
        ignoreJids: prev.ignoreJids.filter((jid) => jid !== jidToRemove),
      }));
    },
    []
  );


  const saveAgent = useCallback(async () => {
    if (!instanceName) {
      toast({
        title: "Erro",
        description: "Nome da instância não fornecido.",
        variant: "destructive",
      });
      return;
    }


    setLoading(true);
    try {
      const payload: EvoAIConfig = {
        enabled: formData.enabled,
        description: formData.description,
        agentUrl: formData.agentUrl,
        apiKey: formData.apiKey,
        expire: Number(formData.expire), // Garante que é um número
        keywordFinish: formData.keywordFinish,
        delayMessage: Number(formData.delayMessage), // Garante que é um número
        unknownMessage: formData.unknownMessage,
        listeningFromMe: formData.listeningFromMe,
        stopBotFromMe: formData.stopBotFromMe,
        keepOpen: formData.keepOpen,
        debounceTime: Number(formData.debounceTime), // Garante que é um número
        ignoreJids: formData.ignoreJids,
        splitMessages: formData.splitMessages,
        timePerChar: Number(formData.timePerChar), // Garante que é um número
        triggerType: formData.triggerType,
        triggerOperator: formData.triggerOperator,
        triggerValue: formData.triggerValue,
      };


      let response;
      if (selectedAgent) {
        // Atualizar agente existente
        console.log("Atualizando agente:", selectedAgent.id, payload);
        response = await updateBot(selectedAgent.id, instanceName, payload);
        toast({
          title: "Sucesso",
          description: "Agente atualizado com sucesso!",
        });
      } else {
        // Criar novo agente
        console.log("Criando novo agente:", payload);
        response = await createBot(instanceName, payload);
        toast({
          title: "Sucesso",
          description: "Agente conectado com sucesso!",
        });
      }


      console.log("Resposta da API:", response);
      onUpdate(); // Notifica o componente pai para atualizar a lista de instâncias
      onOpenChange(false); // Fecha o modal
    } catch (error: any) {
      console.error("Erro ao salvar agente:", error);
      toast({
        title: "Erro",
        description:
          error.response?.data?.message || "Ocorreu um erro ao salvar o agente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    formData,
    instanceName,
    selectedAgent,
    onUpdate,
    onOpenChange,
  ]);


  const handleDeleteAgent = useCallback(async () => {
    if (!selectedAgent || !instanceName) {
      toast({
        title: "Erro",
        description: "Nenhum agente selecionado para deletar ou instância inválida.",
        variant: "destructive",
      });
      return;
    }


    setLoading(true);
    try {
      console.log("Deletando agente:", selectedAgent.id);
      await deleteBot(selectedAgent.id, instanceName);
      toast({
        title: "Sucesso",
        description: "Agente desconectado com sucesso!",
      });
      onUpdate(); // Notifica o componente pai
      onOpenChange(false); // Fecha o modal
    } catch (error: any) {
      console.error("Erro ao deletar agente:", error);
      toast({
        title: "Erro",
        description:
          error.response?.data?.message ||
          "Ocorreu um erro ao desconectar o agente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedAgent, instanceName, onUpdate, onOpenChange]);


  const cancelEditing = useCallback(() => {
    setSelectedAgent(null);
    setIsCreatingNew(false);
    setFormData(defaultFormData);
    setSelectedAgentId("");
    setIgnoreJidInput("");
  }, []);


  const isEditing = selectedAgent !== null;


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Configurar Agente de IA para {instanceName}</DialogTitle>
          <DialogDescription>
            {isCreatingNew
              ? "Selecione um agente do seu painel para conectar a esta instância ou configure manualmente."
              : isEditing
                ? `Editando configuração do bot: ${selectedAgent?.description || selectedAgent?.id}`
                : "Gerencie os agentes de IA conectados a esta instância."}
          </DialogDescription>
        </DialogHeader>


        {/* Lista de agentes existentes ou formulário */}
        {!selectedAgent && !isCreatingNew ? (
          <div className="flex flex-col gap-4 py-4 overflow-y-auto">
            {loading ? (
              <p>Carregando agentes...</p>
            ) : availableAgents.length === 0 ? (
              <p>Nenhum agente de IA configurado para esta instância.</p>
            ) : (
              availableAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 border rounded-md"
                >
                  <div>
                    <p className="font-semibold">{agent.description || agent.id}</p>
                    <p className="text-sm text-gray-500">{agent.agentUrl}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editAgent(agent)}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    {/* Botão de deletar só aparece na lista, não no formulário de edição */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAgent} // Usa o handler de delete
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
            <div className="flex justify-center mt-4">
              <Button onClick={() => setIsCreatingNew(true)}>
                <Plus className="mr-2 h-4 w-4" /> Conectar Novo Agente
              </Button>
            </div>
          </div>
        ) : (
          /* Formulário de criação/edição */
          <div className="grid gap-4 py-4 flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="grid gap-4">
                {/* Seleção do agente backend (apenas na criação) */}
                {!isEditing && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="backendAgent" className="text-right">
                      Agentes IA
                    </Label>
                    <Select
                      onValueChange={handleAgentSelection}
                      value={selectedAgentId}
                      disabled={loading || isEditing}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione um agente do seu painel" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}


                {/* Campos do formulário (EvoAI Config) */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Nome/Descrição Bot
                    <HelpTooltip content="Nome ou descrição para identificar este bot na Evolution API." />
                  </Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>


                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="agentUrl" className="text-right">
                    Agent URL
                    <HelpTooltip content="URL do seu agente de IA (backend) que a Evolution API irá chamar." />
                  </Label>
                  <Input
                    id="agentUrl"
                    value={formData.agentUrl}
                    onChange={(e) => handleFormChange("agentUrl", e.target.value)}
                    className="col-span-3"
                    disabled={loading || isCreatingNew} // Desabilita se estiver criando via seleção de agente backend
                  />
                </div>


                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="apiKey" className="text-right">
                    API Key
                    <HelpTooltip content="Chave de API para autenticar a Evolution API no seu agente backend." />
                  </Label>
                  <Input
                    id="apiKey"
                    value={formData.apiKey}
                    onChange={(e) => handleFormChange("apiKey", e.target.value)}
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>


                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expire" className="text-right">
                    Expirar (min)
                    <HelpTooltip content="Tempo em minutos que a sessão do bot permanece ativa após a última interação. 0 para nunca expirar." />
                  </Label>
                  <Input
                    id="expire"
                    type="number"
                    value={formData.expire}
                    onChange={(e) =>
                      handleFormChange("expire", Number(e.target.value))
                    }
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>


                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="keywordFinish" className="text-right">
                    Palavra-chave Finalizar
                    <HelpTooltip content="Palavra-chave que o usuário pode usar para finalizar a conversa com o bot." />
                  </Label>
                  <Input
                    id="keywordFinish"
                    value={formData.keywordFinish}
                    onChange={(e) =>
                      handleFormChange("keywordFinish", e.target.value)
                    }
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>


                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="delayMessage" className="text-right">
                    Delay Mensagem (seg)
                    <HelpTooltip content="Atraso em segundos antes de enviar a resposta do bot." />
                  </Label>
                  <Input
                    id="delayMessage"
                    type="number"
                    value={formData.delayMessage}
                    onChange={(e) =>
                      handleFormChange("delayMessage", Number(e.target.value))
                    }
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>


                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unknownMessage" className="text-right">
                    Mensagem Desconhecida
                    <HelpTooltip content="Mensagem enviada quando o bot não consegue processar a solicitação do usuário." />
                  </Label>
                  <Textarea
                    id="unknownMessage"
                    value={formData.unknownMessage}
                    onChange={(e) =>
                      handleFormChange("unknownMessage", e.target.value)
                    }
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>


                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="triggerType" className="text-right">
                    Tipo de Gatilho
                    <HelpTooltip content="Define quando o bot será ativado. 'all' para todas as mensagens, 'keyword' para ativar por palavra-chave." />
                  </Label>
                  <Select
                    onValueChange={(value: "all" | "keyword") =>
                      handleFormChange("triggerType", value)
                    }
                    value={formData.triggerType}
                    disabled={loading}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione o tipo de gatilho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Mensagens</SelectItem>
                      <SelectItem value="keyword">Palavra-chave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


                {formData.triggerType === "keyword" && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="triggerOperator" className="text-right">
                        Operador Gatilho
                        <HelpTooltip content="Define como a palavra-chave de gatilho será comparada com a mensagem do usuário." />
                      </Label>
                      <Select
                        onValueChange={(
                          value: "contains" | "equals" | "startsWith" | "endsWith"
                        ) => handleFormChange("triggerOperator", value)}
                        value={formData.triggerOperator}
                        disabled={loading}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecione o operador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contains">Contém</SelectItem>
                          <SelectItem value="equals">Igual a</SelectItem>
                          <SelectItem value="startsWith">Começa com</SelectItem>
                          <SelectItem value="endsWith">Termina com</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="triggerValue" className="text-right">
                        Valor Gatilho
                        <HelpTooltip content="A palavra-chave ou frase que ativará o bot (quando o tipo de gatilho for 'keyword')." />
                      </Label>
                      <Input
                        id="triggerValue"
                        value={formData.triggerValue}
                        onChange={(e) =>
                          handleFormChange("triggerValue", e.target.value)
                        }
                        className="col-span-3"
                        disabled={loading}
                      />
                    </div>
                  </>
                )}


                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ignoreJids" className="text-right">
                    Ignorar Contatos
                    <HelpTooltip content="Lista de JIDs (ex: 5511999999999@s.whatsapp.net) que o bot deve ignorar. Adicione um por um." />
                  </Label>
                  <div className="col-span-3 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Input
                        id="ignoreJids"
                        value={ignoreJidInput}
                        onChange={(e) => setIgnoreJidInput(e.target.value)}
                        placeholder="Ex: 5511999999999@s.whatsapp.net"
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        onClick={addIgnoreJid}
                        disabled={loading || !ignoreJidInput.trim()}
                      >
                        Adicionar
                      </Button>
                    </div>
                    {formData.ignoreJids.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {formData.ignoreJids.map((jid) => (
                          <span
                            key={jid}
                            className="flex items-center bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300"
                          >
                            {jid}
                            <button
                              type="button"
                              onClick={() => removeIgnoreJid(jid)}
                              className="ml-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                              disabled={loading}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>


                {/* Switches */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="enabled" className="text-right">
                    Habilitado
                    <HelpTooltip content="Ativa ou desativa este bot." />
                  </Label>
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) =>
                      handleFormChange("enabled", checked)
                    }
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>


                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="listeningFromMe" className="text-right">
                    Ouvir Minhas Mensagens
                    <HelpTooltip content="Se ativado, o bot responderá às mensagens enviadas por você (o número da instância)." />
                  </Label>
                  <Switch
                    id="listeningFromMe"
                    checked={formData.listeningFromMe}
                    onCheckedChange={(checked) =>
                      handleFormChange("listeningFromMe", checked)
                    }
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>


                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stopBotFromMe" className="text-right">
                    Parar Bot Com Minha Mensagem
                    <HelpTooltip content="Se ativado, o bot parará de responder a uma conversa se você enviar uma mensagem nela." />
                  </Label>
                  <Switch
                    id="stopBotFromMe"
                    checked={formData.stopBotFromMe}
                    onCheckedChange={(checked) =>
                      handleFormChange("stopBotFromMe", checked)
                    }
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>


                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="keepOpen" className="text-right">
                    Manter Sessão Aberta
                    <HelpTooltip content="Se ativado, a sessão do bot não expirará automaticamente pelo tempo definido em 'Expirar'." />
                  </Label>
                  <Switch
                    id="keepOpen"
                    checked={formData.keepOpen}
                    onCheckedChange={(checked) =>
                      handleFormChange("keepOpen", checked)
                    }
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>


                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="splitMessages" className="text-right">
                    Dividir Mensagens
                    <HelpTooltip content="Se ativado, respostas longas serão divididas em várias mensagens menores." />
                  </Label>
                  <Switch
                    id="splitMessages"
                    checked={formData.splitMessages}
                    onCheckedChange={(checked) =>
                      handleFormChange("splitMessages", checked)
                    }
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>


                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="timePerChar" className="text-right">
                    Tempo Por Caractere (ms)
                    <HelpTooltip content="Atraso adicional em milissegundos por caractere na resposta do bot, simula digitação." />
                  </Label>
                  <Input
                    id="timePerChar"
                    type="number"
                    value={formData.timePerChar}
                    onChange={(e) =>
                      handleFormChange("timePerChar", Number(e.target.value))
                    }
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>
              </div>
            </ScrollArea>


            {/* Ações do formulário (botões Salvar/Cancelar) */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              {isEditing && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteAgent}
                  disabled={loading}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Desconectar
                </Button>
              )}
              <Button
                variant="outline"
                onClick={cancelEditing}
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" /> Cancelar
              </Button>
              <Button onClick={saveAgent} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />{" "}
                {isEditing ? "Atualizar" : "Conectar"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
