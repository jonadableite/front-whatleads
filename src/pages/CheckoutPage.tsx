// src/pages/CheckoutPage.tsx
import { authService } from "@/services/auth.service";
import { Elements } from "@stripe/react-stripe-js";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowLeft,
	CheckIcon,
	CreditCardIcon,
	Lock,
	Shield,
	ShieldCheckIcon,
	Sparkles,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CheckoutForm from "../components/CheckoutForm";
import { stripePromise } from "../lib/stripe-client";

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			duration: 0.5,
			when: "beforeChildren",
			staggerChildren: 0.1,
		},
	},
};

const cardVariants = {
	hidden: { opacity: 0, y: 50 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 100,
			damping: 15,
		},
	},
};

const CheckoutPage: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [price, setPrice] = useState<number | null>(null);
	const [billingCycle, setBillingCycle] = useState<string | null>(null);
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [plan, setPlan] = useState<string | null>(null);

	useEffect(() => {
		if (!location.state) {
			setError("Informações do plano não encontradas.");
			return;
		}

		const {
			plan: statePlan,
			priceId,
			price: planPrice,
			billingCycle: planBillingCycle,
		} = location.state as {
			plan: string;
			priceId: string;
			price: number;
			billingCycle: string;
		};

		setPlan(statePlan);
		setPrice(planPrice);
		setBillingCycle(planBillingCycle);

		if (!statePlan || !priceId) {
			setError("Plano inválido");
			return;
		}

		fetchClientSecret(priceId);
	}, [location.state]);

	const fetchClientSecret = useCallback(
		async (priceId: string) => {
			setLoading(true);
			setError(null);
			try {
				// Verifique se o token está válido antes de fazer a requisição
				if (!authService.isAuthenticated()) {
					throw new Error("Sessão expirada. Por favor, faça login novamente.");
				}

				const apiUrl =
					import.meta.env.VITE_API_URL || "https://https://api.whatlead.com.br";
				const response = await fetch(
					`${apiUrl}/api/stripe/create-payment-intent`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							...authService.getAuthHeaders().headers, // Utilize o método getAuthHeaders para obter os headers
						},
						body: JSON.stringify({
							priceId,
							returnUrl: `${window.location.origin}/return`,
						}),
					},
				);

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(
						errorData.error || "Erro ao criar intent de pagamento",
					);
				}

				const data = await response.json();
				setClientSecret(data.clientSecret);
			} catch (err: any) {
				setError(err.message);
				if (err.message.includes("Sessão expirada")) {
					setTimeout(() => navigate("/login"), 3000);
				}
			} finally {
				setLoading(false);
			}
		},
		[navigate],
	);

	const getPlanDetails = () => {
		const planDetails = {
			basic: {
				color: "bg-blue-500",
				gradient: "from-blue-500 to-blue-700",
				features: [
					"2 Números",
					"Envio de Texto",
					"Suporte Básico",
					"Limite de 50 Mensagens/Dia",
				],
			},
			pro: {
				color: "bg-purple-500",
				gradient: "from-purple-500 to-purple-700",
				features: [
					"5 Números",
					"Envio de Texto e Áudio",
					"Suporte Prioritário",
					"Limite de 500 Mensagens/Dia",
					"Relatórios Avançados",
				],
			},
			enterprise: {
				color: "bg-green-500",
				gradient: "from-green-500 to-emerald-700",
				features: [
					"Números Ilimitados",
					"Envio de Texto, Áudio e Mídia",
					"Suporte Dedicado 24/7",
					"Mensagens Ilimitadas",
					"Relatórios Personalizados",
					"Integração API",
					"Segurança Avançada",
				],
			},
		};
		return planDetails[plan as keyof typeof planDetails] || planDetails.basic;
	};

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={containerVariants}
			className="min-h-screen bg-gradient-to-br from-deep to-neon-purple/10 p-4"
		>
			<div className="max-w-7xl mx-auto relative">
				<div className="absolute inset-0 bg-gradient-radial from-electric/20 via-transparent to-transparent blur-3xl" />
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-neon-green/30 rounded-full blur-3xl animate-pulse" />
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-electric/30 rounded-full blur-3xl animate-pulse delay-1000" />

				<div className="relative z-10 flex justify-between items-center mb-8">
					<motion.button
						onClick={() => navigate(-1)}
						className="flex items-center text-white gap-2 hover:text-neon-green transition-all duration-300"
						whileHover={{ x: -5, scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<ArrowLeft className="w-5 h-5" />
						<span>Voltar para planos</span>
					</motion.button>

					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						className="flex items-center gap-4 text-white/80"
					>
						<div className="flex items-center gap-2">
							<Lock className="w-4 h-4 text-neon-green" />
							<span className="text-sm">Pagamento Seguro</span>
						</div>
						<div className="flex items-center gap-2">
							<Shield className="w-4 h-4 text-electric" />
							<span className="text-sm">Criptografia SSL</span>
						</div>
					</motion.div>
				</div>

				<AnimatePresence mode="wait">
					{loading ? (
						<motion.div
							key="loading"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="flex flex-col items-center justify-center h-[70vh] gap-4"
						>
							<motion.div
								animate={{
									rotate: 360,
									scale: [1, 1.2, 1],
								}}
								transition={{
									rotate: {
										repeat: Number.POSITIVE_INFINITY,
										duration: 2,
										ease: "linear",
									},
									scale: {
										repeat: Number.POSITIVE_INFINITY,
										duration: 1,
										ease: "easeInOut",
									},
								}}
							>
								<ShieldCheckIcon className="w-20 h-20 text-neon-green" />
							</motion.div>
							<motion.p
								animate={{ opacity: [0.5, 1, 0.5] }}
								transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
								className="text-white/80 text-lg"
							>
								Preparando seu checkout seguro...
							</motion.p>
						</motion.div>
					) : error ? (
						<motion.div
							key="error"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							className="relative overflow-hidden bg-red-500/10 rounded-2xl p-8 backdrop-blur-xl border border-red-500/30"
						>
							<div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent" />
							<div className="relative z-10 text-center space-y-4">
								<h2 className="text-2xl font-bold text-white">
									Erro no Checkout
								</h2>
								<p className="text-red-200">{error}</p>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={() => fetchClientSecret()}
									className="px-6 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
								>
									Tentar Novamente
								</motion.button>
							</div>
						</motion.div>
					) : (
						<motion.div
							key="content"
							variants={cardVariants}
							className="grid lg:grid-cols-2 gap-8 relative z-10"
						>
							<motion.div
								variants={cardVariants}
								className="bg-deep/80 backdrop-blur-xl rounded-3xl p-8 border border-electric/30 hover:border-electric/50 transition-colors duration-300"
							>
								<div className="space-y-6">
									<motion.div
										initial={{ y: -20, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										className="flex items-center gap-4"
									>
										<div className="p-3 bg-gradient-to-br from-electric to-neon-green rounded-2xl">
											<CreditCardIcon className="w-8 h-8 text-white" />
										</div>
										<div>
											<h2 className="text-3xl font-bold text-white capitalize flex items-center gap-2">
												Plano {plan}
												<Sparkles className="w-5 h-5 text-electric animate-pulse" />
											</h2>
											<p className="text-white/60">
												{billingCycle === "monthly" ? "Mensal" : "Anual"}
											</p>
										</div>
									</motion.div>

									<div className="space-y-4">
										{getPlanDetails().features.map((feature, index) => (
											<motion.div
												key={index}
												initial={{ x: -20, opacity: 0 }}
												animate={{ x: 0, opacity: 1 }}
												transition={{ delay: index * 0.1 }}
												className="flex items-center gap-3 text-white group"
											>
												<motion.div
													whileHover={{ scale: 1.2, rotate: 180 }}
													className="p-1 bg-gradient-to-br from-electric to-neon-green rounded-full"
												>
													<CheckIcon className="w-4 h-4 text-deep" />
												</motion.div>
												<span className="group-hover:text-electric transition-colors">
													{feature}
												</span>
											</motion.div>
										))}
									</div>

									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="pt-6 border-t border-electric/20"
									>
										<div className="flex items-center justify-between">
											<span className="text-white/60">Total:</span>
											<motion.div
												className="text-right"
												whileHover={{ scale: 1.05 }}
											>
												<p className="text-4xl font-bold text-white">
													R$ {price?.toFixed(2)}
												</p>
												<p className="text-sm text-white/60">
													por {billingCycle === "monthly" ? "mês" : "ano"}
												</p>
											</motion.div>
										</div>
									</motion.div>
								</div>
							</motion.div>

							<motion.div
								variants={cardVariants}
								className="bg-deep/80 backdrop-blur-xl rounded-3xl p-8 border border-electric/30 hover:border-electric/50 transition-colors duration-300"
							>
								{clientSecret && (
									<Elements
										stripe={stripePromise}
										options={{
											clientSecret,
											appearance: {
												theme: "night",
												variables: {
													colorPrimary: "#25D366",
													colorBackground: "#1F2937",
													colorText: "#FFFFFF",
													colorDanger: "#EF4444",
													fontFamily: "system-ui",
													spacingUnit: "4px",
													borderRadius: "8px",
												},
											},
										}}
									>
										<CheckoutForm
											clientSecret={clientSecret}
											plan={plan}
											price={price || 0}
										/>
									</Elements>
								)}
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
};

export default CheckoutPage;
