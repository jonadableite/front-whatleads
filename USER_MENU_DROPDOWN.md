# 👤 Menu Dropdown de Usuário - Documentação

## ✨ Visão Geral

Foi implementado um **menu dropdown elegante e funcional** que aparece ao clicar no perfil do usuário na sidebar, proporcionando acesso rápido a funcionalidades importantes.

## 🎯 Funcionalidades

### 1. **Ativação do Menu**

- ✅ Clique na **foto/avatar do usuário**
- ✅ Clique no **nome do usuário**
- ✅ Clique no **email do usuário**
- ✅ Clique em qualquer parte da **div que envolve o perfil**

### 2. **Opções do Menu**

#### 🧑 Meu Perfil

```typescript
{
  icon: UserIcon,
  label: "Meu Perfil",
  route: "/perfil",
  color: "electric" // Azul elétrico
}
```

#### 💰 Assinaturas

```typescript
{
  icon: Wallet,
  label: "Assinaturas",
  subtitle: "Pagamentos & Planos",
  route: "/billing",
  color: "neon-green" // Verde neon
}
```

**Destaque:** Este item tem subtitle extra!

#### ⚙️ Configurações

```typescript
{
  icon: Settings,
  label: "Configurações",
  route: "/configuracoes",
  color: "electric" // Azul elétrico
}
```

#### 🚪 Sair da Conta

```typescript
{
  icon: LogOut,
  label: "Sair da Conta",
  action: handleLogout,
  color: "red" // Vermelho
}
```

## 🎨 Design e Animações

### Avatar Interativo

```tsx
<motion.div
  whileHover={{ scale: 1.1, rotate: 360 }}
  transition={{ duration: 0.3 }}
  className="w-10 h-10 rounded-full bg-gradient-to-br from-electric to-neon-green"
>
  {user?.name?.charAt(0)?.toUpperCase()}
</motion.div>
```

**Animações:**

- 🔄 **Hover**: Rotação 360° + Scale 1.1
- 🎨 **Gradiente**: Electric → Neon Green
- 💫 **Sombra**: `shadow-lg`

### Container Clicável

```tsx
<motion.div
  onClick={toggleUserMenu}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className={cn(
    "hover:bg-electric/10 border border-transparent hover:border-electric/30",
    userMenuOpen && "bg-electric/10 border-electric/30"
  )}
>
```

**Estados:**

- 🎯 **Normal**: Border transparente
- 🖱️ **Hover**: Background electric/10 + Border electric/30
- ✅ **Ativo**: Background electric/10 + Border electric/30

### Ícone Chevron Animado

```tsx
<motion.div
  animate={{ rotate: userMenuOpen ? 180 : 0 }}
  transition={{ duration: 0.2 }}
>
  <ChevronRight className="rotate-90" />
</motion.div>
```

**Comportamento:**

- ▼ Menu fechado: `rotate: 0`
- ▲ Menu aberto: `rotate: 180`

## 📱 Dropdown Menu

### Estrutura

```
┌─────────────────────────────┐
│  🧑 Meu Perfil              │
├─────────────────────────────┤
│  💰 Assinaturas             │
│     Pagamentos & Planos     │
├─────────────────────────────┤
│  ⚙️ Configurações           │
├─────────────────────────────┤
│  🚪 Sair da Conta           │
└─────────────────────────────┘
```

### Características do Dropdown

```tsx
<motion.div
  initial={{ opacity: 0, y: -10, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: -10, scale: 0.95 }}
  className="absolute bottom-full left-0 right-0 mb-2 bg-deep/95 backdrop-blur-xl border border-electric/30 rounded-lg shadow-2xl"
>
```

**Posição:**

- 📍 `absolute bottom-full` - Abre acima do perfil
- 📏 `left-0 right-0` - Largura total da sidebar
- 🔼 `mb-2` - Margem de 8px

**Visual:**

- 🌙 Background: `bg-deep/95`
- 💎 Backdrop blur: `backdrop-blur-xl`
- 🔲 Border: `border-electric/30`
- 🌟 Shadow: `shadow-2xl`

## 🎭 Animações dos Itens do Menu

### Item Padrão

```tsx
<motion.button
  whileHover={{ x: 5 }}
  className="hover:bg-electric/10 rounded-lg"
>
```

**Efeito Hover:**

- ➡️ Desliza 5px para direita
- 🎨 Background electric/10
- 🔄 Transição suave (200ms)

### Ícones com Background

```tsx
<div className="p-1.5 bg-electric/10 rounded-lg group-hover:bg-electric/20">
  <Icon className="w-4 h-4 text-electric" />
</div>
```

**Estados:**

- 🔵 **Normal**: `bg-electric/10`
- 🔷 **Hover**: `bg-electric/20`

### Item "Assinaturas" (Especial)

```tsx
<div className="flex-1 text-left">
  <span className="text-sm font-medium block">Assinaturas</span>
  <span className="text-xs text-white/50">Pagamentos & Planos</span>
</div>
```

