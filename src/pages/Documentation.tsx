// src/pages/Documentation.tsx
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Book,
  Bot,
  CheckCircle,
  Database,
  FileText,
  Flame,
  Lightbulb,
  MessageCircle,
  Search,
  Send,
  Settings,
  Smartphone,
  Target,
  TrendingUp,
  Upload,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const Documentation = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const sections: Section[] = [
    {
      id: 'introducao',
      title: 'Introdução',
      icon: <Book className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg">
                <Book className="w-6 h-6 text-white" />
              </div>
              Bem-vindo ao WhatLead
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              O WhatLead é uma plataforma completa de automação de marketing via WhatsApp que permite
              criar campanhas inteligentes, gerenciar contatos e automatizar conversas com IA.
            </p>
          </div>

          <div className="bg-gradient-to-r from-neon-blue/10 to-neon-green/10 border border-neon-blue/30 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-neon-blue" />
              <span className="text-neon-blue font-semibold">Jornada Ideal na Plataforma</span>
            </div>
            <p className="text-gray-300 mb-4">
              Para obter os melhores resultados, siga esta sequência recomendada:
            </p>
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-center gap-3">
                <span className="bg-neon-green text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                Conectar e configurar instâncias do WhatsApp
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-neon-blue text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                Criar campanhas organizadas por segmento
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-neon-pink text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                Importar base de leads vinculada às campanhas
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-orange-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                Realizar aquecimento do WhatsApp (recomendado)
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-neon-yellow text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
                Executar disparos em massa com segurança
              </li>
            </ol>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-deep/60 backdrop-blur-xl rounded-2xl p-6 border border-electric/30">
              <h3 className="text-xl font-semibold text-neon-green mb-3">🚀 Recursos Principais</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                  Disparos em massa personalizados
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-blue rounded-full"></div>
                  Agentes de IA conversacionais
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-pink rounded-full"></div>
                  Gerenciamento avançado de campanhas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-yellow rounded-full"></div>
                  Análises e relatórios detalhados
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Aquecimento avançado
                </li>
              </ul>
            </div>

            <div className="bg-deep/60 backdrop-blur-xl rounded-2xl p-6 border border-electric/30">
              <h3 className="text-xl font-semibold text-neon-blue mb-3">⚡ Funcionalidades Avançadas</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-blue rounded-full"></div>
                  Aquecimento automático de instâncias
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                  Personalização com variáveis dinâmicas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-pink rounded-full"></div>
                  Rotação inteligente de instâncias
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Proteção contra bloqueios
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'instancias',
      title: 'Passo 1: Conectar Instâncias',
      icon: <Smartphone className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-neon-blue to-electric rounded-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              Passo 1: Conectar Instâncias WhatsApp
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              O primeiro e mais importante passo é conectar suas instâncias do WhatsApp.
              Sem isso, nenhuma funcionalidade da plataforma funcionará.
            </p>
          </div>

          <div className="bg-gradient-to-r from-electric/10 to-shock/10 border border-electric/30 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-neon-blue" />
              <span className="text-neon-blue font-semibold">Primeiro Passo Essencial</span>
            </div>
            <p className="text-gray-300">
              Antes de qualquer ação na plataforma, você deve conectar pelo menos duas instância do WhatsApp.
              Esta é a base para todas as funcionalidades da plataforma.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-neon-green" />
                Conectando Nova Instância
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Acesse a seção "Instâncias" no menu lateral</li>
                <li>• Clique em "Conectar Nova Instância"</li>
                <li>• Defina um nome para identificar a instância (de preferencia sem espaços e caracteres especiais)</li>
                <li>• Escaneie o QR Code com seu WhatsApp</li>
                <li>• Aguarde a confirmação da conexão</li>
                <li>• Verifique o status "Conectado" na lista</li>
              </ul>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-shock-pink" />
                Rotação de Instâncias
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Configure múltiplas instâncias para distribuir envios</li>
                <li>• Estratégia RANDOM: Seleção aleatória</li>
                <li>• Estratégia SEQUENTIAL: Rotação sequencial</li>
                <li>• Estratégia LOAD_BALANCED: Baseada na carga</li>
                <li>• Evita sobrecarga e bloqueios</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h4 className="text-yellow-300 font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Dicas Importantes
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li>• Use sempre números dedicados para marketing</li>
              <li>• Evite usar seu número pessoal</li>
              <li>• Mantenha o WhatsApp Web fechado no número conectado</li>
              <li>• Uma instância = uma conta do WhatsApp</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'campanhas',
      title: 'Passo 2: Criar Campanhas',
      icon: <Target className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-shock to-neon-pink rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              Passo 2: Criar Campanhas
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Organize seus disparos criando campanhas segmentadas por objetivo, público ou produto.
            </p>
          </div>

          <div className="bg-gradient-to-r from-shock/10 to-electric/10 border border-shock/30 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-5 h-5 text-shock-pink" />
              <span className="text-shock-pink font-semibold">Segundo Passo da Jornada</span>
            </div>
            <p className="text-gray-300">
              Após conectar suas instâncias, crie campanhas organizadas por segmento ou objetivo.
              Cada campanha servirá como container para seus leads e disparos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-neon-green" />
                Criando Campanha
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Acesse "Campanhas" no menu lateral</li>
                <li>• Clique em "Nova Campanha"</li>
                <li>• Defina nome e descrição clara</li>
                <li>• Escolha do tipo ja vai estar definida por padrao</li>
                <li>• Configure intervalos</li>
              </ul>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-shock-pink" />
                Configurações Avançadas
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Defina horários de envio</li>
                <li>• Configure intervalos entre mensagens</li>
                <li>• Escolha instâncias para rotação</li>
                <li>• Ative/desative recursos específicos</li>
              </ul>
            </div>
          </div>

          <div className="bg-deep/60 backdrop-blur-xl rounded-2xl p-6 border border-electric/30">
            <h3 className="text-xl font-semibold text-neon-blue mb-4">💡 Exemplos de Campanhas</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-deep/80 rounded-xl p-4">
                <h4 className="font-semibold text-neon-green mb-2">E-commerce</h4>
                <p className="text-gray-300 text-sm">Promoções, lançamentos, carrinho abandonado</p>
              </div>
              <div className="bg-deep/80 rounded-xl p-4">
                <h4 className="font-semibold text-neon-blue mb-2">Educação</h4>
                <p className="text-gray-300 text-sm">Cursos, webinars, conteúdo educativo</p>
              </div>
              <div className="bg-deep/80 rounded-xl p-4">
                <h4 className="font-semibold text-neon-pink mb-2">Serviços</h4>
                <p className="text-gray-300 text-sm">Agendamentos, follow-up, suporte</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'leads',
      title: 'Passo 3: Importar Base de Leads',
      icon: <Users className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-neon-green to-electric rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              Passo 3: Importar Base de Leads
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Com campanhas criadas, importe sua base de contatos vinculando-os às campanhas correspondentes.
            </p>
          </div>

          <div className="bg-gradient-to-r from-neon-green/10 to-electric/10 border border-neon-green/30 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-neon-green" />
              <span className="text-neon-green font-semibold">Terceiro Passo da Jornada</span>
            </div>
            <p className="text-gray-300">
              Com campanhas criadas, importe sua base de leads vinculando-os às campanhas correspondentes.
              Isso permitirá segmentação e personalização das mensagens.
            </p>
          </div>

          {/* Passo a Passo Visual */}
          <div className="bg-deep/60 backdrop-blur-xl rounded-2xl p-6 border border-electric/30">
            <h3 className="text-xl font-semibold text-neon-blue mb-6">🎯 Passo a Passo: Como Importar sua Base</h3>

            <div className="space-y-6">
              {/* Passo 1 */}
              <div className="flex gap-4 p-4 bg-gray-800/30 rounded-xl border-l-4 border-neon-green">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-neon-green rounded-full flex items-center justify-center text-black font-bold">1</div>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">Acesse a seção "Campanhas"</h4>
                  <p className="text-gray-300 text-sm mb-3">No menu lateral esquerdo, clique em "Campanhas" para acessar o gerenciador.</p>
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
                    <div className="flex items-center gap-2 text-neon-green text-sm">
                      <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                      <span>📍 Localização: Menu lateral → Campanhas</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="flex gap-4 p-4 bg-gray-800/30 rounded-xl border-l-4 border-neon-blue">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-neon-blue rounded-full flex items-center justify-center text-black font-bold">2</div>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">Clique em "Nova Campanha"</h4>
                  <p className="text-gray-300 text-sm mb-3">Procure pelo botão azul "+ Nova Campanha" no canto superior direito da tela.</p>
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
                    <div className="flex items-center gap-2 text-neon-blue text-sm">
                      <div className="w-2 h-2 bg-neon-blue rounded-full"></div>
                      <span>🎯 Visual: Botão azul com ícone "+" no topo da página</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="flex gap-4 p-4 bg-gray-800/30 rounded-xl border-l-4 border-neon-pink">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-neon-pink rounded-full flex items-center justify-center text-black font-bold">3</div>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">Preencha os dados básicos</h4>
                  <p className="text-gray-300 text-sm mb-3">Defina nome da campanha e descriçäos.</p>
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-neon-pink text-sm">
                        <div className="w-2 h-2 bg-neon-pink rounded-full"></div>
                        <span>📝 Campos obrigatórios: Nome da campanha e pelomenos uma breve descriçäo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passo 4 - DESTAQUE PRINCIPAL */}
              <div className="flex gap-4 p-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border-2 border-orange-500/50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">4</div>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2 text-lg">🎯 IMPORTAR BASE DE LEADS (Etapa Crítica)</h4>
                  <p className="text-gray-200 mb-4">Esta é a etapa onde a maioria dos usuários tem dúvidas. Siga exatamente estas instruções:</p>

                  <div className="space-y-3">
                    <div className="bg-gray-900/70 rounded-lg p-4 border border-orange-500/30">
                      <h5 className="text-orange-400 font-semibold mb-2">📂 1. Clique no botão "Importar Leads"</h5>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>• Na página de Campanhas, procure pelo botão "Importar Leads" (ícone de upload 📤)</li>
                        <li>• Este botão fica na parte superior da página, ao lado de "Nova Campanha"</li>
                        <li>• Clique nele para abrir o modal de importação</li>
                      </ul>
                    </div>

                    <div className="bg-gray-900/70 rounded-lg p-4 border border-orange-500/30">
                      <h5 className="text-orange-400 font-semibold mb-2">📋 2. Selecione a Campanha no Modal</h5>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>• No modal que abrir, primeiro selecione a campanha na qual deseja vincular os leads</li>
                        <li>• Use o dropdown "Selecione a Campanha" para escolher uma campanha existente</li>
                        <li>• Esta etapa é obrigatória - os leads serão vinculados à campanha selecionada</li>
                      </ul>
                    </div>

                    <div className="bg-gray-900/70 rounded-lg p-4 border border-orange-500/30">
                      <h5 className="text-orange-400 font-semibold mb-2">📤 3. Faça o Upload do Arquivo</h5>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>• <strong>Opção 1:</strong> Clique na área pontilhada para selecionar o arquivo</li>
                        <li>• <strong>Opção 2:</strong> Arraste e solte seu arquivo CSV/Excel na área pontilhada</li>
                        <li>• O sistema mostrará o nome e tamanho do arquivo selecionado</li>
                      </ul>
                    </div>

                    <div className="bg-gray-900/70 rounded-lg p-4 border border-orange-500/30">
                      <h5 className="text-orange-400 font-semibold mb-2">✅ 4. Clique em "Importar Leads"</h5>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>• Após selecionar campanha e arquivo, clique no botão "Importar Leads"</li>
                        <li>• Aguarde o processamento - o sistema mostrará quantos leads foram importados</li>
                        <li>• Uma mensagem de sucesso confirmará a importação</li>
                      </ul>
                    </div>

                    <div className="bg-red-900/30 rounded-lg p-4 border border-red-500/50">
                      <h5 className="text-red-400 font-semibold mb-2">⚠️ Problemas Comuns</h5>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>• <strong>"Arquivo não aceito":</strong> Verifique se é .csv</li>
                        <li>• <strong>"Nenhum contato importado":</strong> Confira se as colunas estão nomeadas corretamente e separadas por virgulas</li>
                        <li>• <strong>"Telefones inválidos":</strong> Certifique-se de näo ter espaços e apenas números validos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recursos de Apoio */}
          <div className="bg-deep/60 backdrop-blur-xl rounded-2xl p-6 border border-electric/30">
            <h3 className="text-xl font-semibold text-neon-purple mb-6">📚 Recursos de Apoio</h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Arquivo de Exemplo */}
              <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <FileText className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="text-white font-semibold">Arquivo de Exemplo</h4>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Baixe nosso modelo de planilha pré-formatado com exemplos de dados para facilitar sua importação.
                </p>
                <button
                  onClick={() => {
                    try {
                      const exampleData = [
                        ['Nome', 'Telefone'],
                        ['WhatLead', '5512988444921'],
                        ['João Silva', '11999999999'],
                        ['Maria Santos', '11888888888'],
                        ['Carlos Oliveira', '11777777777'],
                      ];

                      const csvContent = exampleData
                        .map((row) => row.join(','))
                        .join('\n');

                      const blob = new Blob([csvContent], {
                        type: 'text/csv;charset=utf-8;',
                      });

                      const link = document.createElement('a');
                      if (link.download !== undefined) {
                        const url = URL.createObjectURL(blob);
                        link.setAttribute('href', url);
                        link.setAttribute('download', 'modelo_exemplo_leads.csv');
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    } catch (error) {
                      console.error('Erro ao baixar modelo:', error);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Baixar Planilha Modelo
                </button>
              </div>

              {/* Vídeo Tutorial */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <div className="w-6 h-6 text-purple-400 flex items-center justify-center">▶️</div>
                  </div>
                  <h4 className="text-white font-semibold">Vídeo Tutorial</h4>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Assista ao tutorial completo de como importar sua base de leads passo a passo.
                </p>
                <button
                  onClick={() => {
                    const videoUrl = 'https://www.youtube.com/watch?v=_IHj4V594Ho';
                    window.open(videoUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <div className="w-4 h-4 flex items-center justify-center">▶️</div>
                  Assistir Tutorial
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-neon-green" />
                Importando Leads
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Acesse a seção "Contatos" ou "Campanhas"</li>
                <li>• Clique em "Importar Leads"</li>
                <li>• Faça upload do arquivo CSV</li>
                <li>• Mapeie os campos (nome e telefone)</li>
                <li>• Vincule à campanha correspondente</li>
              </ul>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-shock-pink" />
                Formato do Arquivo
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Formato: CSV(RECOMENDADO) ou Excel (.xlsx)</li>
                <li>• Campos obrigatórios: Nome, Telefone</li>
                <li>• Campos opcionais: Email, Empresa, Segmento</li>
                <li>• Telefone no formato: +5511999999999</li>
                <li>• Máximo: 10.000 leads por importação</li>
              </ul>
            </div>
          </div>

          <div className="bg-deep/60 backdrop-blur-xl rounded-2xl p-6 border border-electric/30">
            <h3 className="text-xl font-semibold text-neon-blue mb-4">📋 Exemplo de Planilha</h3>
            <div className="bg-deep/80 rounded-xl p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-2 text-neon-green">Nome</th>
                    <th className="text-left p-2 text-neon-blue">Telefone</th>
                    <th className="text-left p-2 text-neon-pink">Email</th>
                    <th className="text-left p-2 text-neon-yellow">Segmento</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr>
                    <td className="p-2">João Silva</td>
                    <td className="p-2">+5511999999999</td>
                    <td className="p-2">joao@email.com</td>
                    <td className="p-2">E-commerce</td>
                  </tr>
                  <tr>
                    <td className="p-2">Maria Santos</td>
                    <td className="p-2">+5511888888888</td>
                    <td className="p-2">maria@email.com</td>
                    <td className="p-2">Educação</td>
                  </tr>
                  <tr>
                    <td className="p-2">Carlos Oliveira</td>
                    <td className="p-2">+5511777777777</td>
                    <td className="p-2">carlos@empresa.com</td>
                    <td className="p-2">Tecnologia</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <p className="text-blue-300 text-sm">
                <strong>💡 Dica:</strong> Mantenha exatamente estes nomes de colunas: "Nome", "Telefone", "Email", "Segmento".
                O sistema reconhece automaticamente essas colunas padrão.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'aquecimento',
      title: 'Passo 4: Aquecimento WhatsApp',
      icon: <Flame className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Flame className="w-6 h-6 text-white" />
              </div>
              Passo 4: Aquecimento do WhatsApp
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Prepare suas instâncias para disparos em massa através do processo de aquecimento.
            </p>
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="text-orange-500 font-semibold">Passo Crítico - Altamente Recomendado</span>
            </div>
            <p className="text-gray-300">
              Antes de fazer disparos em massa, é essencial aquecer suas instâncias do WhatsApp.
              Isso evita bloqueios e garante melhor entregabilidade das mensagens.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Como Aquecer
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Acesse "Aquecimento" no menu lateral</li>
                <li>• Selecione as instâncias para aquecer</li>
                <li>• Configure o conteudo para aquecimento</li>
                <li>• Defina quantidade gradual de mensagens</li>
                <li>• Monitore métricas de entregabilidade</li>
              </ul>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neon-green" />
                Benefícios do Aquecimento
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Reduz risco de bloqueio da conta</li>
                <li>• Melhora taxa de entregabilidade</li>
                <li>• Aumenta confiança do WhatsApp</li>
                <li>• Permite volumes maiores de envio</li>
                <li>• Protege reputação da instância</li>
              </ul>
            </div>
          </div>

          <div className="bg-deep/60 backdrop-blur-xl rounded-2xl p-6 border border-electric/30">
            <h3 className="text-xl font-semibold text-orange-500 mb-4">🔥 Sistema de Aquecimento Avançado</h3>
            <div className="space-y-6">
              <div className="bg-deep/80 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-shock-pink" />
                  Funcionalidades Avançadas
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Simulação de digitação e tempo de resposta</li>
                    <li>• Status online/offline inteligente</li>
                    <li>• Marcação de mensagens como lidas</li>
                    <li>• Delays baseados no comprimento da mensagem</li>
                  </ul>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Score de engajamento automático</li>
                    <li>• Informações de dispositivo aleatórias</li>
                    <li>• Modo anti-detecção ativado</li>
                    <li>• Comportamento reduzido nos fins de semana</li>
                  </ul>
                </div>
              </div>

              <div className="bg-deep/80 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-neon-blue" />
                  Tipos de Conteúdo Suportados
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-neon-green font-medium mb-2">Básico:</p>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• Mensagens de texto</li>
                      <li>• Emojis e reações</li>
                      <li>• Áudios e vídeos</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-neon-blue font-medium mb-2">Avançado:</p>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• Documentos PDF</li>
                      <li>• Localização</li>
                      <li>• Cartões de visita</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-neon-pink font-medium mb-2">Interativo:</p>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• Figurinhas</li>
                      <li>• Enquetes</li>
                      <li>• Status e perfil</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-deep/80 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-neon-green mb-2">Dia 1-3</div>
                  <p className="text-gray-300 text-sm">50-100 mensagens/dia</p>
                </div>
                <div className="bg-deep/80 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-neon-blue mb-2">Dia 4-7</div>
                  <p className="text-gray-300 text-sm">200-500 mensagens/dia</p>
                </div>
                <div className="bg-deep/80 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-neon-pink mb-2">Dia 8-14</div>
                  <p className="text-gray-300 text-sm">1000+ mensagens/dia</p>
                </div>
                <div className="bg-deep/80 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500 mb-2">Dia 15+</div>
                  <p className="text-gray-300 text-sm">Volume total liberado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'disparos',
      title: 'Passo 5: Disparos em Massa',
      icon: <Send className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg">
                <Send className="w-6 h-6 text-white" />
              </div>
              Passo 5: Disparos em Massa
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Execute seus disparos em massa com segurança e eficiência máxima.
            </p>
          </div>

          <div className="bg-gradient-to-r from-neon-green/10 to-electric/10 border border-neon-green/30 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-neon-green" />
              <span className="text-neon-green font-semibold">Último Passo da Jornada</span>
            </div>
            <p className="text-gray-300">
              Com instâncias conectadas, campanhas criadas, leads importados e WhatsApp aquecido,
              você está pronto para realizar disparos em massa com segurança e eficiência.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-neon-green" />
                Criando Disparo
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Acesse "Disparos" no menu lateral</li>
                <li>• Clique em "Novo Disparo"</li>
                <li>• Selecione a campanha</li>
                <li>• Crie sua mensagem personalizada</li>
                <li>• Configure horários e intervalos</li>
                <li>• Revise e execute o disparo</li>
              </ul>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-shock-pink" />
                Personalização Avançada
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Use instancias com status Recomendado</li>
                <li>• Adicione mídias (imagens, vídeos ou audio)</li>
                <li>• Configure mensagens de follow-up</li>
                <li>• Ative rotação de instâncias</li>
                <li>• Monitore métricas em tempo real</li>
              </ul>
            </div>
          </div>

          <div className="bg-deep/60 backdrop-blur-xl rounded-2xl p-6 border border-electric/30">
            <h3 className="text-xl font-semibold text-neon-blue mb-4">🎯 Sistema de Dispatcher Inteligente</h3>
            <div className="space-y-6">
              <div className="bg-deep/80 rounded-xl p-4">
                <h4 className="text-neon-green font-semibold mb-3 flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Configuração de Disparo
                </h4>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300">
                  1. Selecione a campanha e base de leads<br />
                  2. Configure rotação de instâncias (RANDOM/SEQUENTIAL/LOAD_BALANCED)<br />
                  3. Defina limites por instância e intervalos<br />
                  4. Configure horários de funcionamento<br />
                  5. Inicie o disparo com monitoramento automático
                </div>
              </div>

              <div className="bg-deep/80 rounded-xl p-4">
                <h4 className="text-neon-blue font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recursos de Proteção
                </h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Rotação automática entre múltiplas instâncias</li>
                  <li>• Controle de velocidade por instância</li>
                  <li>• Pausas inteligentes baseadas em horários</li>
                  <li>• Monitoramento de status das instâncias</li>
                  <li>• Sistema anti-bloqueio avançado</li>
                </ul>
              </div>

              <div className="bg-deep/80 rounded-xl p-4">
                <h4 className="text-neon-pink font-semibold mb-3">📊 Monitoramento em Tempo Real</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-neon-green">1,234</div>
                    <div className="text-xs text-gray-400">Enviadas</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-neon-blue">987</div>
                    <div className="text-xs text-gray-400">Entregues</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-shock-pink">156</div>
                    <div className="text-xs text-gray-400">Lidas</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-orange-500">23</div>
                    <div className="text-xs text-gray-400">Respostas</div>
                  </div>
                </div>
              </div>

              <div className="bg-deep/80 rounded-xl p-4">
                <h4 className="text-neon-yellow font-semibold mb-3">💬 Exemplo de Mensagem Personalizada</h4>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 mb-4">
                  Olá {'{nome}'}! 👋<br /><br />
                  Temos uma oferta especial para você!<br />
                  🎉 50% OFF em todos os produtos<br /><br />
                  Válido até amanhã às 23:59h<br />
                  Link: https://meusite.com/oferta<br /><br />
                  Atenciosamente,<br />
                  Equipe {'{empresa}'}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-300 mb-2">Variáveis Disponíveis:</p>
                    <div className="space-y-1 text-sm">
                      <code className="bg-electric/20 text-neon-green px-2 py-1 rounded">{'{nome}'}</code>
                      <span className="text-gray-400 ml-2">Nome do contato</span>
                      <br />
                      <code className="bg-electric/20 text-neon-green px-2 py-1 rounded">{'{telefone}'}</code>
                      <span className="text-gray-400 ml-2">Número do telefone</span>
                      <br />
                      <code className="bg-electric/20 text-neon-green px-2 py-1 rounded">{'{segmento}'}</code>
                      <span className="text-gray-400 ml-2">Segmento do lead</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-300 mb-2">Variáveis do Sistema:</p>
                    <div className="space-y-1 text-sm">
                      <code className="bg-electric/20 text-neon-blue px-2 py-1 rounded">{'{data}'}</code>
                      <span className="text-gray-400 ml-2">Data atual</span>
                      <br />
                      <code className="bg-electric/20 text-neon-blue px-2 py-1 rounded">{'{hora}'}</code>
                      <span className="text-gray-400 ml-2">Hora atual</span>
                      <br />
                      <code className="bg-electric/20 text-neon-blue px-2 py-1 rounded">{'{empresa}'}</code>
                      <span className="text-gray-400 ml-2">Nome da empresa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'chat-ia',
      title: 'Chat IA',
      icon: <MessageCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              Chat com Inteligência Artificial
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Automatize conversas e atendimento com nossos agentes de IA avançados.
            </p>
          </div>

          <div className="bg-deep/60 backdrop-blur-xl rounded-2xl p-6 border border-electric/30 mt-6">
            <h3 className="text-xl font-semibold text-neon-purple mb-4">🤖 Sistema de Agentes IA Avançado</h3>
            <div className="space-y-6">
              <div className="bg-deep/80 rounded-xl p-4">
                <h4 className="text-neon-green font-semibold mb-3 flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  Workflow Builder Visual
                </h4>
                <p className="text-gray-300 mb-4">
                  Interface visual drag-and-drop para criar workflows complexos sem programação.
                </p>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Editor visual com canvas interativo</li>
                  <li>• Biblioteca de nós pré-configurados</li>
                  <li>• Configuração de agentes por instância</li>
                  <li>• Sistema de triggers e condições</li>
                  <li>• Conexões visuais entre nós</li>
                </ul>
              </div>

              <div className="bg-deep/80 rounded-xl p-4">
                <h4 className="text-neon-blue font-semibold mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configurações Avançadas
                </h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Modal de configuração de agentes</li>
                  <li>• Diálogos informativos sobre agentes</li>
                  <li>• Menu contextual do canvas</li>
                  <li>• Integração com instâncias WhatsApp</li>
                  <li>• Templates de workflows prontos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'agentes-ia',
      title: 'Agentes IA',
      icon: <Bot className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-neon-cyan to-neon-blue rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              Agentes de Inteligência Artificial
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Crie agentes especializados para diferentes tipos de atendimento e automação.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-neon-cyan" />
                Workflow Builder
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Acesse "Agentes IA" no menu</li>
                <li>• Use o editor visual drag-and-drop</li>
                <li>• Configure nós e conexões</li>
                <li>• Defina triggers e ações</li>
                <li>• Teste e publique o workflow</li>
                <li>• Monitore performance em tempo real</li>
              </ul>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-neon-blue" />
                Tipos de Workflows
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• <strong>Atendimento:</strong> Suporte automatizado</li>
                <li>• <strong>Vendas:</strong> Qualificação de leads</li>
                <li>• <strong>Marketing:</strong> Nutrição de contatos</li>
                <li>• <strong>Agendamento:</strong> Marcação automática</li>
                <li>• <strong>Personalizado:</strong> Fluxos específicos</li>
              </ul>
            </div>
          </div>

          <div className="bg-deep/60 backdrop-blur-xl rounded-2xl p-6 border border-electric/30 mt-6">
            <h3 className="text-xl font-semibold text-neon-cyan mb-4">🔧 Funcionalidades do Workflow Builder</h3>
            <div className="space-y-6">
              <div className="bg-deep/80 rounded-xl p-4">
                <h4 className="text-neon-green font-semibold mb-3">Canvas Interativo</h4>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 mb-4">
                  • Editor visual com zoom e pan<br />
                  • Biblioteca de nós arrastavéis<br />
                  • Conexões automáticas entre nós<br />
                  • Preview em tempo real<br />
                  • Salvamento automático
                </div>
              </div>

              <div className="bg-deep/80 rounded-xl p-4">
                <h4 className="text-neon-blue font-semibold mb-3">Tipos de Nós Disponíveis</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-neon-green font-medium mb-2">Triggers:</div>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• Mensagem recebida</li>
                      <li>• Palavra-chave</li>
                      <li>• Horário específico</li>
                    </ul>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-neon-blue font-medium mb-2">Ações:</div>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• Enviar mensagem</li>
                      <li>• Criar tarefa</li>
                      <li>• Agendar reunião</li>
                    </ul>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-neon-pink font-medium mb-2">Condições:</div>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• If/Else lógico</li>
                      <li>• Filtros de dados</li>
                      <li>• Validações</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'agentes',
      title: 'Agentes de IA',
      icon: <Bot className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-neon-blue to-electric rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              Agentes de IA Conversacionais
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Crie agentes inteligentes que podem conversar automaticamente com seus leads,
              responder perguntas e qualificar prospects 24/7.
            </p>
          </div>

          <div className="bg-gradient-to-r from-neon-blue/10 to-electric/10 border border-neon-blue/30 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Bot className="w-5 h-5 text-neon-blue" />
              <span className="text-neon-blue font-semibold">Primeiro Passo: Configurar API Keys</span>
            </div>
            <p className="text-gray-300">
              Antes de criar agentes, você precisa configurar as chaves de API dos provedores de IA.
              Sem isso, os agentes não conseguirão funcionar.
            </p>
          </div>

          {/* Seção Principal: Como obter API Key da OpenAI */}
          <div className="bg-deep/60 backdrop-blur-xl rounded-2xl p-6 border border-electric/30">
            <h3 className="text-2xl font-semibold text-neon-blue mb-6 flex items-center gap-3">
              🔑 Como Pegar a API Key da OpenAI — Passo a Passo
            </h3>

            <div className="space-y-6">
              {/* Passo 1 */}
              <div className="flex gap-4 p-6 bg-gradient-to-r from-neon-blue/20 to-electric/20 rounded-xl border-2 border-neon-blue/50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-neon-blue to-electric rounded-full flex items-center justify-center text-white font-bold text-lg">1</div>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-3 text-lg">🌐 Acesse a Plataforma OpenAI</h4>
                  <div className="bg-gray-900/70 rounded-lg p-4 border border-neon-blue/30">
                    <p className="text-gray-200 mb-3">Vá para <span className="text-neon-blue font-mono bg-gray-800 px-2 py-1 rounded">https://platform.openai.com/</span></p>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>• Entre com sua conta OpenAI (ou crie uma nova)</li>
                      <li>• Se for novo usuário, pode ser necessário verificar o número de telefone</li>
                      <li>• Aguarde a aprovação da conta (pode levar alguns minutos)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="flex gap-4 p-6 bg-gradient-to-r from-electric/20 to-neon-green/20 rounded-xl border-2 border-electric/50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-electric to-neon-green rounded-full flex items-center justify-center text-black font-bold text-lg">2</div>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-3 text-lg">🔧 Abra o Painel de API Keys</h4>
                  <div className="bg-gray-900/70 rounded-lg p-4 border border-electric/30">
                    <p className="text-gray-200 mb-3">No Dashboard, procure a seção <span className="text-electric font-semibold">"API keys"</span> ou <span className="text-electric font-semibold">"View API keys"</span></p>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>• Geralmente fica no menu lateral esquerdo</li>
                      <li>• Ou no menu superior da plataforma</li>
                      <li>• É onde você gerencia e cria todas as suas chaves</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Passo 3 - DESTAQUE PRINCIPAL */}
              <div className="flex gap-4 p-6 bg-gradient-to-r from-neon-green/20 to-neon-yellow/20 rounded-xl border-2 border-neon-green/50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-neon-green to-neon-yellow rounded-full flex items-center justify-center text-black font-bold text-lg">3</div>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-3 text-lg">🔐 Crie uma Nova Chave Secreta</h4>
                  <div className="bg-gray-900/70 rounded-lg p-4 border border-neon-green/30">
                    <p className="text-gray-200 mb-3">Clique em <span className="text-neon-green font-semibold">"Create new secret key"</span> ou <span className="text-neon-green font-semibold">"+ Create new secret key"</span></p>
                    <ul className="space-y-2 text-gray-300 text-sm mb-4">
                      <li>• Dê um nome (label) para identificar a chave (ex: "WhatLead Bot")</li>
                      <li>• Escolha o projeto/organização (se aplicável)</li>
                      <li>• Confirme para gerar a chave</li>
                    </ul>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <p className="text-yellow-300 text-sm font-semibold">⚠️ IMPORTANTE: A chave só será mostrada UMA VEZ!</p>
                      <p className="text-yellow-200 text-sm">Copie e guarde em local seguro imediatamente.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passo 4 */}
              <div className="flex gap-4 p-6 bg-gradient-to-r from-neon-pink/20 to-shock/20 rounded-xl border-2 border-neon-pink/50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-neon-pink to-shock rounded-full flex items-center justify-center text-white font-bold text-lg">4</div>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-3 text-lg">📋 Adicione no WhatLead</h4>
                  <div className="bg-gray-900/70 rounded-lg p-4 border border-neon-pink/30">
                    <p className="text-gray-200 mb-3">Agora cole a chave no WhatLead:</p>
                    <ol className="space-y-2 text-gray-300 text-sm">
                      <li>1. Vá para <span className="text-neon-pink font-semibold">Agentes → Gerenciar Chaves de API</span></li>
                      <li>2. Clique em <span className="text-neon-pink font-semibold">"Nova Chave"</span></li>
                      <li>3. Preencha os campos:</li>
                      <li className="ml-4">• <strong>Nome:</strong> Ex: "OpenAI GPT-4"</li>
                      <li className="ml-4">• <strong>Provider:</strong> Selecione "OpenAI"</li>
                      <li className="ml-4">• <strong>Key Value:</strong> Cole sua chave (sk-...)</li>
                      <li>4. Clique em <span className="text-neon-pink font-semibold">"Adicionar"</span></li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Exemplo Visual da Chave */}
            <div className="mt-6 bg-gray-900/50 rounded-xl p-4 border border-gray-600">
              <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-neon-blue" />
                Exemplo de Chave OpenAI
              </h5>
              <div className="bg-black/50 rounded-lg p-3 font-mono text-sm">
                <span className="text-gray-500">sk-proj-</span><span className="text-neon-green">AbCdEfGhIjKlMnOpQrStUvWxYz1234567890</span><span className="text-gray-500">...</span>
              </div>
              <p className="text-gray-400 text-xs mt-2">* Sempre começa com "sk-" seguido de caracteres aleatórios</p>
            </div>
          </div>

          {/* Outros Provedores */}
          <div className="bg-deep/60 backdrop-blur-xl rounded-2xl p-6 border border-electric/30">
            <h3 className="text-xl font-semibold text-electric mb-4">🔗 Outros Provedores Suportados</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-deep/80 rounded-xl p-4 border border-gray-600">
                <h4 className="text-neon-blue font-semibold mb-2">Anthropic (Claude)</h4>
                <p className="text-gray-300 text-sm mb-2">console.anthropic.com</p>
                <p className="text-gray-400 text-xs">Chaves começam com "sk-ant-"</p>
              </div>
              <div className="bg-deep/80 rounded-xl p-4 border border-gray-600">
                <h4 className="text-neon-green font-semibold mb-2">Google (Gemini)</h4>
                <p className="text-gray-300 text-sm mb-2">aistudio.google.com</p>
                <p className="text-gray-400 text-xs">Chaves começam com "AIza"</p>
              </div>
              <div className="bg-deep/80 rounded-xl p-4 border border-gray-600">
                <h4 className="text-neon-pink font-semibold mb-2">Groq</h4>
                <p className="text-gray-300 text-sm mb-2">console.groq.com</p>
                <p className="text-gray-400 text-xs">Chaves começam com "gsk_"</p>
              </div>
            </div>
          </div>

          {/* Criando Agentes */}
          <div className="bg-deep/60 backdrop-blur-xl rounded-2xl p-6 border border-electric/30">
            <h3 className="text-xl font-semibold text-shock-pink mb-4">🤖 Criando Seu Primeiro Agente</h3>
            <div className="space-y-4">
              <div className="bg-deep/80 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">Após configurar as API Keys:</h4>
                <ol className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-3">
                    <span className="bg-shock-pink text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                    Vá para "Agentes" no menu lateral
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="bg-neon-blue text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                    Clique em "Novo Agente"
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="bg-neon-green text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                    Configure nome, descrição e personalidade
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="bg-electric text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                    Selecione a API Key configurada
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="bg-neon-yellow text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
                    Teste o agente antes de ativar
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Dicas de Segurança */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <h4 className="text-red-300 font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              🔒 Dicas de Segurança
            </h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• <strong>Nunca compartilhe</strong> suas chaves de API com terceiros</li>
              <li>• <strong>Monitore o uso</strong> regularmente no painel do provedor</li>
              <li>• <strong>Configure limites</strong> de gastos nos provedores</li>
              <li>• <strong>Revogue chaves</strong> antigas ou não utilizadas</li>
              <li>• <strong>Use nomes descritivos</strong> para identificar cada chave</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep via-gray-900 to-deep">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-shock/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-900/80 backdrop-blur-xl border-r border-gray-700 h-screen sticky top-0 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg">
                <Book className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Documentação</h1>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar na documentação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-neon-blue"
              />
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <a href="#introducao" className="block text-gray-300 hover:text-neon-blue transition-colors">Introdução</a>
              <a href="#instancias" className="block text-gray-300 hover:text-neon-blue transition-colors">1. Conectar Instâncias</a>
              <a href="#campanhas" className="block text-gray-300 hover:text-neon-blue transition-colors">2. Criar Campanhas</a>
              <a href="#leads" className="block text-gray-300 hover:text-neon-blue transition-colors">3. Importar Base de Leads</a>
              <a href="#aquecimento" className="block text-gray-300 hover:text-neon-blue transition-colors">4. Aquecimento WhatsApp</a>
              <a href="#disparos" className="block text-gray-300 hover:text-neon-blue transition-colors">5. Disparos em Massa</a>
              <a href="#chat-ia" className="block text-gray-300 hover:text-neon-blue transition-colors">Chat IA</a>
              <a href="#agentes-ia" className="block text-gray-300 hover:text-neon-blue transition-colors">Agentes IA</a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {filteredSections.map((section, index) => (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-16"
              >
                {section.content}
              </motion.section>
            ))}
          </div>

          {/* Help Section */}
          <div className="mt-16 bg-deep/60 backdrop-blur-xl rounded-2xl p-8 border border-electric/30">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Precisa de Mais Ajuda?
              </h3>
              <p className="text-gray-300 mb-6">
                Nossa equipe de suporte está sempre pronta para ajudar você a aproveitar ao máximo a plataforma.
              </p>
              <div className="flex justify-center">
                <button
                  className="bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-blue hover:to-neon-green text-black font-semibold px-6 py-3 rounded-lg transition-all duration-300"
                  onClick={() => window.open('https://wa.me/5512988444921', '_blank')}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Contatar Suporte
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-700">
            <div className="text-center text-gray-400">
              <p>&copy; 2025 WhatLead. Todos os direitos reservados.</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Documentation;