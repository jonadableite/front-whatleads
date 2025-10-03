
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiKey } from "@/services/agentService";
import { Plus, Maximize2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ModelOption {
  value: string;
  label: string;
  provider: string;
}

interface LLMAgentConfigProps {
  apiKeys: ApiKey[];
  availableModels: ModelOption[];
  values: {
    model?: string;
    api_key_id?: string;
    instruction?: string;
    role?: string;
    goal?: string;
  };
  onChange: (values: any) => void;
  onOpenApiKeysDialog: () => void;
}

export function LLMAgentConfig({
  apiKeys,
  availableModels,
  values,
  onChange,
  onOpenApiKeysDialog,
}: LLMAgentConfigProps) {
  const [instructionText, setInstructionText] = useState(values.instruction || "");
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
  const [expandedInstructionText, setExpandedInstructionText] = useState("");

  // Debug logs para verificar os dados
  console.log("LLMAgentConfig - availableModels:", availableModels);
  console.log("LLMAgentConfig - availableModels length:", availableModels?.length);
  console.log("LLMAgentConfig - apiKeys:", apiKeys);
  console.log("LLMAgentConfig - values:", values);

  useEffect(() => {
    setInstructionText(values.instruction || "");
  }, [values.instruction]);

  const handleInstructionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInstructionText(newValue);

    onChange({
      ...values,
      instruction: newValue,
    });
  };

  const handleExpandInstruction = () => {
    setExpandedInstructionText(instructionText);
    setIsInstructionModalOpen(true);
  };

  const handleSaveExpandedInstruction = () => {
    setInstructionText(expandedInstructionText);
    onChange({
      ...values,
      instruction: expandedInstructionText,
    });
    setIsInstructionModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="role" className="text-right text-gray-300">
          Função
        </Label>
        <div className="col-span-3">
          <Input
            id="role"
            value={values.role || ""}
            onChange={(e) =>
              onChange({
                ...values,
                role: e.target.value,
              })
            }
            placeholder="Ex: Assistente de Pesquisa, Suporte ao Cliente, etc."
            className="bg-[#16151D] border-[#0D0C15] text-white"
          />
          <div className="mt-1 text-xs text-gray-400">
            <span className="inline-block h-3 w-3 mr-1">ℹ️</span>
            <span>Defina a função ou persona que o agente irá assumir</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="goal" className="text-right text-gray-300">
          Objetivo
        </Label>
        <div className="col-span-3">
          <Input
            id="goal"
            value={values.goal || ""}
            onChange={(e) =>
              onChange({
                ...values,
                goal: e.target.value,
              })
            }
            placeholder="Ex: Encontrar e organizar informações, Auxiliar clientes com dúvidas, etc."
            className="bg-[#16151D] border-[#0D0C15] text-white"
          />
          <div className="mt-1 text-xs text-gray-400">
            <span className="inline-block h-3 w-3 mr-1">ℹ️</span>
            <span>Defina o objetivo ou propósito principal deste agente</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="api_key" className="text-right text-gray-300">
          API Key
        </Label>
        <div className="col-span-3 space-y-4">
          <div className="flex items-center">
            <Select
              value={values.api_key_id || ""}
              onValueChange={(value) =>
                onChange({
                  ...values,
                  api_key_id: value,
                })
              }
            >
              <SelectTrigger className="flex-1 bg-[#16151D] border-[#0D0C15] text-white">
                <SelectValue placeholder="Selecione uma chave de API" />
              </SelectTrigger>
              <SelectContent className="bg-[#16151D] border-[#0D0C15] text-white">
                {apiKeys.length > 0 ? (
                  apiKeys
                    .filter((key) => key.is_active !== false)
                    .map((key) => (
                      <SelectItem
                        key={key.id}
                        value={key.id}
                        className="data-[selected]:bg-[#0D0C15] data-[highlighted]:bg-[#0D0C15] !text-white focus:!text-white hover:text-[#8234b2] data-[selected]:!text-[#8234b2]"
                      >
                        <div className="flex items-center">
                          <span>{key.name}</span>
                          <Badge className="ml-2 bg-[#0D0C15] text-[#8234b2] text-xs">
                            {key.provider}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                ) : (
                  <div className="text-gray-500 px-2 py-1.5 pl-8">
                    Nenhuma chave de API disponível
                  </div>
                )}
              </SelectContent>
            </Select>

            <Button
              onClick={onOpenApiKeysDialog}
              variant="outline"
              size="sm"
              className="ml-2 bg-[#16151D] border-[#0D0C15] text-gray-300 hover:bg-[#0D0C15] hover:text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {apiKeys.length === 0 && (
            <div className="flex items-center text-xs text-gray-400">
              <span className="inline-block h-3 w-3 mr-1 text-gray-400">i</span>
              <span>
                Você precisa{" "}
                <Button
                  variant="link"
                  onClick={onOpenApiKeysDialog}
                  className="h-auto p-0 text-xs text-[#8234b2]"
                >
                  registrar chaves de API
                </Button>{" "}
                antes de criar um agente.
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="model" className="text-right text-gray-300">
          Modelo
        </Label>
        <Select
          value={values.model || ""}
          onValueChange={(value) =>
            onChange({
              ...values,
              model: value,
            })
          }
        >
          <SelectTrigger className="col-span-3 bg-[#16151D] border-[#0D0C15] text-white">
            <SelectValue placeholder="Selecione o modelo" />
          </SelectTrigger>
          <SelectContent className="bg-[#16151D] border-[#0D0C15] text-white max-h-60 overflow-y-auto">
            {availableModels && availableModels.length > 0 ? (
              availableModels
                .filter((modelo) => {
                  if (!values.api_key_id) {
                    return false;
                  }
                  const selectedKey = apiKeys.find(key => key.id === values.api_key_id);
                  if (!selectedKey) {
                    return false;
                  }
                  // Comparação case-insensitive entre providers
                  return modelo.provider.toLowerCase() === selectedKey.provider.toLowerCase();
                })
                .map((model) => (
                  <SelectItem
                    key={model.value}
                    value={model.value}
                    className="data-[selected]:bg-[#0D0C15] data-[highlighted]:bg-[#0D0C15] !text-white focus:!text-white hover:text-[#8234b2] data-[selected]:!text-[#8234b2] cursor-pointer py-3"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">{model.label}</span>
                      <span className="text-xs text-gray-400 mt-0.5">{model.provider}</span>
                    </div>
                  </SelectItem>
                ))
            ) : (
              <div className="text-gray-500 px-2 py-1.5">
                Nenhum modelo disponível
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="instruction" className="text-right text-gray-300">
          Instruções
        </Label>
        <div className="col-span-3">
          <div className="relative">
            <Textarea
              id="instruction"
              value={instructionText}
              onChange={handleInstructionChange}
              className="w-full bg-[#16151D] border-[#0D0C15] text-white pr-10"
              rows={4}
              onClick={handleExpandInstruction}
            />
            <button
              type="button"
              className="absolute top-3 right-5 text-gray-400 hover:text-[#8234b2] focus:outline-none"
              onClick={handleExpandInstruction}
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            <span className="inline-block h-3 w-3 mr-1">ℹ️</span>
            <span>
              Personagens como {"{"} e {"}"} ou {"{{"} e {"}}"} são escapados automaticamente para evitar erros em Python.
              <span className="ml-2 text-[#8234b2]">Clique para expandir o editor.</span>
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Instruction Modal */}
      <Dialog open={isInstructionModalOpen} onOpenChange={setIsInstructionModalOpen}>
        <DialogContent className="sm:max-w-[1200px] max-h-[90vh] bg-[#1a1a1a] border-[#0D0C15] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white">Instruções do agente</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col min-h-[60vh]">
            <Textarea
              value={expandedInstructionText}
              onChange={(e) => setExpandedInstructionText(e.target.value)}
              className="flex-1 min-h-full bg-[#16151D] border-[#0D0C15] text-white p-4 focus:border-[#8234b2] focus:ring-[#8234b2] focus:ring-opacity-50 resize-none"
              placeholder="Digite instruções detalhadas para o agente..."
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInstructionModalOpen(false)}
              className="bg-[#16151D] border-[#0D0C15] text-gray-300 hover:bg-[#0D0C15] hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveExpandedInstruction}
              className="bg-[#8234b2] text-black hover:bg-[#242238]"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar instruções
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
