// src/routes/index.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import Campanhas from "@/pages/Campanhas";
import CheckoutPage from "@/pages/CheckoutPage";
import Dashboard from "@/pages/Dashboard";
import Disparos from "@/pages/Disparos";
import ErrorPage from "@/pages/ErrorPage";
import Login from "@/pages/Login";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PricingPage from "@/pages/Pricing";
import Register from "@/pages/Register";
import Return from "@/pages/Return";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Agendados from "../pages/Agendados";
import Contatos from "../pages/Contatos";
import Historico from "../pages/Historico";
import Instances from "../pages/Instances";
import PasswordRecovery from "../pages/PasswordRecovery";

const router = createBrowserRouter([
	{
		element: <ProtectedLayout />,
		errorElement: <ErrorPage />,
		children: [
			{
				element: <DashboardLayout />,
				children: [
					{
						path: "/",
						element: <Dashboard />,
					},
					{
						path: "/dashboard",
						element: <Dashboard />,
					},
					{
						path: "/disparos",
						element: <Disparos />,
					},
					{
						path: "/disparos/novo",
						element: <Disparos />,
					},
					{
						path: "/disparos/:campaignId/history",
						element: <Historico />,
					},
					{
						path: "/disparos/agendados",
						element: <Agendados />,
					},
					{
						path: "/contatos",
						element: <Contatos />,
					},
					{
						path: "/pricing",
						element: <PricingPage />,
					},
					{
						path: "/checkout",
						element: <CheckoutPage />,
					},
					{
						path: "/payment-success",
						element: <PaymentSuccess />,
					},
					{
						path: "/return",
						element: <Return />,
					},
					{
						path: "/campanhas",
						element: <Campanhas />,
					},
					{
						path: "/instancias",
						element: <Instances />,
					},
					{
						path: "/configuracoes",
						element: <div>Configurações</div>,
					},
				],
			},
		],
	},
	{
		element: <PublicLayout />,
		children: [
			{
				path: "/login",
				element: <Login />,
			},
			{
				path: "/register",
				element: <Register />,
			},
			{
				path: "/forgot-password",
				element: <PasswordRecovery />,
			},
		],
	},
]);

export function Routes() {
	return <RouterProvider router={router} />;
}
