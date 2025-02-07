import { motion } from "framer-motion";
import type React from "react";
import { useState } from "react";
import type { EditPaymentModalProps, Payment } from "../interface";

const EditPaymentModal: React.FC<EditPaymentModalProps> = ({
	payment,
	onClose,
	onSave,
}) => {
	const [amount, setAmount] = useState(payment.amount);
	const [dueDate, setDueDate] = useState(payment.dueDate);
	const [status, setStatus] = useState(payment.status);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onSave(payment.id, { amount, dueDate, status });
		onClose();
	};

	return (
		<motion.div
			className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			<motion.div
				className="bg-deep/80 p-6 rounded-lg shadow-lg w-96"
				initial={{ scale: 0.8 }}
				animate={{ scale: 1 }}
				transition={{ duration: 0.2 }}
			>
				<h2 className="text-xl font-bold text-white mb-4">Editar Pagamento</h2>
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label className="block text-sm font-medium text-white">
							Valor
						</label>
						<input
							type="number"
							value={amount}
							onChange={(e) => setAmount(Number(e.target.value))}
							className="mt-1 block w-full rounded-md border-gray-600 bg-deep/60 text-white shadow-sm focus:border-electric focus:ring-electric"
						/>
					</div>
					<div className="mb-4">
						<label className="block text-sm font-medium text-white">
							Data de Vencimento
						</label>
						<input
							type="date"
							value={dueDate}
							onChange={(e) => setDueDate(e.target.value)}
							className="mt-1 block w-full rounded-md border-gray-600 bg-deep/60 text-white shadow-sm focus:border-electric focus:ring-electric"
						/>
					</div>
					<div className="mb-4">
						<label className="block text-sm font-medium text-white">
							Status
						</label>
						<select
							value={status}
							onChange={(e) => setStatus(e.target.value as Payment["status"])}
							className="mt-1 block w-full rounded-md border-gray-600 bg-deep/60 text-white shadow-sm focus:border-electric focus:ring-electric"
						>
							<option value="pending">Pendente</option>
							<option value="completed">Completo</option>
							<option value="overdue">Atrasado</option>
						</select>
					</div>
					<div className="flex justify-end">
						<button
							type="button"
							onClick={onClose}
							className="mr-4 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-electric text-white rounded-md hover:bg-electric/80"
						>
							Salvar
						</button>
					</div>
				</form>
			</motion.div>
		</motion.div>
	);
};

export default EditPaymentModal;
