import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BarChart3, 
  Download, 
  Calendar,
  Users,
  Clock,
  DollarSign,
  Shield,
  FileText,
  Eye,
  RefreshCw,
  Filter
} from "lucide-react";

/**
 * Interface para configuração de relatório
 */
interface RelatorioConfig {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'pessoal' | 'frequencia' | 'financeiro' | 'armamento';
  icon: React.ElementType;
  color: string;
  campos: Array<{
    nome: string;
    tipo: 'data' | 'select' | 'multiselect';
    obrigatorio?: boolean;
    opcoes?: Array<{ value: string; label: string }>;
  }>;
}

/**
 * Configurações dos relatórios disponíveis
 */
const relatoriosDisponiveis: RelatorioConfig[] = [
  // Relatórios de Pessoal
  {
    id: 'servidores-ativos',
    nome: 'Servidores Ativos',
    descricao: 'Lista completa de servidores ativos no sistema',
    categoria: 'pessoal',
    icon: Users,
    color: 'text-blue-600 bg-blue-100',
    campos: [
      {
        nome: 'unidade',
        tipo: 'select',
        opcoes: [
          { value: 'todas', label: 'Todas as unidades' },
          { value: '1', label: 'Sede' },
          { value: '2', label: 'Unidade Regional' }
        ]
      },
      {
        nome: 'cargo',
        tipo: 'select',
        opcoes: [
          { value: 'todos', label: 'Todos os cargos' },
          { value: '1', label: 'Delegado' },
          { value: '2', label: 'Investigador' }
        ]
      }
    ]
  },
  {
    id: 'fichas-funcionais',
    nome: 'Fichas Funcionais',
    descricao: 'Relatório detalhado das fichas funcionais dos servidores',
    categoria: 'pessoal',
    icon: FileText,
    color: 'text-blue-600 bg-blue-100',
    campos: [
      {
        nome: 'servidor',
        tipo: 'select',
        opcoes: [
          { value: 'todos', label: 'Todos os servidores' }
        ]
      }
    ]
  },

  // Relatórios de Frequência
  {
    id: 'escalas-periodo',
    nome: 'Escalas por Período',
    descricao: 'Relatório de escalas de trabalho em período específico',
    categoria: 'frequencia',
    icon: Calendar,
    color: 'text-emerald-600 bg-emerald-100',
    campos: [
      {
        nome: 'dataInicio',
        tipo: 'data',
        obrigatorio: true
      },
      {
        nome: 'dataFim',
        tipo: 'data',
        obrigatorio: true
      },
      {
        nome: 'unidade',
        tipo: 'select',
        opcoes: [
          { value: 'todas', label: 'Todas as unidades' }
        ]
      }
    ]
  },
  {
    id: 'afastamentos-ativos',
    nome: 'Afastamentos Ativos',
    descricao: 'Lista de todos os afastamentos em andamento',
    categoria: 'frequencia',
    icon: Clock,
    color: 'text-emerald-600 bg-emerald-100',
    campos: [
      {
        nome: 'tipoAfastamento',
        tipo: 'select',
        opcoes: [
          { value: 'todos', label: 'Todos os tipos' },
          { value: '1', label: 'Licença Médica' },
          { value: '2', label: 'Férias' }
        ]
      }
    ]
  },

  // Relatórios Financeiros
  {
    id: 'diarias-periodo',
    nome: 'Diárias por Período',
    descricao: 'Relatório financeiro de diárias pagas em período específico',
    categoria: 'financeiro',
    icon: DollarSign,
    color: 'text-purple-600 bg-purple-100',
    campos: [
      {
        nome: 'dataInicio',
        tipo: 'data',
        obrigatorio: true
      },
      {
        nome: 'dataFim',
        tipo: 'data',
        obrigatorio: true
      },
      {
        nome: 'status',
        tipo: 'select',
        opcoes: [
          { value: 'todos', label: 'Todos os status' },
          { value: 'aprovada', label: 'Aprovadas' },
          { value: 'pendente', label: 'Pendentes' }
        ]
      }
    ]
  },

  // Relatórios de Armamento
  {
    id: 'controle-armamento',
    nome: 'Controle de Armamento',
    descricao: 'Relatório de situação atual do armamento',
    categoria: 'armamento',
    icon: Shield,
    color: 'text-amber-600 bg-amber-100',
    campos: [
      {
        nome: 'situacao',
        tipo: 'select',
        opcoes: [
          { value: 'todas', label: 'Todas as situações' },
          { value: 'disponivel', label: 'Disponível' },
          { value: 'em_uso', label: 'Em Uso' },
          { value: 'manutencao', label: 'Manutenção' }
        ]
      }
    ]
  }
];

/**
 * Página de relatórios do sistema
 * Permite gerar e baixar relatórios personalizados
 */
