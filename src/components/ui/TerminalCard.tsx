import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { FlickeringGrid } from "./flickering-grid";
import { cn } from "@/lib/utils";

// Interface para as propriedades do TerminalCard seguindo princípios SOLID
interface TerminalCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  description: string;
  className?: string;
  iconColor?: string;
  gridColor?: string;
  gridOpacity?: number;
  animationVariants?: {
    hidden: { opacity: number; y: number };
    visible: { opacity: number; y: number };
  };
}

// Interface para configurações do grid terminal
interface TerminalGridConfig {
  squareSize: number;
  gridGap: number;
  flickerChance: number;
  maxOpacity: number;
  color: string;
}

// Configuração padrão do grid terminal
const DEFAULT_GRID_CONFIG: TerminalGridConfig = {
  squareSize: 3,
  gridGap: 4,
  flickerChance: 0.2,
  maxOpacity: 0.15,
  color: "#3279fc", // cor azul principal
};

// Variantes de animação padrão
const DEFAULT_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * TerminalCard Component
 * 
 * Componente de card com fundo terminal animado seguindo princípios SOLID:
 * - Single Responsibility: Responsável apenas por renderizar um card com estatísticas
 * - Open/Closed: Extensível através de props sem modificar o código base
 * - Liskov Substitution: Pode ser usado em qualquer lugar que espere um card
 * - Interface Segregation: Interface específica e focada
 * - Dependency Inversion: Depende de abstrações (props) não de implementações concretas
 */
export const TerminalCard: React.FC<TerminalCardProps> = ({
  icon: Icon,
  title,
  value,
  description,
  className,
  iconColor = "text-electric",
  gridColor = DEFAULT_GRID_CONFIG.color,
  gridOpacity = DEFAULT_GRID_CONFIG.maxOpacity,
  animationVariants = DEFAULT_ANIMATION_VARIANTS,
}) => {
  // Configuração do grid personalizada baseada nas props
  const gridConfig: TerminalGridConfig = {
    ...DEFAULT_GRID_CONFIG,
    color: gridColor,
    maxOpacity: gridOpacity,
  };

  return (
    <motion.div
      variants={animationVariants}
      className={cn(
        "relative overflow-hidden rounded-xl border border-electric/30 shadow-lg hover:shadow-electric/20 transition-all duration-300 group",
        className
      )}
    >
      {/* Fundo terminal animado */}
      <div className="absolute inset-0 bg-deep/90 backdrop-blur-xl">
        <FlickeringGrid
          squareSize={gridConfig.squareSize}
          gridGap={gridConfig.gridGap}
          flickerChance={gridConfig.flickerChance}
          color={gridConfig.color}
          maxOpacity={gridConfig.maxOpacity}
          className="w-full h-full opacity-60 group-hover:opacity-80 transition-opacity duration-300"
        />
      </div>

      {/* Overlay gradient para melhor legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-br from-deep/80 via-deep/60 to-deep/80" />

      {/* Conteúdo do card */}
      <div className="relative z-10 p-6">
        {/* Header com ícone e indicador de tempo */}
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-2 bg-electric/10 rounded-lg border border-electric/20 group-hover:bg-electric/20 transition-colors duration-300",
            "shadow-[0_0_10px_rgb(50, 121, 252,0.1)] group-hover:shadow-[0_0_15px_rgb(50, 121, 252,0.2)]"
          )}>
            <Icon className={cn("w-6 h-6", iconColor)} />
          </div>
          <span className="text-sm text-white/60 font-mono">24h</span>
        </div>

        {/* Valor principal */}
        <h3 className="text-2xl font-bold text-white mb-1 font-mono tracking-wider">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>

        {/* Título */}
        <p className="text-sm text-white/80 font-medium mb-1">{title}</p>

        {/* Descrição */}
        <p className="text-xs text-white/50 leading-relaxed">{description}</p>

        {/* Borda inferior animada */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-electric to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Efeito de brilho no hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-electric/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
};

// Hook personalizado para configurações de cards de estatísticas
export const useTerminalCardConfig = () => {
  const getCardConfig = (type: 'total' | 'delivered' | 'read' | 'pending' | 'failed') => {
    const configs = {
      total: {
        iconColor: "text-electric",
        gridColor: "#3279fc", // cor azul principal
        gridOpacity: 0.15,
      },
      delivered: {
        iconColor: "text-neon-green",
        gridColor: "rgb(34, 197, 94)", // green
        gridOpacity: 0.12,
      },
      read: {
        iconColor: "text-blue-400",
        gridColor: "rgb(59, 130, 246)", // blue
        gridOpacity: 0.12,
      },
      pending: {
        iconColor: "text-yellow-400",
        gridColor: "rgb(245, 158, 11)", // yellow
        gridOpacity: 0.12,
      },
      failed: {
        iconColor: "text-red-400",
        gridColor: "rgb(239, 68, 68)", // red
        gridOpacity: 0.12,
      },
    };

    return configs[type];
  };

  return { getCardConfig };
};

export default TerminalCard;