import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Filter, 
  Search,
  Shield,
  MoreVertical,
  Eye,
  Edit,
  UserPlus,
  UserMinus,
  Wrench,
  RefreshCw
} from "lucide-react";
import type { Armamento, TipoArma } from "@shared/schema";

/**
 * Interface para filtros de armamento
 */
interface ArmamentoFilters {
  situacao?: string;
  tipoArmaId?: number;
  numeroSerie?: string;
}

/**
 * Página de listagem de armamentos
 * Exibe controle de armamentos com filtros e funcionalidades de gestão
 */
export default function ArmamentoList() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<ArmamentoFilters>({});

  // Queries para dados
  const { 
    data: armamentos = [], 
    isLoading: armamentosLoading,
    error: armamentosError,
    refetch: refetchArmamentos 
  } = useQuery<Armamento[]>({
    queryKey: ["/api/armamentos", filters],
    retry: 1,
  });

  const { data: tiposArma = [] } = useQuery<TipoArma[]>({
    queryKey: ["/api/tipos-arma"],
    retry: 1,
  });

  // Tratamento de erro de autenticação
  if (armamentosError && isUnauthorizedError(armamentosError)) {
    toast({
      title: "Não autorizado",
      description: "Você foi deslogado. Redirecionando...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  /**
   * Atualiza os filtros de busca
   */
  const updateFilters = (newFilters: Partial<ArmamentoFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  /**
   * Manipula a busca por número de série
   */
  const handleSearch = (numeroSerie: string) => {
    updateFilters({ numeroSerie: numeroSerie || undefined });
  };

  /**
   * Atualiza os armamentos
   */
  const handleRefresh = () => {
    refetchArmamentos();
    toast({
      title: "Atualizado",
      description: "Lista de armamentos atualizada",
    });
  };

  /**
   * Obtém configuração de situação
   */
  const getSituacaoConfig = (situacao: string) => {
    switch (situacao) {
      case 'DISPONIVEL':
        return { label: 'Disponível', className: 'status-badge success', icon: Shield };
      case 'EM_USO':
        return { label: 'Em Uso', className: 'status-badge warning', icon: UserPlus };
      case 'MANUTENCAO':
        return { label: 'Manutenção', className: 'status-badge info', icon: Wrench };
      case 'BAIXADO':
        return { label: 'Baixado', className: 'status-badge error', icon: UserMinus };
      default:
        return { label: 'Indefinido', className: 'status-badge', icon: Shield };
    }
  };

  /**
   * Novo armamento (placeholder)
   */
  const handleNovoArmamento = () => {
    toast({
      title: "Novo Armamento",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  /**
   * Ações do armamento
   */
  const handleAcaoArmamento = (action: string, armamento: Armamento) => {
    toast({
      title: `${action}`,
      description: `Funcionalidade em desenvolvimento para ${armamento.numeroSerie}`,
    });
  };

  return (
    <div className="main-layout">
      <Sidebar />
      
      <main className="main-content">
        <Header 
          title="Controle de Armamento"
          breadcrumbs={[
            { label: "Armamento" }
          ]}
          actions={
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                data-testid="refresh-button"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button 
                className="btn-primary"
                onClick={handleNovoArmamento}
                data-testid="add-armamento-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Armamento
              </Button>
            </div>
          }
        />

        <div className="p-6">
          {/* Filtros de busca */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros de Busca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Buscar por número de série
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Número de série..."
                      className="pl-10"
                      onChange={(e) => handleSearch(e.target.value)}
                      data-testid="search-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Tipo de Arma
                  </label>
                  <Select 
                    onValueChange={(value) => 
                      updateFilters({ tipoArmaId: value ? parseInt(value) : undefined })
                    }
                  >
                    <SelectTrigger data-testid="filter-tipo">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      {tiposArma.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Situação
                  </label>
                  <Select 
                    onValueChange={(value) => 
                      updateFilters({ situacao: value || undefined })
                    }
                  >
                    <SelectTrigger data-testid="filter-situacao">
                      <SelectValue placeholder="Todas as situações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as situações</SelectItem>
                      <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                      <SelectItem value="EM_USO">Em Uso</SelectItem>
                      <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                      <SelectItem value="BAIXADO">Baixado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Disponível', count: armamentos.filter(a => a.situacao === 'DISPONIVEL').length, color: 'text-emerald-600 bg-emerald-100' },
              { label: 'Em Uso', count: armamentos.filter(a => a.situacao === 'EM_USO').length, color: 'text-amber-600 bg-amber-100' },
              { label: 'Manutenção', count: armamentos.filter(a => a.situacao === 'MANUTENCAO').length, color: 'text-blue-600 bg-blue-100' },
              { label: 'Baixado', count: armamentos.filter(a => a.situacao === 'BAIXADO').length, color: 'text-red-600 bg-red-100' }
            ].map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.count}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <Shield className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Lista de armamentos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Lista de Armamentos
                  {!armamentosLoading && (
                    <Badge variant="secondary" className="ml-2">
                      {armamentos.length}
                    </Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent>
              {armamentosLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 animate-pulse">
                      <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-1/3 h-4 bg-slate-200 rounded"></div>
                        <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
                      </div>
                      <div className="w-20 h-6 bg-slate-200 rounded"></div>
                      <div className="w-8 h-8 bg-slate-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : armamentos.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Nenhum armamento encontrado
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Não há armamentos cadastrados com os filtros selecionados.
                  </p>
                  <Button 
                    className="btn-primary"
                    onClick={handleNovoArmamento}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Armamento
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {armamentos.map((armamento) => {
                    const tipo = tiposArma.find(t => t.id === armamento.tipoArmaId);
                    const situacaoConfig = getSituacaoConfig(armamento.situacao || 'DISPONIVEL');
                    const IconComponent = situacaoConfig.icon;
                    
                    return (
                      <div 
                        key={armamento.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-emerald-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-slate-900">
                              {armamento.numeroSerie}
                            </h3>
                            <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                              <span>{tipo?.nome || 'Tipo não encontrado'}</span>
                              {armamento.marca && (
                                <>
                                  <span>•</span>
                                  <span>{armamento.marca}</span>
                                </>
                              )}
                              {armamento.modelo && (
                                <>
                                  <span>•</span>
                                  <span>{armamento.modelo}</span>
                                </>
                              )}
                            </div>
                            {armamento.anoFabricacao && (
                              <p className="text-xs text-slate-600 mt-1">
                                Ano: {armamento.anoFabricacao}
                              </p>
                            )}
                          </div>
                          
                          <Badge 
                            className={situacaoConfig.className}
                            data-testid={`armamento-situacao-${armamento.id}`}
                          >
                            {situacaoConfig.label}
                          </Badge>
                        </div>

                        {/* Menu de ações */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              data-testid={`armamento-actions-${armamento.id}`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleAcaoArmamento("Ver Detalhes", armamento)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAcaoArmamento("Editar", armamento)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {armamento.situacao === 'DISPONIVEL' && (
                              <DropdownMenuItem
                                className="text-amber-600"
                                onClick={() => handleAcaoArmamento("Alocar", armamento)}
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Alocar
                              </DropdownMenuItem>
                            )}
                            {armamento.situacao === 'EM_USO' && (
                              <DropdownMenuItem
                                className="text-emerald-600"
                                onClick={() => handleAcaoArmamento("Devolver", armamento)}
                              >
                                <UserMinus className="w-4 h-4 mr-2" />
                                Devolver
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-blue-600"
                              onClick={() => handleAcaoArmamento("Manutenção", armamento)}
                            >
                              <Wrench className="w-4 h-4 mr-2" />
                              Manutenção
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
