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
// src/pages/Register.tsx
import axios from "axios";
import { motion } from "framer-motion";
import type React from "react";
import { useEffect, useRef, useState } from "react";
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

const Register: React.FC = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		if (!name || !email || !password || !confirmPassword) {
			setError("Todos os campos são obrigatórios.");
			setIsLoading(false);
			return;
		}

		if (password !== confirmPassword) {
			setError("As senhas não coincidem!");
			setIsLoading(false);
			return;
		}

		if (password.length < 8) {
			setError("A senha deve ter pelo menos 8 caracteres.");
			setIsLoading(false);
			return;
		}

		try {
			const response = await axios.post(
				"https://api.whatlead.com.br/api/users/register",
				{
					name,
					email,
					password,
				},
			);

			if (response.status === 201) {
				toast.success(
					"Registro realizado com sucesso! Redirecionando para o login...",
				);
				setTimeout(() => navigate("/login"), 2000);
			} else {
				toast.error("Erro ao registrar. Por favor, tente novamente.");
			}
		} catch (error: any) {
			console.error("Erro ao registrar:", error);
			setError(error.response?.data?.message || "Erro ao registrar.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-start bg-gradient-to-br from-deep-purple to-deep-blue overflow-hidden">
			<MatrixRain />
			<motion.div
				initial={{ opacity: 0, x: -100 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.5 }}
				className="relative z-10 w-full max-w-3xl min-h-screen overflow-y-auto"
				style={{
					clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)",
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
							/>
							<CardTitle className="text-center text-neon-blue text-4xl font-bold mb-2">
								Crie sua conta
							</CardTitle>
							<CardDescription className="text-center text-white-pure/90 text-xl">
								Junte-se a nós para uma experiência incrível
							</CardDescription>
						</CardHeader>
						<CardContent className="mt-6">
							<form onSubmit={handleRegister} className="space-y-6">
								<motion.div
									className="space-y-3"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 }}
								>
									<label
										htmlFor="name"
										className="text-lg font-medium text-white-pure"
									>
										Nome completo
									</label>
									<Input
										type="text"
										id="name"
										placeholder="Digite seu nome completo"
										value={name}
										onChange={(e) => setName(e.target.value)}
										required
										className="bg-gray-dark/50 border-electric text-white-pure
                    placeholder-gray-light focus:ring-2 focus:ring-neon-blue
                    transition-all duration-300 h-12 text-lg"
									/>
								</motion.div>
								<motion.div
									className="space-y-3"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.3 }}
								>
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
                    placeholder-gray-light focus:ring-2 focus:ring-neon-blue
                    transition-all duration-300 h-12 text-lg"
									/>
								</motion.div>
								<motion.div
									className="space-y-3"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.4 }}
								>
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
                    placeholder-gray-light focus:ring-2 focus:ring-neon-blue
                    transition-all duration-300 h-12 text-lg"
									/>
								</motion.div>
								<motion.div
									className="space-y-3"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.5 }}
								>
									<label
										htmlFor="confirmPassword"
										className="text-lg font-medium text-white-pure"
									>
										Confirme a senha
									</label>
									<Input
										type={showConfirmPassword ? "text" : "password"}
										id="confirmPassword"
										placeholder="Confirme sua senha"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
										className="bg-gray-dark/50 border-electric text-white-pure
                    placeholder-gray-light focus:ring-2 focus:ring-neon-blue
                    transition-all duration-300 h-12 text-lg"
									/>
								</motion.div>
								{error && (
									<motion.div
										initial={{ opacity: 0, y: -20 }}
										animate={{ opacity: 1, y: 0 }}
										className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-6 text-center"
									>
										{error}
									</motion.div>
								)}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.6 }}
								>
									<Button
										type="submit"
										disabled={isLoading}
										className={`w-full bg-neon-blue text-white-pure font-bold text-xl
                    py-5 rounded-xl shadow-lg transition-all duration-300
                    hover:bg-electric hover:text-black hover:shadow-neon
                    focus:ring-4 focus:ring-neon-blue/50 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
									>
										{isLoading ? "Registrando..." : "Criar conta"}
									</Button>
								</motion.div>
							</form>
						</CardContent>
						<CardFooter className="flex justify-center mt-6 pb-4">
							<Button
								variant="link"
								className="text-neon-pink hover:text-white-pure transition-colors duration-300 text-lg"
								onClick={() => navigate("/login")}
							>
								Já tem uma conta? Faça Login
							</Button>
						</CardFooter>
					</Card>
				</div>
			</motion.div>
		</div>
	);
};

export default Register;
