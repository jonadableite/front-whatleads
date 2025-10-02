// src/routes/index.tsx
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import AdminDashboard from '@/pages/AdminDashboard';
import AgenteIA from '@/pages/AgenteIA';
import Campanhas from '@/pages/Campanhas';
import CheckoutPage from '@/pages/CheckoutPage';
import Dashboard from '@/pages/Dashboard';
import Disparos from '@/pages/Disparos';
import Documentation from '@/pages/Documentation';
import ErrorPage from '@/pages/ErrorPage';
import Login from '@/pages/Login';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PricingPage from '@/pages/Pricing';
import Register from '@/pages/Register';
import Return from '@/pages/Return';
import Bottest from '@/pages/bottest';
import {
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import Agendados from '../pages/Agendados';
import Chat from '../pages/Chat';
import Contatos from '../pages/Contatos';
import Grupos from '../pages/Grupos';
import Historico from '../pages/Historico';
import HotmartSales from '../pages/HotmartSales';
import PasswordRecovery from '../pages/PasswordRecovery';
import WhatsappPage from '../pages/Whatsapp';

const router = createBrowserRouter([
  {
    element: <ProtectedLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/',
            element: <Dashboard />,
          },
          {
            path: '/dashboard',
            element: <Dashboard />,
          },
          {
            path: '/disparos',
            element: <Disparos />,
          },
          {
            path: '/disparos/grupos',
            element: <Grupos />,
          },
          {
            path: '/admin',
            element: <AdminDashboard />,
          },
          {
            path: '/disparos/novo',
            element: <Disparos />,
          },
          {
            path: '/disparos/:campaignId/history',
            element: <Historico />,
          },
          {
            path: '/disparos/agendados',
            element: <Agendados />,
          },
          {
            path: '/contatos',
            element: <Contatos />,
          },
          {
            path: '/AgenteIA',
            element: <AgenteIA />,
          },
          {
            path: '/pricing',
            element: <PricingPage />,
          },
          {
            path: '/checkout',
            element: <CheckoutPage />,
          },
          {
            path: '/payment-success',
            element: <PaymentSuccess />,
          },
          {
            path: '/return',
            element: <Return />,
          },
          {
            path: '/campanhas',
            element: <Campanhas />,
          },
          {
            path: '/instancias',
            element: <WhatsappPage />,
          },
          {
            path: '/configuracoes',
            element: <div>Configurações</div>,
          },
          {
            path: '/bot',
            element: <Bottest />,
          },
          {
            path: '/chat',
            element: <Chat />,
          },
          {
            path: '/documentacao',
            element: <Documentation />,
          },
          {
            path: '/hotmart/vendas',
            element: <HotmartSales />,
          },
        ],
      },
    ],
  },
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/forgot-password',
        element: <PasswordRecovery />,
      },
    ],
  },
]);

export function Routes() {
  return <RouterProvider router={router} />;
}
