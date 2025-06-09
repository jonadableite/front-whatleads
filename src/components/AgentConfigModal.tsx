// src/components/AgentConfigModal.tsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { yupResolver } from "@hookform/resolvers/yup";
import { HelpCircle, Save, X } from "lucide-react";
import React, { KeyboardEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { toast } from "./ui/toast";

// --- Interfaces ---

interface AgentFormData {
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
  triggerType: "all" | "keyword" | "none";
  triggerOperator: "contains" | "equals" | "startsWith" | "endsWith" | "regex";
  triggerValue: string;
}

// --- Schema de Validação com Yup ---
const agentConfigSchema = yup.object().shape({
  enabled: yup.boolean().required("Campo obrigatório"),
  description: yup.string().required("Descrição é obrigatória").min(3, "Mínimo 3 caracteres"),
  agentUrl: yup.string().url("URL inválida").required("URL do Agente é obrigatória"),
  apiKey: yup.string().required("API Key é obrigatória"),
  expire: yup.number().min(0, "Deve ser no mínimo 0").required("Tempo de expiração é obrigatório"),
  keywordFinish: yup.string().required("Palavra para encerrar é obrigatória"),
  delayMessage: yup.number().min(0, "Deve ser no mínimo 0").required("Delay da mensagem é obrigatório"),
  unknownMessage: yup.string().required("Mensagem quando não entender é obrigatória"),
  listeningFromMe: yup.boolean().required("Campo obrigatório"),
  stopBotFromMe: yup.boolean().required("Campo obrigatório"),
  keepOpen: yup.boolean().required("Campo obrigatório"),
  debounceTime: yup.number().min(0, "Deve ser no mínimo 0").required("Tempo de debounce é obrigatório"),
  ignoreJids: yup.array(yup.string().matches(/^\d+$/, "Número inválido (apenas dígitos)")).required(), // Valida array de strings (apenas dígitos)
  splitMessages: yup.boolean().required("Campo obrigatório"),
  timePerChar: yup.number().min(0, "Deve ser no mínimo 0").required("Tempo por caractere é obrigatório"),
  triggerType: yup.string().oneOf(["all", "keyword", "none"], "Tipo de gatilho inválido").required("Tipo de gatilho é obrigatório"),
  triggerOperator: yup.string().oneOf(["contains", "equals", "startsWith", "endsWith", "regex"], "Operador de gatilho inválido").required("Operador de gatilho é obrigatório"),
  triggerValue: yup.string().when("triggerType", { // triggerValue é obrigatório apenas se triggerType for 'keyword'
    is: "keyword",
    then: (schema) => schema.required("Valor do gatilho é obrigatório quando o tipo é 'keyword'"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

// --- Propriedades do Componente ---
interface AgentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAgentId: string | null; // ID do agente sendo editado, null para criar novo
  instanceName: string; // O nome da instância para a qual o agente está sendo configurado
  // Funções para interagir com a API backend (passadas do componente pai)
  createAgent: (instanceName: string, data: AgentFormData) => Promise<any>;
  updateAgent: (agentId: string, instanceName: string, data: AgentFormData) => Promise<any>;
  fetchAgent: (agentId: string, instanceName: string) => Promise<AgentFormData>; // Função para buscar dados do agente para edição
}

const AgentConfigModal: React.FC<AgentConfigModalProps> = ({
  isOpen,
  onClose,
  selectedAgentId,
  instanceName,
  createAgent,
  updateAgent,
  fetchAgent,
}) => {
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  const [ignoreJidInput, setIgnoreJidInput] = useState("");

  const {
    register,
    handleSubmit,
    formState,
    reset,
    setValue,
    watch,
    // control, // Pode ser necessário para alguns componentes controlados, mas register e setValue/watch geralmente bastam
  } = useForm<AgentFormData>({
    resolver: yupResolver(agentConfigSchema),
    defaultValues: {
      enabled: true,
      description: "",
      agentUrl: "",
      apiKey: "",
      expire: 10,
      keywordFinish: "sair",
      delayMessage: 1,
      unknownMessage: "Desculpe, não consegui entender sua solicitação.",
      listeningFromMe: false,
      stopBotFromMe: true,
      keepOpen: false,
      debounceTime: 0,
      ignoreJids: [],
      splitMessages: true,
      timePerChar: 2,
      triggerType: "all",
      triggerOperator: "contains",
      triggerValue: "",
    },
  });

  const { errors, isSubmitting, isValid } = formState;

  // Observa campos necessários para renderização condicional ou lógica
  const [splitMessages, triggerType] = watch(['splitMessages', 'triggerType']);
  const ignoreJids = watch('ignoreJids'); // Observa o array para renderização

  // --- Efeitos ---

  // Efeito para carregar dados do agente quando o modal abre para edição
  useEffect(() => {
    if (isOpen) {
      if (selectedAgentId) {
        setIsLoadingAgent(true);
        fetchAgent(selectedAgentId, instanceName)
          .then((data) => {
            reset(data); // Popula o formulário com os dados buscados
            toast.success(
              `Configurações do agente "${data.description}" carregadas com sucesso.`
            );
          })
          .catch((error) => {
            console.error("Erro ao carregar agente:", error);
            toast.error(
              "Não foi possível carregar as configurações do agente."
            );
            // Opcionalmente, feche o modal ou desabilite o formulário em caso de erro
            onClose();
          })
          .finally(() => {
            setIsLoadingAgent(false);
          });
      } else {
        // Reseta o formulário para valores padrão ao criar um novo agente
        reset({
          enabled: true,
          description: "",
          agentUrl: "",
          apiKey: "",
          expire: 10,
          keywordFinish: "sair",
          delayMessage: 1,
          unknownMessage: "Desculpe, não consegui entender sua solicitação.",
          listeningFromMe: false,
          stopBotFromMe: true,
          keepOpen: false,
          debounceTime: 0,
          ignoreJids: [],
          splitMessages: true,
          timePerChar: 2,
          triggerType: "all",
          triggerOperator: "contains",
          triggerValue: "",
        });
      }
    } else {
      // Reseta o formulário quando o modal fecha para limpar dados anteriores
      reset();
      setIgnoreJidInput(""); // Limpa também o input de novos JIDs
    }
  }, [isOpen, selectedAgentId, instanceName, fetchAgent, reset]); // Adicionado reset às dependências conforme recomendação do linter

  // --- Handlers ---

  const handleAddIgnoreJid = () => {
    const jid = ignoreJidInput.trim();
    if (!jid) {
      // Opcional: mostrar toast se o input estiver vazio
      toast.info("Por favor, digite um número para adicionar.");
      return;
    }

    // Validação básica do formato do JID (apenas dígitos)
    const jidRegex = /^\d+$/;
    if (!jidRegex.test(jid)) {
      toast.error("O número deve conter apenas dígitos.");
      return;
    }

    if (ignoreJids.includes(jid)) {
      toast.info(`O número ${jid} já está na lista de ignorados.`);
      setIgnoreJidInput(""); // Limpa o input mesmo se já existir
      return;
    }

    const updatedJids = [...ignoreJids, jid];
    setValue("ignoreJids", updatedJids, { shouldValidate: true }); // Atualiza o estado do formulário e dispara validação
    setIgnoreJidInput(""); // Limpa o campo de input
  };

  const handleRemoveIgnoreJid = (jidToRemove: string) => {
    const updatedJids = ignoreJids.filter((jid) => jid !== jidToRemove);
    setValue("ignoreJids", updatedJids, { shouldValidate: true }); // Atualiza o estado do formulário e dispara validação
  };

  const handleIgnoreJidKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Previne o submit do formulário
      handleAddIgnoreJid();
    }
  };

  const onSubmit = async (data: AgentFormData) => {
    try {
      if (selectedAgentId) {
        // Atualiza agente existente
        await updateAgent(selectedAgentId, instanceName, data);
        toast.success(
          `Configurações do agente "${data.description}" atualizadas com sucesso.`
        );
      } else {
        // Cria novo agente
        await createAgent(instanceName, data);
        toast.success(
          `Agente IA adicionado com sucesso à instância "${instanceName}".`
        );
      }
      onClose(); // Fecha o modal em caso de sucesso
    } catch (error: any) {
      console.error("Erro ao salvar agente:", error);
      const errorMessage = error.response?.data?.error || error.message || "Ocorreu um erro ao salvar as configurações do agente.";
      toast.error(errorMessage);
    }
  };

  const cancelEditing = () => {
    // Opcionalmente, confirme com o usuário se o formulário tem alterações não salvas
    const isDirty = Object.keys(formState.dirtyFields).length > 0;
    if (isDirty && !window.confirm("Você tem alterações não salvas. Deseja descartar?")) {
      return;
    }
    onClose();
  };

  return (
    // Use onOpenChange para controlar a visibilidade do Dialog
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* <DialogTrigger asChild>
          {/* Seu botão ou elemento que abre o modal aqui }
          <Button variant="outline">Configurar Agente</Button>
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col"> {/* Adicionado flex e max-h para controlar a altura e rolagem */}
        <DialogHeader>
          <DialogTitle>{selectedAgentId ? "Editar Configurações do Agente" : "Conectar Novo Agente"}</DialogTitle>
          <DialogDescription>
            {selectedAgentId
              ? "Ajuste as configurações do agente existente para esta instância."
              : `Conecte um novo agente de IA à instância "${instanceName}".`}
          </DialogDescription>
        </DialogHeader>

        {isLoadingAgent ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            <span className="ml-2">Carregando configurações...</span>
          </div>
        ) : (
          // ScrollArea para o conteúdo do formulário
          <ScrollArea className="flex-grow pr-4 -mr-4"> {/* Ajuste para a barra de rolagem */}
            <div className="space-y-6 py-4"> {/* Adicionado padding interno */}
              {/* Configurações Gerais */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-[#16151D]/50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Configurações Gerais</h3>
                {/* Enabled */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enabled"
                        checked={watch('enabled')} // Use watch para componentes controlados
                        onCheckedChange={(checked) => setValue('enabled', checked)} // Use setValue
                      />
                      <Label htmlFor="enabled" className="font-normal">
                        Agente Ativo
                      </Label>
                    </div>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-6 right-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
                        Ativa ou desativa o agente para esta instância.
                      </div>
                    </div>
                  </div>
                </div>
                {/* Description */}
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    {...register("description")} // Use register
                    placeholder="Ex: Agente de Vendas, Suporte IA"
                    className="mt-1"
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>
                {/* Agent URL */}
                <div>
                  <Label htmlFor="agentUrl">URL do Agente (API) *</Label>
                  <Input
                    id="agentUrl"
                    type="url"
                    {...register("agentUrl")} // Use register
                    placeholder="Ex: https://sua-api-de-agente.com/webhook"
                    className="mt-1"
                  />
                  {errors.agentUrl && <p className="text-red-500 text-sm mt-1">{errors.agentUrl.message}</p>}
                </div>
                {/* API Key */}
                <div>
                  <Label htmlFor="apiKey">API Key *</Label>
                  <Input
                    id="apiKey"
                    type="password" // Use type password para chave sensível
                    {...register("apiKey")} // Use register
                    placeholder="Digite a API Key do seu agente"
                    className="mt-1"
                  />
                  {errors.apiKey && <p className="text-red-500 text-sm mt-1">{errors.apiKey.message}</p>}
                </div>
              </div>

              {/* Configurações de Comportamento */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-[#16151D]/50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Comportamento do Agente</h3>
                {/* Trigger Type */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="triggerType">Gatilho *</Label>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
                        Define quando o agente deve responder: "all" (sempre), "keyword" (apenas se a mensagem contiver a palavra-chave), "none" (nunca inicia, apenas continua conversas existentes).
                      </div>
                    </div>
                  </div>
                  <Select
                    value={triggerType} // Use watch
                    onValueChange={(value: "all" | "keyword" | "none") => setValue('triggerType', value, { shouldValidate: true })} // Use setValue
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tipo de gatilho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualquer Mensagem</SelectItem>
                      <SelectItem value="keyword">Palavra-Chave Específica</SelectItem>
                      <SelectItem value="none">Desativado (Apenas Continua Conversas)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.triggerType && <p className="text-red-500 text-sm mt-1">{errors.triggerType.message}</p>}
                </div>

                {/* Trigger Value (Condicional) */}
                {triggerType === "keyword" && (
                  <>
                    {/* Trigger Operator */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="triggerOperator">Operador do Gatilho *</Label>
                        <div className="group relative">
                          <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                          <div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
                            Como a palavra-chave será comparada: "contains" (contém), "equals" (igual), "startsWith" (começa com), "endsWith" (termina com), "regex" (expressão regular).
                          </div>
                        </div>
                      </div>
                      <Select
                        value={watch('triggerOperator')} // Use watch
                        onValueChange={(value: "contains" | "equals" | "startsWith" | "endsWith" | "regex") => setValue('triggerOperator', value, { shouldValidate: true })} // Use setValue
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o operador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contains">Contém</SelectItem>
                          <SelectItem value="equals">Igual</SelectItem>
                          <SelectItem value="startsWith">Começa com</SelectItem>
                          <SelectItem value="endsWith">Termina com</SelectItem>
                          <SelectItem value="regex">Regex</SelectItem> {/* Adicionado regex */}
                        </SelectContent>
                      </Select>
                      {errors.triggerOperator && <p className="text-red-500 text-sm mt-1">{errors.triggerOperator.message}</p>}
                    </div>
                    {/* Trigger Value */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="triggerValue">Valor do Gatilho *</Label>
                        <div className="group relative">
                          <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                          <div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
                            A palavra-chave ou expressão regular que ativará o agente.
                          </div>
                        </div>
                      </div>
                      <Input
                        id="triggerValue"
                        {...register("triggerValue")} // Use register
                        placeholder="Ex: ola, atendimento, ^menu$"
                        className="mt-1"
                      />
                      {errors.triggerValue && <p className="text-red-500 text-sm mt-1">{errors.triggerValue.message}</p>}
                    </div>
                  </>
                )}

                {/* Expire (Tempo de Expiração) */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="expire">Tempo de Expiração (segundos)</Label> {/* Nome do label ajustado */}
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
                        Tempo em segundos sem interação para a conversa expirar automaticamente. Use 0 para não expirar (a menos que "Manter Aberto" esteja ativo).
                      </div>
                    </div>
                  </div>
                  <Input
                    id="expire" // ID ajustado
                    type="number"
                    min="0"
                    {...register("expire", { valueAsNumber: true })} // Use register, parse como número
                    placeholder="Ex: 600 (10 minutos)"
                    className="mt-1"
                  />
                  {errors.expire && <p className="text-red-500 text-sm mt-1">{errors.expire.message}</p>}
                </div>

                {/* Keep Open */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="keepOpen"
                        checked={watch('keepOpen')} // Use watch
                        onCheckedChange={(checked) => setValue('keepOpen', checked)} // Use setValue
                      />
                      <Label htmlFor="keepOpen" className="font-normal">
                        Manter Aberto
                      </Label>
                    </div>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-6 right-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
                        Se ativo, a conversa nunca expira automaticamente, ignorando o "Tempo de Expiração".
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tempo de Debounce */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="debounceTime">Tempo de Debounce (ms)</Label> {/* Ajustado para ms */}
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
                        Aguarda este tempo em milissegundos antes de processar a última mensagem recebida para evitar múltiplas respostas seguidas.
                      </div>
                    </div>
                  </div>
                  <Input
                    id="debounceTime"
                    type="number"
                    min="0"
                    {...register("debounceTime", { valueAsNumber: true })} // Use register, parse como número
                    placeholder="Ex: 300 (0.3 segundos)"
                    className="mt-1"
                  />
                  {errors.debounceTime && <p className="text-red-500 text-sm mt-1">{errors.debounceTime.message}</p>}
                </div>

                {/* Delay Message */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="delayMessage">Delay da Mensagem Inicial (ms)</Label> {/* Adicionado "Inicial" */}
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
                        Atraso em milissegundos antes de enviar a primeira mensagem de resposta do agente após ser ativado.
                      </div>
                    </div>
                  </div>
                  <Input
                    id="delayMessage"
                    type="number"
                    min="0"
                    {...register("delayMessage", { valueAsNumber: true })} // Use register, parse como número
                    placeholder="Ex: 1000 (1 segundo)"
                    className="mt-1"
                  />
                  {errors.delayMessage && <p className="text-red-500 text-sm mt-1">{errors.delayMessage.message}</p>}
                </div>

                {/* Listening From Me */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="listeningFromMe"
                        checked={watch('listeningFromMe')} // Use watch
                        onCheckedChange={(checked) => setValue('listeningFromMe', checked)} // Use setValue
                      />
                      <Label htmlFor="listeningFromMe" className="font-normal">
                        Ouvir Minhas Mensagens
                      </Label>
                    </div>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-6 right-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
                        Se ativo, o agente também processará as mensagens enviadas por você (o dono da instância) para os contatos.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stop Bot From Me */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="stopBotFromMe"
                        checked={watch('stopBotFromMe')} // Use watch
                        onCheckedChange={(checked) => setValue('stopBotFromMe', checked)} // Use setValue
                      />
                      <Label htmlFor="stopBotFromMe" className="font-normal">
                        Parar Bot Com Minhas Mensagens
                      </Label>
                    </div>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-6 right-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
                        Se ativo, uma mensagem enviada por você (o dono da instância) para um contato em conversa com o agente encerrará a sessão do agente com aquele contato.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-[#16151D]/50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Mensagens e Respostas</h3>
                {/* Keyword Finish */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="keywordFinish">Palavra para Encerrar *</Label>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
                        Palavra ou frase que o usuário pode digitar para sair da conversa com o agente.
                      </div>
                    </div>
                  </div>
                  <Input
                    id="keywordFinish"
                    {...register("keywordFinish")} // Use register
                    placeholder="Ex: sair, tchau, encerrar"
                    className="mt-1"
                  />
                  {errors.keywordFinish && <p className="text-red-500 text-sm mt-1">{errors.keywordFinish.message}</p>}
                </div>
                {/* Unknown Message */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="unknownMessage">Mensagem Quando Não Entender *</Label>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
                        Mensagem enviada quando o agente não consegue processar ou entender a solicitação do usuário.
                      </div>
                    </div>
                  </div>
                  <Textarea
                    id="unknownMessage"
                    {...register("unknownMessage")} // Use register
                    placeholder="Desculpe, não consegui entender. Pode repetir?"
                    rows={2}
                    className="mt-1"
                  />
                  {errors.unknownMessage && <p className="text-red-500 text-sm mt-1">{errors.unknownMessage.message}</p>}
                </div>
              </div>

              {/* Divisão de Mensagens */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-[#16151D]/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="splitMessages"
                      checked={splitMessages} // Use watch
                      onCheckedChange={(checked) => setValue('splitMessages', checked)} // Use setValue
                    />
                    <Label htmlFor="splitMessages" className="font-normal">
                      Dividir Mensagens Longas
                    </Label> {/* Adicionado "Longas" */}
                  </div>
                  <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-6 right-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
                      Quebra mensagens de resposta muito longas em várias mensagens menores para melhor visualização no WhatsApp.
                    </div>
                  </div>
                </div>
                {splitMessages && ( // Renderização condicional
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor="timePerChar">
                        Velocidade de Digitação (ms por caractere)
                      </Label>
                      <div className="group relative">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        <div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
                          Simula velocidade de digitação humana adicionando um atraso proporcional ao número de caracteres. Quanto maior o número, mais devagar (0 = instantâneo).
                        </div>
                      </div>
                    </div>
                    <Input
                      id="timePerChar"
                      type="number"
                      min="0"
                      {...register("timePerChar", { valueAsNumber: true })} // Use register, parse como número
                      placeholder="Ex: 50"
                      className="mt-1"
                    />
                    {errors.timePerChar && <p className="text-red-500 text-sm mt-1">{errors.timePerChar.message}</p>}
                  </div>
                )}
              </div>

              {/* Números a Ignorar */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-[#16151D]/50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Números a Ignorar</h3>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label>Números para Ignorar</Label>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
                        Lista de números (JIDs completos, ex: 5511999999999@s.whatsapp.net ou apenas 5511999999999 dependendo da sua API) que o agente deve ignorar completamente. Digite o número e clique em Adicionar ou pressione Enter.
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={ignoreJidInput}
                      onChange={(e) => setIgnoreJidInput(e.target.value)}
                      placeholder="Digite um número... (ex: 5511999999999)"
                      onKeyPress={handleIgnoreJidKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={handleAddIgnoreJid} size="sm" type="button">
                      Adicionar
                    </Button>
                  </div>
                  {/* Exibe erro de validação para o array ignoreJids */}
                  {errors.ignoreJids && <p className="text-red-500 text-sm mt-1">{errors.ignoreJids.message}</p>}

                  {ignoreJids && ignoreJids.length > 0 && ( // Renderiza se o array existe e tem itens
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ignoreJids.map((jid) => (
                        <div
                          key={jid}
                          className="flex items-center gap-1 bg-gray-100 dark:bg-[#16151D] px-2 py-1 rounded text-sm"
                        >
                          <span>{jid}</span>
                          <Button
                            onClick={() => handleRemoveIgnoreJid(jid)}
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}


        {/* Ações do Formulário */}
        {/* Botões fora do ScrollArea, fixos na parte inferior */}
        <div className="flex justify-end gap-2 mt-auto pt-4 border-t bg-white dark:bg-[#0c0b13] sticky bottom-0">
          <Button
            onClick={cancelEditing}
            disabled={isSubmitting || isLoadingAgent} // Desabilita cancelar enquanto salva ou carrega
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)} // Usa handleSubmit do react-hook-form
            disabled={isSubmitting || isLoadingAgent || !isValid} // Desabilita enquanto salva, carrega ou formulário inválido
            className="bg-gradient-to-r from-electric-light to-electric hover:opacity-90"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {selectedAgentId ? "Atualizar" : "Conectar"} Agente
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentConfigModal;
