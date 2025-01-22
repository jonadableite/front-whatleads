import { cn } from "@/lib/utils";
// src/components/ui/input-with-icon.tsx
import type { InputHTMLAttributes, ReactNode } from "react";

interface InputWithIconProps extends InputHTMLAttributes<HTMLInputElement> {
	icon?: ReactNode;
}

export const InputWithIcon: React.FC<InputWithIconProps> = ({
	icon,
	className,
	...props
}) => {
	return (
		<div className="relative">
			{icon && (
				<div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
					{icon}
				</div>
			)}
			<input
				{...props}
				className={cn(
					"w-full bg-deep/50 border-electric text-white rounded-lg px-4 py-2",
					icon && "pl-10",
					className,
				)}
			/>
		</div>
	);
};
