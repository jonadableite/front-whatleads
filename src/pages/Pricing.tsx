//src/pages/PricingComponents.tsx
import type { Plan } from "@/interface";
import { AnimatePresence, motion } from "framer-motion";
import {
	CheckIcon,
	GlobeIcon,
	InfinityIcon,
	RocketIcon,
	Zap,
} from "lucide-react";

import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Configuração do Stripe (substitua com seus próprios valores)
const STRIPE_CONFIG = {
	PRICES: {
		BASIC: {
			MONTHLY: "price_1QkGeGP7kXKQS2sw0mnJ1Io6",
			ANNUAL: "price_1QkGnuP7kXKQS2swH6cD6jNC",
		},
		PRO: {
			MONTHLY: "price_1QkGgDP7kXKQS2swZkrUAQF9",
			ANNUAL: "price_1QkGoPP7kXKQS2sw9jMpejuo",
		},
		ENTERPRISE: {
			MONTHLY: "price_1QkGj0P7kXKQS2swnk462V8c",
			ANNUAL: "price_1QkGolP7kXKQS2swUrUStVB0",
		},
	},
};

const TypewriterText: React.FC<{
	text: string;
	delay: number;
	onComplete?: () => void;
}> = ({ text, delay, onComplete }) => {
	const [displayText, setDisplayText] = useState("");
	const [isComplete, setIsComplete] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => {
			let currentIndex = 0;
			const interval = setInterval(() => {
				if (currentIndex <= text.length) {
					setDisplayText(text.slice(0, currentIndex));
					currentIndex++;
				} else {
					setIsComplete(true);
					clearInterval(interval);
					onComplete?.();
				}
			}, 50);

			return () => clearInterval(interval);
		}, delay * 1000);

		return () => clearTimeout(timeout);
	}, [text, delay, onComplete]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="text-2xl md:text-3xl font-bold text-green-400 transition-colors duration-300 tracking-wider backdrop-blur-sm p-4 rounded-lg border border-gray-800 shadow-lg transform hover:scale-105 cursor-default"
			style={{
				textShadow: "0 0 10px rgba(74, 222, 128, 0.5)",
				background: "rgba(0, 0, 0, 0.4)",
			}}
		>
			{displayText}
			<span className="animate-pulse">|</span>
		</motion.div>
	);
};

const MessageContainer: React.FC<{ onComplete: () => void }> = ({
	onComplete,
}) => {
	const messages = [
		"Pronto para multiplicar seus resultados?",
		"Escolha o caminho da transformação",
		"🫵 Sua jornada para o sucesso começa aqui...",
	];

	const [isLastMessageComplete, setIsLastMessageComplete] = useState(false);

	useEffect(() => {
		if (isLastMessageComplete) {
			onComplete();
		}
	}, [isLastMessageComplete, onComplete]);

	return (
		<motion.div
			className="flex flex-col items-center justify-center space-y-6 max-w-4xl mx-auto"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 1 }}
		>
			{messages.map((message, index) => (
				<TypewriterText
					key={index}
					text={message}
					delay={index * 2.5}
					onComplete={() => {
						if (index === messages.length - 1) {
							setIsLastMessageComplete(true);
						}
					}}
				/>
			))}
		</motion.div>
	);
};

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

