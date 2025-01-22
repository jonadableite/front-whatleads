import { Button } from "@/components/ui/button";
// src/pages/ErrorPage.tsx
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function ErrorPage() {
	const error = useRouteError();

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-deep-purple to-deep-blue p-4">
			<div className="text-center space-y-4">
				<h1 className="text-4xl font-bold text-white">Oops!</h1>
				<p className="text-xl text-white/80">
					{isRouteErrorResponse(error)
						? error.status === 404
							? "Página não encontrada"
							: "Ocorreu um erro inesperado"
						: "Ocorreu um erro inesperado"}
				</p>
				<div className="flex gap-4 justify-center mt-6">
					<Button
						onClick={() => (window.location.href = "/")}
						className="bg-electric hover:bg-neon-green text-white"
					>
						Voltar ao início
					</Button>
					<Button
						onClick={() => window.location.reload()}
						variant="outline"
						className="text-white border-electric hover:bg-electric/20"
					>
						Tentar novamente
					</Button>
				</div>
			</div>
		</div>
	);
}
