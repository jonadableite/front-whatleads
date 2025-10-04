// src/services/instance.service.ts
import { Instancia } from "../types/index";

export const calculateWarmupProgress = (instance: Instancia) => {
  // Se não tiver warmupStats, retorna 0
  if (!instance.warmupStats || instance.warmupStats.length === 0) {
    return 0;
  }

  // Ordenar os warmupStats por data para garantir o último
  const sortedWarmupStats = [...instance.warmupStats].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const latestWarmupStat = sortedWarmupStats[0];
  
  // Usar 400 horas como o backend para consistência
  // warmupTime está em segundos, então convertemos para o cálculo
  const warmupTimeInSeconds = latestWarmupStat.warmupTime || 0;
  const TOTAL_WARMUP_SECONDS = 400 * 3600; // 400 horas em segundos (igual ao backend)
  
  const progress = typeof warmupTimeInSeconds === "number" && warmupTimeInSeconds > 0
    ? Math.min((warmupTimeInSeconds / TOTAL_WARMUP_SECONDS) * 100, 100)
    : 0;

  return progress;
};
