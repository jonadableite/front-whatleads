/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/agents/forms/SubAgentsTab.tsx                                    │
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
import { Agent } from "@/types/agent";

interface SubAgentsTabProps {
  values: Partial<Agent>;
  onChange: (values: Partial<Agent>) => void;
  agents: Agent[];
  getAgentNameById: (id: string) => string;
  editingAgentId?: string;
  clientId: string;
}

export function SubAgentsTab({
  values,
  onChange,
  agents,
  getAgentNameById,
  editingAgentId,
  clientId,
}: SubAgentsTabProps) {
  const handleAddSubAgent = (agentId: string) => {
    if (!values.config?.sub_agents?.includes(agentId)) {
      onChange({
        ...values,
        config: {
          ...values.config,
          sub_agents: [...(values.config?.sub_agents || []), agentId],
        },
      });
    }
  };

  const handleRemoveSubAgent = (agentId: string) => {
    onChange({
      ...values,
      config: {
        ...values.config,
        sub_agents:
          values.config?.sub_agents?.filter((id) => id !== agentId) || [],
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Sub-Agents</h3>
        <div className="text-sm text-gray-400">
          {values.config?.sub_agents?.length || 0} subagentes selecionados
        </div>
      </div>

      <div className="border border-[#0D0C15] rounded-md p-4 bg-[#0D0C15]">
        <p className="text-sm text-gray-400 mb-4">
          Selecione os agentes que serão usados ​​como subagentes.
        </p>

        {values.config?.sub_agents && values.config.sub_agents.length > 0 ? (
          <div className="space-y-2 mb-4">
            <h4 className="text-sm font-medium text-white">
              Subagentes selecionados:
            </h4>
            <div className="flex flex-wrap gap-2">
              {values.config.sub_agents.map((agentId) => (
                <Badge
                  key={agentId}
                  variant="secondary"
                  className="flex items-center gap-1 bg-[#0D0C15] text-[#0000EE]"
                >
                  {getAgentNameById(agentId)}
                  <button
                    onClick={() => handleRemoveSubAgent(agentId)}
                    className="ml-1 h-4 w-4 rounded-full hover:bg-[#0D0C15] inline-flex items-center justify-center"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400 mb-4">
            Nenhum subagente selecionado
          </div>
        )}

        <h4 className="text-sm font-medium text-white mb-2">
          Agentes disponíveis:
        </h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {agents
            .filter((agent) => agent.id !== editingAgentId)
            .map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-2 hover:bg-[#0D0C15] rounded-md"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{agent.name}</span>
                  <Badge
                    variant="outline"
                    className="ml-2 border-[#0D0C15] text-[#0000EE]"
                  >
                    {agent.type === "llm"
                      ? "LLM Agent"
                      : agent.type === "a2a"
                        ? "A2A Agent"
                        : agent.type === "sequential"
                          ? "Sequential Agent"
                          : agent.type === "parallel"
                            ? "Parallel Agent"
                            : agent.type === "loop"
                              ? "Loop Agent"
                              : agent.type === "workflow"
                                ? "Workflow Agent"
                                : agent.type === "task"
                                  ? "Task Agent"
                                  : agent.type}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddSubAgent(agent.id)}
                  disabled={values.config?.sub_agents?.includes(agent.id)}
                  className={
                    values.config?.sub_agents?.includes(agent.id)
                      ? "text-gray-500 bg-[#16151D] hover:bg-[#222030]"
                      : "text-[#0000EE] hover:bg-[#222030] bg-[#16151D]"
                  }
                >
                  {values.config?.sub_agents?.includes(agent.id)
                    ? "Adicionado"
                    : "Adicionar"}
                </Button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
