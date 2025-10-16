# 🎯 Sistema de Tour Guiado - WhatLeads

## Visão Geral

O sistema de tour guiado foi implementado para ajudar novos usuários a aprender como usar a plataforma WhatLeads de forma intuitiva e interativa.

## Características Principais

### ✨ **Funcionalidades**

- **Tour Automático**: Inicia automaticamente para novos usuários
- **Tour Manual**: Botão flutuante para iniciar tours a qualquer momento
- **Navegação Inteligente**: Navega automaticamente entre páginas
- **Persistência**: Lembra quais tours foram completados
- **Responsivo**: Funciona em desktop e mobile
- **Animações Suaves**: Transições e efeitos visuais atraentes

### 🎨 **Design**

- **Tema Escuro**: Integrado com o design da plataforma
- **Cores Neon**: Usa a paleta de cores neon-green e electric
- **Overlay Destacado**: Destaca elementos com bordas animadas
- **Tooltips Informativos**: Conteúdo rico com progresso visual

## Como Usar

### 🚀 **Para Usuários**

1. **Tour Automático**:

   - Ao fazer login pela primeira vez, o tour inicia automaticamente
   - Aguarde 2 segundos após o carregamento da página

2. **Tour Manual**:

   - Clique no botão flutuante (❓) no canto inferior direito
   - Ou use o botão "Tour Guiado" na sidebar
   - Selecione o tour desejado no menu dropdown

3. **Navegação no Tour**:
   - **Próximo**: Avança para o próximo passo
   - **Anterior**: Volta ao passo anterior
   - **Pular Tour**: Cancela o tour atual
   - **Finalizar**: Completa o tour

### 🛠️ **Para Desenvolvedores**

#### **Estrutura dos Arquivos**

```
src/
├── types/tour.ts                    # Tipos TypeScript
├── hooks/
│   ├── useTour.ts                   # Hook principal do tour
│   └── useTourContext.ts            # Hook do contexto
├── contexts/
│   ├── TourContext.tsx              # Provider do contexto
│   └── TourContextDefinition.ts     # Definição do contexto
├── components/tour/
│   ├── TourGuide.tsx               # Componente principal
│   ├── TourOverlay.tsx             # Overlay de destaque
│   ├── TourTooltip.tsx             # Tooltip informativo
│   └── TourButton.tsx              # Botões de controle
└── config/tours.ts                 # Configuração dos tours
```

#### **Adicionando Novos Passos**

1. **Adicionar atributo data-tour**:

```tsx
<div data-tour="meu-elemento">Conteúdo do elemento</div>
```

2. **Configurar o passo no tour**:

```typescript
// src/config/tours.ts
{
  id: 'meu-passo',
  title: '🎯 Meu Passo',
  content: 'Descrição do que este elemento faz...',
  target: '[data-tour="meu-elemento"]',
  placement: 'bottom',
  showNext: true,
  showPrevious: true,
  page: 'minha-pagina',
}
```

#### **Criando Novos Tours**

```typescript
// src/config/tours.ts
export const tourConfigs: TourConfig[] = [
  // ... tours existentes
  {
    id: "meu-novo-tour",
    name: "Meu Novo Tour",
    description: "Aprenda a usar esta funcionalidade",
    autoStart: false,
    showProgress: true,
    allowSkip: true,
    persistent: true,
    steps: [
      // ... seus passos aqui
    ],
  },
];
```

#### **Iniciando Tours Programaticamente**

```tsx
import { useTourContext } from "@/hooks/useTourContext";

function MeuComponente() {
  const { startTour } = useTourContext();

  const handleStartTour = () => {
    startTour("meu-tour-id");
  };

  return <button onClick={handleStartTour}>Iniciar Tour</button>;
}
```

## Tours Disponíveis

### 🎉 **Tour de Boas-vindas** (`welcome`)

- **Duração**: ~5-7 minutos
- **Páginas**: Dashboard → Instâncias → Aquecimento → Campanhas → Contatos → Disparos
- **Objetivo**: Apresentar os recursos principais da plataforma

### 🔥 **Recursos Avançados** (`advanced-features`)

- **Duração**: ~3-4 minutos
- **Páginas**: Contatos → Chatbot → Histórico
- **Objetivo**: Ensinar funcionalidades avançadas

## Personalização

### 🎨 **Estilos**

Os componentes usam Tailwind CSS e seguem o design system da plataforma:

- **Cores**: `neon-green`, `electric`, `deep`
- **Animações**: Framer Motion
- **Responsividade**: Mobile-first

### ⚙️ **Configurações**

```typescript
// Configurações globais
const STORAGE_KEY = "whatleads_completed_tours";
const AUTO_START_DELAY = 2000; // 2 segundos
const REFRESH_INTERVAL = 1000; // 1 segundo para tours ativos
```

## Boas Práticas

### ✅ **Recomendações**

1. **Textos Claros**: Use linguagem simples e objetiva
2. **Passos Curtos**: Máximo 20-25 passos por tour
3. **Navegação Lógica**: Siga o fluxo natural do usuário
4. **Elementos Visíveis**: Certifique-se que os elementos existem na tela
5. **Testes**: Teste em diferentes resoluções e dispositivos

### ❌ **Evitar**

1. **Tours Muito Longos**: Dividir em tours menores
2. **Elementos Dinâmicos**: Evitar elementos que podem não existir
3. **Textos Técnicos**: Usar linguagem acessível
4. **Muitas Animações**: Manter performance fluida

## Troubleshooting

### 🐛 **Problemas Comuns**

1. **Elemento não encontrado**:

   - Verificar se o `data-tour` está correto
   - Confirmar se o elemento existe na página
   - Adicionar delay se necessário

2. **Tour não inicia**:

   - Verificar se o `TourProvider` está configurado
   - Confirmar se o tour existe na configuração
   - Verificar console para erros

3. **Navegação não funciona**:
   - Verificar se as rotas estão corretas
   - Confirmar se o React Router está funcionando
   - Verificar se há redirects interferindo

## Contribuindo

Para adicionar novos tours ou melhorar os existentes:

1. **Fork** o repositório
2. **Crie** uma branch para sua feature
3. **Adicione** os passos necessários
4. **Teste** em diferentes cenários
5. **Submeta** um Pull Request

## Suporte

Para dúvidas ou problemas:

- 📧 Email: suporte@whatleads.com.br
- 💬 Chat: Disponível na plataforma
- 📚 Documentação: [docs.whatleads.com.br](https://docs.whatleads.com.br)

---

**Desenvolvido com ❤️ pela equipe WhatLeads**
