// src/pages/Login.tsx
import Logo from "@/assets/Logo.png";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react"; // Adicione estas importações
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const MatrixRain: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const emojis = [
			"😀",
			"😂",
			"😅",
			"🤣",
			"😊",
			"😍",
			"😘",
			"😜",
			"🤔",
			"🤩",
			"😎",
			"🤓",
			"👻",
			"🎃",
			"💀",
			"👽",
			"🤖",
			"🎉",
			"🔥",
			"✨",
			"🌟",
			"💫",
			"⭐",
			"🌈",
			"🎈",
			"🎁",
			"🎀",
			"🎊",
			"🎄",
			"🎅",
			"🤶",
			"🧑‍🎄",
			"🧙‍♂️",
			"🧛‍♂️",
			"🧟‍♂️",
			"🧞‍♂️",
			"🧜‍♂️",
			"🧚‍♂️",
		];
		const fontSize = 16;
		const columns = canvas.width / fontSize;
		const drops: number[] = [];

		for (let i = 0; i < columns; i++) {
			drops[i] = 1;
		}

		const draw = () => {
			ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = "rgba(0, 255, 106, 0.3)";
			ctx.font = `${fontSize}px serif`;

			for (let i = 0; i < drops.length; i++) {
				const emoji = emojis[Math.floor(Math.random() * emojis.length)];
				ctx.fillText(emoji, i * fontSize, drops[i] * fontSize);

				if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
					drops[i] = 0;
				}
				drops[i]++;
			}
		};

		const interval = setInterval(draw, 33);
		return () => clearInterval(interval);
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-30"
		/>
	);
};

const Login: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await authService.login({ email, password });

			// Verificar se temos a resposta completa
			if (!response || !response.user) {
				throw new Error("Resposta inválida do servidor");
			}

			// Verificar status do plano (com verificação de null/undefined)
			const planStatus = response.planStatus || {
				hasActiveSubscription: true,
				isTrialExpired: false,
				status: "active",
			};

			if (!planStatus.hasActiveSubscription && planStatus.isTrialExpired) {
				toast.warning("Sua assinatura expirou. Por favor, renove seu plano.");
				navigate("/plans");
				return;
			}

			// Verificar se tem empresa configurada
			if (!response.user.companyId) {
				toast.info("Configure sua empresa para continuar.");
				navigate("/company-setup");
				return;
			}

			// Se chegou aqui, está tudo ok
			toast.success("Login realizado com sucesso!");

			// Redirecionar para o dashboard
			navigate("/dashboard", { replace: true });
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.error || error.message || "Erro ao fazer login";
			toast.error(errorMessage);
			console.error("Erro no login:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-end bg-gradient-to-br from-deep-purple to-deep-blue overflow-hidden">
			<MatrixRain />
			<motion.div
				initial={{ opacity: 0, x: 100 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.5 }}
				className="relative z-10 w-full max-w-3xl min-h-screen overflow-y-auto"
				style={{
					clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)",
					background: "rgba(13, 13, 13, 0.9)",
					backdropFilter: "blur(10px)",
				}}
			>
				<div className="min-h-screen flex items-center py-6 px-16">
					<Card className="w-full bg-transparent shadow-none border-none">
						<CardHeader className="space-y-4 pt-4">
							<motion.div
								initial={{ y: -20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.5 }}
								className="flex justify-center mb-6"
							>
								<motion.img
									src={Logo}
									alt="Logo"
									className="h-28 w-auto"
									initial={{ rotate: -180, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									transition={{
										type: "spring",
										stiffness: 260,
										damping: 20,
										delay: 0.3,
									}}
									whileHover={{ scale: 1.05 }}
								/>
							</motion.div>
							<CardTitle className="text-center text-neon-green text-4xl font-bold mb-2">
								Bem-vindo de volta!
							</CardTitle>
							<CardDescription className="text-center text-white-pure/90 text-xl">
								Entre na sua conta para acessar o painel
							</CardDescription>
						</CardHeader>
						<CardContent className="mt-6">
							<form onSubmit={handleLogin} className="space-y-6">
								<div className="space-y-3">
									<label
										htmlFor="email"
										className="text-lg font-medium text-white-pure"
									>
										Email
									</label>
									<Input
										type="email"
										id="email"
										placeholder="Digite seu email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="bg-gray-dark/50 border-electric text-white-pure
                             placeholder-gray-light focus:ring-2 focus:ring-neon-green
                             transition-all duration-300 h-12 text-lg"
									/>
								</div>
								<div className="space-y-4">
									<label
										htmlFor="password"
										className="text-lg font-medium text-white-pure"
									>
										Senha
									</label>
									<Input
										type={showPassword ? "text" : "password"}
										id="password"
										placeholder="Digite sua senha"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										className="bg-gray-dark/50 border-electric text-white-pure
                             placeholder-gray-light focus:ring-2 focus:ring-neon-green
                             transition-all duration-300 h-12 text-lg"
										rightIcon={
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="text-white-pure/70 hover:text-white-pure focus:outline-none"
											>
												<span className="text-2xl">
													{showPassword ? "👁️" : "👁️‍🗨️"}
												</span>
											</button>
										}
									/>
								</div>
								<Button
									type="submit"
									disabled={loading}
									className="w-full bg-electric text-white-pure font-bold text-xl
                     py-6 rounded-xl shadow-lg transition-all duration-300
                     hover:bg-neon-green hover:text-black hover:shadow-neon
                     focus:ring-4 focus:ring-electric/50 disabled:opacity-50"
								>
									{loading ? "Entrando..." : "Entrar"}
								</Button>
							</form>
						</CardContent>
						<CardFooter className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:justify-between mt-8 pb-8">
							<Button
								variant="link"
								className="text-neon-pink hover:text-white-pure transition-colors duration-300 text-lg"
							>
								Esqueceu a senha?
							</Button>
							<Button
								variant="link"
								className="text-neon-blue hover:text-white-pure transition-colors duration-300 text-lg"
								onClick={() => navigate("/register")}
							>
								Registre-se
							</Button>
						</CardFooter>
					</Card>
				</div>
			</motion.div>
		</div>
	);
};

export default Login;
