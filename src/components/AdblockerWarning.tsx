import React from 'react';
import { AlertTriangle, RefreshCw, Shield } from 'lucide-react';

interface AdblockerWarningProps {
  onRetry?: () => void;
  className?: string;
}

export const AdblockerWarning: React.FC<AdblockerWarningProps> = ({ 
  onRetry, 
  className = "" 
}) => {
  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Adblocker Detectado
          </h3>
          <p className="text-yellow-700 mb-4">
            Parece que você está usando um adblocker que pode estar interferindo 
            com o processamento de pagamentos. Para continuar com sua compra:
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-yellow-700">
              <Shield className="h-4 w-4" />
              <span className="text-sm">
                Desative temporariamente seu adblocker para este site
              </span>
            </div>
            <div className="flex items-center space-x-2 text-yellow-700">
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">
                Recarregue a página após desativar o adblocker
              </span>
            </div>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </button>
          )}
          
          <p className="text-xs text-yellow-600 mt-3">
            Seus dados de pagamento são processados de forma segura pelo Stripe.
          </p>
        </div>
      </div>
    </div>
  );
};