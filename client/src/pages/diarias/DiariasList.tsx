import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Receipt,
  Calendar,
  MapPin,
  MoreVertical,
  Eye,
  Edit,
  Check,
  X,
  RefreshCw
} from "lucide-react";
import type { Diaria, Pessoa, StatusDiaria } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Interface para filtros de diárias
 */
interface DiariaFilters {
  pessoaId?: number;
  statusId?: number;
  dataInicio?: Date;
  dataFim?: Date;
  nome?: string;
}

/**
 * Página de listagem de diárias
 * Exibe solicitações de diárias com filtros e funcionalidades de aprovação
 */
export default function DiariasList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<DiariaFilters>({});

  // Queries para dados
  const { 
    data: diarias = [], 
    isLoading: diariasLoading,
    error: diariasError,
    refetch: refetchDiarias 
  } = useQuery<Diaria[]>({
    queryKey: ["/api/diarias", filters],
    retry: 1,
  });

  const { data: pessoas = [] } = useQuery<Pessoa[]>({
    queryKey: ["/api/pessoas", { tipoPessoa: 'S' }],
    retry: 1,
  });

  const { data: statusDiaria = [] } = useQuery<StatusDiaria[]>({
    queryKey: ["/api/status-diaria"],
    retry: 1,
  });

  // Mutation para atualizar status da diária
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, statusId }: { id: number; statusId: number }) => {
      await apiRequest("PUT", `/api/diarias/${id}`, { statusId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diarias"] });
      toast({
        title: "Sucesso",
        description: "Status da diária atualizado com sucesso",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi deslogado. Redirecionando...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Falha ao atualizar status da diária",
        variant: "destructive",
      });
    },
  });

  // Tratamento de erro de autenticação
  if (diariasError && isUnauthorizedError(diariasError)) {
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
  const updateFilters = (newFilters: Partial<DiariaFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  /**
   * Manipula a busca por nome
   */
  const handleSearch = (nome: string) => {
    updateFilters({ nome: nome || undefined });
  };

  /**
   * Atualiza as diárias
   */
  const handleRefresh = () => {
    refetchDiarias();
    toast({
      title: "Atualizado",
      description: "Lista de diárias atualizada",
    });
  };

  /**
   * Aprova uma diária
   */
  const handleAprovar = (diaria: Diaria) => {
    const statusAprovado = statusDiaria.find(s => s.nome === 'APROVADA');
    if (statusAprovado) {
      updateStatusMutation.mutate({ id: diaria.id, statusId: statusAprovado.id });
    }
  };

  /**
   * Rejeita uma diária
   */
  const handleRejeitar = (diaria: Diaria) => {
    const statusRejeitado = statusDiaria.find(s => s.nome === 'REJEITADA');
    if (statusRejeitado) {
      updateStatusMutation.mutate({ id: diaria.id, statusId: statusRejeitado.id });
    }
  };

  /**
   * Obtém configuração de status
   */
  const getStatusConfig = (statusId: number) => {
    const status = statusDiaria.find(s => s.id === statusId);
    const nome = status?.nome || 'PENDENTE';
    
    switch (nome) {
      case 'APROVADA':
        return { label: 'Aprovada', className: 'status-badge success' };
      case 'REJEITADA':
        return { label: 'Rejeitada', className: 'status-badge error' };
      case 'EM_ANALISE':
        return { label: 'Em Análise', className: 'status-badge info' };
      case 'PENDENTE':
      default:
        return { label: 'Pendente', className: 'status-badge warning' };
    }
  };

  /**
   * Obtém as iniciais do nome
   */
  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  /**
   * Formata valor monetário
   */
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  /**
   * Formata período
   */
  const formatPeriodo = (dataInicio: string, dataFim: string) => {
    const inicio = format(new Date(dataInicio), "dd/MM", { locale: ptBR });
    const fim = format(new Date(dataFim), "dd/MM/yyyy", { locale: ptBR });
    return `${inicio} - ${fim}`;
  };

  /**
   * Nova diária (placeholder)
   */
  const handleNovaDiaria = () => {
    toast({
      title: "Nova Diária",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  return (
    <div className="main-layout">
      <Sidebar />
      
      <main className="main-content">
        <Header 
          title="Diárias"
          breadcrumbs={[
            { label: "Diárias" }
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
                onClick={handleNovaDiaria}
                data-testid="add-diaria-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Diária
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Buscar por solicitante
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Nome do solicitante..."
                      className="pl-10"
                      onChange={(e) => handleSearch(e.target.value)}
                      data-testid="search-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Status
                  </label>
                  <Select 
                    onValueChange={(value) => 
                      updateFilters({ statusId: value ? parseInt(value) : undefined })
                    }
                  >
                    <SelectTrigger data-testid="filter-status">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os status</SelectItem>
                      {statusDiaria.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          {status.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Data de início
                  </label>
                  <Input
                    type="date"
                    onChange={(e) => 
                      updateFilters({ dataInicio: e.target.value ? new Date(e.target.value) : undefined })
                    }
                    data-testid="filter-data-inicio"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Data de fim
                  </label>
                  <Input
                    type="date"
                    onChange={(e) => 
                      updateFilters({ dataFim: e.target.value ? new Date(e.target.value) : undefined })
                    }
                    data-testid="filter-data-fim"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de diárias */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Solicitações de Diárias
                  {!diariasLoading && (
                    <Badge variant="secondary" className="ml-2">
                      {diarias.length}
                    </Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent>
              {diariasLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 animate-pulse">
                      <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-1/3 h-4 bg-slate-200 rounded"></div>
                        <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
                      </div>
                      <div className="w-20 h-6 bg-slate-200 rounded"></div>
                      <div className="w-8 h-8 bg-slate-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : diarias.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Nenhuma diária encontrada
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Não há solicitações de diárias com os filtros selecionados.
                  </p>
                  <Button 
                    className="btn-primary"
                    onClick={handleNovaDiaria}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Solicitação
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {diarias.map((diaria) => {
                    const solicitante = pessoas.find(p => p.id === diaria.pessoaId);
                    const statusConfig = getStatusConfig(diaria.statusId);
                    
                    return (
                      <div 
                        key={diaria.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-purple-100 text-purple-600 font-medium">
                              {solicitante ? getInitials(solicitante.nome) : '??'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-slate-900 truncate">
                              {solicitante?.nome || 'Solicitante não encontrado'}
                            </h3>
                            <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {diaria.destino}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatPeriodo(diaria.dataInicio, diaria.dataFim)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 truncate">
                              {diaria.finalidade}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-900">
                              {diaria.valorTotal ? formatCurrency(diaria.valorTotal) : 'Valor não informado'}
                            </p>
                            <Badge 
                              className={statusConfig.className}
                              data-testid={`diaria-status-${diaria.id}`}
                            >
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </div>

                        {/* Menu de ações */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              data-testid={`diaria-actions-${diaria.id}`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {statusConfig.label === 'Pendente' && (
                              <>
                                <DropdownMenuItem 
                                  className="text-emerald-600"
                                  onClick={() => handleAprovar(diaria)}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Aprovar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleRejeitar(diaria)}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Rejeitar
                                </DropdownMenuItem>
                              </>
                            )}
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
