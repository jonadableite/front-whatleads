//app/agents/forms/BasicInfoTab.tsx

import { AgentTypeSelector } from "@/components/agents/AgentTypeSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sanitizeAgentName } from "@/lib/utils";
import { ApiKey } from "@/services/agentService";
import { Agent, AgentType } from "@/types/agent";
import { LLMAgentConfig } from "../config/LLMAgentConfig";

interface ModelOption {
  value: string;
  label: string;
  provider: string;
}

interface BasicInfoTabProps {
  values: Partial<Agent>;
  onChange: (values: Partial<Agent>) => void;
  apiKeys: ApiKey[];
  availableModels: ModelOption[];
  onOpenApiKeysDialog: () => void;
  clientId: string;
}

export function BasicInfoTab({
  values,
  onChange,
  apiKeys,
  availableModels,
  onOpenApiKeysDialog,
}: BasicInfoTabProps) {
  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const sanitizedName = sanitizeAgentName(e.target.value);
    if (sanitizedName !== e.target.value) {
      onChange({ ...values, name: sanitizedName });
    }
  };

  const handleTypeChange = (type: AgentType) => {
    let newValues: Partial<Agent> = { ...values, type };

    if (type === "llm") {
      newValues = {
        ...newValues,
        model: "openai/gpt-4.1-nano",
        instruction: "",
        role: "",
        goal: "",
        agent_card_url: undefined,
        config: {
          tools: [],
          mcp_servers: [],
          custom_mcp_servers: [],
          custom_tools: {
            http_tools: [],
          },
          sub_agents: [],
        },
      };
    } else if (type === "a2a") {
      newValues = {
        ...newValues,
        model: undefined,
        instruction: undefined,
        role: undefined,
        goal: undefined,
        agent_card_url: "",
        api_key_id: undefined,
        config: undefined,
      };
    } else if (type === "loop") {
      newValues = {
        ...newValues,
        model: undefined,
        instruction: undefined,
        role: undefined,
        goal: undefined,
        agent_card_url: undefined,
        api_key_id: undefined,
        config: {
          sub_agents: [],
          custom_mcp_servers: [],
        },
      };
    } else if (type === "workflow") {
      newValues = {
        ...newValues,
        model: undefined,
        instruction: undefined,
        role: undefined,
        goal: undefined,
        agent_card_url: undefined,
        api_key_id: undefined,
        config: {
          sub_agents: [],
          workflow: {
            nodes: [],
            edges: [],
          },
        },
      };
    } else if (type === "task") {
      newValues = {
        ...newValues,
        model: undefined,
        instruction: undefined,
        role: undefined,
        goal: undefined,
        agent_card_url: undefined,
        api_key_id: undefined,
        config: {
          tasks: [],
          sub_agents: [],
        },
      };
    } else {
      newValues = {
        ...newValues,
        model: undefined,
        instruction: undefined,
        role: undefined,
        goal: undefined,
        agent_card_url: undefined,
        api_key_id: undefined,
        config: {
          sub_agents: [],
          custom_mcp_servers: [],
        },
      };
    }

    onChange(newValues);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="type" className="text-right text-gray-300">
          Tipo de agente
        </Label>
        <div className="col-span-3">
          <AgentTypeSelector
            value={values.type || "llm"}
            onValueChange={handleTypeChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right text-gray-300">
          Name
        </Label>
        <Input
          id="name"
          value={values.name || ""}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          onBlur={handleNameBlur}
          className="col-span-3 bg-[#16151D] border-[#0D0C15] text-white"
        />
      </div>

      {values.type !== "a2a" && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right text-gray-300">
            Descrição
          </Label>
          <Input
            id="description"
            value={values.description || ""}
            onChange={(e) =>
              onChange({ ...values, description: e.target.value })
            }
            className="col-span-3 bg-[#16151D] border-[#0D0C15] text-white"
          />
        </div>
      )}

      {values.type === "llm" && (
        <LLMAgentConfig
          apiKeys={apiKeys}
          availableModels={availableModels}
          values={values}
          onChange={onChange}
          onOpenApiKeysDialog={onOpenApiKeysDialog}
        />
      )}

      {values.type === "loop" && values.config?.max_iterations && (
        <div className="space-y-1 text-xs text-gray-400">
          <div>
            <strong>Max. Iterations:</strong> {values.config.max_iterations}
          </div>
        </div>
      )}

      {values.type === "workflow" && (
        <div className="space-y-1 text-xs text-gray-400">
          <div>
            <strong>Type:</strong> Visual Flow
          </div>
          {values.config?.workflow && (
            <div>
              <strong>Elements:</strong>{" "}
              {values.config.workflow.nodes?.length || 0} nodes,{" "}
              {values.config.workflow.edges?.length || 0} connections
            </div>
          )}
        </div>
      )}
    </div>
  );
}
