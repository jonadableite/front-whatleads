// src/pages/Bottest.tsx

import type React from "react";
import BotSettingsWithWorkflow from "../components/fluxoflows/bot-workflow-integration";
// import { api } from "@/lib/api";

const exampleBotData: any = {
	steps: {
		inicio: {
			mensagem:
				"Olá {{pushNameUser}}! 👋 Como podemos te ajudar hoje?\n\n1️⃣ - Financeiro\n2️⃣ - Comercial\n3️⃣ - Suporte Técnico\n4️⃣ - Segunda via de Boleto",
			respostas: {
				"1": {
					next: "cidade",
					valor: "financeiro",
				},
				"2": {
					next: "cidade",
					valor: "comercial",
				},
				"3": {
					next: "cidade",
					valor: "suporte",
				},
				"4": {
					next: "cidade",
					valor: "boleto",
				},
				financeiro: {
					next: "cidade",
					valor: "financeiro",
				},
				comercial: {
					next: "cidade",
					valor: "comercial",
				},
				suporte: {
					next: "cidade",
					valor: "suporte",
				},
				boleto: {
					next: "cidade",
					valor: "boleto",
				},
			},
			naoentendi:
				"Não entendi {{pushNameUser}} 🤔. Por favor, escolha uma das opções digitando o número ou nome:\n1 - Financeiro\n2 - Comercial\n3 - Suporte\n4 - Boleto",
		},
		cidade: {
			mensagem: "Legal {{pushNameUser}}! 🏙️ Qual a sua cidade?",
			inputLivre: true,
			next: "empreendimento",
			respostas: "cidade",
			naoentendi:
				"Desculpe, não consegui identificar. Pode repetir o nome da sua cidade? 📍",
		},
		empreendimento: {
			mensagem:
				"Qual o empreendimento que você tem interesse, {{pushNameUser}}?\n\n1️⃣ - Jardim das Acácias\n2️⃣ - Vila das Flores\n3️⃣ - Parque dos Sonhos\n4️⃣ - Residencial Aurora",
			respostas: {
				"1": {
					next: "confirmar-servico",
					valor: "Jardim das Acácias",
				},
				"2": {
					next: "confirmar-servico",
					valor: "Vila das Flores",
				},
				"3": {
					next: "confirmar-servico",
					valor: "Parque dos Sonhos",
				},
				"4": {
					next: "confirmar-servico",
					valor: "Residencial Aurora",
				},
				"jardim das acácias": {
					next: "confirmar-servico",
					valor: "Jardim das Acácias",
				},
				"vila das flores": {
					next: "confirmar-servico",
					valor: "Vila das Flores",
				},
				"parque dos sonhos": {
					next: "confirmar-servico",
					valor: "Parque dos Sonhos",
				},
				"residencial aurora": {
					next: "confirmar-servico",
					valor: "Residencial Aurora",
				},
			},
			naoentendi:
				"Empreendimento não reconhecido. Por favor, Qual o empreendimento que você tem interesse, {{pushNameUser}}?\n\n1️⃣ - Jardim das Acácias\n2️⃣ - Vila das Flores\n3️⃣ - Parque dos Sonhos\n4️⃣ - Residencial Aurora",
		},
		"confirmar-servico": {
			mensagem:
				"Perfeito {{pushNameUser}}! Só pra confirmar, você quer agendar: *{{servicoSelecionado}}*, correto?\n\n1️⃣ - Sim\n2️⃣ - Não, quero trocar o serviço",
			respostas: {
				"1": {
					next: "horario",
					valor: "horario",
				},
				"2": {
					next: "horario",
					valor: "trocar",
				},
				sim: {
					next: "horario",
					valor: "horario",
				},
				não: {
					next: "empreendimento",
					valor: "trocar",
				},
				nao: {
					next: "empreendimento",
					valor: "trocar",
				},
			},
			naoentendi:
				"Não entendi sua resposta, {{pushNameUser}}. Por favor, digite 1 para confirmar ou 2 para trocar o serviço. 😉",
		},
		horario: {
			mensagem:
				"Perfeito! localização {{ cidade }}, Agora escolha o melhor horário de atendimento:\n\n1️⃣ - Manhã\n2️⃣ - Tarde\n3️⃣ - Noite",
			respostas: {
				"1": {
					next: "finalizar",
					valor: "manha",
				},
				"2": {
					next: "finalizar",
					valor: "tarde",
				},
				"3": {
					next: "finalizar",
					valor: "noite",
				},
				manhã: {
					next: "finalizar",
					valor: "manha",
				},
				manha: {
					next: "finalizar",
					valor: "manha",
				},
				tarde: {
					next: "finalizar",
					valor: "tarde",
				},
				noite: {
					next: "finalizar",
					valor: "noite",
				},
			},
			naoentendi:
				"Horário não reconhecido. Pode repetir digitando 1, 2 ou 3? ⏰",
		},
		finalizar: {
			mensagemFinal: {
				financeiro: {
					mensagem:
						"Certo {{pushNameUser}}! 💸 Vou te conectar com o time Financeiro.",
					setorId: "67b8d47c5b7b4fa03aad2e2c",
				},
				comercial: {
					mensagem:
						"Show {{pushNameUser}}! 🧑‍💼 Nosso time Comercial vai te atender.",
					setorId: "67b8d47c5b7b4fa03aad2e2c",
				},
				suporte: {
					mensagem: "Beleza {{pushNameUser}}! 🛠️ Suporte Técnico chegando!",
					setorId: "67b8d47c5b7b4fa03aad2e2c",
				},
				boleto: {
					mensagem:
						"Sem problema {{pushNameUser}}! 🧾 Vamos te ajudar com o boleto agora mesmo.",
					setorId: "67b8d47c5b7b4fa03aad2e2c",
				},
			},
		},
		expediente_off: {
			mensagem:
				"Olá {{pushNameUser}}! Nosso horário de atendimento é de segunda a sexta, das 8h às 18h. Deixe sua mensagem e retornaremos em breve.",
		},
	},
};

const Bottest: React.FC = () => {
	return (
		<div>
			<BotSettingsWithWorkflow
				botData={exampleBotData}
				companyId={"547ec678-e2fe-4649-94b2-1d1f0de3ad0a"}
			/>
		</div>
	);
};

export default Bottest;
