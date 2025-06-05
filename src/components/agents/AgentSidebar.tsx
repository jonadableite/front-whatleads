// src/components/agents/AgentSidebar.tsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  CircleEllipsis,
  Edit,
  Folder,
  FolderClosed,
  FolderPlus,
  Home,
  Trash2,
  X,
} from "lucide-react";
import { useEffect } from "react";

interface AgentFolder {
  id: string;
  name: string;
  description?: string;
}

interface AgentSidebarProps {
  visible: boolean;
  folders: AgentFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onAddFolder: () => void;
  onEditFolder: (folder: AgentFolder) => void;
  onDeleteFolder: (folder: AgentFolder) => void;
  onClose: () => void;
}

export function AgentSidebar({
  visible,
  folders,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  onEditFolder,
  onDeleteFolder,
  onClose,
}: AgentSidebarProps) {
  // Close on Esc
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Definindo classes estáticas para substituir as variáveis de tema não definidas
  // Ajuste essas classes conforme o esquema de cores real do seu projeto
  const panelBgClass = "bg-gray-900"; // Fundo do painel (sidebar)
  const hoverBgClass = "hover:bg-gray-700"; // Fundo ao passar o mouse sobre itens
  const textColorClass = "text-gray-300"; // Cor do texto padrão
  const footerBorderClass = "border-gray-700"; // Cor da borda no rodapé
  const footerTextColorClass = "text-gray-400"; // Cor do texto no rodapé

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-30 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          {/* Sidebar panel */}
          <motion.aside
            className={cn(
              "fixed top-0 left-0 z-40 flex h-full w-72 flex-col p-6 shadow-2xl",
              panelBgClass // Usando a classe estática
            )}
            initial={{ x: -280 }}
            animate={{ x: 0, transition: { type: "spring", stiffness: 260, damping: 30 } }}
            exit={{ x: -280, transition: { duration: 0.2 } }}
            aria-label="Folder navigation"
          >
            {/* Header */}
            <div className={cn("flex items-center justify-between mb-6")}> {/* Removido bgColor, pois o fundo já é definido no aside */}
              <h2 className="flex items-center text-2xl font-bold">
                <FolderClosed className="mr-3 h-6 w-6 text-[#9238c7]" aria-hidden />
                Pastas
              </h2>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  aria-label="Add folder"
                  onClick={onAddFolder}
                  className={`relative p-2 ${hoverBgClass} text-gray-400 hover:text-green-500 transition-colors duration-300`} // Usando a classe estática
                >
                  {/* Radar ping */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="absolute w-5 h-5 rounded-full bg-green-500 opacity-50 animate-ping"></span>
                  </span>
                  {/* Ícone da pasta com efeito de hover */}
                  <FolderPlus className="h-6 w-6 relative z-10 hover:scale-110 transition-transform duration-200" />
                </Button>
                <Button
                  variant="ghost"
                  aria-label="Close sidebar"
                  onClick={onClose}
                  className={`p-2 text-[#5D103D] ${hoverBgClass} hover:text-[#CB39C1]`} // Usando a classe estática
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
            {/* List */}
            <nav
              className={cn(
                "flex flex-col space-y-2 flex-1 overflow-y-auto pr-2" // Removido bgColor
              )}
              role="menu"
            >
              {/* All agents */}
              <button
                onClick={() => onSelectFolder(null)}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  selectedFolderId === null
                    ? "bg-[#9238c7] text-white"
                    : `${textColorClass} ${hoverBgClass}` // Usando classes estáticas
                )}
                role="menuitem"
              >
                <Home className="h-5 w-5" aria-hidden />
                <span>Todos os agentes</span>
              </button>
              {/* Folders */}
              {folders.map((folder) => {
                const active = folder.id === selectedFolderId;
                return (
                  <div key={folder.id} className="relative group"> {/* `key` já está presente aqui */}
                    <button
                      onClick={() => onSelectFolder(folder.id)}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-4 py-2 text-sm font-medium w-full transition-colors",
                        active
                          ? "bg-[#9238c7] text-white"
                          : `${textColorClass} ${hoverBgClass}` // Usando classes estáticas
                      )}
                      role="menuitem"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <Folder className="h-5 w-5 flex-shrink-0" aria-hidden />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Folder options"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <CircleEllipsis className="h-5 w-5 text-gray-500 hover:text-white" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className={cn("border border-transparent", panelBgClass)} // Usando a classe estática
                        >
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); onEditFolder(folder); }}
                          >
                            <Edit className="mr-2 h-4 w-4 text-[#9238c7]" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500 hover:text-red-400"
                            onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder); }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </button>
                  </div>
                );
              })}
            </nav>
            {/* Footer */}
            <div className={cn(
              "mt-6 pt-4 border-t text-xs p-2",
              footerBorderClass, // Usando a classe estática
              footerTextColorClass // Usando a classe estática
            )}>
              <p>WhatLead</p>
              <p className="mt-1">© {new Date().getFullYear()}</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
