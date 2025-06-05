/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/agents/config/SequentialAgentConfig.tsx                          │
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
import { Agent } from "@/types/agent";
import { ArrowRight } from "lucide-react";

interface SequentialAgentConfigProps {
  values: {
    config?: {
      sub_agents?: string[];
      max_iterations?: number;
      custom_mcp_servers?: any[];
    };
  };
  onChange: (values: any) => void;
  agents: Agent[];
  getAgentNameById: (id: string) => string;
}

export function SequentialAgentConfig({
  values,
  onChange,
  agents,
  getAgentNameById,
}: SequentialAgentConfigProps) {
  const handleMaxIterationsChange = (value: string) => {
    const maxIterations = parseInt(value);
    onChange({
      ...values,
      config: {
        ...values.config,
        max_iterations: isNaN(maxIterations) ? undefined : maxIterations,
      },
    });
  };

  return (
    <div className="space-y-6">

      <div className="border border-[#16151D] rounded-md p-4 bg-[#16151D]">
        <h3 className="text-sm font-medium text-white mb-4">
          Ordem de Execução de Agentes
        </h3>

        {values.config?.sub_agents && values.config.sub_agents.length > 0 ? (
          <div className="space-y-3">
            {values.config.sub_agents.map((agentId, index) => (
              <div
                key={agentId}
                className="flex items-center space-x-2 bg-[#16151D] p-3 rounded-md"
              >
                <div className="flex-1">
                  <div className="font-medium text-white">
                    {getAgentNameById(agentId)}
                  </div>
                  <div className="text-sm text-gray-400">
                    Executed on{" "}
                    <Badge className="bg-[#16151D] text-[#8234b3] border-none">
                      Position {index + 1}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            Adicione agentes na aba “Subagentes” para definir a ordem de execução
          </div>
        )}

        <div className="mt-3 text-sm text-gray-400">
          <p>
            Os agentes serão executados sequencialmente na ordem listada acima.
            A saída de cada agente será fornecida como entrada para o próximo
            agente na sequência.
          </p>
        </div>
      </div>
    </div>
  );
}
