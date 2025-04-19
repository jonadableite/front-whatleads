import type React from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface Client {
	id: string;
	name: string;
	email: string;
	phone: string;
	status: string;
}

interface CRMTableProps {
	clients: Client[];
	onEdit: (client: Client) => void;
	onDelete: (clientId: string) => void;
}

const CRMTable: React.FC<CRMTableProps> = ({ clients, onEdit, onDelete }) => {
	return (
		<div className="w-full overflow-x-auto">
			<table className="w-full text-left">
				<thead className="bg-deep/50 text-white/80">
					<tr>
						<th className="p-4">Nome</th>
						<th className="p-4">Email</th>
						<th className="p-4">Telefone</th>
						<th className="p-4">Status</th>
						<th className="p-4">Ações</th>
					</tr>
				</thead>
				<tbody>
					{clients.map((client) => (
						<tr
							key={client.id}
							className="border-b border-electric/20 hover:bg-electric/10 transition-colors"
						>
							<td className="p-4 text-white">{client.name}</td>
							<td className="p-4 text-white/80">{client.email}</td>
							<td className="p-4 text-white/80">{client.phone}</td>
							<td className="p-4">
								<span
									className={`
                    px-3 py-1 rounded-full text-xs
                    ${
											client.status === "ATIVO"
												? "bg-neon-green/20 text-neon-green"
												: client.status === "POTENCIAL"
													? "bg-yellow-500/20 text-yellow-500"
													: "bg-red-500/20 text-red-500"
										}
                  `}
								>
									{client.status}
								</span>
							</td>
							<td className="p-4 flex items-center space-x-2">
								<button
									onClick={() => onEdit(client)}
									className="text-electric hover:text-electric/80 transition-colors"
								>
									<FiEdit />
								</button>
								<button
									onClick={() => onDelete(client.id)}
									className="text-red-500 hover:text-red-600 transition-colors"
								>
									<FiTrash2 />
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{clients.length === 0 && (
				<div className="text-center py-8 text-white/60">
					Nenhum cliente encontrado
				</div>
			)}
		</div>
	);
};

export default CRMTable;
