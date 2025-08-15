import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  Users,
  FileText
} from "lucide-react";
import type { Pessoa } from "@shared/schema";

/**
 * Interface para filtros de busca
 */
interface SearchFilters {
  nome?: string;
  cpf?: string;
  tipoPessoa?: string;
}

/**
 * Página de listagem de servidores
 * Exibe todos os servidores cadastrados com funcionalidades de busca, filtro e ações
 */
export default function ServidoresList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    tipoPessoa: 'S' // Apenas servidores
  });

  // Query para buscar servidores
  const { 
    data: servidores = [], 
    isLoading,
    error 
  } = useQuery<Pessoa[]>({
    queryKey: ["/api/pessoas", searchFilters],
    retry: 1,
  });

  // Mutation para excluir servidor
  const deleteServerMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/pessoas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pessoas"] });
      toast({
        title: "Sucesso",
        description: "Servidor excluído com sucesso",
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
        description: "Falha ao excluir servidor",
        variant: "destructive",
      });
    },
  });

  /**
   * Manipula a busca por nome
   */
  const handleSearch = (nome: string) => {
    setSearchFilters(prev => ({ ...prev, nome: nome || undefined }));
  };

  /**
   * Manipula a exclusão de um servidor
   */
  const handleDelete = async (servidor: Pessoa) => {
    if (confirm(`Tem certeza que deseja excluir ${servidor.nome}?`)) {
      deleteServerMutation.mutate(servidor.id);
    }
  };

  /**
   * Formata o CPF para exibição
   */
  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
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

  // Tratamento de erro de autenticação
  if (error && isUnauthorizedError(error)) {
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

  return (
    <div className="main-layout">
      <Sidebar />
      
      <main className="main-content">
        <Header 
          title="Servidores"
          breadcrumbs={[
            { label: "Gestão de Pessoas" },
            { label: "Servidores" }
          ]}
          actions={
            <Link href="/pessoas/servidor/novo">
              <Button className="btn-primary" data-testid="add-servidor-button">
                <Plus className="w-4 h-4 mr-2" />
                Novo Servidor
              </Button>
            </Link>
          }
        />

        <div className="p-6">
          {/* Filtros e busca */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros de Busca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nome..."
                      className="pl-10"
                      onChange={(e) => handleSearch(e.target.value)}
                      data-testid="search-input"
                    />
                  </div>
                </div>
                <Button variant="outline" className="sm:w-auto">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros Avançados
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de servidores */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Lista de Servidores
                  {!isLoading && (
                    <Badge variant="secondary" className="ml-2">
                      {servidores.length}
                    </Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
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
              ) : servidores.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Nenhum servidor encontrado
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Comece cadastrando o primeiro servidor do sistema.
                  </p>
                  <Link href="/pessoas/servidor/novo">
                    <Button className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Servidor
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {servidores.map((servidor) => (
                    <div 
                      key={servidor.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary-100 text-primary-600 font-medium">
                            {getInitials(servidor.nome)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-slate-900 truncate">
                            {servidor.nome}
                          </h3>
                          <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                            <span>CPF: {formatCPF(servidor.cpf)}</span>
                            <span>•</span>
                            <span>{servidor.email || "Email não informado"}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={servidor.isActive ? "default" : "secondary"}
                            className={servidor.isActive ? "status-badge success" : "status-badge"}
                          >
                            {servidor.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>

                      {/* Menu de ações */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            data-testid={`servidor-actions-${servidor.id}`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/pessoas/servidor/${servidor.id}/ficha`}>
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              Ficha Funcional
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/pessoas/servidor/${servidor.id}/editar`}>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(servidor)}
                            disabled={deleteServerMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {deleteServerMutation.isPending ? "Excluindo..." : "Excluir"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
