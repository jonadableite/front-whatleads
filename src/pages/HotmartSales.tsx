import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/table';
import { toast } from '../components/ui/toast';
import { hotmartService, HotmartSalesHistoryResponse, HotmartSalesSummaryResponse, HotmartSalesUsersResponse, HotmartSalesCommissionsResponse } from '../services/hotmart.service';
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  RefreshCw,
  Download,
  Filter,
  Search,
  LucideIcon
} from 'lucide-react';

interface DateRange {
  start: string;
  end: string;
}

interface Filters {
  productId: string;
  buyerEmail: string;
  transactionStatus: string;
  maxResults: number;
}

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
  color?: string;
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: LucideIcon;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, description, color = "electric" }) => (
  <motion.div
    variants={itemVariants}
    className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric shadow-lg hover:shadow-electric transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-electric/10 rounded-lg">
        <Icon className="text-electric w-6 h-6" />
      </div>
      <span className="text-sm text-white/60">Hotmart</span>
    </div>
    <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
    <p className="text-sm text-white/60">{title}</p>
    <p className="text-xs text-white/40 mt-1">{description}</p>
  </motion.div>
);

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${active
        ? 'bg-electric text-black font-medium'
        : 'bg-deep/60 text-white/80 hover:bg-deep/80 hover:text-white'
      }`}
  >
    <Icon className="w-4 h-4" />
    <span>{children}</span>
  </button>
);

const HotmartSales: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Estados para cada tipo de dados
  const [salesHistory, setSalesHistory] = useState<HotmartSalesHistoryResponse | null>(null);
  const [salesSummary, setSalesSummary] = useState<HotmartSalesSummaryResponse | null>(null);
  const [salesUsers, setSalesUsers] = useState<HotmartSalesUsersResponse | null>(null);
  const [salesCommissions, setSalesCommissions] = useState<HotmartSalesCommissionsResponse | null>(null);

  // Filtros
  const [filters, setFilters] = useState<Filters>({
    productId: '',
    buyerEmail: '',
    transactionStatus: '',
    maxResults: 50
  });

  // Função para converter data para timestamp
  const dateToTimestamp = (dateString: string): string => {
    return Math.floor(new Date(dateString).getTime() / 1000).toString();
  };

  // Função para converter timestamp para data legível
  const timestampToDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR');
  };

  // Função para formatar valor monetário
  const formatCurrency = (value: number, currency: string = 'BRL'): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Carregar histórico de vendas
  const loadSalesHistory = async () => {
    try {
      setLoading(true);
      const params = {
        start_date: dateToTimestamp(dateRange.start),
        end_date: dateToTimestamp(dateRange.end),
        max_results: filters.maxResults,
        ...(filters.productId && { product_id: filters.productId }),
        ...(filters.buyerEmail && { buyer_email: filters.buyerEmail }),
        ...(filters.transactionStatus && { transaction_status: filters.transactionStatus })
      };

      const response = await hotmartService.getSalesHistory(params);
      setSalesHistory(response);
    } catch (error) {
      console.error('Erro ao carregar histórico de vendas:', error);
      toast.error('Não foi possível carregar o histórico de vendas');
    } finally {
      setLoading(false);
    }
  };

  // Carregar sumário de vendas
  const loadSalesSummary = async () => {
    try {
      setLoading(true);
      const params = {
        start_date: dateToTimestamp(dateRange.start),
        end_date: dateToTimestamp(dateRange.end),
        ...(filters.productId && { product_id: filters.productId })
      };

      const response = await hotmartService.getSalesSummary(params);
      setSalesSummary(response);
    } catch (error) {
      console.error('Erro ao carregar sumário de vendas:', error);
      toast.error('Não foi possível carregar o sumário de vendas');
    } finally {
      setLoading(false);
    }
  };

  // Carregar participantes de vendas
  const loadSalesUsers = async () => {
    try {
      setLoading(true);
      const params = {
        start_date: dateToTimestamp(dateRange.start),
        end_date: dateToTimestamp(dateRange.end),
        max_results: filters.maxResults,
        ...(filters.productId && { product_id: filters.productId }),
        ...(filters.buyerEmail && { buyer_email: filters.buyerEmail })
      };

      const response = await hotmartService.getSalesUsers(params);
      setSalesUsers(response);
    } catch (error) {
      console.error('Erro ao carregar participantes de vendas:', error);
      toast.error('Não foi possível carregar os participantes de vendas');
    } finally {
      setLoading(false);
    }
  };

  // Carregar comissões de vendas
  const loadSalesCommissions = async () => {
    try {
      setLoading(true);
      const params = {
        start_date: dateToTimestamp(dateRange.start),
        end_date: dateToTimestamp(dateRange.end),
        max_results: filters.maxResults,
        ...(filters.productId && { product_id: filters.productId })
      };

      const response = await hotmartService.getSalesCommissions(params);
      setSalesCommissions(response);
    } catch (error) {
      console.error('Erro ao carregar comissões de vendas:', error);
      toast.error('Não foi possível carregar as comissões de vendas');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados baseado na aba ativa
  const loadData = (): void => {
    switch (activeTab) {
      case 'history':
        loadSalesHistory();
        break;
      case 'summary':
        loadSalesSummary();
        break;
      case 'participants':
        loadSalesUsers();
        break;
      case 'commissions':
        loadSalesCommissions();
        break;
      default:
        break;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleRefresh = (): void => {
    loadData();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-deep via-deep/95 to-deep/90 p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Vendas Hotmart</h1>
            <p className="text-white/60">Acompanhe suas vendas e comissões da Hotmart</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-electric hover:bg-electric/90 text-black font-medium"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Card className="bg-deep/80 backdrop-blur-xl border-electric/30 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Data Inicial
                </label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="bg-deep/60 border-electric/30 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Data Final
                </label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="bg-deep/60 border-electric/30 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  ID do Produto
                </label>
                <Input
                  type="text"
                  placeholder="ID do produto (opcional)"
                  value={filters.productId}
                  onChange={(e) => setFilters(prev => ({ ...prev, productId: e.target.value }))}
                  className="bg-deep/60 border-electric/30 text-white placeholder-white/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email do Comprador
                </label>
                <Input
                  type="email"
                  placeholder="Email (opcional)"
                  value={filters.buyerEmail}
                  onChange={(e) => setFilters(prev => ({ ...prev, buyerEmail: e.target.value }))}
                  className="bg-deep/60 border-electric/30 text-white placeholder-white/40"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            icon={DollarSign}
            title="Receita Total"
            value={salesSummary?.items?.[0]?.total_value ? formatCurrency(salesSummary.items[0].total_value) : 'R$ 0,00'}
            description="Receita total do período"
          />
          <StatCard
            icon={TrendingUp}
            title="Total de Vendas"
            value={salesSummary?.items?.[0]?.total_transactions || '0'}
            description="Número de vendas realizadas"
          />
          <StatCard
            icon={Users}
            title="Compradores"
            value={salesUsers?.page_info?.total_results || '0'}
            description="Compradores únicos"
          />
          <StatCard
            icon={Calendar}
            title="Transações"
            value={salesHistory?.page_info?.total_results || '0'}
            description="Transações no período"
          />
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants}>
          <div className="flex space-x-2 mb-6">
            <TabButton
              active={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              icon={TrendingUp}
            >
              Histórico
            </TabButton>
            <TabButton
              active={activeTab === 'summary'}
              onClick={() => setActiveTab('summary')}
              icon={DollarSign}
            >
              Resumo
            </TabButton>
            <TabButton
              active={activeTab === 'participants'}
              onClick={() => setActiveTab('participants')}
              icon={Users}
            >
              Participantes
            </TabButton>
            <TabButton
              active={activeTab === 'commissions'}
              onClick={() => setActiveTab('commissions')}
              icon={Download}
            >
              Comissões
            </TabButton>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div variants={itemVariants}>
          <Card className="bg-deep/80 backdrop-blur-xl border-electric/30">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric"></div>
                <span className="ml-3 text-white/60">Carregando dados...</span>
              </div>
            ) : (
              <div className="p-6">
                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">Histórico de Vendas</h3>
                      <div className="flex items-center space-x-2">
                        <Search className="w-4 h-4 text-white/60" />
                        <Input
                          placeholder="Buscar transações..."
                          className="bg-deep/60 border-electric/30 text-white placeholder-white/40 w-64"
                        />
                      </div>
                    </div>

                    {salesHistory?.items && salesHistory.items.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table className="w-full">
                          <Thead>
                            <Tr className="border-electric/30">
                              <Th className="text-white/80">Transação</Th>
                              <Th className="text-white/80">Produto</Th>
                              <Th className="text-white/80">Comprador</Th>
                              <Th className="text-white/80">Valor</Th>
                              <Th className="text-white/80">Status</Th>
                              <Th className="text-white/80">Data</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {salesHistory.items.map((item) => (
                              <Tr key={item.transaction} className="border-electric/20 hover:bg-deep/40">
                                <Td className="text-white/90 font-mono text-sm">{item.transaction}</Td>
                                <Td className="text-white/90">
                                  <div>
                                    <div className="font-medium">{item.product.name}</div>
                                    <div className="text-sm text-white/60">ID: {item.product.id}</div>
                                  </div>
                                </Td>
                                <Td className="text-white/90">
                                  <div>
                                    <div className="font-medium">{item.buyer.name}</div>
                                    <div className="text-sm text-white/60">{item.buyer.email}</div>
                                  </div>
                                </Td>
                                <Td className="text-white/90">
                                  {formatCurrency(item.purchase.price.value, item.purchase.price.currency_value)}
                                </Td>
                                <Td>
                                  <span className={`px-2 py-1 rounded-full text-xs ${item.purchase.status === 'APPROVED'
                                      ? 'bg-green-500/20 text-green-400'
                                      : item.purchase.status === 'CANCELLED'
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {item.purchase.status || 'N/A'}
                                  </span>
                                </Td>
                                <Td className="text-white/90">
                                  {timestampToDate(item.purchase.order_date)}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <TrendingUp className="w-12 h-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">Nenhuma venda encontrada no período selecionado</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'summary' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white">Resumo de Vendas</h3>
                    {salesSummary?.items && salesSummary.items.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {salesSummary.items.map((item, index) => (
                          <div key={index} className="bg-deep/60 p-4 rounded-lg border border-electric/20">
                            <h4 className="text-white/80 text-sm font-medium mb-2">Receita Total</h4>
                            <p className="text-2xl font-bold text-electric">{formatCurrency(item.total_value, item.currency_code)}</p>
                            <div className="mt-2 space-y-1">
                              <div className="text-sm text-white/80">
                                <span className="font-medium">Comissões: </span>
                                {formatCurrency(item.total_commissions, item.currency_code)}
                              </div>
                              <div className="text-sm text-white/80">
                                <span className="font-medium">Transações: </span>
                                {item.total_transactions}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <DollarSign className="w-12 h-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">Nenhum resumo disponível para o período selecionado</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'participants' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Participantes de Vendas</h3>
                    {salesUsers?.items && salesUsers.items.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table className="w-full">
                          <Thead>
                            <Tr className="border-electric/30">
                              <Th className="text-white/80">Nome</Th>
                              <Th className="text-white/80">Email</Th>
                              <Th className="text-white/80">Papel</Th>
                              <Th className="text-white/80">Transações</Th>
                              <Th className="text-white/80">Localização</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {salesUsers.items.map((user) => (
                              <Tr key={user.user_id} className="border-electric/20 hover:bg-deep/40">
                                <Td className="text-white/90 font-medium">{user.name}</Td>
                                <Td className="text-white/90">{user.email}</Td>
                                <Td>
                                  <span className="px-2 py-1 rounded-full text-xs bg-electric/20 text-electric">
                                    {user.role}
                                  </span>
                                </Td>
                                <Td className="text-white/90">{user.transactions.length}</Td>
                                <Td className="text-white/90">
                                  {user.address && (
                                    <div className="text-sm">
                                      {user.address.city}, {user.address.state}
                                      {user.address.country && ` - ${user.address.country}`}
                                    </div>
                                  )}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">Nenhum participante encontrado</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'commissions' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Comissões</h3>
                    {salesCommissions?.items && salesCommissions.items.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table className="w-full">
                          <Thead>
                            <Tr className="border-electric/30">
                              <Th className="text-white/80">Transação</Th>
                              <Th className="text-white/80">Produto</Th>
                              <Th className="text-white/80">Valor Total</Th>
                              <Th className="text-white/80">Comissões</Th>
                              <Th className="text-white/80">Data</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {salesCommissions.items.map((item) => (
                              <Tr key={item.transaction} className="border-electric/20 hover:bg-deep/40">
                                <Td className="text-white/90 font-mono text-sm">{item.transaction}</Td>
                                <Td className="text-white/90">
                                  <div>
                                    <div className="font-medium">{item.product.name}</div>
                                    <div className="text-sm text-white/60">ID: {item.product.id}</div>
                                  </div>
                                </Td>
                                <Td className="text-white/90">
                                  {formatCurrency(item.total_value, item.currency_code)}
                                </Td>
                                <Td className="text-white/90">
                                  <div className="space-y-1">
                                    {item.commissions.map((commission, idx) => (
                                      <div key={idx} className="text-sm">
                                        <span className="font-medium">{commission.source_name}: </span>
                                        {formatCurrency(commission.value, commission.currency_code)}
                                        <span className="text-white/60 ml-1">
                                          ({commission.percentage}%)
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </Td>
                                <Td className="text-white/90">
                                  {timestampToDate(item.purchase_date)}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Download className="w-12 h-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">Nenhuma comissão encontrada</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HotmartSales;