**Destaque:**

- 📝 Título principal: `text-sm font-medium`
- 📋 Subtítulo: `text-xs text-white/50`
- 💚 Cor verde neon para ícone

### Item "Sair" (Vermelho)

```tsx
<motion.button className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
  <div className="bg-red-500/10 group-hover:bg-red-500/20">
    <LogOut className="text-red-400" />
  </div>
</motion.button>
```

**Cores:**

- 🔴 Texto: `text-red-400`
- 🟥 Background hover: `bg-red-500/10`
- 🔻 Ícone background: `bg-red-500/10`

## 📊 Estados e Comportamento

### Estados do Menu

```typescript
const [userMenuOpen, setUserMenuOpen] = useState(false);

const toggleUserMenu = () => {
  setUserMenuOpen(!userMenuOpen);
};
```

### Navegação

```typescript
const navigateToProfile = () => {
  navigate("/perfil");
  setUserMenuOpen(false); // Fecha o menu após navegar
};

const navigateToBilling = () => {
  navigate("/billing");
  setUserMenuOpen(false);
};
```

**Comportamento:**

1. ✅ Usuário clica no item do menu
2. ✅ Navegação é executada
3. ✅ Menu fecha automaticamente
4. ✅ Transição suave para nova página

### Logout

```typescript
const handleLogout = () => {
  authService.logout(); // Limpa sessão e redireciona
};
```

## 🔄 Integrações

### React Router

```typescript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
```

### Auth Service

```typescript
import { authService } from "@/services/auth.service";

authService.logout(); // Limpa token e redireciona
```

### User Context

```typescript
import { useUser } from "@/contexts/UserContext";

const { user } = useUser();
```

## 📱 Responsividade

### Sidebar Collapsed

```tsx
{
  isCollapsed && (
    <motion.div className="absolute left-full ml-2 bg-deep/90 rounded-md">
      <p>{user?.name}</p>
      <p>{user?.email}</p>
    </motion.div>
  );
}
```

**Comportamento:**

- 🔒 Menu dropdown **não aparece** quando collapsed
- 💡 Tooltip com nome/email aparece no hover
- 📍 Posicionado à direita do avatar

### Sidebar Expandida

- ✅ Menu dropdown completo
- ✅ Todas as opções visíveis
- ✅ Animações ativas

## 🎯 Casos de Uso

### 1. Acesso Rápido a Assinaturas

```
Usuário → Clica no perfil → Clica em "Assinaturas" → /billing
```

### 2. Editar Perfil

```
Usuário → Clica no perfil → Clica em "Meu Perfil" → /perfil
```

### 3. Configurações

```
Usuário → Clica no perfil → Clica em "Configurações" → /configuracoes
```

### 4. Logout Rápido

```
Usuário → Clica no perfil → Clica em "Sair da Conta" → Logout
```

## ✨ Melhorias de UX

### 1. Feedback Visual

- ✅ Avatar roda 360° no hover
- ✅ Container muda de cor quando ativo
- ✅ Chevron roda 180° quando abre
- ✅ Items deslizam 5px no hover

### 2. Acessibilidade

- ✅ Cursor pointer em elementos clicáveis
- ✅ Transições suaves (200-300ms)
- ✅ Cores contrastantes
- ✅ Ícones descritivos

### 3. Performance

- ✅ AnimatePresence para mount/unmount suave
- ✅ GPU-accelerated animations
- ✅ Estado local otimizado
- ✅ Re-renders minimizados

## 🔧 Código SOLID

### Single Responsibility

```typescript
// Cada função tem uma única responsabilidade
const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);
const navigateToProfile = () => {
  navigate("/perfil");
  setUserMenuOpen(false);
};
const navigateToBilling = () => {
  navigate("/billing");
  setUserMenuOpen(false);
};
```

### Open/Closed

- ✅ Fácil adicionar novos itens ao menu
- ✅ Componente extensível sem modificar código existente

### Dependency Inversion

- ✅ Depende de abstrações (`authService`, `navigate`)
- ✅ Não depende de implementações concretas

## 📝 Checklist de Recursos

- ✅ Menu dropdown com animação
- ✅ 4 opções de navegação
- ✅ Avatar com animação de rotação
- ✅ Chevron indicador de estado
- ✅ Item "Assinaturas" com destaque
- ✅ Separador visual antes do logout
- ✅ Cores consistentes com plataforma
- ✅ Animações Framer Motion
- ✅ Navegação automática
- ✅ Fechamento automático após ação
- ✅ Tooltip para sidebar collapsed
- ✅ Estado visual de ativo/inativo

## 🚀 Como Usar

1. **Abrir Menu**: Clique no perfil do usuário na sidebar
2. **Navegar**: Clique em qualquer opção do menu
3. **Fechar**: Menu fecha automaticamente ou clique fora

---

**Desenvolvido com 💙 para WhatLead**
**Data: Outubro 2025**
