//src/pages/AgenteIA.tsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { listMCPServers } from "@/services/mcpServerService";
import { Download, Folder, Key, Plus, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder as AgentFolder,
  ApiKey,
  assignAgentToFolder,
  createAgent,
  createApiKey,
  createFolder,
  deleteAgent,
  deleteApiKey,
  deleteFolder,
  importAgentFromJson,
  listAgents,
  listApiKeys,
  listFolders,
  shareAgent,
  updateAgent,
  updateApiKey,
  updateFolder,
} from "../services/agentService";


import { exportAsJson } from "../lib/utils";


// Importações dos componentes
import { AgentList } from "@/components/agents/AgentList";
import { AgentSidebar } from "@/components/agents/AgentSidebar";
import { ApiKeysDialog } from "@/components/agents/dialogs/ApiKeysDialog";
import { ConfirmationDialog } from "@/components/agents/dialogs/ConfirmationDialog";
import { FolderDialog } from "@/components/agents/dialogs/FolderDialog";
import { ImportAgentDialog } from "@/components/agents/dialogs/ImportAgentDialog";
import { MoveAgentDialog } from "@/components/agents/dialogs/MoveAgentDialog";
import { ShareAgentDialog } from "@/components/agents/dialogs/ShareAgentDialog";
import { EmptyState } from "@/components/agents/EmptyState";
import { AgentForm } from "@/components/agents/forms/AgentForm";
import { SearchInput } from "@/components/agents/SearchInput";


// CORRIGIDO: Importe o hook useUser
import { useUser } from "@/contexts/UserContext";


// Tipos
import { Agent, AgentCreate } from "@/types/agent";
import { availableModels } from "@/types/aiModels";
import { MCPServer } from "@/types/mcpServer";


