/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/agents/config/LLMAgentConfig.tsx                                 │
│ Developed by: Davidson Gomes                                                 │
│ Creation date: May 13, 2025                                                  │
│ Contact: contato@evolution-api.com                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ @copyright © Evolution API 2025. All rights reserved.                        │
│ Licensed under the Apache License, Version 2.0                               │
│                                                                              │
│ You may not use this file except in compliance with the License.             │
│ You may obtain a copy of the License at                                      │
│                                                                              │
│    http://www.apache.org/licenses/LICENSE-2.0                                │
│                                                                              │
│ Unless required by applicable law or agreed to in writing, software          │
│ distributed under the License is distributed on an "AS IS" BASIS,            │
│ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.     │
│ See the License for the specific language governing permissions and          │
│ limitations under the License.                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ @important                                                                   │
│ For any future changes to the code in this file, it is recommended to        │
│ include, together with the modification, the information of the developer    │
│ who changed it and the date of modification.                                 │
└──────────────────────────────────────────────────────────────────────────────┘
*/
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
          Role
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
            placeholder="Ex: Research Assistant, Customer Support, etc."
            className="bg-[#16151D] border-[#0D0C15] text-white"
          />
          <div className="mt-1 text-xs text-gray-400">
            <span className="inline-block h-3 w-3 mr-1">ℹ️</span>
            <span>Define the role or persona that the agent will assume</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="goal" className="text-right text-gray-300">
          Goal
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
            placeholder="Ex: Find and organize information, Assist customers with inquiries, etc."
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
                <SelectValue placeholder="Select an API key" />
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
              variant="ghost"
              size="sm"
              onClick={onOpenApiKeysDialog}
              className="ml-2 bg-[#16151D] text-[#8234b2] hover:bg-[#0D0C15]"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {apiKeys.length === 0 && (
            <div className="flex items-center text-xs text-gray-400">
              <span className="inline-block h-3 w-3 mr-1 text-gray-400">i</span>
              <span>
                You need to{" "}
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
          Model
        </Label>
        <Select
          value={values.model}
          onValueChange={(value) =>
            onChange({
              ...values,
              model: value,
            })
          }
        >
          <SelectTrigger className="col-span-3 bg-[#16151D] border-[#0D0C15] text-white">
            <SelectValue placeholder="Select the model" />
          </SelectTrigger>
          <SelectContent className="bg-[#16151D] border-[#0D0C15] text-white p-0">
            <div className="sticky top-0 z-10 p-2 bg-[#16151D] border-b border-[#0D0C15]">
              <Input
                placeholder="Search models..."
                className="bg-[#0D0C15] border-[#0D0C15] text-white h-8"
                onChange={(e) => {
                  const searchQuery = e.target.value.toLowerCase();
                  const items = document.querySelectorAll('[data-model-item="true"]');
                  items.forEach((item) => {
                    const text = item.textContent?.toLowerCase() || '';
                    if (text.includes(searchQuery)) {
                      (item as HTMLElement).style.display = 'flex';
                    } else {
                      (item as HTMLElement).style.display = 'none';
                    }
                  });
                }}
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto py-1">
              {availableModels
                .filter((model) => {
                  if (!values.api_key_id) return true;

                  const selectedKey = apiKeys.find(
                    (key) => key.id === values.api_key_id
                  );

                  if (!selectedKey) return true;

                  return model.provider === selectedKey.provider;
                })
                .map((model) => (
                  <SelectItem
                    key={model.value}
                    value={model.value}
                    className="data-[selected]:bg-[#0D0C15] data-[highlighted]:bg-[#0D0C15] !text-white focus:!text-white hover:text-[#8234b2] data-[selected]:!text-[#8234b2]"
                    data-model-item="true"
                  >
                    {model.label}
                  </SelectItem>
                ))}
            </div>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="instruction" className="text-right text-gray-300">
          Instructions
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
              placeholder="Enter detailed instructions for the agent..."
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInstructionModalOpen(false)}
              className="bg-[#16151D] border-[#0D0C15] text-gray-300 hover:bg-[#0D0C15] hover:text-white"
            >
              Cancel
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
