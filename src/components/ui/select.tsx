// src/components/ui/select.tsx
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { motion } from "framer-motion"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
	<SelectPrimitive.Trigger
		ref={ref}
		className={cn(
			"flex h-12 w-full items-center justify-between rounded-xl",
			"border border-electric/30 bg-deep/50 px-4 py-2 text-sm",
			"focus:outline-none focus:ring-2 focus:ring-electric/50 focus:ring-offset-2",
			"disabled:cursor-not-allowed disabled:opacity-50",
			"text-white placeholder-white/70",
			"backdrop-blur-xl transition-all duration-300 hover:border-electric/60",
			className
		)}
		{...props}
	>
		{children}
		<SelectPrimitive.Icon asChild>
			<motion.div
				whileHover={{ rotate: 180 }}
				transition={{ type: "spring", stiffness: 300 }}
			>
				<ChevronsUpDown className="h-5 w-5 text-white/60 opacity-70" />
			</motion.div>
		</SelectPrimitive.Icon>
	</SelectPrimitive.Trigger>
))

SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<SelectPrimitive.Portal>
		<SelectPrimitive.Content
			ref={ref}
			className={cn(
				"relative z-50 min-w-[8rem] overflow-hidden",
				"rounded-xl border border-electric/30",
				"bg-deep/80 backdrop-blur-xl shadow-lg",
				"data-[state=open]:animate-in data-[state=closed]:animate-out",
				"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
				"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
				"data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
				className
			)}
			position="popper"
			{...props}
		>
			<SelectPrimitive.Viewport
				className="h-full w-full p-1 space-y-1"
			>
				{children}
			</SelectPrimitive.Viewport>
			<SelectPrimitive.ScrollDownButton />
		</SelectPrimitive.Content>
	</SelectPrimitive.Portal>
))

SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
	<SelectPrimitive.Item
		ref={ref}
		className={cn(
			"relative flex w-full cursor-pointer select-none items-center",
			"rounded-lg p-3 text-sm outline-none",
			"text-gray-300 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			"data-[highlighted]:bg-electric/10 data-[highlighted]:text-white",
			"data-[state=checked]:bg-electric/20 data-[state=checked]:text-white",
			"focus:bg-electric/20 hover:bg-electric/10",
			"transition-all duration-200 group",
			className
		)}
		{...props}
	>
		<div className="absolute left-2 opacity-0 group-data-[state=checked]:opacity-100">
			<motion.div
				initial={{ scale: 0, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{
					type: "spring",
					stiffness: 300,
					damping: 20
				}}
			>
				<Check className="h-4 w-4 text-electric" />
			</motion.div>
		</div>
		<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
	</SelectPrimitive.Item>
))

SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectLabel = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Label
		ref={ref}
		className={cn(
			"px-4 py-2 text-xs font-medium text-white/60",
			"bg-deep/20 backdrop-blur-md",
			className
		)}
		{...props}
	/>
))

SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectSeparator = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Separator
		ref={ref}
		className={cn(
			"h-px bg-electric/20 my-1",
			className
		)}
		{...props}
	/>
))

SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
	Select,
	SelectGroup,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectLabel,
	SelectItem,
	SelectSeparator
}
