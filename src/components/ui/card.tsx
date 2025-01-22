import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
// src/components/ui/card.tsx
import * as React from "react";

const Card = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		gradient?: boolean;
		hover?: boolean;
		animation?: boolean;
	}
>(({ className, gradient, hover, animation = true, ...props }, ref) => (
	<motion.div
		ref={ref}
		initial={animation ? { opacity: 0, y: 20 } : false}
		animate={animation ? { opacity: 1, y: 0 } : false}
		transition={{ duration: 0.5 }}
		whileHover={hover ? { scale: 1.02, y: -5 } : undefined}
		className={cn(
			"rounded-xl border bg-card text-card-foreground shadow-sm relative overflow-hidden backdrop-blur-sm",
			gradient && "bg-gradient-to-br from-card/50 to-card shadow-xl",
			hover && "transition-all duration-300 hover:shadow-xl",
			className,
		)}
		{...props}
	/>
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex flex-col space-y-1.5 p-6", className)}
		{...props}
	/>
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<motion.h3
		ref={ref}
		initial={{ opacity: 0, x: -20 }}
		animate={{ opacity: 1, x: 0 }}
		className={cn(
			"text-2xl font-semibold leading-none tracking-tight",
			className,
		)}
		{...props}
	/>
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<motion.p
		ref={ref}
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		transition={{ delay: 0.2 }}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<motion.div
		ref={ref}
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ delay: 0.3 }}
		className={cn("p-6 pt-0", className)}
		{...props}
	/>
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<motion.div
		ref={ref}
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		transition={{ delay: 0.4 }}
		className={cn("flex items-center p-6 pt-0", className)}
		{...props}
	/>
));
CardFooter.displayName = "CardFooter";

export {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
};
