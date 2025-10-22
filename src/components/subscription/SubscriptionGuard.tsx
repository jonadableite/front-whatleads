/**
 * Subscription Guard Component
 * Blocks access to protected routes if subscription is invalid
 * Following SOLID principles: Single Responsibility
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSubscriptionGuard } from '../../hooks/useSubscription';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, CreditCard, Lock } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

/**
 * Component that guards routes requiring active subscription
 */
export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { shouldBlock, blockReason, subscription, loading } = useSubscriptionGuard();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If subscription is valid, render children
  if (!shouldBlock) {
    return <>{children}</>;
  }

  // If subscription is invalid, show blocking screen
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Lock className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Acesso Bloqueado</CardTitle>
          <CardDescription>{blockReason}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {subscription && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Status da Assinatura</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-1 text-sm">
                  <p><strong>Plano:</strong> {subscription.plan.toUpperCase()}</p>
                  <p><strong>Status:</strong> {subscription.status}</p>
                  {subscription.subscriptionEndDate && (
                    <p>
                      <strong>Expirou em:</strong>{' '}
                      {new Date(subscription.subscriptionEndDate).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  {subscription.hasOverduePayment && (
                    <p className="text-red-600 font-semibold">
                      Você possui pagamentos em atraso
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Para continuar usando a plataforma, você precisa regularizar sua assinatura.
            </p>

            <Button
              className="w-full"
              onClick={() => window.location.href = '/billing'}
              size="lg"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Ver Pagamentos
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/pricing'}
            >
              Ver Planos
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            Precisa de ajuda?{' '}
            <a href="/support" className="text-primary hover:underline">
              Entre em contato
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Component to show subscription warning (expiring soon)
 */
export const SubscriptionWarning: React.FC = () => {
  const { subscription, isExpiringSoon, daysUntilExpiration } = useSubscriptionGuard();

  if (!isExpiringSoon || !subscription) {
    return null;
  }

  return (
    <Alert variant="warning" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Assinatura Expirando</AlertTitle>
      <AlertDescription>
        <div className="flex items-center justify-between">
          <span>
            Sua assinatura expira em {daysUntilExpiration} dia(s).
            Renove agora para continuar usando todos os recursos.
          </span>
          <Button
            size="sm"
            onClick={() => window.location.href = '/billing'}
          >
            Renovar
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SubscriptionGuard;

