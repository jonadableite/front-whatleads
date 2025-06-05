/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/agents/EmptyState.tsx                                            │
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

import { Button } from "@/components/ui/button";
import { Folder, Plus, Search, Server } from "lucide-react";

interface EmptyStateProps {
  type: "no-agents" | "empty-folder" | "search-no-results";
  searchTerm?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({
  type,
  searchTerm = "",
  onAction,
  actionLabel = "Create Agent",
}: EmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case "empty-folder":
        return <Folder className="h-16 w-16 text-[#e978e0]" />;
      case "search-no-results":
        return <Search className="h-16 w-16 text-[#e978e0]" />;
      case "no-agents":
      default:
        return <Server className="h-16 w-16 text-[#e978e0]" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "empty-folder":
        return "Pasta vazia";
      case "search-no-results":
        return "Nenhum agente encontrado";
      case "no-agents":
      default:
        return "Nenhum agente encontrado";
    }
  };

  const getMessage = () => {
    switch (type) {
      case "empty-folder":
        return "Esta pasta está vazia. Adicione agentes ou crie um novo.";
      case "search-no-results":
        return `Não encontramos nenhum agente que corresponda à sua busca: "${searchTerm}"`;
      case "no-agents":
      default:
        return "Você não tem nenhum agente configurado. Crie seu primeiro agente para começar!";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="mb-6 p-8 rounded-full bg-[#16151D] border border-[#16151D]">
        {getIcon()}
      </div>
      <h2 className="text-2xl font-semibold text-white mb-3">{getTitle()}</h2>
      <p className="text-gray-300 mb-6 max-w-md">{getMessage()}</p>
      {onAction && (
        <Button
          onClick={onAction}
          className={
            type === "search-no-results"
              ? "bg-[#16151D] text-white hover:bg-[#16151D]"
              : "bg-[#e978e0] text-black hover:bg-[#201933] px-6 py-2 hover:shadow-[0_0_15px_rgb(129, 81, 232)]"
          }
        >
          {type === "search-no-results" ? null : (
            <Plus className="mr-2 h-5 w-5" />
          )}
          {type === "search-no-results" ? "Clear search" : actionLabel}
        </Button>
      )}
    </div>
  );
}
