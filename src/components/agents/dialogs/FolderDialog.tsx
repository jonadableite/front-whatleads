//src/components/agents/dialogs/FolderDialog.tsx

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

interface Folder {
  id: string;
  name: string;
  description: string;
}

interface FolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (folder: { name: string; description: string }) => Promise<void>;
  editingFolder: Folder | null;
  isLoading?: boolean;
}

export function FolderDialog({
  open,
  onOpenChange,
  onSave,
  editingFolder,
  isLoading = false,
}: FolderDialogProps) {
  const [folder, setFolder] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (editingFolder) {
      setFolder({
        name: editingFolder.name,
        description: editingFolder.description,
      });
    } else {
      setFolder({ name: "", description: "" });
    }
  }, [editingFolder, open]);

  const handleSave = async () => {
    await onSave(folder);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl border bg-deep text-blue-900 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {editingFolder ? "Editar pasta" : "Nova pasta"}
          </DialogTitle>
          <DialogDescription className="text-grbg-gray-600/15-electext-blue-900">
            {editingFolder
              ? "Atualize as informações da pasta existente."
              : "Preencha os campos abaixo para criar uma nova pasta."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Nome da pasta</Label>
            <Input
              id="folder-name"
              placeholder="Ex: Projetos de IA"
              value={folder.name}
              onChange={(e) => setFolder({ ...folder, name: e.target.value })}
              className="bg-gray-600/15 text-white-pure placeholder:text-grbg-gray-600/15-electext-blue-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder-description">Descrição (opcional)</Label>
            <Textarea
              id="folder-description"
              placeholder="Adicione uma descrição curta sobre esta pasta..."
              value={folder.description}
              onChange={(e) => setFolder({ ...folder, description: e.target.value })}
              className="bg-gray-600/15 text-white resize-none h-24 placeholder:text-grbg-gray-600/15-electext-blue-900"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto bg-shock/30 text-white hover:bg-shock/60 hover:text-white/80 border-rounded-md border-shock/50 hover:border-shock/60"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!folder.name || isLoading}
            className="w-full sm:w-auto bg-electric text-white hover:bg-blue-500 hover:text-white"
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-shock-light border-t-transparent rounded-full mr-2"></div>
            ) : null}
            {editingFolder ? "Salvar alterações" : "Criar pasta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}