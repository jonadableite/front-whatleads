/**
 * Modal de Gerenciamento de Usuário
 * Permite editar planos, datas, status e configurações do usuário
 */

import { useState } from 'react';
import { X, Save, Calendar, CreditCard, Shield, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  subscriptionStatus: string | null;
  subscriptionEndDate: Date | string | null;
  trialEndDate: Date | string | null;
  isActive: boolean;
  maxInstances: number;
  messagesPerDay: number;
  features: string[];
  daysUntilExpiration: number | null;
  daysUntilTrialEnd: number | null;
  isInTrial: boolean;
  hasOverduePayment: boolean;
  hasPendingPayment: boolean;
}

interface UserManagementModalProps {
  user: User;
  onClose: () => void;
  onSave: (userId: string, data: Partial<User>) => Promise<void>;
}

export function UserManagementModal({ user, onClose, onSave }: UserManagementModalProps) {
  const [formData, setFormData] = useState({
    plan: user.plan || 'free',
    subscriptionStatus: user.subscriptionStatus || 'PENDING',
    subscriptionEndDate: user.subscriptionEndDate
      ? format(new Date(user.subscriptionEndDate), 'yyyy-MM-dd')
      : '',
    trialEndDate: user.trialEndDate
      ? format(new Date(user.trialEndDate), 'yyyy-MM-dd')
      : '',
    isActive: user.isActive,
    maxInstances: user.maxInstances || 2,
    messagesPerDay: user.messagesPerDay || 100,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave(user.id, {
        ...formData,
        subscriptionEndDate: formData.subscriptionEndDate || null,
        trialEndDate: formData.trialEndDate || null,
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const planOptions = [
    { value: 'free', label: 'Gratuito (Free)', color: 'text-gray-400' },
    { value: 'basic', label: 'Básico (Basic)', color: 'text-blue-400' },
    { value: 'premium', label: 'Premium', color: 'text-purple-400' },
    { value: 'enterprise', label: 'Empresarial (Enterprise)', color: 'text-gold' },
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: '✅ Ativo', color: 'text-green-500' },
    { value: 'PENDING', label: '⏳ Pendente', color: 'text-yellow-500' },
    { value: 'SUSPENDED', label: '🚫 Suspenso', color: 'text-red-500' },
    { value: 'TRIAL', label: '🎁 Teste (Trial)', color: 'text-blue-500' },
    { value: 'EXPIRED', label: '⏰ Expirado', color: 'text-orange-500' },
    { value: 'CANCELLED', label: '❌ Cancelado', color: 'text-gray-500' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-deep/95 backdrop-blur-xl border border-electric/30 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-deep/95 backdrop-blur-xl border-b border-electric/30 p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Settings className="w-6 h-6 text-electric" />
                Gerenciar Usuário
              </h2>
              <p className="text-sm text-white/60 mt-1">{user.name} • {user.email}</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Status Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-deep/60 rounded-lg border border-electric/20">
              {user.isInTrial && (
                <div className="text-center">
                  <div className="text-xs text-blue-400 mb-1">🎁 Em Trial</div>
                  <div className="text-sm font-bold text-white">
                    {user.daysUntilTrialEnd} dias restantes
                  </div>
                </div>
              )}
              {user.hasOverduePayment && (
                <div className="text-center">
                  <div className="text-xs text-red-400 mb-1">⚠️  Pagamento Vencido</div>
                  <div className="text-sm font-bold text-red-500">Ação necessária</div>
                </div>
              )}
              {user.hasPendingPayment && (
                <div className="text-center">
                  <div className="text-xs text-yellow-400 mb-1">⏳ Pagamento Pendente</div>
                  <div className="text-sm font-bold text-yellow-500">Aguardando</div>
                </div>
              )}
            </div>

            {/* Plano e Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-electric" />
                  Plano
                </label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full px-4 py-3 bg-deep/60 border border-electric/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric transition-all"
                >
                  {planOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-electric" />
                  Status da Assinatura
                </label>
                <select
                  value={formData.subscriptionStatus}
                  onChange={(e) => setFormData({ ...formData, subscriptionStatus: e.target.value })}
                  className="w-full px-4 py-3 bg-deep/60 border border-electric/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric transition-all"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neon-green" />
                  Data de Vencimento da Assinatura
                </label>
                <input
                  type="date"
                  value={formData.subscriptionEndDate}
                  onChange={(e) => setFormData({ ...formData, subscriptionEndDate: e.target.value })}
                  className="w-full px-4 py-3 bg-deep/60 border border-electric/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Data de Término do Trial (Opcional)
                </label>
                <input
                  type="date"
                  value={formData.trialEndDate}
                  onChange={(e) => setFormData({ ...formData, trialEndDate: e.target.value })}
                  className="w-full px-4 py-3 bg-deep/60 border border-electric/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric transition-all"
                  placeholder="Deixe em branco se não estiver em trial"
                />
              </div>
            </div>

            {/* Configurações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Máximo de Instâncias
                </label>
                <input
                  type="number"
                  value={formData.maxInstances}
                  onChange={(e) => setFormData({ ...formData, maxInstances: Number(e.target.value) })}
                  min={1}
                  className="w-full px-4 py-3 bg-deep/60 border border-electric/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Mensagens por Dia
                </label>
                <input
                  type="number"
                  value={formData.messagesPerDay}
                  onChange={(e) => setFormData({ ...formData, messagesPerDay: Number(e.target.value) })}
                  min={0}
                  className="w-full px-4 py-3 bg-deep/60 border border-electric/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric transition-all"
                />
              </div>
            </div>

            {/* Ativo/Inativo */}
            <div className="flex items-center gap-3 p-4 bg-deep/60 rounded-lg border border-electric/20">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-electric/30 text-electric focus:ring-electric"
              />
              <label htmlFor="isActive" className="text-white font-medium">
                Usuário Ativo
                <span className="block text-xs text-white/60">Desmarque para desativar a conta do usuário</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 bg-deep/50 border-white/20 text-white hover:bg-white/10"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-electric text-deep hover:bg-electric/80"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-deep border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Salvar Alterações
                  </span>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

