import Logo from '@/components/Logo';
import { TourButton } from '@/components/tour/TourButton';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/contexts/SidebarContext';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import { authService } from '@/services/auth.service';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  ChevronRight,
  CreditCard,
  Crown,
  FileText,
  Flame,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquareText,
  Settings,
  ShoppingCart,
  User as UserIcon,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  submenu?: {
    title: string;
    path: string;
  }[];
  adminOnly?: boolean;
  isExternal?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    icon: <Home className="w-5 h-5" />,
    path: '/',
  },
  {
    title: 'Disparos',
    icon: <MessageSquareText className="w-5 h-5" />,
    path: '/disparos',
    submenu: [
      { title: 'Grupos', path: '/disparos/grupos' }, // Item "Grupos"
      { title: 'Agendados', path: '/disparos/agendados' }, // Item "Agendados"
    ],
  },
  {
    title: 'Contatos',
    icon: <Users className="w-5 h-5" />,
    path: '/contatos',
    badge: 5,
  },
  {
    title: 'Campanhas',
    icon: <FileText className="w-5 h-5" />,
    path: '/campanhas',
    submenu: [{ title: 'Todas Campanhas', path: '/campanhas' }],
  },
  {
    title: 'Instâncias',
    icon: <FaWhatsapp className="w-5 h-5" />,
    path: '/instancias',
  },
  {
    title: 'Chat IA',
    icon: <MessageCircle className="w-5 h-5" />,
    path: '/chat',
  },
  {
    title: 'Agentes IA',
    icon: <Bot className="w-5 h-5" />,
    path: '/AgenteIA',
  },
  {
    title: 'Documentação',
    icon: <FileText className="w-5 h-5" />,
    path: '/documentacao',
  },

  {
    title: 'Aquecimento',
    icon: <Flame className="w-5 h-5" />,
    path: '/aquecimento',
  },
  // {
  //   title: 'Assinaturas',
  //   icon: <CreditCard className="w-5 h-5" />,
  //   path: '/billing',
  // },
  {
    title: 'Painel de Admin',
    icon: <Crown className="w-5 h-5" />,
    path: '/admin',
    adminOnly: true,
  },
  {
    title: 'Vendas Hotmart',
    icon: <ShoppingCart className="w-5 h-5" />,
    path: '/hotmart/vendas',
    adminOnly: true,
  },
];

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { user } = useUser();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin' || false;

  const handleLogout = () => {
    authService.logout();
  };

  const toggleSubmenu = (path: string) => {
    setOpenSubmenu(openSubmenu === path ? null : path);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const navigateToProfile = () => {
    navigate('/perfil');
    setUserMenuOpen(false);
  };

  const navigateToBilling = () => {
    navigate('/billing');
    setUserMenuOpen(false);
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={cn(
        'fixed left-0 top-0 h-screen bg-deep/90 backdrop-blur-xl border-r border-electric/30',
        isCollapsed ? 'w-20' : 'w-64',
        'transition-all duration-300 ease-in-out z-50',
      )}
      data-tour="sidebar"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="relative border-b border-electric/30 p-4">
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.3 }}
                  transition={{ duration: 0.3 }}
                >
                  <Logo variant="default" />
                </motion.div>
              )}
              {isCollapsed && (
                <motion.div
                  key="icon"
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.3 }}
                  transition={{ duration: 0.3 }}
                >
                  <Logo variant="icon" />
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                'text-neon-pink hover:bg-neon-pink/20 transition-colors duration-300',
                isCollapsed ? 'w-full' : 'ml-auto',
              )}
            >
              {isCollapsed ? (
                <Menu className="w-5 h-5" />
              ) : (
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-5 h-5" />
                </motion.div>
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {sidebarItems.map((item) => {
            if (item.adminOnly && !isAdmin) {
              return null;
            }

            const isActive =
              location.pathname === item.path && !item.isExternal;

            return (
              <div key={item.path} className="relative">
                <AnimatePresence>
                  {isActive && ( // Indicador de rota ativa apenas para links internos
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="absolute left-0 top-0 h-full w-1 bg-neon-green rounded-r-full"
                    />
                  )}
                </AnimatePresence>

                {item.isExternal ? (
                  <a
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 text-white/80 relative group',
                      'transition-all duration-200',
                      isCollapsed && 'justify-center',
                    )}
                    data-tour={
                      item.path === '/instancias' ? 'instances-menu' :
                        item.path === '/aquecimento' ? 'warmup-menu' :
                          item.path === '/campanhas' ? 'campaigns-menu' :
                            item.path === '/contatos' ? 'leads-menu' :
                              item.path === '/disparos' ? 'dispatches-menu' :
                                undefined
                    }
                  >
                    <motion.div
                      className="absolute inset-0 bg-electric/10 rounded-lg opacity-0 group-hover:opacity-100"
                      initial={{ scale: 0.95, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.div
                      className="relative z-10"
                      whileHover={{
                        scale: 1.1,
                        rotate: [0, -10, 10, -10, 0],
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.icon}
                    </motion.div>

                    {!isCollapsed && (
                      <>
                        <motion.span
                          className="flex-1 relative z-10 group-hover:text-white"
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.title}
                        </motion.span>

                        {item.badge && (
                          <motion.span
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            className="bg-neon-green text-deep px-2 py-0.5 rounded-full text-xs z-10 shadow-[0_0_10px_rgba(0,255,106,0.5)]"
                          >
                            {item.badge}
                          </motion.span>
                        )}

                        {item.submenu && (
                          <motion.div
                            animate={{
                              rotate:
                                openSubmenu === item.path ? 90 : 0,
                              color:
                                openSubmenu === item.path
                                  ? '#00FF6A'
                                  : '#ffffff',
                            }}
                            className="z-10"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </motion.div>
                        )}
                      </>
                    )}
                    {isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="absolute left-full ml-2 px-2 py-1 bg-deep/90 rounded-md text-sm whitespace-nowrap z-50 hidden group-hover:block"
                      >
                        {item.title}
                      </motion.div>
                    )}
                  </a>
                ) : (
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 text-white/80 relative group',
                      'transition-all duration-200',
                      isActive && 'text-white', // Estilo ativo apenas para links internos
                      isCollapsed && 'justify-center',
                    )}
                    onClick={() =>
                      item.submenu &&
                      !item.isExternal &&
                      toggleSubmenu(item.path)
                    }
                    data-tour={
                      item.path === '/instancias' ? 'instances-menu' :
                        item.path === '/aquecimento' ? 'warmup-menu' :
                          item.path === '/campanhas' ? 'campaigns-menu' :
                            item.path === '/contatos' ? 'leads-menu' :
                              item.path === '/disparos' ? 'dispatches-menu' :
                                undefined
                    }
                  >
                    <motion.div
                      className="absolute inset-0 bg-electric/10 rounded-lg opacity-0 group-hover:opacity-100"
                      initial={{ scale: 0.95, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.div
                      className={cn(
                        'relative z-10',
                        isActive && 'text-neon-green', // Estilo ativo apenas para links internos
                      )}
                      whileHover={{
                        scale: 1.1,
                        rotate: [0, -10, 10, -10, 0],
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.icon}
                    </motion.div>

                    {!isCollapsed && (
                      <>
                        <motion.span
                          className="flex-1 relative z-10 group-hover:text-white"
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.title}
                        </motion.span>

                        {item.badge && (
                          <motion.span
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            className="bg-neon-green text-deep px-2 py-0.5 rounded-full text-xs z-10 shadow-[0_0_10px_rgba(0,255,106,0.5)]"
                          >
                            {item.badge}
                          </motion.span>
                        )}

                        {item.submenu && (
                          <motion.div
                            animate={{
                              rotate:
                                openSubmenu === item.path ? 90 : 0,
                              color:
                                openSubmenu === item.path
                                  ? '#00FF6A'
                                  : '#ffffff',
                            }}
                            className="z-10"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </motion.div>
                        )}
                      </>
                    )}
                    {isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="absolute left-full ml-2 px-2 py-1 bg-deep/90 rounded-md text-sm whitespace-nowrap z-50 hidden group-hover:block"
                      >
                        {item.title}
                      </motion.div>
                    )}
                  </Link>
                )}

                <AnimatePresence>
                  {!isCollapsed &&
                    item.submenu &&
                    openSubmenu === item.path && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-deep/50"
                      >
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={cn(
                              'flex items-center gap-3 px-12 py-2 text-white/70',
                              'hover:text-white transition-all duration-200',
                              location.pathname === subItem.path &&
                              'bg-electric/30 text-white',
                            )}
                          >
                            <span>{subItem.title}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-electric/30 p-4 space-y-4">
          {/* Tour Button */}
          {!isCollapsed && (
            <TourButton variant="minimal" className="w-full justify-start" />
          )}

          {/* User Menu com Dropdown */}
          <div className="relative">
            {/* User Info - Clickable */}
            <motion.div
              onClick={toggleUserMenu}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-electric/10 border border-transparent hover:border-electric/30",
                userMenuOpen && "bg-electric/10 border-electric/30"
              )}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-electric to-neon-green flex items-center justify-center text-deep font-bold text-lg shadow-lg"
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </motion.div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    {user?.email || 'email@exemplo.com'}
                  </p>
                </div>
              )}
              {!isCollapsed && (
                <motion.div
                  animate={{ rotate: userMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4 text-white/60 rotate-90" />
                </motion.div>
              )}
            </motion.div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {userMenuOpen && !isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-deep/95 backdrop-blur-xl border border-electric/30 rounded-lg shadow-2xl overflow-hidden"
                >
                  {/* Menu Items */}
                  <div className="p-2 space-y-1">
                    {/* Perfil */}
                    <motion.button
                      onClick={navigateToProfile}
                      whileHover={{ x: 5 }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-white/80 hover:text-white hover:bg-electric/10 rounded-lg transition-all duration-200 group"
                    >
                      <div className="p-1.5 bg-electric/10 rounded-lg group-hover:bg-electric/20 transition-colors">
                        <UserIcon className="w-4 h-4 text-electric" />
                      </div>
                      <span className="text-sm font-medium">Meu Perfil</span>
                    </motion.button>

                    {/* Assinaturas */}
                    <motion.button
                      onClick={navigateToBilling}
                      whileHover={{ x: 5 }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-white/80 hover:text-white hover:bg-neon-green/10 rounded-lg transition-all duration-200 group"
                    >
                      <div className="p-1.5 bg-neon-green/10 rounded-lg group-hover:bg-neon-green/20 transition-colors">
                        <Wallet className="w-4 h-4 text-neon-green" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-sm font-medium block">Assinaturas</span>
                        <span className="text-xs text-white/50">Pagamentos & Planos</span>
                      </div>
                    </motion.button>

                    {/* Configurações */}
                    <motion.button
                      onClick={() => {
                        navigate('/configuracoes');
                        setUserMenuOpen(false);
                      }}
                      whileHover={{ x: 5 }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-white/80 hover:text-white hover:bg-electric/10 rounded-lg transition-all duration-200 group"
                    >
                      <div className="p-1.5 bg-electric/10 rounded-lg group-hover:bg-electric/20 transition-colors">
                        <Settings className="w-4 h-4 text-electric" />
                      </div>
                      <span className="text-sm font-medium">Configurações</span>
                    </motion.button>

                    <div className="h-px bg-electric/20 my-2" />

                    {/* Sair */}
                    <motion.button
                      onClick={handleLogout}
                      whileHover={{ x: 5 }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
                    >
                      <div className="p-1.5 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">Sair da Conta</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tooltip para sidebar collapsed */}
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="absolute left-full ml-2 px-3 py-2 bg-deep/90 rounded-md text-sm whitespace-nowrap z-50 hidden group-hover:block"
              >
                <p className="font-medium text-white">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-white/60">{user?.email}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}