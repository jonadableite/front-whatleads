// src/components/CheckoutForm.tsx
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import type { StripePaymentElementOptions } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { LockIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CheckoutFormProps {
  clientSecret: string;
  plan: string;
  price: number;
}

export const CheckoutForm = ({
  clientSecret,
  plan,
  price,
}: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    setMessage(null);

    if (!stripe || !elements) {
      setError('Stripe não está carregado.');
      setProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setError(error.message || 'Erro ao processar o pagamento.');
        setMessage(error.message || 'Erro ao processar o pagamento.');
      } else if (paymentIntent) {
        switch (paymentIntent.status) {
          case 'succeeded':
            navigate('/payment-success', {
              state: {
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
              },
            });
            break;
          case 'processing':
            setMessage(
              'Processando seu pagamento. Por favor, aguarde...',
            );
            break;
          default:
            setError('Pagamento não concluído.');
            break;
        }
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro desconhecido ao processar o pagamento.';

      setError(errorMessage);
      setMessage(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">
          Informações de Pagamento
        </h3>
        <p className="text-neutral-500 text-lg">
          Complete suas informações de pagamento de forma segura
        </p>
      </div>

      <motion.form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-deep/50 rounded-xl p-6 backdrop-blur-lg border border-electric/20">
          <PaymentElement options={paymentElementOptions} />
        </div>

        <div className="space-y-4">
          <motion.button
            type="submit"
            disabled={processing || !stripe || !elements}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full py-4 px-6 rounded-xl
              bg-gradient-to-r from-neon-green to-green-700
              text-white font-medium text-lg
              disabled:opacity-50
              transition-all duration-300
              flex items-center justify-center
              shadow-lg shadow-neon-green/20
            `}
          >
            <LockIcon className="w-5 h-5 mr-2" />
            {processing
              ? 'Processando...'
              : `Pagar R$ ${price.toFixed(2)}`}
          </motion.button>

          <p className="text-center text-neutral-700 text-sm">
            Pagamento seguro processado pelo Stripe
          </p>
        </div>

        {(message || error) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl text-sm text-center backdrop-blur-lg transition-all duration-300 ${
              error
                ? 'bg-red-500/20 text-red-200 border border-red-500/30'
                : 'bg-green-500/20 text-green-200 border border-green-500/30'
            }`}
          >
            {message || error}
          </motion.div>
        )}
      </motion.form>
    </motion.div>
  );
};
