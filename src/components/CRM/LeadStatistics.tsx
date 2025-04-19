import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	ArrowDownRight,
	ArrowUpRight,
	BookOpen,
	MessageCircle,
	TrendingUp,
	Users,
} from "lucide-react";
// src/components/CRM/LeadStatistics.tsx
import type React from "react";

interface LeadStatisticsProps {
	totalLeads: number;
	newLeads: number;
	convertedLeads: number;
	engagementRate: number;
	className?: string;
}

const StatCard: React.FC<{
	icon: React.ReactNode;
	title: string;
	value: number | string;
	trend?: "up" | "down";
	trendPercentage?: number;
	tooltipContent?: string;
}> = ({ icon, title, value, trend, trendPercentage, tooltipContent }) => {
	const renderTrendIcon = () => {
		if (!trend) return null;

		return trend === "up" ? (
			<ArrowUpRight className="text-green-500 w-4 h-4" />
		) : (
			<ArrowDownRight className="text-red-500 w-4 h-4" />
		);
	};

	const cardContent = (
		<Card className="hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{title}
				</CardTitle>
				{icon}
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold flex items-center gap-2">
					{value}
					{trend && renderTrendIcon()}
					{trendPercentage && (
						<span
							className={`text-xs ${trend === "up" ? "text-green-500" : "text-red-500"}`}
						>
							{trendPercentage}%
						</span>
					)}
				</div>
			</CardContent>
		</Card>
	);

	return tooltipContent ? (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>{cardContent}</TooltipTrigger>
				<TooltipContent>{tooltipContent}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	) : (
		cardContent
	);
};

const LeadStatistics: React.FC<LeadStatisticsProps> = ({
	totalLeads,
	newLeads,
	convertedLeads,
	engagementRate,
	className,
}) => {
	const calculateConversionRate = () => {
		if (totalLeads === 0) return 0;
		return Number(((convertedLeads / totalLeads) * 100).toFixed(2));
	};

	return (
		<div
			className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
		>
			<StatCard
				icon={<Users className="text-muted-foreground" />}
				title="Total de Leads"
				value={totalLeads}
				trend="up"
				trendPercentage={12.5}
				tooltipContent="Número total de leads cadastrados"
			/>

			<StatCard
				icon={<BookOpen className="text-muted-foreground" />}
				title="Novos Leads"
				value={newLeads}
				trend="up"
				trendPercentage={8.3}
				tooltipContent="Leads adicionados recentemente"
			/>

			<StatCard
				icon={<TrendingUp className="text-muted-foreground" />}
				title="Leads Convertidos"
				value={convertedLeads}
				trend={convertedLeads > 0 ? "up" : undefined}
				trendPercentage={calculateConversionRate()}
				tooltipContent="Leads que se tornaram clientes"
			/>

			<StatCard
				icon={<MessageCircle className="text-muted-foreground" />}
				title="Taxa de Engajamento"
				value={`${engagementRate}%`}
				trend={engagementRate > 50 ? "up" : "down"}
				tooltipContent="Percentual de leads que interagem com suas campanhas"
			/>
		</div>
	);
};

export default LeadStatistics;
