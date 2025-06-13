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
      // Só fechar se estiver visível
      if (visible && e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, visible]); // Adicionado visible como dependência


  // Definindo classes para o tema escuro e futurista
  const panelBgClass = "bg-gradient-to-br from-deep to-electric-dark/10"; // Fundo com gradiente sutil
  const hoverBgClass = "hover:bg-gray-700"; // Fundo hover mais escuro
  const activeBgClass = "bg-blue-600 hover:bg-electric-dark"; // Cor ativa vibrante com hover
  const textColorClass = "text-gray-300"; // Cor de texto padrão
  const activeTextColorClass = "text-white"; // Cor de texto ativo
  const accentColorClass = "text-blue-600"; // Cor de acento para ícones/elementos
  const footerBorderClass = "border-blue-700"; // Borda do rodapé
  const footerTextColorClass = "text-blue-400"; // Cor de texto do rodapé


  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.aside
          className={cn(
            "flex h-[90vh] w-72 flex-shrink-0 flex-col p-6 overflow-hidden   rounded-lg",
            panelBgClass
          )}
          initial={{ translateX: "-100%" }}
          animate={{ translateX: "0%", transition: { type: "spring", stiffness: 260, damping: 30 } }}
          exit={{ translateX: "-100%", transition: { duration: 0.2 } }}
          aria-label="Folder navigation"
        >
          {/* Header */}
          <div className={cn("flex items-center justify-between mb-6")}>
            <h2 className={cn("flex items-center text-2xl font-bold", activeTextColorClass)}>
              <FolderClosed className={cn("mr-3 h-6 w-6", accentColorClass)} aria-hidden />
              Pastas
            </h2>
            <div className="flex space-x-2">
              {/* Add Folder Button with Pulsing Effect */}
              <Button
                variant="ghost"
                aria-label="Add folder"
                onClick={onAddFolder}
                className={`relative p-2 text-gray-400 ${hoverBgClass} hover:text-green-500 transition-colors duration-300 rounded-full`} // Botão redondo
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
                className={`p-2 text-[#5D103D] ${hoverBgClass} hover:text-shock transition-colors duration-300`} // Usando a classe estática
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>


          {/* List */}
          <nav
            className={cn(
              "flex flex-col space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar" // flex-1 e overflow-y-auto garantem que a lista role internamente
            )}
            role="menu"
          >
            {/* All agents */}
            <button
              onClick={() => onSelectFolder(null)}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200",
                selectedFolderId === null
                  ? activeBgClass
                  : `${textColorClass} ${hoverBgClass}`
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
                <div key={folder.id} className="relative group">
                  <button
                    onClick={() => onSelectFolder(folder.id)}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-4 py-2 text-sm font-medium w-full transition-colors duration-200",
                      active
                        ? activeBgClass
                        : `${textColorClass} ${hoverBgClass}`
                    )}
                    role="menuitem"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden flex-1">
                      <Folder className={cn("h-5 w-5 flex-shrink-0", active ? activeTextColorClass : accentColorClass)} aria-hidden />
                      <span className="truncate">{folder.name}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Folder options"
                          className={cn(
                            "opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6",
                            active ? activeTextColorClass : "text-gray-500 hover:text-white"
                          )}
                        >
                          <CircleEllipsis className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className={cn("border border-gray-700 bg-gray-800 text-gray-300")}
                      >
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); onEditFolder(folder); }}
                          className="hover:bg-gray-700 cursor-pointer"
                        >
                          <Edit className={cn("mr-2 h-4 w-4", accentColorClass)} />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 hover:bg-gray-700 hover:text-red-400 cursor-pointer"
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
      )}
    </AnimatePresence>
  );
}