export default function RelatoriosList() {
  const { toast } = useToast();
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<RelatorioConfig | null>(null);
  const [parametros, setParametros] = useState<Record<string, string>>({});
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('todas');

  /**
   * Filtra relatórios por categoria
   */
  const relatoriosFiltrados = categoriaSelecionada === 'todas' 
    ? relatoriosDisponiveis 
    : relatoriosDisponiveis.filter(r => r.categoria === categoriaSelecionada);

  /**
   * Obtém configuração de categoria
   */
  const getCategoriaConfig = (categoria: string) => {
    switch (categoria) {
      case 'pessoal':
        return { label: 'Pessoal', icon: Users, color: 'text-blue-600' };
      case 'frequencia':
        return { label: 'Frequência', icon: Clock, color: 'text-emerald-600' };
      case 'financeiro':
        return { label: 'Financeiro', icon: DollarSign, color: 'text-purple-600' };
      case 'armamento':
        return { label: 'Armamento', icon: Shield, color: 'text-amber-600' };
      default:
        return { label: 'Geral', icon: BarChart3, color: 'text-slate-600' };
    }
  };

  /**
   * Atualiza parâmetro do relatório
   */
  const updateParametro = (campo: string, valor: string) => {
    setParametros(prev => ({ ...prev, [campo]: valor }));
  };

  /**
   * Gera o relatório
   */
  const handleGerarRelatorio = (formato: 'pdf' | 'excel' | 'csv') => {
    if (!relatorioSelecionado) return;

    // Validar campos obrigatórios
    const camposObrigatorios = relatorioSelecionado.campos.filter(c => c.obrigatorio);
    const camposFaltantes = camposObrigatorios.filter(c => !parametros[c.nome]);
    
    if (camposFaltantes.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios antes de gerar o relatório",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Relatório gerado",
      description: `Relatório "${relatorioSelecionado.nome}" em formato ${formato.toUpperCase()} será baixado em breve`,
    });

    // TODO: Implementar geração real do relatório
    console.log('Gerando relatório:', {
      relatorio: relatorioSelecionado.id,
      formato,
      parametros
    });
  };

  /**
   * Visualiza o relatório
   */
  const handleVisualizarRelatorio = () => {
    if (!relatorioSelecionado) return;
    
    toast({
      title: "Visualização",
      description: "Funcionalidade de visualização em desenvolvimento",
    });
  };

  return (
    <div className="main-layout">
      <Sidebar />
      
      <main className="main-content">
        <Header 
          title="Relatórios"
          breadcrumbs={[
            { label: "Relatórios" }
          ]}
          actions={
            <Button 
              variant="outline"
              data-testid="refresh-button"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          }
        />

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de relatórios */}
            <div className="lg:col-span-2 space-y-6">
              {/* Filtro por categoria */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filtrar por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={categoriaSelecionada}
                    onValueChange={setCategoriaSelecionada}
                  >
                    <SelectTrigger data-testid="filter-categoria">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as categorias</SelectItem>
                      <SelectItem value="pessoal">Pessoal</SelectItem>
                      <SelectItem value="frequencia">Frequência</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="armamento">Armamento</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Lista de relatórios */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Relatórios Disponíveis
                    <Badge variant="secondary" className="ml-2">
                      {relatoriosFiltrados.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {relatoriosFiltrados.map((relatorio) => {
                      const categoriaConfig = getCategoriaConfig(relatorio.categoria);
                      const IconComponent = relatorio.icon;
                      const isSelected = relatorioSelecionado?.id === relatorio.id;
                      
                      return (
                        <div 
                          key={relatorio.id}
                          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                          onClick={() => setRelatorioSelecionado(relatorio)}
                          data-testid={`relatorio-${relatorio.id}`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${relatorio.color}`}>
                              <IconComponent className="w-6 h-6" />
                            </div>
                            
                            <div>
                              <h3 className="text-sm font-medium text-slate-900">
                                {relatorio.nome}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1">
                                {relatorio.descricao}
                              </p>
                              <Badge 
                                variant="outline" 
                                className={`mt-2 text-xs ${categoriaConfig.color}`}
                              >
                                {categoriaConfig.label}
                              </Badge>
                            </div>
                          </div>
                          
                          {isSelected && (
                            <Badge className="status-badge success">
                              Selecionado
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Painel de configuração */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {relatorioSelecionado ? 'Configurar Relatório' : 'Selecione um Relatório'}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  {relatorioSelecionado ? (
                    <div className="space-y-4">
                      {/* Informações do relatório */}
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <h4 className="font-medium text-slate-900 mb-1">
                          {relatorioSelecionado.nome}
                        </h4>
                        <p className="text-xs text-slate-600">
                          {relatorioSelecionado.descricao}
                        </p>
                      </div>

                      {/* Parâmetros do relatório */}
                      {relatorioSelecionado.campos.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-slate-900">
                            Parâmetros
                          </h5>
                          
                          {relatorioSelecionado.campos.map((campo) => (
                            <div key={campo.nome}>
                              <Label className="text-xs text-slate-700 capitalize">
                                {campo.nome.replace(/([A-Z])/g, ' $1')}
                                {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                              </Label>
                              
                              {campo.tipo === 'data' ? (
                                <Input
                                  type="date"
                                  className="mt-1"
                                  onChange={(e) => updateParametro(campo.nome, e.target.value)}
                                  data-testid={`param-${campo.nome}`}
                                />
                              ) : (
                                <Select 
                                  onValueChange={(value) => updateParametro(campo.nome, value)}
                                >
                                  <SelectTrigger className="mt-1" data-testid={`param-${campo.nome}`}>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {campo.opcoes?.map((opcao) => (
                                      <SelectItem key={opcao.value} value={opcao.value}>
                                        {opcao.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Ações */}
                      <div className="space-y-2 pt-4 border-t">
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={handleVisualizarRelatorio}
                          data-testid="visualizar-button"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                        
                        <div className="grid grid-cols-3 gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGerarRelatorio('pdf')}
                            data-testid="gerar-pdf"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGerarRelatorio('excel')}
                            data-testid="gerar-excel"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Excel
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGerarRelatorio('csv')}
                            data-testid="gerar-csv"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            CSV
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">
                        Selecione um relatório da lista para configurar os parâmetros
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
