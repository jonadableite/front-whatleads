// src/components/agents/dialogs/ApiKeysDialog.tsx

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiKey } from "@/services/agentService"; // Verifique o caminho correto
import { availableModelProviders } from "@/types/aiModels"; // Verifique o caminho correto
import { Edit, Eye, EyeOff, Key, Plus, Trash2, X } from "lucide-react"; // Ou a biblioteca de ícones que você usa
import { useEffect, useState } from "react";
import { ConfirmationDialog } from "./ConfirmationDialog"; // Verifique o caminho correto

interface ApiKeysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKeys: ApiKey[];
  isLoading: boolean;
  onAddApiKey: (apiKey: {
    name: string;
    provider: string;
    key_value: string;
  }) => Promise<void>;
  onUpdateApiKey: (
    id: string,
    apiKey: {
      name: string;
      provider: string;
      key_value?: string; // key_value é opcional na atualização
      is_active: boolean;
    }
  ) => Promise<void>;
  onDeleteApiKey: (id: string) => Promise<void>;
}

export function ApiKeysDialog({
  open,
  onOpenChange,
  apiKeys,
  isLoading,
  onAddApiKey,
  onUpdateApiKey,
  onDeleteApiKey,
}: ApiKeysDialogProps) {
  const [isAddingApiKey, setIsAddingApiKey] = useState(false);
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState<
    Partial<ApiKey & { key_value?: string }>
  >({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [apiKeyToDelete, setApiKeyToDelete] = useState<ApiKey | null>(null);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  // Reset states when the dialog is closed
  useEffect(() => {
    if (!open) {
      setIsAddingApiKey(false);
      setIsEditingApiKey(false);
      setCurrentApiKey({});
      setIsDeleteDialogOpen(false);
      setApiKeyToDelete(null);
      setIsApiKeyVisible(false);
    }
  }, [open]);


  const handleAddClick = () => {
    setCurrentApiKey({ is_active: true }); // Default to active for new keys
    setIsAddingApiKey(true);
    setIsEditingApiKey(false);
    setIsApiKeyVisible(false); // Hide key value initially
  };

  const handleEditClick = (apiKey: ApiKey) => {
    // Note: We don't load the key_value here for security reasons.
    // The user will leave it blank to keep the old one or enter a new one.
    // Include existing active status
    setCurrentApiKey({ ...apiKey, key_value: "", is_active: apiKey.is_active });
    setIsAddingApiKey(true);
    setIsEditingApiKey(true);
    setIsApiKeyVisible(false); // Hide key value initially
  };

  const handleDeleteClick = (apiKey: ApiKey) => {
    setApiKeyToDelete(apiKey);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleActive = async (apiKey: ApiKey) => {
    try {
      // Pass the current name and provider, and toggle the active status
      await onUpdateApiKey(apiKey.id, {
        name: apiKey.name,
        provider: apiKey.provider,
        is_active: !apiKey.is_active, // Toggle the active status
      });
    } catch (error) {
      console.error("Error toggling API key status:", error);
      // Optionally show a toast or other feedback
    }
  };


  const handleSaveApiKey = async () => {
    // Basic validation
    if (
      !currentApiKey.name ||
      !currentApiKey.provider ||
      (!isEditingApiKey && !currentApiKey.key_value) // Key value is required only for adding
    ) {
      // Optionally show a validation message to the user
      console.warn("Missing required fields");
      return;
    }

    try {
      if (currentApiKey.id) {
        // Update existing key
        await onUpdateApiKey(currentApiKey.id, {
          name: currentApiKey.name,
          provider: currentApiKey.provider,
          // Only send key_value if it was entered (not empty string)
          ...(currentApiKey.key_value !== "" && { key_value: currentApiKey.key_value }),
          // Ensure is_active is a boolean, default to true if undefined (for new keys before saving)
          is_active: currentApiKey.is_active !== false,
        });
      } else {
        // Add new key
        await onAddApiKey({
          name: currentApiKey.name,
          provider: currentApiKey.provider,
          key_value: currentApiKey.key_value!, // key_value is guaranteed by validation above
        });
      }

      // Reset form states
      setCurrentApiKey({});
      setIsAddingApiKey(false);
      setIsEditingApiKey(false);
      setIsApiKeyVisible(false); // Hide key value after saving

    } catch (error) {
      console.error("Error saving API key:", error);
      // Optionally show an error message to the user
    }
  };

  const handleDeleteConfirm = async () => {
    if (!apiKeyToDelete) return;
    try {
      await onDeleteApiKey(apiKeyToDelete.id);
      setApiKeyToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting API key:", error);
      // Optionally show an error message to the user
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col bg-[#0c0b13] border-[#0c0b13]">
        <DialogHeader>
          <DialogTitle className="text-white">Gerenciar chaves de API</DialogTitle>
          <DialogDescription className="text-gray-400">
            Adicione e gerencie chaves de API para uso em seus agentes
          </DialogDescription>
        </DialogHeader>

        {/* Container principal que controla o scroll e o preenchimento do espaço disponível */}
        {/* Adicionada chave única para o container principal da renderização condicional */}
        {/* Este div contém o conteúdo que muda (formulário ou lista) */}
        <div key={isAddingApiKey ? "api-form-container" : "api-list-container"} className="flex-1 overflow-auto p-1">
          {isAddingApiKey ? (
            // Adicionada chave única para o formulário de adicionar/editar
            <div key="add-edit-form" className="space-y-4 p-4 bg-[#0c0b13] rounded-md">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">
                  {isEditingApiKey ? "Edit Key" : "New Key"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingApiKey(false);
                    setIsEditingApiKey(false);
                    setCurrentApiKey({});
                    setIsApiKeyVisible(false); // Esconder a chave ao cancelar
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-gray-300">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={currentApiKey.name || ""}
                    onChange={(e) =>
                      setCurrentApiKey({
                        ...currentApiKey,
                        name: e.target.value,
                      })
                    }
                    className="col-span-3 bg-[#0c0b13] border-[#444] text-white"
                    placeholder="OpenAI GPT-4"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="provider"
                    className="text-right text-gray-300"
                  >
                    Provider
                  </Label>
                  <Select
                    value={currentApiKey.provider}
                    onValueChange={(value) =>
                      setCurrentApiKey({
                        ...currentApiKey,
                        provider: value,
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3 bg-[#0c0b13] border-[#444] text-white">
                      <SelectValue placeholder="Select Provider" />
                    </SelectTrigger>
                    {/* Adicionada classe para garantir que o SelectContent apareça acima de outros elementos se necessário */}
                    <SelectContent className="bg-[#222] border-[#444] text-white z-[999]">
                      {availableModelProviders.map((provider) => (
                        <SelectItem
                          key={provider.value} // Chave única para cada item do select
                          value={provider.value}
                          className="data-[selected]:bg-[#0c0b13] data-[highlighted]:bg-[#0c0b13] !text-white focus:!text-white hover:text-[#CB39C1] data-[selected]:!text-[#CB39C1]"
                        >
                          {provider.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="key_value"
                    className="text-right text-gray-300"
                  >
                    Key Value
                  </Label>
                  <div className="col-span-3 relative">
                    <Input
                      id="key_value"
                      value={currentApiKey.key_value || ""}
                      onChange={(e) =>
                        setCurrentApiKey({
                          ...currentApiKey,
                          key_value: e.target.value,
                        })
                      }
                      className="bg-[#0c0b13] border-[#444] text-white pr-10"
                      type={isApiKeyVisible ? "text" : "password"}
                      placeholder={
                        isEditingApiKey
                          ? "Leave blank to keep the current value"
                          : "sk-..."
                      }
                    />
                    {/* Botão para mostrar/esconder a chave */}
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button" // Importante para não submeter o form
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:text-white"
                      onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                    >
                      {isApiKeyVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {isEditingApiKey && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="is_active"
                      className="text-right text-gray-300"
                    >
                      Status
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Checkbox
                        id="is_active"
                        checked={currentApiKey.is_active !== false} // Treat undefined as true for new keys, ensure boolean for existing
                        onCheckedChange={(checked) =>
                          setCurrentApiKey({
                            ...currentApiKey,
                            is_active: !!checked, // Ensure boolean value
                          })
                        }
                        className="mr-2 data-[state=checked]:bg-[#CB39C1] data-[state=checked]:border-[#CB39C1]"
                      />
                      <Label htmlFor="is_active" className="text-gray-300">
                        Active
                      </Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer para os botões do formulário */}
              {/* Adicionada chave única para o footer do formulário */}
              <DialogFooter key="form-footer" className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingApiKey(false);
                    setIsEditingApiKey(false);
                    setCurrentApiKey({});
                    setIsApiKeyVisible(false); // Esconder a chave ao cancelar
                  }}
                  className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#0c0b13] hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveApiKey}
                  className="bg-[#CB39C1] text-black hover:bg-[#00cc7d]"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full mr-1"></div>
                  )}
                  {isEditingApiKey ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            // Container para a lista ou estado vazio, com chave única
            <div key="api-key-list-content"> {/* Chave única para este bloco */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">
                  Available Keys
                </h3>
                <Button
                  onClick={handleAddClick}
                  className="bg-[#CB39C1] text-black hover:bg-[#00cc7d]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Key
                </Button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#CB39C1]"></div>
                </div>
              ) : apiKeys.length > 0 ? (
                <div className="space-y-2">
                  {apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id} // Chave única para cada item da lista (essencial!)
                      className="flex items-center justify-between p-3 bg-[#222] rounded-md border border-[#0c0b13] hover:border-[#CB39C1]/30"
                    >
                      <div>
                        <p className="font-medium text-white">{apiKey.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="bg-[#0c0b13] text-[#CB39C1] border-[#CB39C1]/30"
                          >
                            {apiKey.provider.toUpperCase()}
                          </Badge>
                          <p className="text-xs text-gray-400">
                            Created on{" "}
                            {new Date(apiKey.created_at).toLocaleDateString()}
                          </p>
                          {/* Badge para status ativo/inativo */}
                          <Badge
                            variant="outline"
                            className={`bg-[#0c0b13] ${apiKey.is_active ? 'text-emerald-400 border-emerald-400/30' : 'text-red-400 border-red-400/30'}`}
                          >
                            {apiKey.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {/* Botão para alternar status ativo/inativo */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(apiKey)}
                          title={apiKey.is_active ? "Deactivate Key" : "Activate Key"}
                          className="text-gray-300 hover:text-[#CB39C1] hover:bg-[#0c0b13]"
                          disabled={isLoading} // Desabilitar enquanto carrega
                        >
                          {apiKey.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(apiKey)}
                          className="text-gray-300 hover:text-[#CB39C1] hover:bg-[#0c0b13]"
                          disabled={isLoading} // Desabilitar enquanto carrega
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(apiKey)}
                          className="text-red-500 hover:text-red-400 hover:bg-[#0c0b13]"
                          disabled={isLoading} // Desabilitar enquanto carrega
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-[#0c0b13] rounded-md bg-[#222] text-gray-400">
                  <Key className="mx-auto h-10 w-10 text-gray-500 mb-3" />
                  <p>You don't have any API keys registered</p>
                  <p className="text-sm mt-1">
                    Add your API keys to use them in your agents
                  </p>
                  <Button
                    onClick={handleAddClick}
                    className="mt-4 bg-[#0c0b13] text-[#CB39C1] hover:bg-[#444]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Key
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer geral para o botão Close quando não estiver no formulário */}
        {/* Adicionada chave única para o footer de fechar */}
        {/* Renderizado condicionalmente para não ter dois footers ao mesmo tempo */}
        {!isAddingApiKey && (
          <DialogFooter key="close-footer" className="border-t border-[#0c0b13] pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#0c0b13] hover:text-white"
            >
              Close
            </Button>
          </DialogFooter>
        )}


        {/* Confirmation Dialog para exclusão */}
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Confirm Delete"
          description={`Are you sure you want to delete the key "${apiKeyToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="destructive"
          onConfirm={handleDeleteConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
