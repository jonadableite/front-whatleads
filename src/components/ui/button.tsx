// src/components/ui/button.tsx
// @ts-nocheck // Manter se houver outros problemas de tipagem, mas este ajuste deve ajudar
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import {
	type HTMLMotionProps,
	type Variants,
	motion,
} from "framer-motion";
import type { ReactNode } from "react";
import * as React from "react";

const buttonVariants = cva(
	"inline-flex items-center justify-center rounded-lg text-sm font-medium relative overflow-hidden transition-all duration-300",
	{
		variants: {
			variant: {
				default:
					"bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 backdrop-blur-sm",
				destructive:
					"bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground hover:from-destructive/90 hover:to-destructive shadow-lg shadow-destructive/30 hover:shadow-xl hover:shadow-destructive/40",
				outline:
					"border-2 border-input bg-transparent hover:bg-accent hover:text-accent-foreground backdrop-blur-sm hover:border-electric",
				secondary:
					"bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-secondary/40",
				ghost: "hover:bg-accent hover:text-accent-foreground backdrop-blur-sm",
				link: "text-primary underline-offset-4 hover:underline",
				glow: "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:shadow-[0_0_25px_rgba(79,70,229,0.7)]",
				neon: "bg-gradient-to-r from-electric via-neon-green to-electric text-white shadow-[0_0_15px_rgba(0,255,106,0.5)] hover:shadow-[0_0_25px_rgba(0,255,106,0.7)]",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-md px-3 text-xs",
				lg: "h-11 rounded-md px-8 text-base",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

// Tipo para as props do botão, incluindo props padrão e de motion
interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>, // Props padrão de botão
	VariantProps<typeof buttonVariants>,
	HTMLMotionProps<"button"> // Props de motion para um botão
{
	asChild?: boolean;
	children?: ReactNode;
}

// Tipo de componente para lidar com diferentes renderizações
type ButtonComponentType =
	| React.ComponentType<any>
	| React.ForwardRefExoticComponent<any>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, children, ...props }, ref) => {
		// Definir variantes de animação
		const buttonAnimationVariants: Variants = {
			rest: {
				scale: 1,
				filter: "brightness(1)",
			},
			hover: {
				scale: 1.02,
				filter: "brightness(1.1)",
			},
			tap: {
				scale: 0.98,
				filter: "brightness(0.9)",
			},
		};

		const shimmerAnimation: Variants = {
			rest: {
				x: "-100%",
				opacity: 0,
			},
			hover: {
				x: "100%",
				opacity: 0.5,
				transition: {
					duration: 1,
					ease: "easeInOut",
					repeat: Number.POSITIVE_INFINITY,
				},
			},
		};

		// Determina o componente a ser renderizado (Slot ou motion.button)
		const Comp = asChild ? Slot : motion.button;

		// Prepara as props para o componente
		// Removemos as props whileHover, whileTap, etc. de 'props'
		// para não passá-las para o Slot quando asChild for true.
		// Elas serão adicionadas condicionalmente abaixo.
		const {
			whileHover, // Remove whileHover de props
			whileTap,   // Remove whileTap de props
			initial,    // Remove initial de props
			animate,    // Remove animate de props
			variants,   // Remove variants de props
			transition, // Remove transition de props
			...standardProps // Mantém todas as outras props (onClick, type, etc.)
		} = props;

		const componentProps: any = { // Usar 'any' temporariamente se a tipagem for complexa
			className: cn(buttonVariants({ variant, size, className })),
			ref,
			...standardProps, // Passa props padrão
		};

		// Adiciona props de motion apenas se não for asChild
		if (!asChild) {
			Object.assign(componentProps, {
				variants: variants || buttonAnimationVariants, // Usa variants passados ou o padrão
				initial: initial || "rest", // Usa initial passado ou o padrão
				whileHover: whileHover || "hover", // Usa whileHover passado ou o padrão
				whileTap: whileTap || "tap",     // Usa whileTap passado ou o padrão
				animate: animate || "rest",  // Usa animate passado ou o padrão
				transition: transition // Passa transition se existir
			});
		}

		return (
			// Removemos a motion.div externa
			<Comp {...componentProps}>
				<span className="relative z-10 flex items-center gap-2">
					{children}
				</span>
				{/* Efeito Shimmer - aplica apenas se for o motion.button */}
				{!asChild && (
					<motion.div
						className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
						variants={shimmerAnimation}
					/>
				)}
				{/* Este div parece decorativo, mantém */}
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-lg" />
			</Comp>
		);
	}
);

Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };

