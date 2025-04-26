// src/services/instance.service.ts
import { Instancia } from "../types/index";

export const calculateWarmupProgress = (instance: Instancia) => {
  // Se não tiver warmupStats, retorna 0
  if (!instance.warmupStats || instance.warmupStats.length === 0) {
    return 0;
  }

  // Parâmetros de configuração de warmup
  const TOTAL_WARMUP_HOURS = 1728; // 72 dias
  const TOTAL_WARMUP_MILLISECONDS = TOTAL_WARMUP_HOURS * 60 * 60 * 1000;

  // Ordenar os warmupStats por data para garantir o último
  const sortedWarmupStats = [...instance.warmupStats].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const latestWarmupStat = sortedWarmupStats[0];
  const startWarmupTime = new Date(latestWarmupStat.createdAt).getTime();
  const currentTime = Date.now();

  // Calcular tempo decorrido
  const elapsedTime = currentTime - startWarmupTime;

  // Calcular progresso percentual
  const progress = Math.min(
    100,
    Math.max(0, (elapsedTime / TOTAL_WARMUP_MILLISECONDS) * 100)
  );

  console.log(`Warmup Progress for ${instance.instanceName}:`, {
    progress: `${progress.toFixed(2)}%`,
    elapsedTime: `${(elapsedTime / (60 * 60 * 1000)).toFixed(2)} horas`,
  });

  return progress;
};
