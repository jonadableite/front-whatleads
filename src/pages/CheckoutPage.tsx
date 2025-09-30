// @ts-nocheck

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
import { CheckoutForm } from "../components/CheckoutForm";
import { AdblockerWarning } from "../components/AdblockerWarning";
import { stripePromise, checkStripeAvailability } from "../lib/stripe-client";

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
	const [priceId, setPriceId] = useState<string>("");
	const [stripeBlocked, setStripeBlocked] = useState<boolean>(false);

	const fetchClientSecret = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			if (!authService.isAuthenticated()) {
				throw new Error(
					"Token não encontrado. Por favor, faça login novamente.",
				);
			}

			const apiUrl =
				import.meta.env.VITE_API_URL || "https://api.whatlead.com.br";
			console.log(
				"Fazendo requisição para:",
				`${apiUrl}/api/stripe/create-payment-intent`,
			);
			console.log("PriceId:", priceId);

			const response = await fetch(
				`${apiUrl}/api/stripe/create-payment-intent`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						...authService.getAuthHeaders(),
					},
					body: JSON.stringify({ priceId }),
				},
			);

			console.log("Resposta recebida:", response);

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Resposta de erro:", errorData);
				throw new Error(
					errorData.error || `Erro ${response.status}: ${response.statusText}`,
				);
			}

			const data = await response.json();
			console.log("Resposta bem-sucedida:", data);

			if (data.clientSecret) {
				setClientSecret(data.clientSecret);
			} else {
				throw new Error("ClientSecret não encontrado na resposta");
			}
		} catch (err: any) {
			console.error("Erro ao buscar clientSecret:", err);
			
			// Verifica se o erro pode estar relacionado a problemas de rede/adblocker
			let errorMessage = err.message || "Erro desconhecido ao processar o pagamento";
			
			if (err.message?.includes('fetch') || err.message?.includes('network') || err.message?.includes('blocked')) {
				errorMessage += ". Se você estiver usando um adblocker, tente desativá-lo temporariamente.";
			}
			
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	}, []);

	// Verificar se o Stripe está disponível (não bloqueado por adblocker)
	useEffect(() => {
		const checkStripe = async () => {
			const isBlocked = await checkStripeAvailability();
			setStripeBlocked(isBlocked);
		};
		
		checkStripe();
	}, []);

	useEffect(() => {
		if (!location.state) {
			setError("Informações do plano não encontradas.");
			return;
		}

		const {
			plan: statePlan,
			priceId: statePriceId,
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
		setPriceId(statePriceId);

		if (!statePlan || !statePriceId) {
			setError("Plano inválido");
			return;
		}

		fetchClientSecret();
	}, [location.state, fetchClientSecret]);

	const getPlanDetails = () => {
		const planDetails = {
			basic: {
				color: "bg-blue-500",
				gradient: "from-blue-500 to-blue-700",
				features: [
					"2 Números",
					"Envio aovivo",
					"Suporte Básico",
					"Limite de 250 Leads/Base",
					"Analises Avançadas",
				],
			},
			pro: {
				color: "bg-purple-500",
				gradient: "from-purple-500 to-purple-700",
				features: [
					"5 Números",
					"Envios aovivo e agendados",
					"Suporte Prioritário",
					"Limite de 700 Leads/Base",
					"Leads Personalizados",
					"Campanhas Personalizadas",
					"Segmentação de Leads",
					"Relatórios Avançados",
				],
			},
			enterprise: {
				color: "bg-green-500",
				gradient: "from-green-500 to-emerald-700",
				features: [
					"Números Ilimitados",
					"Envio aovivo e agendado",
					"Suporte Dedicado 24/7",
					"Leads/Base Ilimitadas",
					"Relatórios Personalizados",
					"Segmentação Avançada de Leads",
					"Leads Personalizados",
					"Campanhas Ilimitadas",
					"Campanhas Personalizadas",
					"Agendamento e Postagem de Storys",
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
					{stripeBlocked ? (
						<motion.div
							key="adblocker-warning"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							className="relative overflow-hidden rounded-2xl backdrop-blur-xl"
						>
							<AdblockerWarning 
								onRetry={() => window.location.reload()} 
								className="bg-yellow-500/10 border-yellow-500/30"
							/>
						</motion.div>
					) : loading ? (
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
					) : clientSecret ? (
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
												// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
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
							</motion.div>
						</motion.div>
					) : (
						<motion.div
							key="noContent"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="flex flex-col items-center justify-center h-[70vh] gap-4"
						>
							<p className="text-white/80 text-lg">
								Aguardando informações do checkout...
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
};

export default CheckoutPage;
