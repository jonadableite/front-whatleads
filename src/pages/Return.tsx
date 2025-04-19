import { motion } from "framer-motion";
import { ArrowRightIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Return: React.FC = () => {
	const [status, setStatus] = useState<string | null>(null);
	const [customerEmail, setCustomerEmail] = useState<string>("");
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const sessionId = urlParams.get("session_id");

		if (sessionId) {
			fetch(
				`https://api.whatlead.com.br/sessions/session-status?session_id=${sessionId}`,
			)
				.then((res) => res.json())
				.then((data) => {
					setStatus(data.status);
					setCustomerEmail(data.customer_email);
				})
				.catch((error) => {
					console.error("Erro ao verificar status da sessão:", error);
					setStatus("error");
				});
		} else {
			setStatus("error");
		}
	}, [location]);

	const handleNavigateToDashboard = () => {
		navigate("/");
	};

	if (status === "OPEN") {
		navigate("/checkout");
		return null;
	}

	const successVariants = {
		initial: { opacity: 0, y: -50 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.5 },
	};
	const errorVariants = {
		initial: { opacity: 0, scale: 0.9 },
		animate: { opacity: 1, scale: 1 },
		transition: { duration: 0.3 },
	};

	if (status === "complete") {
		return (
			<motion.div
				className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-4"
				variants={successVariants}
				initial="initial"
				animate="animate"
			>
				<motion.div
					className="max-w-md bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700 space-y-6"
					whileHover={{ scale: 1.02 }}
					transition={{ duration: 0.3 }}
				>
					<div className="flex justify-center">
						<motion.div
							className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4"
							whileHover={{ scale: 1.1 }}
							transition={{ duration: 0.3 }}
						>
							<CheckCircleIcon className="w-12 h-12 text-white" />
						</motion.div>
					</div>
					<h2 className="text-3xl font-bold text-center mb-2">
						Pagamento Concluído!
					</h2>
					<p className="text-gray-300 text-center">
						Agradecemos sua compra! Um e-mail de confirmação será enviado para{" "}
						<span className="font-semibold">{customerEmail}</span>.
					</p>
					<motion.button
						onClick={handleNavigateToDashboard}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						transition={{ duration: 0.2 }}
						className="w-full bg-gradient-to-r from-whatsapp-green to-whatsapp-dark text-white py-3 rounded-full flex items-center justify-center space-x-2 group"
					>
						<span>Ir para o painel</span>
						<ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
					</motion.button>
				</motion.div>
			</motion.div>
		);
	}

	if (status === "error") {
		return (
			<motion.div
				className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-4"
				variants={errorVariants}
				initial="initial"
				animate="animate"
			>
				<motion.div
					className="max-w-md bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700 space-y-6"
					whileHover={{ scale: 1.02 }}
					transition={{ duration: 0.3 }}
				>
					<div className="flex justify-center">
						<motion.div
							className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-4"
							whileHover={{ scale: 1.1 }}
							transition={{ duration: 0.3 }}
						>
							<XCircleIcon className="w-12 h-12 text-white" />
						</motion.div>
					</div>
					<h2 className="text-3xl font-bold text-center mb-2">
						Erro no Pagamento
					</h2>
					<p className="text-gray-300 text-center">
						Ocorreu um erro ao processar o pagamento. Por favor, tente
						novamente.
					</p>
					<motion.button
						onClick={() => navigate("/pricing")}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						transition={{ duration: 0.2 }}
						className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white py-3 rounded-full flex items-center justify-center space-x-2 group"
					>
						<span>Tentar Novamente</span>
						<ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
					</motion.button>
				</motion.div>
			</motion.div>
		);
	}

	return null;
};

export default Return;
