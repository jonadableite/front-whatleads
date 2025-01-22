// src/components/ui/table.tsx
import { cn } from "@/lib/utils";
import type React from "react";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
	children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({
	children,
	className,
	...props
}) => {
	return (
		<div className="w-full overflow-auto rounded-xl border border-electric/30 bg-deep/50 backdrop-blur-xl">
			<table
				className={cn("w-full border-collapse text-sm text-white", className)}
				{...props}
			>
				{children}
			</table>
		</div>
	);
};

export const Thead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
	children,
	className,
	...props
}) => (
	<thead className={cn("bg-deep/50 text-white/70", className)} {...props}>
		{children}
	</thead>
);

export const Tbody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
	children,
	className,
	...props
}) => (
	<tbody className={cn("divide-y divide-electric/30", className)} {...props}>
		{children}
	</tbody>
);

export const Tr: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
	children,
	className,
	...props
}) => (
	<tr
		className={cn("transition-colors hover:bg-electric/10", className)}
		{...props}
	>
		{children}
	</tr>
);

export const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
	children,
	className,
	...props
}) => (
	<th className={cn("px-4 py-3 text-left font-medium", className)} {...props}>
		{children}
	</th>
);

export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
	children,
	className,
	...props
}) => (
	<td className={cn("px-4 py-3", className)} {...props}>
		{children}
	</td>
);
