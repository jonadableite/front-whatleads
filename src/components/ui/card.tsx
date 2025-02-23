import { cn } from "@/lib/utils";
import {
	type HTMLMotionProps,
	type MotionProps,
	type Variants,
	motion,
} from "framer-motion";
import type { HTMLAttributes, ReactNode, Ref } from "react";
import * as React from "react";

// Interfaces para os componentes do Card
export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;
export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;
export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
export type CardContentProps = HTMLAttributes<HTMLDivElement>;
export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

// Interface para combinar propriedades HTML e Framer Motion
interface CardProps extends HTMLMotionProps<"div"> {
	gradient?: boolean;
	hover?: boolean;
	animation?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ className, gradient, hover, animation = true, ...props }, ref) => {
		const motionProps: MotionProps = {
			initial: animation ? "hidden" : false,
			animate: animation ? "visible" : false,
			variants: {
				hidden: { opacity: 0, y: 20 },
				visible: {
					opacity: 1,
					y: 0,
					transition: { duration: 0.5 },
				},
				hover: hover
					? {
							scale: 1.02,
							y: -5,
							transition: { duration: 0.3 },
						}
					: {},
			},
			whileHover: hover ? "hover" : undefined,
		};

		return (
			<motion.div
				ref={ref}
				{...motionProps}
				className={cn(
					"rounded-xl border bg-card text-card-foreground shadow-sm relative overflow-hidden backdrop-blur-sm",
					gradient && "bg-gradient-to-br from-card/50 to-card shadow-xl",
					hover && "transition-all duration-300 hover:shadow-xl",
					className,
				)}
				{...props}
			/>
		);
	},
);
Card.displayName = "Card";

// Tipo mais específico para elementos HTML suportados
type SupportedHTMLElements = "div" | "h3" | "p" | "span" | "header" | "footer";

// Função auxiliar para criar componentes de motion com tipagem segura
const createMotionComponent = <T extends SupportedHTMLElements>(
	elementType: T,
) => {
	// Tipo personalizado para props de motion
	type MotionComponentProps = Omit<HTMLMotionProps<T>, "children" | "ref"> & {
		children?: ReactNode;
		className?: string;
		ref?: Ref<HTMLElementTagNameMap[T]>;
	};

	return React.forwardRef<HTMLElementTagNameMap[T], MotionComponentProps>(
		({ className, children, ...props }, ref) => {
			const animationVariants: Variants = {
				hidden: { opacity: 0, x: -20 },
				visible: {
					opacity: 1,
					x: 0,
					transition: { duration: 0.5 },
				},
			};

			// Criação do componente de motion com tipagem segura
			const MotionComponent = motion[
				elementType
			] as React.ComponentType<MotionComponentProps>;

			return (
				// @ts-expect-error
				<MotionComponent
					ref={ref}
					initial="hidden"
					animate="visible"
					variants={animationVariants}
					className={cn(className)}
					{...props}
				>
					{children}
				</MotionComponent>
			);
		},
	);
};

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("flex flex-col space-y-1.5 p-6", className)}
			{...props}
		/>
	),
);
CardHeader.displayName = "CardHeader";

const CardTitle = createMotionComponent("h3");
CardTitle.displayName = "CardTitle";

const CardDescription = createMotionComponent("p");
CardDescription.displayName = "CardDescription";

const CardContent = createMotionComponent("div");
CardContent.displayName = "CardContent";

const CardFooter = createMotionComponent("div");
CardFooter.displayName = "CardFooter";

export {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
};
