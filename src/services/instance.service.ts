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
  
  // Usar o mesmo cálculo da página Home.tsx do front-warmup
  // 480 horas = 20 dias de warmup total
  // warmupTime está em segundos, então convertemos para o cálculo
  const warmupTimeInSeconds = latestWarmupStat.warmupTime || 0;
  const TOTAL_WARMUP_SECONDS = 480 * 3600; // 480 horas em segundos
  
  const progress = typeof warmupTimeInSeconds === "number" && warmupTimeInSeconds > 0
    ? Math.min((warmupTimeInSeconds / TOTAL_WARMUP_SECONDS) * 100, 100)
    : 0;

  console.log(`Warmup Progress for ${instance.instanceName}:`, {
    progress: `${progress.toFixed(2)}%`,
    warmupTimeInSeconds,
    warmupTimeInMinutes: `${(warmupTimeInSeconds / 60).toFixed(2)} minutos`,
  });

  return progress;
};
