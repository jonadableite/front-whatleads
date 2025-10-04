import api from "@/lib/api";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ProgressData {
  progress: number;
  status: string | null;
  numbersProcessed: number;
  totalNumbers: number;
  error: string | null;
  instanceName: string | null;
}

export const useCampaignProgress = (campaignId: string) => {
  const [data, setData] = useState<ProgressData>({
    progress: 0,
    status: null,
    numbersProcessed: 0,
    totalNumbers: 0,
    error: null,
    instanceName: null,
  });
  const [isPolling, setIsPolling] = useState<boolean>(true);

  useEffect(() => {
    if (!campaignId) return;

    const fetchProgress = async () => {
      try {
        const response = await api.get(`/api/campaigns/${campaignId}/progress`);

        if (response.data.success) {
          const { progress, status, statistics, instanceName } =
            response.data.data;

          setData({
            progress,
            status,
            numbersProcessed: statistics.sentCount,
            totalNumbers: statistics.totalLeads,
            error: null,
            instanceName,
          });

          if (["completed", "failed"].includes(status)) {
            setIsPolling(false);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar progresso:", error);
        setData((prev) => ({
          ...prev,
          error: "Erro ao atualizar progresso",
        }));
      }
    };

    const intervalId = setInterval(fetchProgress, 2000);
    fetchProgress();

    return () => {
      clearInterval(intervalId);
      setIsPolling(false);
    };
  }, [campaignId]);

  const handlePause = async () => {
    try {
      await api.post(`/api/campaigns/${campaignId}/pause`);
      toast.success("Campanha pausada com sucesso");
      setIsPolling(false);
    } catch (error) {
      console.error("Erro ao pausar campanha:", error);
      toast.error("Erro ao pausar campanha");
    }
  };

  const handleResume = async (instanceName: string) => {
    try {
      await api.post(`/api/campaigns/${campaignId}/resume`, { instanceName });
      toast.success("Campanha retomada com sucesso");
      setIsPolling(true);
    } catch (error) {
      console.error("Erro ao retomar campanha:", error);
      toast.error("Erro ao retomar campanha");
    }
  };

  const handleCancel = async () => {
    try {
      await api.post(`/api/campaigns/${campaignId}/stop`);
      toast.success("Campanha cancelada com sucesso");
      setIsPolling(false);
    } catch (error) {
      console.error("Erro ao cancelar campanha:", error);
      toast.error("Erro ao cancelar campanha");
    }
  };

  return {
    progress: data.progress,
    status: data.status,
    numbersProcessed: data.numbersProcessed,
    totalNumbers: data.totalNumbers,
    error: data.error,
    instanceName: data.instanceName,
    isPolling,
    handlePause,
    handleResume,
    handleCancel,
  };
};