const PricingPage: React.FC = () => {
	const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
		"monthly",
	);
	const [showPlans, setShowPlans] = useState(false);
	const navigate = useNavigate();

	const plans: Plan[] = [
		{
			name: "Basic",
			price: {
				monthly: 109.0,
				annual: 1229.0,
			},
			features: [
				"2 Números",
				"Envio aovivo",
				"Suporte Básico",
				"Limite de 250 Leads/Base",
				"Analises Avançadas",
			],
			icon: <RocketIcon className="w-12 h-12 text-blue-500" />,
			bgGradient: "from-blue-500 to-blue-700",
			recommended: false,
			priceId: {
				monthly: STRIPE_CONFIG.PRICES.BASIC.MONTHLY,
				annual: STRIPE_CONFIG.PRICES.BASIC.ANNUAL,
			},
		},
		{
			name: "Pro",
			price: {
				monthly: 167.0,
				annual: 1800.0,
			},
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
			icon: <GlobeIcon className="w-12 h-12 text-purple-500" />,
			bgGradient: "from-purple-500 to-purple-700",
			recommended: true,
			priceId: {
				monthly: STRIPE_CONFIG.PRICES.PRO.MONTHLY,
				annual: STRIPE_CONFIG.PRICES.PRO.ANNUAL,
			},
		},
		{
			name: "Enterprise",
			price: {
				monthly: 209.0,
				annual: 2100.0,
			},
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
			icon: <InfinityIcon className="w-12 h-12 text-green-500" />,
			bgGradient: "from-green-500 to-emerald-700",
			recommended: false,
			priceId: {
				monthly: STRIPE_CONFIG.PRICES.ENTERPRISE.MONTHLY,
				annual: STRIPE_CONFIG.PRICES.ENTERPRISE.ANNUAL,
			},
		},
	];

	const isPriceValid = (priceId: string | undefined): boolean => {
		return Boolean(priceId && priceId.trim() !== "");
	};

	const handleSubscribe = (
		planName: string,
		priceId: string,
		price: number,
	) => {
		if (!isPriceValid(priceId)) {
			toast.error(
				`Configuração de preço indisponível para o plano ${planName}. Por favor, contate o suporte.`,
			);
			return;
		}

		navigate("/checkout", {
			state: {
				plan: planName,
				priceId: priceId,
				price,
				billingCycle,
			},
		});
	};

	useEffect(() => {
		const validatePriceIds = () => {
			const missingPrices = Object.entries(STRIPE_CONFIG.PRICES).flatMap(
				([planName, prices]) =>
					Object.entries(prices)
						.filter(([, priceId]) => !isPriceValid(priceId))
						.map(([cycle]) => `${planName}_${cycle}`),
			);

			if (missingPrices.length > 0) {
				console.error("Configuração incompleta dos preços:", missingPrices);
				toast.error(
					"Alguns planos estão temporariamente indisponíveis. Por favor, tente novamente mais tarde.",
				);
			}
		};

		validatePriceIds();

		const timeout = setTimeout(() => {
			setShowPlans(true);
		}, 30000); // Mostra os planos após 30 segundos

		return () => clearTimeout(timeout);
	}, []);

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={containerVariants}
			className="min-h-screen bg-gradient-to-br from-deep to-neon-purple/10 p-8"
		>
			<ToastContainer />
			<div className="max-w-7xl mx-auto">
				<AnimatePresence mode="wait">
					{!showPlans ? (
						<MessageContainer onComplete={() => setShowPlans(true)} />
					) : (
						<motion.div
							key="pricing-content"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.5 }}
						>
							<div className="text-center mb-16">
								<motion.h1
									initial={{ opacity: 0, y: -50 }}
									animate={{ opacity: 1, y: 0 }}
									className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-electric via-neon-green to-neon-blue"
								>
									Escolha seu Plano
								</motion.h1>
								<motion.p
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 }}
									className="text-xl text-white/80"
								>
									Encontre o plano perfeito para impulsionar seu negócio
								</motion.p>
							</div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="flex justify-center mb-12"
							>
								<div className="bg-deep/80 backdrop-blur-xl rounded-full p-1 flex items-center shadow-lg border border-electric/30">
									{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
									<button
										onClick={() => setBillingCycle("monthly")}
										className={`px-6 py-3 rounded-full transition-all duration-300 ${
											billingCycle === "monthly"
												? "bg-gradient-to-r from-electric to-neon-green text-white shadow-md"
												: "text-white/60 hover:text-white"
										}`}
									>
										Mensal
									</button>
									<button
										onClick={() => setBillingCycle("annual")}
										className={`px-6 py-3 rounded-full transition-all duration-300 ${
											billingCycle === "annual"
												? "bg-gradient-to-r from-neon-green to-electric text-white shadow-md"
												: "text-white/60 hover:text-white"
										}`}
									>
										Anual
									</button>
								</div>
							</motion.div>

							<motion.div
								className="grid md:grid-cols-3 gap-8"
								variants={{
									hidden: { opacity: 0 },
									show: {
										opacity: 1,
										transition: {
											staggerChildren: 0.2,
										},
									},
								}}
								initial="hidden"
								animate="show"
							>
								{plans.map((plan) => (
									<motion.div
										key={plan.name}
										variants={{
											hidden: { opacity: 0, y: 50 },
											show: {
												opacity: 1,
												y: 0,
												transition: {
													duration: 0.5,
													ease: "easeOut",
												},
											},
										}}
										className={`
                      bg-deep/80 backdrop-blur-xl rounded-2xl p-6
                      border border-electric/30
                      transition-all duration-300 hover:shadow-2xl hover:-translate-y-2
                      relative overflow-hidden
                      ${plan.recommended ? "md:scale-105 ring-2 ring-neon-green shadow-lg shadow-neon-green/20" : ""}
                    `}
									>
										{plan.recommended && (
											<div className="absolute -right-12 top-8 bg-neon-green text-deep px-12 py-1.5 transform rotate-45 font-bold text-sm">
												Recomendado
											</div>
										)}
										<div className="flex justify-between items-center mb-6">
											<div className="flex items-center space-x-4">
												<div className="p-3 bg-electric/10 rounded-full">
													{plan.icon}
												</div>
												<h2 className="text-2xl font-bold capitalize text-white">
													{plan.name}
												</h2>
											</div>
										</div>
										<div className="mb-6">
											<span className="text-5xl font-bold text-white">
												R$ {plan.price[billingCycle]?.toFixed(2)}
											</span>
											<span className="text-lg text-white/80 ml-2">
												/{billingCycle === "monthly" ? "mês" : "ano"}
											</span>
										</div>
										<ul className="space-y-3 mb-8">
											{plan.features.map((feature) => (
												<li
													key={feature}
													className="flex items-center space-x-2"
												>
													<CheckIcon className="w-5 h-5 text-neon-green" />
													<span className="text-white/90">{feature}</span>
												</li>
											))}
										</ul>
										<motion.button
											onClick={() =>
												handleSubscribe(
													plan.name,
													plan.priceId[billingCycle],
													plan.price[billingCycle],
												)
											}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											className={`
                        w-full py-4 rounded-full
                        bg-gradient-to-r from-electric to-neon-green
                        text-white font-bold text-lg
                        hover:shadow-lg hover:shadow-neon-green/20
                        transition-all duration-300
                        flex items-center justify-center space-x-2
                      `}
										>
											<span>Escolher {plan.name}</span>
											<Zap className="w-5 h-5" />
										</motion.button>
									</motion.div>
								))}
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
};

export default PricingPage;
