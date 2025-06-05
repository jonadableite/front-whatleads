//app/agents/SearchInput.tsx
"use client";
import { Input } from "@/components/ui/input";
import {
	AnimatePresence,
	motion,
	useMotionValue,
	useTransform,
} from "framer-motion";
import { Search, X } from "lucide-react";
import { useRef, useState } from "react";

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	theme?: "dark" | "light";
}

export function SearchInput({
	value,
	onChange,
	placeholder = "Search agents...",
	className = "",
	theme = "dark",
}: SearchInputProps) {
	const [isFocused, setIsFocused] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const pulseAnim = useMotionValue(0);
	const pulseOpacity = useTransform(pulseAnim, [0, 1], [0, 0.2]);

	// Determina as cores com base no tema
	const colors = {
		bg: theme === "dark" ? "bg-[#16151D]" : "bg-white",
		border: theme === "dark" ? "border-[#2a283a]" : "border-gray-200",
		text: theme === "dark" ? "text-white" : "text-gray-800",
		placeholder:
			theme === "dark"
				? "placeholder:text-gray-400"
				: "placeholder:text-gray-500",
		icon: theme === "dark" ? "text-gray-400" : "text-gray-500",
		iconHover: theme === "dark" ? "hover:text-white" : "hover:text-gray-800",
		focus:
			theme === "dark"
				? "focus:border-[#9238c7] focus:ring-[#9238c7]/20"
				: "focus:border-[#7046c0] focus:ring-[#7046c0]/20",
		accentColor: theme === "dark" ? "#9238c7" : "#7046c0",
	};

	const handleFocus = () => {
		setIsFocused(true);
		pulseAnim.set(1);
		setTimeout(() => pulseAnim.set(0), 300);
	};

	const handleClear = () => {
		onChange("");
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	return (
		<motion.div
			className={`relative ${className} rounded-md overflow-hidden group`}
			whileHover={{ scale: 1.01 }}
			transition={{ duration: 0.2 }}
		>
			{/* Efeito de pulso ao focar */}
			<motion.div
				className="absolute inset-0 rounded-md"
				style={{
					backgroundColor: colors.accentColor,
					opacity: pulseOpacity,
				}}
			/>

			{/* Container principal */}
			<div
				className={`relative ${colors.bg} border ${colors.border} rounded-md transition-all duration-300 ${
					isFocused
						? `ring-2 ${theme === "dark" ? "ring-[#9238c7]/30" : "ring-[#7046c0]/30"} border-[${colors.accentColor}]`
						: ""
				}`}
			>
				<div className="flex items-center">
					{/* Ícone de busca com animação */}
					<motion.div
						className="absolute left-3 top-1/2 -translate-y-1/2"
						animate={{
							x: isFocused ? [0, -2, 0] : 0,
							scale: isFocused ? 1.1 : 1,
							color: isFocused ? colors.accentColor : "",
						}}
						transition={{ duration: 0.2 }}
					>
						<Search className={`h-4 w-4 ${colors.icon}`} />
					</motion.div>

					{/* Input */}
					<Input
						ref={inputRef}
						placeholder={placeholder}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						onFocus={handleFocus}
						onBlur={() => setIsFocused(false)}
						className={`pl-10 w-full ${colors.bg} border-transparent ${colors.text} ${colors.placeholder} ${colors.focus} transition-all duration-300`}
					/>

					{/* Botão limpar com animação */}
					<AnimatePresence>
						{value && (
							<motion.button
								className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.icon} ${colors.iconHover}`}
								onClick={handleClear}
								initial={{ opacity: 0, scale: 0, rotate: -90 }}
								animate={{ opacity: 1, scale: 1, rotate: 0 }}
								exit={{ opacity: 0, scale: 0, rotate: 90 }}
								transition={{ duration: 0.15 }}
								whileTap={{ scale: 0.8 }}
								whileHover={{ scale: 1.2 }}
							>
								<X className="h-4 w-4" />
							</motion.button>
						)}
					</AnimatePresence>
				</div>
			</div>

			{/* Linha animada de foco na parte inferior */}
			{isFocused && (
				<motion.div
					className={`absolute bottom-0 left-0 right-0 h-[2px]`}
					style={{ backgroundColor: colors.accentColor }}
					initial={{ scaleX: 0 }}
					animate={{ scaleX: 1 }}
					exit={{ scaleX: 0 }}
					transition={{ duration: 0.3 }}
				/>
			)}
		</motion.div>
	);
}
