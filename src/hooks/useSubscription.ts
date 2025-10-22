/**
 * Subscription Hook
 * Manages subscription status and payment information
 * Following SOLID principles: Single Responsibility
 */

import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export interface SubscriptionInfo {
  userId: string;
  plan: string;
  status:
    | "ACTIVE"
    | "CANCELLED"
    | "SUSPENDED"
    | "PENDING"
    | "TRIAL"
    | "EXPIRED";
  subscriptionEndDate: string | null;
  isActive: boolean;
  daysUntilExpiration: number | null;
  hasOverduePayment: boolean;
  nextPaymentDate: string | null;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  paidAt: string | null;
  paymentMethod: string;
  pixCode?: string;
  pixQRCode?: string;
  createdAt: string;
}

interface UseSubscriptionReturn {
  subscription: SubscriptionInfo | null;
  payments: Payment[];
  loading: boolean;
  error: string | null;
  isSubscriptionValid: boolean;
  isExpiringSoon: boolean;
  daysUntilExpiration: number | null;
  refetch: () => Promise<void>;
  cancelSubscription: (reason?: string) => Promise<void>;
}

/**
 * Hook to manage user subscription and payment information
 */
export const useSubscription = (): UseSubscriptionReturn => {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null
  );
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch subscription information
   */
  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/api/subscription/me");

      if (response.data.success) {
        setSubscription(response.data.data);
      } else {
        throw new Error(
          response.data.error || "Erro ao buscar informações de assinatura"
        );
      }
    } catch (err: any) {
      console.error("Erro ao buscar assinatura:", err);
      setError(
        err.response?.data?.error || err.message || "Erro ao buscar assinatura"
      );

      // If subscription is suspended or invalid, set it
      if (err.response?.status === 403) {
        setSubscription({
          userId: "",
          plan: "free",
          status: "SUSPENDED",
          subscriptionEndDate: null,
          isActive: false,
          daysUntilExpiration: null,
          hasOverduePayment: true,
          nextPaymentDate: null,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch payment history
   */
  const fetchPayments = useCallback(async () => {
    try {
      const response = await api.get("/api/subscription/payments");

      if (response.data.success) {
        setPayments(response.data.data);
      }
    } catch (err: any) {
      console.error("Erro ao buscar pagamentos:", err);
    }
  }, []);

  /**
   * Cancel subscription
   */
  const cancelSubscription = useCallback(
    async (reason?: string) => {
      try {
        const response = await api.post("/api/subscription/cancel", { reason });

        if (response.data.success) {
          // Refetch subscription info
          await fetchSubscription();
          return response.data;
        } else {
          throw new Error(response.data.error || "Erro ao cancelar assinatura");
        }
      } catch (err: any) {
        console.error("Erro ao cancelar assinatura:", err);
        throw err;
      }
    },
    [fetchSubscription]
  );

  /**
   * Refetch all data
   */
  const refetch = useCallback(async () => {
    await Promise.all([fetchSubscription(), fetchPayments()]);
  }, [fetchSubscription, fetchPayments]);

  // Initial load
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Computed values
  const isSubscriptionValid =
    subscription?.isActive === true && subscription?.status === "ACTIVE";

  const isExpiringSoon =
    subscription?.daysUntilExpiration !== null &&
    subscription?.daysUntilExpiration <= 7 &&
    subscription?.daysUntilExpiration >= 0;

  const daysUntilExpiration = subscription?.daysUntilExpiration || null;

  return {
    subscription,
    payments,
    loading,
    error,
    isSubscriptionValid,
    isExpiringSoon,
    daysUntilExpiration,
    refetch,
    cancelSubscription,
  };
};

/**
 * Hook to check subscription status and redirect if invalid
 */
export const useSubscriptionGuard = () => {
  const { subscription, loading, isSubscriptionValid } = useSubscription();
  const [shouldBlock, setShouldBlock] = useState(false);
  const [blockReason, setBlockReason] = useState<string>("");

  useEffect(() => {
    if (loading) return;

    if (!subscription || !isSubscriptionValid) {
      setShouldBlock(true);

      let reason = "Sua assinatura está inativa";

      if (subscription?.status === "SUSPENDED") {
        reason = "Sua conta está suspensa por falta de pagamento";
      } else if (subscription?.status === "CANCELLED") {
        reason = "Sua assinatura foi cancelada";
      } else if (subscription?.status === "EXPIRED") {
        reason = "Sua assinatura expirou";
      } else if (subscription?.hasOverduePayment) {
        reason = "Você possui pagamentos pendentes";
      }

      setBlockReason(reason);
    } else {
      setShouldBlock(false);
      setBlockReason("");
    }
  }, [subscription, loading, isSubscriptionValid]);

  return {
    shouldBlock,
    blockReason,
    subscription,
    loading,
  };
};
