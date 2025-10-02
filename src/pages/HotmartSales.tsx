import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calendar, Download, Filter, RefreshCw, Search, TrendingUp, Users, DollarSign, ShoppingCart } from 'lucide-react';
import { hotmartService, HotmartSalesHistoryResponse, HotmartSalesSummaryResponse, HotmartSalesUsersResponse, HotmartSalesCommissionsResponse } from '../services/hotmart.service';
import { toast } from '../components/ui/use-toast';

interface DateRange {
  start: string;
  end: string;
}

const HotmartSales: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias atrás
    end: new Date().toISOString().split('T')[0] // hoje
  });
  
  // Estados para cada tipo de dados
  const [salesHistory, setSalesHistory] = useState<HotmartSalesHistoryResponse | null>(null);
  const [salesSummary, setSalesSummary] = useState<HotmartSalesSummaryResponse | null>(null);
  const [salesUsers, setSalesUsers] = useState<HotmartSalesUsersResponse | null>(null);
  const [salesCommissions, setSalesCommissions] = useState<HotmartSalesCommissionsResponse | null>(null);
  
  // Filtros
  const [filters, setFilters] = useState({
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
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico de vendas',
        variant: 'destructive'
      });
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
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o sumário de vendas',
        variant: 'destructive'
      });
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
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os participantes de vendas',
        variant: 'destructive'
      });
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
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as comissões de vendas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados baseado na aba ativa
  const loadData = () => {
    switch (activeTab) {
      case 'history':
        loadSalesHistory();
        break;
      case 'summary':
        loadSalesSummary();
        break;
      case 'users':
        loadSalesUsers();
        break;
      case 'commissions':
        loadSalesCommissions();
        break;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Função para obter badge de status
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      'APPROVED': { variant: 'default', label: 'Aprovado' },
      'CANCELLED': { variant: 'destructive', label: 'Cancelado' },
      'REFUNDED': { variant: 'secondary', label: 'Reembolsado' },
      'ACTIVE': { variant: 'default', label: 'Ativo' },
      'INACTIVE': { variant: 'outline', label: 'Inativo' }
    };

    const statusInfo = statusMap[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vendas Hotmart</h1>
          <p className="text-muted-foreground">Gerencie e analise suas vendas da Hotmart</p>
        </div>
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Data Início</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data Fim</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">ID do Produto</label>
              <Input
                placeholder="ID do produto"
                value={filters.productId}
                onChange={(e) => setFilters(prev => ({ ...prev, productId: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email do Comprador</label>
              <Input
                placeholder="email@exemplo.com"
                value={filters.buyerEmail}
                onChange={(e) => setFilters(prev => ({ ...prev, buyerEmail: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={loadData} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Sumário
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Participantes
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Comissões
          </TabsTrigger>
        </TabsList>

        {/* Histórico de Vendas */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              ) : salesHistory?.items?.length ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Total de resultados: {salesHistory.page_info.total_results}
                  </div>
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Transação</Th>
                        <Th>Produto</Th>
                        <Th>Comprador</Th>
                        <Th>Valor</Th>
                        <Th>Status</Th>
                        <Th>Data</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {salesHistory.items.map((item) => (
                        <Tr key={item.transaction}>
                          <Td className="font-mono text-sm">{item.transaction}</Td>
                          <Td>
                            <div>
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-sm text-muted-foreground">ID: {item.product.id}</div>
                            </div>
                          </Td>
                          <Td>
                            <div>
                              <div className="font-medium">{item.buyer.name}</div>
                              <div className="text-sm text-muted-foreground">{item.buyer.email}</div>
                            </div>
                          </Td>
                          <Td>
                            {formatCurrency(item.purchase.price.value, item.purchase.price.currency_value)}
                          </Td>
                          <Td>
                            {getStatusBadge(item.purchase.status)}
                          </Td>
                          <Td>
                            {timestampToDate(item.purchase.order_date)}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  Nenhuma venda encontrada no período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sumário de Vendas */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Sumário de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              ) : salesSummary?.items?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {salesSummary.items.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="text-2xl font-bold">
                          {formatCurrency(item.total_value, item.currency_code)}
                        </div>
                        <div className="text-sm text-muted-foreground">Valor Total</div>
                        <div className="mt-2 space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">Comissões: </span>
                            {formatCurrency(item.total_commissions, item.currency_code)}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Transações: </span>
                            {item.total_transactions}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Moeda: </span>
                            {item.currency_code}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  Nenhum dado de sumário encontrado no período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Participantes de Vendas */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Participantes de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              ) : salesUsers?.items?.length ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Total de resultados: {salesUsers.page_info.total_results}
                  </div>
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Nome</Th>
                        <Th>Email</Th>
                        <Th>Papel</Th>
                        <Th>Transações</Th>
                        <Th>Localização</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {salesUsers.items.map((user) => (
                        <Tr key={user.user_id}>
                          <Td className="font-medium">{user.name}</Td>
                          <Td>{user.email}</Td>
                          <Td>
                            <Badge variant="outline">{user.role}</Badge>
                          </Td>
                          <Td>{user.transactions.length}</Td>
                          <Td>
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
                <div className="text-center p-8 text-muted-foreground">
                  Nenhum participante encontrado no período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comissões de Vendas */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Comissões de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              ) : salesCommissions?.items?.length ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Total de resultados: {salesCommissions.page_info.total_results}
                  </div>
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Transação</Th>
                        <Th>Produto</Th>
                        <Th>Valor Total</Th>
                        <Th>Comissões</Th>
                        <Th>Data</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {salesCommissions.items.map((item) => (
                        <Tr key={item.transaction}>
                          <Td className="font-mono text-sm">{item.transaction}</Td>
                          <Td>
                            <div>
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-sm text-muted-foreground">ID: {item.product.id}</div>
                            </div>
                          </Td>
                          <Td>
                            {formatCurrency(item.total_value, item.currency_code)}
                          </Td>
                          <Td>
                            <div className="space-y-1">
                              {item.commissions.map((commission, idx) => (
                                <div key={idx} className="text-sm">
                                  <span className="font-medium">{commission.source_name}: </span>
                                  {formatCurrency(commission.value, commission.currency_code)}
                                  <span className="text-muted-foreground ml-1">
                                    ({commission.percentage}%)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </Td>
                          <Td>
                            {timestampToDate(item.purchase_date)}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  Nenhuma comissão encontrada no período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HotmartSales;