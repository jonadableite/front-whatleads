// src/components/LoadingScreen.tsx
import { motion } from "framer-motion";

export const LoadingScreen = () => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 bg-deep/95 backdrop-blur-xl flex items-center justify-center z-50 overflow-hidden"
		>
			<motion.div
				initial={{ scale: 0.5, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{
					duration: 0.8,
					ease: "easeOut",
				}}
				className="text-center relative"
			>
				<motion.div
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 360],
						borderRadius: ["50%", "30%", "50%"],
					}}
					transition={{
						duration: 3,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
					className="w-32 h-32 bg-gradient-to-r from-electric to-blue-500 mx-auto mb-8 shadow-lg shadow-electric/50"
				/>

				<motion.div
					animate={{
						scale: [1, 1.1, 1],
						opacity: [0.5, 1, 0.5],
					}}
					transition={{
						duration: 2,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
					className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-electric rounded-full filter blur-3xl opacity-20"
				/>

				<motion.h2
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.2, duration: 0.8 }}
					className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-electric to-blue-500 mb-4"
				>
					Carregando
				</motion.h2>

				<motion.div
					initial={{ width: 0 }}
					animate={{ width: "100%" }}
					transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
					className="h-2 bg-gradient-to-r from-electric to-blue-500 rounded-full mb-4"
				/>

				<motion.p
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.4, duration: 0.8 }}
					className="text-xl text-white/60 font-light"
				>
					Preparando uma experiência incrível...
				</motion.p>
			</motion.div>

			<motion.div
				className="absolute inset-0 pointer-events-none"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5, duration: 1 }}
			>
				{[...Array(20)].map((_, index) => (
					<motion.div
						key={index}
						className="absolute w-2 h-2 bg-electric rounded-full"
						initial={{
							x: Math.random() * window.innerWidth,
							y: Math.random() * window.innerHeight,
							scale: 0,
						}}
						animate={{
							y: [null, Math.random() * window.innerHeight],
							scale: [0, 1, 0],
						}}
						transition={{
							duration: Math.random() * 3 + 2,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					/>
				))}
			</motion.div>
		</motion.div>
	);
};
