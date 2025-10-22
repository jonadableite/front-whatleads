/**
 * Billing Page - Consistent with Dashboard Design
 * Following WhatLead platform design system
 */

import React, { useState } from 'react';
import { useSubscription, Payment } from '../hooks/useSubscription';
import { Button } from '../components/ui/button';
import { TerminalCard, useTerminalCardConfig } from '../components/ui/TerminalCard';
import {
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  QrCode,
  TrendingUp,
  Calendar,
  DollarSign,
  Shield,
  Star,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

// Animações consistentes com o Dashboard
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const Billing: React.FC = () => {
  const { subscription, payments, loading, isExpiringSoon, refetch } = useSubscription();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [pixDialogOpen, setPixDialogOpen] = useState(false);
  const { getCardConfig } = useTerminalCardConfig();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-neon-green bg-neon-green/20';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'overdue':
        return 'text-red-500 bg-red-500/20';
      case 'cancelled':
        return 'text-white/60 bg-white/10';
      default:
        return 'text-electric bg-electric/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Pago';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Vencido';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-neon-green/20 text-neon-green border-neon-green/30';
      case 'SUSPENDED': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'CANCELLED': return 'bg-white/20 text-white/60 border-white/30';
      case 'EXPIRED': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'TRIAL': return 'bg-electric/20 text-electric border-electric/30';
      default: return 'bg-white/20 text-white/60 border-white/30';
    }
  };

  const getSubscriptionStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Ativa';
      case 'SUSPENDED': return 'Suspensa';
      case 'CANCELLED': return 'Cancelada';
      case 'EXPIRED': return 'Expirada';
      case 'PENDING': return 'Pendente';
      case 'TRIAL': return 'Trial';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);
  };

  const copyPixCode = async (pixCode: string) => {
    try {
      await navigator.clipboard.writeText(pixCode);
      alert('✅ Código Pix copiado com sucesso!');
    } catch (error) {
      alert('❌ Erro ao copiar código Pix');
    }
  };

  const openPixDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setPixDialogOpen(true);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep to-neon-purple/10 p-8 flex items-center justify-center">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <RefreshCw className="w-8 h-8 text-electric" />
        </motion.div>
      </div>
    );
  }

  // Stats Cards usando TerminalCard igual ao Dashboard
  const stats = [
    {
      title: "Plano Atual",
      icon: Star,
      value: subscription?.plan.toUpperCase() || 'FREE',
      description: "Seu plano ativo",
      ...getCardConfig('total'),
    },
    {
      title: "Status",
      icon: Shield,
      value: getSubscriptionStatusText(subscription?.status || 'PENDING'),
      description: "Status da assinatura",
      ...getCardConfig('delivered'),
    },
    {
      title: "Válido Até",
      icon: Calendar,
      value: subscription?.subscriptionEndDate
        ? format(new Date(subscription.subscriptionEndDate), 'dd/MM/yy', { locale: ptBR })
        : 'N/A',
      description: "Data de vencimento",
      ...getCardConfig('read'),
    },
    {
      title: "Dias Restantes",
      icon: Clock,
      value: subscription?.daysUntilExpiration !== null
        ? subscription?.daysUntilExpiration > 0
          ? subscription?.daysUntilExpiration.toString()
          : '0'
        : 'N/A',
      description: "Tempo até expirar",
      ...getCardConfig('pending'),
    },
    {
      title: "Total de Pagamentos",
      icon: Wallet,
      value: payments.length.toString(),
      description: "Histórico completo",
      ...getCardConfig('failed'),
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-deep to-neon-purple/10 p-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          💳 Assinaturas & Pagamentos
        </h1>
        <p className="text-white/80">
          Gerencie sua assinatura e acompanhe seus pagamentos
        </p>
      </div>

      {/* Alerta de Expiração */}
      <AnimatePresence>
        {isExpiringSoon && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="text-yellow-500 font-medium mb-1">⚠️ Atenção - Assinatura Expirando!</h3>
                <p className="text-white/80 text-sm">
                  Sua assinatura expira em <strong className="text-yellow-500">{subscription?.daysUntilExpiration} dia(s)</strong>.
                  Renove agora para continuar aproveitando todos os recursos.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerta de Pagamento em Atraso */}
      <AnimatePresence>
        {subscription?.hasOverduePayment && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="text-red-500 font-medium mb-1">🚨 Pagamento em Atraso</h3>
                <p className="text-white/80 text-sm">
                  Você possui pagamentos pendentes. Regularize sua situação o mais rápido possível.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid - Igual ao Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {stats.map((stat, index) => (
          <TerminalCard key={index} {...stat} />
        ))}
      </div>

      {/* Status da Assinatura */}
      <motion.div
        variants={itemVariants}
        className="mb-8"
      >
        <div className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neon-green/10 rounded-lg">
                <Shield className="text-neon-green w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Status da Assinatura</h2>
                <p className="text-white/60">Informações detalhadas da sua conta</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              className="bg-electric/20 hover:bg-electric/30 text-white border border-electric/30"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {subscription && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-deep/60 backdrop-blur-xl p-4 rounded-lg border border-electric/30">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-neon-green" />
                  <span className="text-white/60 text-sm">Plano</span>
                </div>
                <p className="text-2xl font-bold text-white capitalize">{subscription.plan}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs border ${getSubscriptionStatusColor(subscription.status)}`}>
                  {getSubscriptionStatusText(subscription.status)}
                </span>
              </div>

              <div className="bg-deep/60 backdrop-blur-xl p-4 rounded-lg border border-electric/30">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-electric" />
                  <span className="text-white/60 text-sm">Válido Até</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {subscription.subscriptionEndDate
                    ? format(new Date(subscription.subscriptionEndDate), 'dd/MM/yyyy', { locale: ptBR })
                    : 'N/A'}
                </p>
              </div>

              <div className="bg-deep/60 backdrop-blur-xl p-4 rounded-lg border border-electric/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-neon-pink" />
                  <span className="text-white/60 text-sm">Dias Restantes</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {subscription.daysUntilExpiration !== null
                    ? subscription.daysUntilExpiration > 0
                      ? `${subscription.daysUntilExpiration} dias`
                      : 'Expirado'
                    : 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Histórico de Pagamentos */}
      <motion.div
        variants={itemVariants}
        className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-electric/10 rounded-lg">
            <DollarSign className="text-electric w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Histórico de Pagamentos</h2>
            <p className="text-white/60">Todos os seus pagamentos e transações</p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg">Nenhum pagamento encontrado</p>
            <p className="text-white/40 text-sm mt-2">Seus pagamentos aparecerão aqui quando forem gerados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-deep/40 rounded-lg border border-electric/20 hover:bg-deep/60 transition-all duration-300 p-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-electric/20 flex items-center justify-center border-2 border-electric/30">
                      <CreditCard className="text-electric w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-xl text-white">{formatCurrency(payment.amount)}</p>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Vencimento: {format(new Date(payment.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                      {payment.paidAt && (
                        <div className="flex items-center gap-2 text-sm text-neon-green">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Pago em: {format(new Date(payment.paidAt), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                    {payment.status === 'pending' && payment.paymentMethod === 'pix' && (
                      <Button
                        onClick={() => openPixDialog(payment)}
                        className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border border-neon-green/30"
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Pagar com Pix
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Dialog Pix - Consistente com o tema */}
      <Dialog open={pixDialogOpen} onOpenChange={setPixDialogOpen}>
        <DialogContent className="max-w-md bg-deep/95 backdrop-blur-xl border-electric/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <QrCode className="w-6 h-6 text-neon-green" />
              Pagamento via Pix
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Escaneie o QR Code ou copie o código Pix
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Valor */}
              <div className="text-center bg-electric/10 rounded-xl p-6 border border-electric/30">
                <p className="text-sm text-white/60 mb-2">Valor a pagar</p>
                <p className="text-4xl font-bold text-electric">
                  {formatCurrency(selectedPayment.amount)}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-white/60">
                  <Calendar className="w-4 h-4" />
                  <span>Vence em: {format(new Date(selectedPayment.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
              </div>

              {/* QR Code */}
              {selectedPayment.pixQRCode && (
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-xl">
                    <img
                      src={selectedPayment.pixQRCode}
                      alt="QR Code Pix"
                      className="w-64 h-64"
                    />
                  </div>
                </div>
              )}

              {/* Código Pix */}
              {selectedPayment.pixCode && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white flex items-center gap-2">
                    <Copy className="w-4 h-4 text-neon-green" />
                    Código Pix (Copia e Cola)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedPayment.pixCode}
                      readOnly
                      className="flex-1 p-3 bg-deep/50 border border-electric/30 rounded-lg text-white text-sm font-mono"
                    />
                    <Button
                      onClick={() => copyPixCode(selectedPayment.pixCode!)}
                      className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border border-neon-green/30"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-neon-green mt-0.5" />
                <p className="text-white/80 text-sm">
                  Após realizar o pagamento, ele será confirmado automaticamente em até <strong className="text-neon-green">2 horas</strong>.
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setPixDialogOpen(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/30"
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Billing;
