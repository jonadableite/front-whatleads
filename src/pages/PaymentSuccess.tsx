// src/pages/PaymentSuccess.tsx
import { authService } from "@/services/auth.service";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PaymentSuccess = () => {
	const location = useLocation();
	const paymentData = location.state;
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [status, setStatus] = useState("loading");
	const [subscriptionData, setSubscriptionData] = useState<any>(null);
	const [attempts, setAttempts] = useState(0);
	const MAX_ATTEMPTS = 20;

	useEffect(() => {
		if (paymentData) {
			// Use paymentData para mostrar informações sobre o pagamento
			console.log("Pagamento bem-sucedido:", paymentData);
			// Aqui você pode chamar a função para verificar o status do plano
			checkPlanUpdate();
		} else {
			// Se não houver dados de pagamento, redirecione para a página inicial
			navigate("/");
		}
	}, [paymentData, navigate]);

	const checkPlanUpdate = async () => {
		try {
			if (!authService.isAuthenticated()) {
				console.log("Token não encontrado, tentando novamente...");
				return false;
			}

			const response = await axios.get("/api/users/plan-status", {
				headers: authService.getAuthHeaders(),
			});

			if (response.data.success) {
				const { user, subscription } = response.data;
				setSubscriptionData(subscription);

				if (user.plan !== "free") {
					setStatus("success");
					toast.success("Seu plano foi atualizado com sucesso!");
					return true;
				}
			}

			setAttempts((prev) => prev + 1);
			return false;
		} catch (error) {
			console.error("Erro ao verificar atualização do plano:", error);
			setAttempts((prev) => prev + 1);
			return false;
		}
	};

	useEffect(() => {
		const paymentIntent = searchParams.get("payment_intent");
		const sessionId = searchParams.get("session_id");

		if (!paymentIntent && !sessionId) {
			navigate("/pricing");
			return;
		}

		let checkInterval: NodeJS.Timeout;

		const startChecking = () => {
			checkInterval = setInterval(async () => {
				const success = await checkPlanUpdate();

				if (success || attempts >= MAX_ATTEMPTS) {
					clearInterval(checkInterval);
					if (!success && attempts >= MAX_ATTEMPTS) {
						setStatus("error");
					}
				}
			}, 3000);
		};

		startChecking();

		return () => {
			if (checkInterval) {
				clearInterval(checkInterval);
			}
		};
	}, [searchParams, attempts, navigate]);

	// Efeito para verificação periódica
	useEffect(() => {
		const interval = setInterval(checkPlanUpdate, 5000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-deep via-defrom-deep to-defrom-deep p-4">
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="dark"
			/>
			<div className="max-w-2xl mx-auto">
				{status === "loading" ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-center p-8 bg-whatsapp-cinza/20 rounded-xl backdrop-blur-lg"
					>
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-eletext-electric mx-auto"></div>
						<p className="text-whatsapp-branco mt-4">
							Verificando status do pagamento...
						</p>
					</motion.div>
				) : status === "success" ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-whatsapp-cinza/20 backdrop-blur-lg rounded-3xl p-8 border border-eletext-electric/30"
					>
						<div className="text-center">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="inline-block p-3 bg-eletext-electric/20 rounded-full mb-6"
							>
								<CheckCircle className="w-16 h-16 text-electric" />
							</motion.div>

							<h1 className="text-3xl font-bold text-white mb-4">
								Pagamento Realizado com Sucesso!
							</h1>

							<p className="text-neutral-600 mb-8">
								Parabéns! Seu plano foi ativado e agora você está entre aqueles
								que realmente estão prontos para alcançar o sucesso em seus
								negócios. Aqui é onde encontra-se pessoas que estão alavancando
								seus resultados e garantindo total segurança em suas operações.
							</p>

							{subscriptionData && (
								<div className="mt-6 p-4 bg-eletext-electric/10 rounded-lg">
									<h2 className="text-xl font-semibold mb-2">
										Detalhes do Plano
									</h2>
									<p>Plano: {subscriptionData.plan}</p>
									<p>Instâncias: {subscriptionData.maxInstances}</p>
									<p>Mensagens/dia: {subscriptionData.messagesPerDay}</p>
								</div>
							)}

							<p className="text-whatsapp-cinzaClaro mb-8">
								Não estou dizendo que será fácil. Mas com certeza, esse é o
								melhor caminho para você ter resultados e construir riqueza de
								verdade. A jornada começa agora.
							</p>

							<motion.button
								onClick={() => navigate("/")}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="inline-flex items-center px-6 py-3 bg-electric text-white rounded-xl font-medium"
							>
								Ir para o Dashboard
								<ArrowRight className="ml-2 w-5 h-5" />
							</motion.button>

							<div className="mt-8 text-neutral-600">
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									className="inline-block p-3 bg-electric/20 rounded-full mb-4"
								>
									<Star className="w-6 h-6 text-elebg-electric" />
								</motion.div>
								<p>
									Se tiver alguma dúvida, nosso time de suporte está aqui para
									ajudar. Visite nossa{" "}
									<a href="/tutorial" className="text-elebg-electric underline">
										Central de Ajuda
									</a>{" "}
									ou entre em contato diretamente.
								</p>
							</div>
						</div>
					</motion.div>
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-center p-8 bg-red-500/20 rounded-xl backdrop-blur-lg border border-red-500/30"
					>
						<h2 className="text-2xl font-bold text-white mb-4">
							Erro na Verificação
						</h2>
						<p className="text-red-200 mb-6">
							Não foi possível verificar o status do seu pagamento.
						</p>
						<button
							onClick={() => navigate("/pricing")}
							className="bg-white text-red-500 px-6 py-2 rounded-lg"
						>
							Voltar para Planos
						</button>
					</motion.div>
				)}
			</div>
		</div>
	);
};

export default PaymentSuccess;
