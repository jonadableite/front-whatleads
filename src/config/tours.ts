// src/config/tours.ts
import type { TourConfig } from "@/types/tour";

export const tourConfigs: TourConfig[] = [
  {
    id: "welcome",
    name: "Tour de Boas-vindas",
    description: "Aprenda a usar a plataforma WhatLeads passo a passo",
    autoStart: true,
    showProgress: true,
    allowSkip: true,
    persistent: true,
    steps: [
      {
        id: "welcome-start",
        title: "🎉 Bem-vindo ao WhatLeads!",
        content:
          "Olá! Vou te guiar pelos principais recursos da plataforma. Este tour levará apenas alguns minutos e te ajudará a começar rapidamente.",
        target: '[data-tour="dashboard-container"]',
        placement: "center",
        showSkip: true,
        showNext: true,
        page: "dashboard",
      },
      {
        id: "dashboard-overview",
        title: "📊 Dashboard - Visão Geral",
        content:
          "Este é seu painel principal. Aqui você pode ver estatísticas em tempo real, atividades recentes e o status geral da sua operação.",
        target: '[data-tour="dashboard-stats"]',
        placement: "bottom",
        showPrevious: true,
        showNext: true,
        page: "dashboard",
      },
      {
        id: "sidebar-navigation",
        title: "🧭 Menu de Navegação",
        content:
          "Use este menu lateral para navegar entre as diferentes seções da plataforma. Vamos explorar cada uma delas!",
        target: '[data-tour="sidebar"]',
        placement: "right",
        showPrevious: true,
        showNext: true,
        page: "dashboard",
      },
      {
        id: "instances-intro",
        title: "📱 Instâncias WhatsApp",
        content:
          "Primeiro, você precisa conectar suas instâncias do WhatsApp. Clique aqui para acessar a página de instâncias.",
        target: '[data-tour="instances-menu"]',
        placement: "right",
        showPrevious: true,
        showNext: true,
        page: "dashboard",
        nextRoute: "/instancias",
        action: "navigate",
      },
      {
        id: "instances-page",
        title: "📱 Gerenciar Instâncias",
        content:
          "Aqui você conecta e gerencia suas instâncias do WhatsApp. Cada instância representa um número de WhatsApp que você pode usar para envios.",
        target: '[data-tour="instances-container"]',
        placement: "top",
        showPrevious: true,
        showNext: true,
        page: "instancias",
      },
      {
        id: "create-instance",
        title: "➕ Criar Nova Instância",
        content:
          "Clique neste botão para conectar uma nova instância do WhatsApp. Você precisará escanear um QR Code com seu celular.",
        target: '[data-tour="create-instance-btn"]',
        placement: "bottom",
        showPrevious: true,
        showNext: true,
        page: "instancias",
      },
      {
        id: "warmup-intro",
        title: "🔥 Aquecimento de Instâncias",
        content:
          "Após conectar suas instâncias, é importante aquecê-las para melhorar a deliverabilidade. Vamos ver como fazer isso.",
        target: '[data-tour="warmup-menu"]',
        placement: "right",
        showPrevious: true,
        showNext: true,
        page: "instancias",
        nextRoute: "/aquecimento",
        action: "navigate",
      },
      {
        id: "warmup-page",
        title: "🔥 Aquecimento Inteligente",
        content:
          'O aquecimento simula conversas naturais entre suas instâncias para "esquentar" os números e melhorar a entrega das mensagens.',
        target: '[data-tour="warmup-container"]',
        placement: "top",
        showPrevious: true,
        showNext: true,
        page: "aquecimento",
      },
      {
        id: "warmup-selection",
        title: "✅ Seleção de Instâncias",
        content:
          "Selecione pelo menos duas instâncias para iniciar o aquecimento. Elas trocarão mensagens entre si automaticamente.",
        target: '[data-tour="instance-selection"]',
        placement: "top",
        showPrevious: true,
        showNext: true,
        page: "aquecimento",
      },
      {
        id: "campaigns-intro",
        title: "📢 Campanhas de Marketing",
        content:
          "Agora vamos criar sua primeira campanha! As campanhas organizam seus disparos e leads.",
        target: '[data-tour="campaigns-menu"]',
        placement: "right",
        showPrevious: true,
        showNext: true,
        page: "aquecimento",
        nextRoute: "/campanhas",
        action: "navigate",
      },
      {
        id: "campaigns-page",
        title: "📢 Gerenciar Campanhas",
        content:
          "Aqui você cria e gerencia suas campanhas de marketing. Cada campanha pode ter seus próprios leads e configurações.",
        target: '[data-tour="campaigns-container"]',
        placement: "top",
        showPrevious: true,
        showNext: true,
        page: "campanhas",
      },
      {
        id: "create-campaign",
        title: "➕ Nova Campanha",
        content:
          "Clique aqui para criar sua primeira campanha. Você pode dar um nome descritivo e definir o objetivo.",
        target: '[data-tour="create-campaign-btn"]',
        placement: "bottom",
        showPrevious: true,
        showNext: true,
        page: "campanhas",
      },
      {
        id: "import-leads-critical",
        title: "📤 IMPORTAR LEADS - Passo Essencial",
        content:
          "MUITO IMPORTANTE: Após criar campanhas, clique em 'Importar Leads' aqui mesmo na página de Campanhas. Selecione a campanha, depois faça upload do arquivo CSV. Formato: Nome,Telefone (sem espaços nos números).",
        target: '[data-tour="import-leads-btn"]',
        placement: "bottom",
        showPrevious: true,
        showNext: true,
        page: "campanhas",
      },
      {
        id: "leads-intro",
        title: "👥 Gerenciar Contatos",
        content:
          "Vamos importar seus contatos (leads). Você pode fazer upload de arquivos CSV ou Excel com seus contatos.",
        target: '[data-tour="leads-menu"]',
        placement: "right",
        showPrevious: true,
        showNext: true,
        page: "campanhas",
        nextRoute: "/contatos",
        action: "navigate",
      },
      {
        id: "leads-page",
        title: "👥 Base de Contatos",
        content:
          "Aqui estão todos os seus contatos organizados e segmentados. Você pode importar, editar e segmentar seus leads.",
        target: '[data-tour="leads-container"]',
        placement: "top",
        showPrevious: true,
        showNext: true,
        page: "contatos",
      },
      {
        id: "import-leads",
        title: "📁 Importar Contatos - PASSO CRÍTICO",
        content:
          "ATENÇÃO: Este é o passo onde mais usuários têm dúvidas! Para importar leads: 1) Vá para Campanhas, 2) Clique em 'Importar Leads', 3) Selecione a campanha, 4) Faça upload do arquivo CSV com colunas 'Nome' e 'Telefone'.",
        target: '[data-tour="import-leads-btn"]',
        placement: "bottom",
        showPrevious: true,
        showNext: true,
        page: "contatos",
      },
      {
        id: "dispatches-intro",
        title: "🚀 Criar Disparos",
        content:
          "Agora vamos criar seu primeiro disparo! Aqui você configura e envia mensagens para seus contatos.",
        target: '[data-tour="dispatches-menu"]',
        placement: "right",
        showPrevious: true,
        showNext: true,
        page: "contatos",
        nextRoute: "/disparos",
        action: "navigate",
      },
      {
        id: "dispatches-page",
        title: "🚀 Lançamento de Campanhas",
        content:
          "Esta é a página mais importante! Aqui você configura suas mensagens, seleciona instâncias e inicia os disparos.",
        target: '[data-tour="dispatches-container"]',
        placement: "top",
        showPrevious: true,
        showNext: true,
        page: "disparos",
      },
      {
        id: "message-editor",
        title: "✍️ Editor de Mensagens",
        content:
          "Digite sua mensagem aqui. Você pode usar SpinTax para criar variações automáticas: {Olá|Oi|E aí} {pessoal|galera}!",
        target: '[data-tour="message-editor"]',
        placement: "top",
        showPrevious: true,
        showNext: true,
        page: "disparos",
      },
      {
        id: "media-upload",
        title: "📎 Anexar Mídia",
        content:
          "Você pode anexar imagens, vídeos ou áudios às suas mensagens para torná-las mais atrativas.",
        target: '[data-tour="media-upload"]',
        placement: "top",
        showPrevious: true,
        showNext: true,
        page: "disparos",
      },
      {
        id: "launch-campaign",
        title: "🎯 Lançar Campanha",
        content:
          "Quando tudo estiver configurado, use este botão para lançar sua campanha. Você pode enviar imediatamente ou agendar.",
        target: '[data-tour="launch-btn"]',
        placement: "top",
        showPrevious: true,
        showNext: true,
        page: "disparos",
      },
      {
        id: "tour-complete",
        title: "🎉 Parabéns!",
        content:
          "Você completou o tour! Agora você sabe como usar os principais recursos da plataforma. Explore à vontade e lembre-se: estamos aqui para ajudar!",
        target: "body",
        placement: "center",
        showPrevious: true,
        showFinish: true,
        page: "disparos",
      },
    ],
  },
  {
    id: "advanced-features",
    name: "Recursos Avançados",
    description:
      "Aprenda a usar recursos avançados como segmentação, automação e relatórios",
    autoStart: false,
    showProgress: true,
    allowSkip: true,
    persistent: true,
    steps: [
      {
        id: "segmentation-intro",
        title: "🎯 Segmentação Avançada",
        content: "Aprenda a segmentar seus leads para campanhas mais efetivas.",
        target: '[data-tour="segmentation"]',
        placement: "top",
        showNext: true,
        page: "contatos",
      },
      {
        id: "automation-intro",
        title: "🤖 Automação",
        content: "Configure fluxos automatizados para responder seus leads.",
        target: '[data-tour="automation"]',
        placement: "top",
        showPrevious: true,
        showNext: true,
        page: "chatbot-flow",
      },
      {
        id: "reports-intro",
        title: "📈 Relatórios Detalhados",
        content:
          "Acompanhe o desempenho das suas campanhas com relatórios completos.",
        target: '[data-tour="reports"]',
        placement: "top",
        showPrevious: true,
        showFinish: true,
        page: "historico",
      },
    ],
  },
];

export const getTourById = (id: string): TourConfig | undefined => {
  return tourConfigs.find((tour) => tour.id === id);
};

export const getToursByCategory = (category: string): TourConfig[] => {
  return tourConfigs.filter((tour) =>
    tour.name.toLowerCase().includes(category.toLowerCase())
  );
};