const AgenteIA = () => {
  const { toast } = useToast();
  const navigate = useNavigate();


  // CORRIGIDO: Obtenha o user, clientId e userLoading do UserContext
  const { user, clientId, loading: userLoading } = useUser(); // Use o hook useUser


  // CORRIGIDO: Adicionando ref para rastrear montagem do componente
  const mounted = useRef(true);


  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [folders, setFolders] = useState<AgentFolder[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [availableMCPs, setAvailableMCPs] = useState<MCPServer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgentType, setSelectedAgentType] = useState<string | null>(
    null
  );
  const [agentTypes, setAgentTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Este isLoading é para as operações da página (listagem, salvar, deletar)


  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);


  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isMovingDialogOpen, setIsMovingDialogOpen] = useState(false);
  const [isDeleteAgentDialogOpen, setIsDeleteAgentDialogOpen] =
    useState(false);
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] =
    useState(false);
  const [isApiKeysDialogOpen, setIsApiKeysDialogOpen] = useState(false);
  const [isMCPDialogOpen, setIsMCPDialogOpen] = useState(false); // Estado para MCP Dialog - Parece não ser usado diretamente aqui, mas pode ser passado para sub-componentes.
  const [isCustomMCPDialogOpen, setIsCustomMCPDialogOpen] = useState(false); // Estado para Custom MCP Dialog - Parece não ser usado diretamente aqui.
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);


  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editingFolder, setEditingFolder] = useState<AgentFolder | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [agentToMove, setAgentToMove] = useState<Agent | null>(null);
  const [agentToShare, setAgentToShare] = useState<Agent | null>(null);
  const [sharedApiKey, setSharedApiKey] = useState<string>("");


  const [folderToDelete, setFolderToDelete] = useState<AgentFolder | null>(
    null
  );


  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    client_id: clientId || "",
    name: "",
    description: "",
    type: "llm",
    model: "openai/gpt-4.1-nano",
    instruction: "",
    api_key_id: "",
    config: {
      tools: [],
      mcp_servers: [],
      custom_mcp_servers: [],
      custom_tools: {
        http_tools: [],
      },
      sub_agents: [],
      agent_tools: [],
    },
  });


  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);


  useEffect(() => {
    if (!clientId) return;
    loadAgents();
    loadFolders();
    loadApiKeys();
  }, [clientId, selectedFolderId]);


  useEffect(() => {
    const loadMCPs = async () => {
      try {
        const res = await listMCPServers();
        setAvailableMCPs(res.data);
      } catch (error) {
        toast({
          title: "Error loading MCP servers",
          variant: "destructive",
        });
      }
    };


    loadMCPs();
  }, []);


  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const res = await listAgents(
        clientId,
        0,
        100,
        selectedFolderId || undefined
      );
      setAgents(res.data);
      setFilteredAgents(res.data);


      // Extract unique agent types
      const types = [...new Set(res.data.map(agent => agent.type))].filter(Boolean);
      setAgentTypes(types);
    } catch (error) {
      toast({ title: "Error loading agents", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  const loadFolders = async () => {
    setIsLoading(true);
    try {
      const res = await listFolders(clientId);
      setFolders(res.data);
    } catch (error) {
      toast({ title: "Error loading folders", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  const loadApiKeys = async () => {
    try {
      const res = await listApiKeys(clientId);
      setApiKeys(res.data);
    } catch (error) {
      toast({ title: "Error loading API keys", variant: "destructive" });
    }
  };


  useEffect(() => {
    // Apply both search term and type filters
    let filtered = [...agents];


    // Apply search term filter
    if (searchTerm.trim() !== "") {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (agent) =>
          agent.name.toLowerCase().includes(lowercaseSearch) ||
          agent.description?.toLowerCase().includes(lowercaseSearch)
      );
    }


    // Apply agent type filter
    if (selectedAgentType) {
      filtered = filtered.filter(agent => agent.type === selectedAgentType);
    }


    setFilteredAgents(filtered);
  }, [searchTerm, selectedAgentType, agents]);


  const handleAddAgent = async (agentData: Partial<Agent>) => {
    try {
      setIsLoading(true);
      if (editingAgent) {
        await updateAgent(editingAgent.id, {
          ...agentData,
          client_id: clientId,
        });
        toast({
          title: "Agent updated",
          description: `${agentData.name} was updated successfully`,
        });
      } else {
        const createdAgent = await createAgent({
          ...(agentData as AgentCreate),
          client_id: clientId,
        });


        if (selectedFolderId && createdAgent.data.id) {
          await assignAgentToFolder(
            createdAgent.data.id,
            selectedFolderId,
            clientId
          );
        }


        toast({
          title: "Agent added",
          description: `${agentData.name} was added successfully`,
        });
      }
      loadAgents();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to save agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;
    try {
      setIsLoading(true);
      await deleteAgent(agentToDelete.id);
      toast({
        title: "Agent deleted",
        description: "The agent was deleted successfully",
      });
      loadAgents();
      setAgentToDelete(null);
      setIsDeleteAgentDialogOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Unable to delete agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setNewAgent({ ...agent });
    setIsDialogOpen(true);
  };


  const handleMoveAgent = async (targetFolderId: string | null) => {
    if (!agentToMove) return;
    try {
      setIsLoading(true);
      await assignAgentToFolder(agentToMove.id, targetFolderId, clientId);
      toast({
        title: "Agent moved",
        description: targetFolderId
          ? `Agent moved to folder successfully`
          : "Agent removed from folder successfully",
      });
      setIsMovingDialogOpen(false);
      loadAgents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to move agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setAgentToMove(null);
    }
  };


  const handleAddFolder = async (folderData: {
    name: string;
    description: string;
  }) => {
    try {
      setIsLoading(true);
      if (editingFolder) {
        await updateFolder(editingFolder.id, folderData, clientId);
        toast({
          title: "Folder updated",
          description: `${folderData.name} was updated successfully`,
        });
      } else {
        await createFolder({
          ...folderData,
          client_id: clientId,
        });
        toast({
          title: "Folder created",
          description: `${folderData.name} was created successfully`,
        });
      }
      loadFolders();
      setIsFolderDialogOpen(false);
      setEditingFolder(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to save folder",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    try {
      setIsLoading(true);
      await deleteFolder(folderToDelete.id, clientId);
      toast({
        title: "Folder deleted",
        description: "The folder was deleted successfully",
      });
      loadFolders();
      if (selectedFolderId === folderToDelete.id) {
        setSelectedFolderId(null);
      }
      setFolderToDelete(null);
      setIsDeleteFolderDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to delete folder",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleShareAgent = async (agent: Agent) => {
    try {
      setIsLoading(true);
      setAgentToShare(agent);
      const response = await shareAgent(agent.id, clientId);


      if (response.data && response.data.api_key) {
        setSharedApiKey(response.data.api_key);
        setIsShareDialogOpen(true);


        toast({
          title: "Agent shared",
          description: "API key generated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to share agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const resetForm = () => {
    setNewAgent({
      client_id: clientId || "",
      name: "",
      description: "",
      type: "llm",
      model: "openai/gpt-4.1-nano",
      instruction: "",
      api_key_id: "",
      config: {
        tools: [],
        mcp_servers: [],
        custom_mcp_servers: [],
        custom_tools: {
          http_tools: [],
        },
        sub_agents: [],
        agent_tools: [],
      },
    });
    setEditingAgent(null);
  };


  // Function to export all agents as JSON
  const handleExportAllAgents = () => {
    try {
      // Create file name with current date
      const date = new Date();
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      const filename = `agents-export-${formattedDate}`;


      // Use the utility function to export
      // Pass agents both as the data and as allAgents parameter to properly resolve references
      const result = exportAsJson({ agents: filteredAgents }, filename, true, agents);


      if (result) {
        toast({
          title: "Export complete",
          description: `${filteredAgents.length} agent(s) exported to JSON`,
        });
      } else {
        throw new Error("Export failed");
      }
    } catch (error) {
      console.error("Error exporting agents:", error);


      toast({
        title: "Export failed",
        description: "There was an error exporting the agents",
        variant: "destructive",
      });
    }
  };


  const handleImportAgentJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !clientId) return;


    try {
      setIsImporting(true);


      await importAgentFromJson(file, clientId);


      toast({
        title: "Import successful",
        description: "Agent was imported successfully",
      });


      // Refresh the agent list
      loadAgents();


      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Error importing agent:", error);
      toast({
        title: "Import failed",
        description: "There was an error importing the agent",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };


  // Renderização do componente
  return (
    <div className="container mx-auto p-6 min-h-screen flex relative">
      <AgentSidebar
        visible={isSidebarVisible}
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onAddFolder={() => {
          setEditingFolder(null);
          setIsFolderDialogOpen(true);
        }}
        onEditFolder={(folder) => {
          setEditingFolder(folder as AgentFolder);
          setIsFolderDialogOpen(true);
        }}
        onDeleteFolder={(folder) => {
          setFolderToDelete(folder as AgentFolder);
          setIsDeleteFolderDialogOpen(true);
        }}
        onClose={() => setIsSidebarVisible(false)} // Altera para fechar explicitamente
      />


      {/* Conteúdo principal - flex-1 para ocupar o espaço restante */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out overflow-hidden`} // Remove pl-64/pl-0, adiciona flex-1 e overflow-hidden
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            {/* Botão para abrir a sidebar - visível apenas quando a sidebar NÃO está visível */}
            {!isSidebarVisible && (
              <button
                onClick={() => setIsSidebarVisible(true)}
                className="relative mr-2 bg-electric p-2 rounded-md text-blue-700 hover:bg-electric-dark hover:text-blue-700 shadow-md transition-all overflow-hidden" // Adicionado 'relative' e 'overflow-hidden'
                aria-label="Show folders"
              >
                {/* Radar ping */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {/* O span com animate-ping cria o efeito de pulso/radar */}
                  <span className="absolute w-5 h-5 rounded-full bg-neon-blue opacity-50 animate-ping"></span>
                </span>
                {/* O ícone da pasta deve ter um z-index maior que o ping para ficar por cima */}
                <Folder className="h-6 w-6 relative z-10 hover:scale-110 transition-transform duration-200" />
              </button>
            )}
            <h1 className="text-3xl font-bold text-white flex items-center ml-2">
              {selectedFolderId
                ? folders.find((f) => f.id === selectedFolderId)?.name
                : "Agents"}
            </h1>
          </div>


          <div className="flex items-center gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search agents..."
              selectedAgentType={selectedAgentType}
              onAgentTypeChange={setSelectedAgentType}
              agentTypes={agentTypes}
            />


            <Button
              onClick={() => setIsApiKeysDialogOpen(true)}
              className="bg-electric text-white hover:bg-electric-dark border border-electric"
            >
              <Key className="mr-2 h-4 w-4 text-blue-700" />
              API Keys
            </Button>


            <Button
              onClick={handleExportAllAgents}
              className="bg-electric text-white hover:bg-electric-dark border border-electric"
              title="Export all agents as JSON"
            >
              <Download className="mr-2 h-4 w-4 text-purple-400" />
              Export All
            </Button>


            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-neon-green text-white hover:bg-neon-green/50">
                  <Plus className="mr-2 h-4 w-4 text-neon-green" />
                  Novo agente
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-electric/40 border-electric">
                <DropdownMenuItem
                  className="text-white hover:bg-blue-950 cursor-pointer"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2 text-blue-700" />
                  Novo agente
                </DropdownMenuItem>
                {/* Adicionando o botão Import Agent JSON */}
                <DropdownMenuItem
                  className=" text-white hover:bg-blue-950 cursor-pointer"
                  onClick={() => setIsImportDialogOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-2 text-indigo-400" />
                  Import Agent JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>


        {/* CORRIGIDO: Adicione um loader ou mensagem enquanto o clientId está carregando */}
        {isLoading || userLoading || !clientId ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bluetext-blue-700"></div>
          </div>
        ) : filteredAgents.length > 0 ? (
          <AgentList
            agents={filteredAgents}
            isLoading={isLoading} // Passa o estado de loading
            searchTerm={searchTerm}
            selectedFolderId={selectedFolderId}
            availableMCPs={availableMCPs}
            getApiKeyNameById={(id) =>
              apiKeys.find((k) => k.id === id)?.name || null
            }
            getAgentNameById={(id) => agents.find((a) => a.id === id)?.name || id} // Usa a lista completa 'agents'
            onEdit={handleEditAgent}
            onDelete={(agent) => {
              setAgentToDelete(agent);
              setIsDeleteAgentDialogOpen(true);
            }}
            onMove={(agent) => {
              setAgentToMove(agent);
              setIsMovingDialogOpen(true);
            }}
            onShare={handleShareAgent}
            onClearSearch={() => {
              setSearchTerm("");
              setSelectedAgentType(null);
            }}
            onCreateAgent={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            onWorkflow={(agentId) => {
              navigate(`/agents/workflows?agentId=${agentId}`);
            }}
            apiKeys={apiKeys} // Passando as apiKeys para o AgentList
            folders={folders}
          />
        ) : (
          <EmptyState
            type={
              searchTerm || selectedAgentType
                ? "search-no-results"
                : selectedFolderId
                  ? "empty-folder"
                  : "no-agents"
            }
            searchTerm={searchTerm}
            onAction={() => {
              searchTerm || selectedAgentType
                ? (setSearchTerm(""), setSelectedAgentType(null))
                : (resetForm(), setIsDialogOpen(true));
            }}
            actionLabel={searchTerm || selectedAgentType ? "Clear filters" : "Create Agent"}
          />
        )}
      </div>


      {/* Dialogs */}
      {/* Certifique-se de passar o clientId correto para os dialogs/forms */}
      <AgentForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialValues={editingAgent || newAgent} // Use editingAgent se estiver editando
        apiKeys={apiKeys} // Passando as apiKeys para o AgentForm
        availableModels={availableModels}
        availableMCPs={availableMCPs}
        agents={agents} // Passa a lista completa de agentes para sub-agentes etc.
        onOpenApiKeysDialog={() => setIsApiKeysDialogOpen(true)}
        onOpenMCPDialog={() => setIsMCPDialogOpen(true)} // Mantido, embora não usado diretamente
        onOpenCustomMCPDialog={() => setIsCustomMCPDialogOpen(true)} // Mantido, embora não usado diretamente
        onSave={handleAddAgent}
        getAgentNameById={(id) => agents.find((a) => a.id === id)?.name || id}
        clientId={clientId} // Passe o clientId do contexto
      />


      <FolderDialog
        open={isFolderDialogOpen}
        onOpenChange={setIsFolderDialogOpen}
        editingFolder={editingFolder}
        onSave={handleAddFolder}
      />


      <MoveAgentDialog
        open={isMovingDialogOpen}
        onOpenChange={setIsMovingDialogOpen}
        agent={agentToMove}
        folders={folders}
        onMove={handleMoveAgent} // Passa a função handleMoveAgent
      />


      <ConfirmationDialog
        open={isDeleteAgentDialogOpen}
        onOpenChange={setIsDeleteAgentDialogOpen}
        title="Confirm deletion"
        description={`Are you sure you want to delete the agent "${agentToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteAgent} // Passa a função handleDeleteAgent
      />


      <ConfirmationDialog
        open={isDeleteFolderDialogOpen}
        onOpenChange={setIsDeleteFolderDialogOpen}
        title="Confirm deletion"
        description={`Are you sure you want to delete the folder "${folderToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleDeleteFolder}
      />


      <ApiKeysDialog
        open={isApiKeysDialogOpen}
        onOpenChange={setIsApiKeysDialogOpen}
        apiKeys={apiKeys} // Passando as apiKeys para o ApiKeysDialog
        isLoading={isLoading} // Pode ser útil passar um estado de loading específico para as keys se necessário
        onAddApiKey={async (keyData) => {
          if (!clientId) {
            toast({
              title: "Error",
              description: "Client ID not available.",
              variant: "destructive",
            });
            return;
          }
          console.log("Tentando adicionar nova API Key:", keyData); // Log antes de adicionar
          try {
            await createApiKey({ ...keyData, client_id: clientId });
            loadApiKeys();
            toast({
              title: "API Key added",
              description: "API Key created successfully",
            });
          } catch (error) {
            console.error("Error adding API key:", error); // Adicionar log detalhado
            toast({
              title: "Error",
              description: "Unable to add API Key",
              variant: "destructive",
            });
          }
        }}
        onUpdateApiKey={async (id, keyData) => {
          if (!clientId) {
            toast({
              title: "Error",
              description: "Client ID not available.",
              variant: "destructive",
            });
            return;
          }
          console.log("Tentando atualizar API Key:", id, keyData); // Log antes de atualizar
          try {
            await updateApiKey(id, keyData, clientId);
            loadApiKeys();
            toast({
              title: "API Key updated",
              description: "API Key updated successfully",
            });
          } catch (error) {
            console.error("Error updating API key:", error); // Adicionar log detalhado
            toast({
              title: "Error",
              description: "Unable to update API Key",
              variant: "destructive",
            });
          }
        }}
        onDeleteApiKey={async (id) => {
          if (!clientId) {
            toast({
              title: "Error",
              description: "Client ID not available.",
              variant: "destructive",
            });
            return;
          }
          console.log("Tentando deletar API Key:", id); // Log antes de deletar
          try {
            await deleteApiKey(id, clientId);
            loadApiKeys();
            toast({
              title: "API Key deleted",
              description: "API Key deleted successfully",
            });
          } catch (error) {
            console.error("Error deleting API key:", error); // Adicionar log detalhado
            toast({
              title: "Error",
              description: "Unable to delete API Key",
              variant: "destructive",
            });
          }
        }}
      />


      <ShareAgentDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        agent={agentToShare || ({} as Agent)} // Garante que um objeto vazio seja passado se agentToShare for null
        apiKey={sharedApiKey}
      />


      <ImportAgentDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onSuccess={loadAgents} // Recarrega agentes após importação bem sucedida
        clientId={clientId}
        folderId={selectedFolderId}
        onImport={handleImportAgentJSON} // Passa a função de importação
      />
    </div>
  );
};


export default AgenteIA;
