// src/hooks/useWarmup.ts
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";
import type { InstancesResponse } from "@/types";
import type { WarmupConfig, WarmupStatus } from "@/types/warmup";

export function useWarmup() {
  // Fetch instances data
  const {
    data: instancesData,
    error: instancesError,
    mutate: mutateInstances,
    isLoading: loadingInstances,
  } = useFetch<InstancesResponse>("/api/instances");

  // Fetch warmup status with conditional revalidation (optional - may not exist yet)
  const {
    data: warmupStatus,
    error: statusError,
    mutate: mutateWarmupStatus,
    isLoading: loadingStatus,
  } = useFetch<WarmupStatus>("/api/warmup/status", {
    refreshInterval: (data) => {
      // Refresh more frequently if warmup is active to get real-time updates
      return data?.globalStatus === "active" ? 1000 : 5000;
    },
    revalidateOnFocus: true,
    dedupingInterval: 500,
    // Don't fail if endpoint doesn't exist
    shouldRetryOnError: false,
    errorRetryCount: 0,
  });

  // Mutations
  const {
    execute: startWarmup,
    loading: startingWarmup,
    error: startError,
  } = useMutation("/api/warmup/config", "POST");

  const {
    execute: stopWarmup,
    loading: stoppingWarmup,
    error: stopError,
  } = useMutation("/api/warmup/stop-all", "POST");

  // Helper functions
  const refreshData = async () => {
    await Promise.all([mutateInstances(), mutateWarmupStatus()]);
  };

  const handleStartWarmup = async (config: WarmupConfig) => {
    const result = await startWarmup(config);
    if (result) {
      // Refresh status immediately and then after a delay to ensure backend processing
      await mutateWarmupStatus();
      setTimeout(() => mutateWarmupStatus(), 2000);
      setTimeout(() => mutateWarmupStatus(), 5000);
    }
    return result;
  };

  const handleStopWarmup = async () => {
    const result = await stopWarmup({});
    if (result) {
      // Refresh status immediately and then after a delay to ensure backend processing
      await mutateWarmupStatus();
      setTimeout(() => mutateWarmupStatus(), 2000);
    }
    return result;
  };

  // Derived state
  const isWarmingUp = warmupStatus?.globalStatus === "active";
  const isLoading = loadingInstances || loadingStatus;
  // Only consider instances error as critical, warmup status is optional
  const hasError = instancesError || startError || stopError;

  // Plan-based limits
  const getMaxMessageLimit = (plan: string = "free") => {
    switch (plan) {
      case "free":
        return 20;
      case "basic":
        return 50;
      case "pro":
        return 500;
      default:
        return 1000;
    }
  };

  return {
    // Data
    instancesData,
    warmupStatus,

    // Loading states
    isLoading,
    loadingInstances,
    loadingStatus,
    startingWarmup,
    stoppingWarmup,

    // Error states
    hasError,
    instancesError,
    statusError,
    startError,
    stopError,

    // Derived state
    isWarmingUp,

    // Actions
    handleStartWarmup,
    handleStopWarmup,
    refreshData,
    mutateInstances,
    mutateWarmupStatus,

    // Utils
    getMaxMessageLimit,
  };
}
