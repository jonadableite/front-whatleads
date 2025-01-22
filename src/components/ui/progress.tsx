// src/components/ui/progress.tsx
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { motion } from "framer-motion";
import * as React from "react";

const Progress = React.forwardRef<
	React.ElementRef<typeof ProgressPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
	<ProgressPrimitive.Root
		ref={ref}
		className="relative overflow-hidden rounded-full bg-electric/10"
		{...props}
	>
		<motion.div
			initial={{ width: 0 }}
			animate={{ width: `${value}%` }}
			transition={{ duration: 0.5 }}
			className="h-full bg-gradient-to-r from-neon-green to-electric"
		>
			<motion.div
				className="absolute inset-0 bg-white/20"
				animate={{
					x: ["0%", "100%"],
					opacity: [0, 1, 0],
				}}
				transition={{
					duration: 2,
					repeat: Number.POSITIVE_INFINITY,
					ease: "linear",
				}}
			/>
		</motion.div>
	</ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
