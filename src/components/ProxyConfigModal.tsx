import { AnimatePresence, motion } from "framer-motion";
import { Globe, Key, Shield, User, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface ProxyConfigModalProps {
	instanceName: string;
	onClose: () => void;
	onSave: (config: ProxyConfig) => void;
}

interface ProxyConfig {
	host: string;
	port: string;
	username: string;
	password: string;
}

const ProxyConfigModal: React.FC<ProxyConfigModalProps> = ({
	instanceName,
	onClose,
	onSave,
}) => {
	const [proxyHost, setProxyHost] = useState("");
	const [proxyPort, setProxyPort] = useState("");
	const [proxyUsername, setProxyUsername] = useState("");
	const [proxyPassword, setProxyPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSave = async () => {
		if (!proxyHost || !proxyPort) {
			toast.error("Host e porta são obrigatórios");
			return;
		}

		setIsLoading(true);
		try {
			await onSave({
				host: proxyHost,
				port: proxyPort,
				username: proxyUsername,
				password: proxyPassword,
			});
			toast.success("Configurações salvas com sucesso!");
		} catch (error) {
			toast.error("Erro ao salvar configurações");
		} finally {
			setIsLoading(false);
		}
	};

	const inputVariants = {
		focus: { scale: 1.02, boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.5)" },
	};

	const buttonVariants = {
		hover: { scale: 1.02 },
		tap: { scale: 0.98 },
	};

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			>
				<motion.div
					initial={{ y: 50, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 50, opacity: 0 }}
					className="bg-gradient-to-br from-electric to-deep/30 backdrop-blur-50 p-8 rounded-2xl shadow-2xl w-full max-w-md relative"
				>
					<motion.button
						whileHover={{ scale: 1.1, rotate: 90 }}
						whileTap={{ scale: 0.9 }}
						onClick={onClose}
						className="absolute top-4 right-4 text-gray-500 hover:text-gray-700  transition-colors"
					>
						<X className="w-6 h-6" />
					</motion.button>

					<motion.div
						initial={{ x: -20, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ delay: 0.1 }}
						className="flex items-center space-x-3 mb-6"
					>
						<Shield className="w-8 h-8 text-neon-green" />
						<h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-white">
							Configurar Proxy para {instanceName}
						</h2>
					</motion.div>

					<div className="space-y-6">
						<motion.div
							initial={{ x: -20, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ delay: 0.2 }}
							className="relative"
						>
							<Globe className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
							<label className="block text-gray-400 text-sm font-medium mb-2">
								Host do Proxy
							</label>
							<motion.input
								whileFocus="focus"
								variants={inputVariants}
								type="text"
								value={proxyHost}
								onChange={(e) => setProxyHost(e.target.value)}
								className="pl-10 w-full p-3 bg-white/30  border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 focus:border-transparent transition-all duration-200"
								placeholder="Ex: proxy.example.com"
							/>
						</motion.div>

						<motion.div
							initial={{ x: -20, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ delay: 0.3 }}
							className="relative"
						>
							<label className="block text-gray-400 text-sm font-medium mb-2">
								Porta do Proxy
							</label>
							<motion.input
								whileFocus="focus"
								variants={inputVariants}
								type="number"
								value={proxyPort}
								onChange={(e) => setProxyPort(e.target.value)}
								className="pl-10 w-full p-3 bg-white/30 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 focus:border-transparent transition-all duration-200"
								placeholder="Ex: 8080"
							/>
						</motion.div>

						<motion.div
							initial={{ x: -20, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ delay: 0.4 }}
							className="relative"
						>
							<User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
							<label className="block text-gray-400  text-sm font-medium mb-2">
								Usuário do Proxy
							</label>
							<motion.input
								whileFocus="focus"
								variants={inputVariants}
								type="text"
								value={proxyUsername}
								onChange={(e) => setProxyUsername(e.target.value)}
								className="pl-10 w-full p-3 bg-white/30 d border border-gray-700  rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 focus:border-transparent transition-all duration-200"
								placeholder="Usuário (opcional)"
							/>
						</motion.div>

						<motion.div
							initial={{ x: -20, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ delay: 0.5 }}
							className="relative"
						>
							<Key className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
							<label className="block text-gray-400 text-sm font-medium mb-2">
								Senha do Proxy
							</label>
							<motion.input
								whileFocus="focus"
								variants={inputVariants}
								type="password"
								value={proxyPassword}
								onChange={(e) => setProxyPassword(e.target.value)}
								className="pl-10 w-full p-3 bg-white/30 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 focus:border-transparent transition-all duration-200"
								placeholder="Senha (opcional)"
							/>
						</motion.div>
					</div>

					<motion.button
						variants={buttonVariants}
						whileHover="hover"
						whileTap="tap"
						disabled={isLoading}
						onClick={handleSave}
						className="mt-8 w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? (
							<motion.div
								animate={{ rotate: 360 }}
								transition={{
									duration: 1,
									repeat: Number.POSITIVE_INFINITY,
									ease: "linear",
								}}
								className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
							/>
						) : (
							"Salvar Configurações"
						)}
					</motion.button>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default ProxyConfigModal;
