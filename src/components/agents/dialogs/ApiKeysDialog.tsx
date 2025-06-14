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
import { ApiKey } from "@/services/agentService";
import { availableModelProviders } from "@/types/aiModels";
import { Edit, Eye, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { ConfirmationDialog } from "./ConfirmationDialog";

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
      key_value?: string;
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

  const handleAddClick = () => {
    setCurrentApiKey({});
    setIsAddingApiKey(true);
    setIsEditingApiKey(false);
  };

  const handleEditClick = (apiKey: ApiKey) => {
    setCurrentApiKey({ ...apiKey, key_value: "" });
    setIsAddingApiKey(true);
    setIsEditingApiKey(true);
  };

  const handleDeleteClick = (apiKey: ApiKey) => {
    setApiKeyToDelete(apiKey);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveApiKey = async () => {
    if (
      !currentApiKey.name ||
      !currentApiKey.provider ||
      (!isEditingApiKey && !currentApiKey.key_value)
    ) {
      return;
    }

    try {
      if (currentApiKey.id) {
        await onUpdateApiKey(currentApiKey.id, {
          name: currentApiKey.name,
          provider: currentApiKey.provider,
          key_value: currentApiKey.key_value,
          is_active: currentApiKey.is_active !== false,
        });
      } else {
        await onAddApiKey({
          name: currentApiKey.name,
          provider: currentApiKey.provider,
          key_value: currentApiKey.key_value!,
        });
      }

      setCurrentApiKey({});
      setIsAddingApiKey(false);
      setIsEditingApiKey(false);
    } catch (error) {
      console.error("Error saving API key:", error);
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col bg-gray-100 border-gray-300"> {/* Changed background and border */}
        <DialogHeader>
          <DialogTitle className="text-gray-900">Manage API Keys</DialogTitle> {/* Changed text color */}
          <DialogDescription className="text-gray-600"> {/* Changed text color */}
            Add and manage API keys for use in your agents
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-1">
          {isAddingApiKey ? (
            <div className="space-y-4 p-4 bg-white rounded-md shadow"> {/* Changed background and added shadow */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900"> {/* Changed text color */}
                  {isEditingApiKey ? "Edit Key" : "New Key"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingApiKey(false);
                    setIsEditingApiKey(false);
                    setCurrentApiKey({});
                  }}
                  className="text-gray-500 hover:text-gray-700" // Changed text colors
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-gray-700"> {/* Changed text color */}
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
                    className="col-span-3 bg-white border-gray-300 text-gray-900" // Changed background, border, text
                    placeholder="OpenAI GPT-4"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="provider"
                    className="text-right text-gray-700" // Changed text color
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
                    <SelectTrigger className="col-span-3 bg-white border-gray-300 text-gray-900"> {/* Changed background, border, text */}
                      <SelectValue placeholder="Select Provider" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300 text-gray-900"> {/* Changed background, border, text */}
                      {availableModelProviders.map((provider) => (
                        <SelectItem
                          key={provider.value}
                          value={provider.value}
                          className="data-[selected]:bg-blue-100 data-[highlighted]:bg-blue-50 !text-gray-900 focus:!text-gray-900 hover:text-blue-600 data-[selected]:!text-blue-600" // Changed hover/selected colors
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
                    className="text-right text-gray-700" // Changed text color
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
                      className="bg-white border-gray-300 text-gray-900 pr-10" // Changed background, border, text
                      type={isApiKeyVisible ? "text" : "password"}
                      placeholder={
                        isEditingApiKey
                          ? "Leave blank to keep the current value"
                          : "sk-..."
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-gray-500 hover:text-gray-700" // Changed text colors
                      onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {isEditingApiKey && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="is_active"
                      className="text-right text-gray-700" // Changed text color
                    >
                      Status
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Checkbox
                        id="is_active"
                        checked={currentApiKey.is_active !== false}
                        onCheckedChange={(checked) =>
                          setCurrentApiKey({
                            ...currentApiKey,
                            is_active: !!checked,
                          })
                        }
                        className="mr-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" // Changed checked color
                      />
                      <Label htmlFor="is_active" className="text-gray-700"> {/* Changed text color */}
                        Active
                      </Label>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingApiKey(false);
                    setIsEditingApiKey(false);
                    setCurrentApiKey({});
                  }}
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900" // Changed button colors
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveApiKey}
                  className="bg-blue-600 text-white hover:bg-blue-700" // Changed button colors
                  disabled={isLoading}
                >
                  {isLoading && (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                  )}
                  {isEditingApiKey ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900"> {/* Changed text color */}
                  Available Keys
                </h3>
                <Button
                  onClick={handleAddClick}
                  className="bg-blue-600 text-white hover:bg-blue-700" // Changed button colors
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Key
                </Button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div> {/* Changed spinner color */}
                </div>
              ) : apiKeys.length > 0 ? (
                <div className="space-y-2">
                  {apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-300 hover:border-blue-600/30" // Changed background, border, hover border
                    >
                      <div>
                        <p className="font-medium text-gray-900">{apiKey.name}</p> {/* Changed text color */}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-blue-600 border-blue-600/30" // Changed badge colors
                          >
                            {apiKey.provider.toUpperCase()}
                          </Badge>
                          <p className="text-xs text-gray-600"> {/* Changed text color */}
                            Created on{" "}
                            {new Date(apiKey.created_at).toLocaleDateString()}
                          </p>
                          {!apiKey.is_active && (
                            <Badge
                              variant="outline"
                              className="bg-red-100 text-red-600 border-red-600/30" // Example inactive badge color
                            >
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(apiKey)}
                          className="text-gray-500 hover:text-blue-600" // Changed text colors
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(apiKey)}
                          className="text-gray-500 hover:text-red-600" // Changed text colors
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600"> {/* Changed text color */}
                  No API keys added yet. Click "New Key" to add one.
                </p>
              )}
            </>
          )}
        </div>


        <DialogFooter className="border-t border-[#333] pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-[#222] border-[#444] text-neutral-300 hover:bg-[#333] hover:text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Confirm Delete"
        description={`Are you sure you want to delete the key "${apiKeyToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </Dialog>
  );
}
