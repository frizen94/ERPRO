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
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CalendarPlus, 
  Calendar as CalendarIcon, 
  Filter, 
  Search,
  Clock,
  Users,
  RefreshCw
} from "lucide-react";
import type { Escala, Pessoa, Unidade, TipoEscala } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Interface para filtros de escalas
 */
interface EscalaFilters {
  data?: Date;
  pessoaId?: number;
  unidadeId?: number;
  status?: string;
}

/**
 * Página de listagem de escalas
 * Exibe escalas de trabalho com filtros por data, servidor e unidade
 */
export default function EscalasList() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filters, setFilters] = useState<EscalaFilters>({
    data: new Date(),
  });

  // Queries para dados
  const { 
    data: escalas = [], 
    isLoading: escalasLoading,
    error: escalasError,
    refetch: refetchEscalas 
  } = useQuery<Escala[]>({
    queryKey: ["/api/escalas", filters],
    retry: 1,
  });

  const { data: pessoas = [] } = useQuery<Pessoa[]>({
    queryKey: ["/api/pessoas", { tipoPessoa: 'S' }],
    retry: 1,
  });

  const { data: unidades = [] } = useQuery<Unidade[]>({
    queryKey: ["/api/unidades"],
    retry: 1,
  });

  const { data: tiposEscala = [] } = useQuery<TipoEscala[]>({
    queryKey: ["/api/tipos-escala"],
    retry: 1,
  });

  // Tratamento de erro de autenticação
  if (escalasError && isUnauthorizedError(escalasError)) {
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
  const updateFilters = (newFilters: Partial<EscalaFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  /**
   * Manipula a seleção de data no calendário
   */
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      updateFilters({ data: date });
    }
  };

  /**
   * Atualiza as escalas
   */
  const handleRefresh = () => {
    refetchEscalas();
    toast({
      title: "Atualizado",
      description: "Lista de escalas atualizada",
    });
  };

  /**
   * Obtém configuração de status
   */
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PRESENTE':
        return { label: 'Presente', className: 'status-badge success' };
      case 'FALTOU':
        return { label: 'Faltou', className: 'status-badge error' };
      case 'JUSTIFICADA':
        return { label: 'Justificada', className: 'status-badge info' };
      case 'AGENDADA':
      default:
        return { label: 'Agendada', className: 'status-badge warning' };
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
   * Formata horário
   */
  const formatHorario = (inicio: string, fim: string) => {
    return `${inicio} - ${fim}`;
  };

  /**
   * Nova escala (placeholder)
   */
  const handleNovaEscala = () => {
    toast({
      title: "Nova Escala",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  return (
    <div className="main-layout">
      <Sidebar />
      
      <main className="main-content">
        <Header 
          title="Escalas de Trabalho"
          breadcrumbs={[
            { label: "Frequência" },
            { label: "Escalas" }
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
                onClick={handleNovaEscala}
                data-testid="add-escala-button"
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                Nova Escala
              </Button>
            </div>
          }
        />

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar com calendário e filtros */}
            <div className="space-y-6">
              {/* Calendário */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Selecionar Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    locale={ptBR}
                    className="rounded-md"
                  />
                </CardContent>
              </Card>

              {/* Filtros */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Servidor
                    </label>
                    <Select 
                      onValueChange={(value) => 
                        updateFilters({ pessoaId: value ? parseInt(value) : undefined })
                      }
                    >
                      <SelectTrigger data-testid="filter-servidor">
                        <SelectValue placeholder="Todos os servidores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os servidores</SelectItem>
                        {pessoas.map((pessoa) => (
                          <SelectItem key={pessoa.id} value={pessoa.id.toString()}>
                            {pessoa.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Unidade
                    </label>
                    <Select 
                      onValueChange={(value) => 
                        updateFilters({ unidadeId: value ? parseInt(value) : undefined })
                      }
                    >
                      <SelectTrigger data-testid="filter-unidade">
                        <SelectValue placeholder="Todas as unidades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas as unidades</SelectItem>
                        {unidades.map((unidade) => (
                          <SelectItem key={unidade.id} value={unidade.id.toString()}>
                            {unidade.nome}
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
                      onValueChange={(value) => 
                        updateFilters({ status: value || undefined })
                      }
                    >
                      <SelectTrigger data-testid="filter-status">
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os status</SelectItem>
                        <SelectItem value="AGENDADA">Agendada</SelectItem>
                        <SelectItem value="PRESENTE">Presente</SelectItem>
                        <SelectItem value="FALTOU">Faltou</SelectItem>
                        <SelectItem value="JUSTIFICADA">Justificada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de escalas */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Escalas de {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      {!escalasLoading && (
                        <Badge variant="secondary" className="ml-2">
                          {escalas.length}
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {escalasLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 animate-pulse">
                          <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="w-1/3 h-4 bg-slate-200 rounded"></div>
                            <div className="w-1/4 h-3 bg-slate-200 rounded"></div>
                          </div>
                          <div className="w-20 h-6 bg-slate-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : escalas.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        Nenhuma escala encontrada
                      </h3>
                      <p className="text-slate-500 mb-6">
                        Não há escalas cadastradas para a data selecionada.
                      </p>
                      <Button 
                        className="btn-primary"
                        onClick={handleNovaEscala}
                      >
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        Cadastrar Escala
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {escalas.map((escala) => {
                        const servidor = pessoas.find(p => p.id === escala.pessoaId);
                        const unidade = unidades.find(u => u.id === escala.unidadeId);
                        const statusConfig = getStatusConfig(escala.status || 'AGENDADA');
                        
                        return (
                          <div 
                            key={escala.id}
                            className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center space-x-4 flex-1">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback className="bg-primary-100 text-primary-600 font-medium">
                                  {servidor ? getInitials(servidor.nome) : '??'}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-slate-900 truncate">
                                  {servidor?.nome || 'Servidor não encontrado'}
                                </h3>
                                <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                                  <span>
                                    {escala.horaInicio && escala.horaFim 
                                      ? formatHorario(escala.horaInicio, escala.horaFim)
                                      : 'Horário não definido'
                                    }
                                  </span>
                                  <span>•</span>
                                  <span>{unidade?.nome || 'Unidade não encontrada'}</span>
                                </div>
                              </div>
                              
                              <Badge 
                                className={statusConfig.className}
                                data-testid={`escala-status-${escala.id}`}
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
          </div>
        </div>
      </main>
    </div>
  );
}
