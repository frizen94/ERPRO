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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Plus, 
  Filter, 
  Search,
  UserX,
  Calendar,
  FileText,
  RefreshCw
} from "lucide-react";
import type { Afastamento, Pessoa, TipoAfastamento } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Interface para filtros de afastamentos
 */
interface AfastamentoFilters {
  pessoaId?: number;
  tipoAfastamentoId?: number;
  ativo?: boolean;
  nome?: string;
}

/**
 * Página de listagem de afastamentos
 * Exibe afastamentos de servidores com filtros e funcionalidades de gestão
 */
export default function AfastamentosList() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<AfastamentoFilters>({
    ativo: true, // Mostrar apenas afastamentos ativos por padrão
  });

  // Queries para dados
  const { 
    data: afastamentos = [], 
    isLoading: afastamentosLoading,
    error: afastamentosError,
    refetch: refetchAfastamentos 
  } = useQuery<Afastamento[]>({
    queryKey: ["/api/afastamentos", filters],
    retry: 1,
  });

  const { data: pessoas = [] } = useQuery<Pessoa[]>({
    queryKey: ["/api/pessoas", { tipoPessoa: 'S' }],
    retry: 1,
  });

  const { data: tiposAfastamento = [] } = useQuery<TipoAfastamento[]>({
    queryKey: ["/api/tipos-afastamento"],
    retry: 1,
  });

  // Tratamento de erro de autenticação
  if (afastamentosError && isUnauthorizedError(afastamentosError)) {
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
  const updateFilters = (newFilters: Partial<AfastamentoFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  /**
   * Manipula a busca por nome
   */
  const handleSearch = (nome: string) => {
    updateFilters({ nome: nome || undefined });
  };

  /**
   * Atualiza os afastamentos
   */
  const handleRefresh = () => {
    refetchAfastamentos();
    toast({
      title: "Atualizado",
      description: "Lista de afastamentos atualizada",
    });
  };

  /**
   * Verifica se o afastamento está ativo
   */
  const isAfastamentoAtivo = (afastamento: Afastamento) => {
    const hoje = new Date();
    const dataInicio = new Date(afastamento.dataInicio);
    const dataFim = afastamento.dataFim ? new Date(afastamento.dataFim) : null;
    
    return dataInicio <= hoje && (!dataFim || dataFim >= hoje);
  };

  /**
   * Obtém configuração de status do afastamento
   */
  const getStatusConfig = (afastamento: Afastamento) => {
    const ativo = isAfastamentoAtivo(afastamento);
    
    if (ativo) {
      return { label: 'Em Andamento', className: 'status-badge warning' };
    } else if (afastamento.dataFim) {
      return { label: 'Finalizado', className: 'status-badge success' };
    } else {
      return { label: 'Programado', className: 'status-badge info' };
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
   * Formata período do afastamento
   */
  const formatPeriodo = (dataInicio: string, dataFim?: string | null) => {
    const inicio = format(new Date(dataInicio), "dd/MM/yyyy", { locale: ptBR });
    const fim = dataFim ? format(new Date(dataFim), "dd/MM/yyyy", { locale: ptBR }) : "Em andamento";
    return `${inicio} - ${fim}`;
  };

  /**
   * Novo afastamento (placeholder)
   */
  const handleNovoAfastamento = () => {
    toast({
      title: "Novo Afastamento",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  return (
    <div className="main-layout">
      <Sidebar />
      
      <main className="main-content">
        <Header 
          title="Afastamentos"
          breadcrumbs={[
            { label: "Frequência" },
            { label: "Afastamentos" }
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
                onClick={handleNovoAfastamento}
                data-testid="add-afastamento-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Afastamento
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
                    Buscar por nome
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Nome do servidor..."
                      className="pl-10"
                      onChange={(e) => handleSearch(e.target.value)}
                      data-testid="search-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Tipo de Afastamento
                  </label>
                  <Select 
                    onValueChange={(value) => 
                      updateFilters({ tipoAfastamentoId: value ? parseInt(value) : undefined })
                    }
                  >
                    <SelectTrigger data-testid="filter-tipo">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      {tiposAfastamento.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Status
                  </label>
                  <Select 
                    defaultValue="true"
                    onValueChange={(value) => 
                      updateFilters({ ativo: value === "true" ? true : value === "false" ? false : undefined })
                    }
                  >
                    <SelectTrigger data-testid="filter-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="true">Ativos</SelectItem>
                      <SelectItem value="false">Finalizados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de afastamentos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserX className="w-5 h-5" />
                  Lista de Afastamentos
                  {!afastamentosLoading && (
                    <Badge variant="secondary" className="ml-2">
                      {afastamentos.length}
                    </Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent>
              {afastamentosLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 animate-pulse">
                      <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-1/3 h-4 bg-slate-200 rounded"></div>
                        <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
                      </div>
                      <div className="w-20 h-6 bg-slate-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : afastamentos.length === 0 ? (
                <div className="text-center py-12">
                  <UserX className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Nenhum afastamento encontrado
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Não há afastamentos cadastrados com os filtros selecionados.
                  </p>
                  <Button 
                    className="btn-primary"
                    onClick={handleNovoAfastamento}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Afastamento
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {afastamentos.map((afastamento) => {
                    const servidor = pessoas.find(p => p.id === afastamento.pessoaId);
                    const tipo = tiposAfastamento.find(t => t.id === afastamento.tipoAfastamentoId);
                    const statusConfig = getStatusConfig(afastamento);
                    
                    return (
                      <div 
                        key={afastamento.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-amber-100 text-amber-600 font-medium">
                              {servidor ? getInitials(servidor.nome) : '??'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-slate-900 truncate">
                              {servidor?.nome || 'Servidor não encontrado'}
                            </h3>
                            <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {tipo?.nome || 'Tipo não encontrado'}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatPeriodo(afastamento.dataInicio, afastamento.dataFim)}
                              </span>
                            </div>
                            {afastamento.motivo && (
                              <p className="text-xs text-slate-600 mt-1 truncate">
                                Motivo: {afastamento.motivo}
                              </p>
                            )}
                          </div>
                          
                          <Badge 
                            className={statusConfig.className}
                            data-testid={`afastamento-status-${afastamento.id}`}
                          >
                            {statusConfig.label}
                          </Badge>
                        </div>
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
