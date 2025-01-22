// src/components/ui/input.tsx
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import * as React from "react";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, rightIcon, ...props }, ref) => {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="relative w-full"
			>
				<input
					type={type}
					className={cn(
						"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 backdrop-blur-sm relative z-10",
						rightIcon && "pr-12",
						className,
					)}
					ref={ref}
					{...props}
				/>
				{rightIcon && (
					<div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
						{rightIcon}
					</div>
				)}
				<div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-md blur opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
			</motion.div>
		);
	},
);
Input.displayName = "Input";

export { Input };
