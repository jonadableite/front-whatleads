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
import axios from "axios";
import { motion } from "framer-motion";
// src/pages/PasswordRecovery.tsx
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

const PasswordRecovery: React.FC = () => {
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSendCode = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await axios.post("https://api.whatlead.com.br/api/password/forgot", {
				email,
			});
			toast.success("Código de recuperação enviado para seu email.");
			setStep(2);
		} catch (error) {
			toast.error(
				"Erro ao enviar código. Verifique seu email e tente novamente.",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyCode = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await axios.post("https://api.whatlead.com.br/api/password/verify", {
				email,
				code,
			});
			toast.success("Código verificado com sucesso.");
			setStep(3);
		} catch (error) {
			toast.error("Código inválido. Tente novamente.");
		} finally {
			setLoading(false);
		}
	};

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await axios.post("https://api.whatlead.com.br/api/password/reset", {
				email,
				code,
				newPassword,
			});
			toast.success("Senha redefinida com sucesso.");
			navigate("/login");
		} catch (error) {
			toast.error("Erro ao redefinir senha. Tente novamente.");
		} finally {
			setLoading(false);
		}
	};

	const stepVariants = {
		hidden: { opacity: 0, x: 50 },
		visible: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: -50 },
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-deep-purple to-deep-blue">
			<MatrixRain />
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-md"
			>
				<Card className="bg-gray-dark/90 shadow-xl border-electric">
					<CardHeader className="space-y-1">
						<motion.div
							initial={{ y: -20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.2 }}
							className="flex justify-center mb-6"
						>
							<motion.img
								src={Logo}
								alt="Logo"
								className="h-20 w-auto"
								whileHover={{ scale: 1.05 }}
								transition={{ type: "spring", stiffness: 300 }}
							/>
						</motion.div>
						<CardTitle className="text-2xl font-bold text-center text-neon-green">
							Recuperação de Senha
						</CardTitle>
						<CardDescription className="text-center text-gray-light">
							{step === 1 &&
								"Insira seu email para receber o código de recuperação."}
							{step === 2 &&
								"Digite o código de 6 dígitos enviado para seu email."}
							{step === 3 && "Crie uma nova senha para sua conta."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<motion.div
							key={step}
							variants={stepVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
							transition={{ type: "tween", duration: 0.5 }}
						>
							{step === 1 && (
								<form onSubmit={handleSendCode} className="space-y-4">
									<Input
										type="email"
										placeholder="Seu email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="bg-gray-darker text-white-pure border-electric focus:ring-neon-green input-text-white"
									/>

									<Button
										type="submit"
										disabled={loading}
										className="w-full bg-electric text-white-pure hover:bg-neon-green hover:text-black transition-all duration-300"
									>
										{loading ? "Enviando..." : "Enviar Código"}
									</Button>
								</form>
							)}
							{step === 2 && (
								<form onSubmit={handleVerifyCode} className="space-y-4">
									<Input
										type="text"
										placeholder="Código de 6 dígitos"
										value={code}
										onChange={(e) => setCode(e.target.value)}
										required
										maxLength={6}
										className="bg-gray-darker text-white-pure border-electric focus:ring-neon-green"
									/>
									<Button
										type="submit"
										disabled={loading}
										className="w-full bg-electric text-white-pure hover:bg-neon-green hover:text-black transition-all duration-300"
									>
										{loading ? "Verificando..." : "Verificar Código"}
									</Button>
								</form>
							)}
							{step === 3 && (
								<form onSubmit={handleResetPassword} className="space-y-4">
									<Input
										type="password"
										placeholder="Nova senha"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										required
										className="bg-gray-darker text-white-pure border-electric focus:ring-neon-green"
									/>
									<Button
										type="submit"
										disabled={loading}
										className="w-full bg-electric text-white-pure hover:bg-neon-green hover:text-black transition-all duration-300"
									>
										{loading ? "Redefinindo..." : "Redefinir Senha"}
									</Button>
								</form>
							)}
						</motion.div>
					</CardContent>
					<CardFooter>
						<Button
							variant="link"
							onClick={() => navigate("/login")}
							className="w-full text-neon-blue hover:text-white-pure transition-colors duration-300"
						>
							Voltar para o Login
						</Button>
					</CardFooter>
				</Card>
			</motion.div>
		</div>
	);
};

export default PasswordRecovery;
