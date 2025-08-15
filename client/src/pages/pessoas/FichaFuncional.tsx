import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  User, 
  FileText, 
  Calendar, 
  Phone, 
  Mail,
  MapPin,
  CreditCard,
  Briefcase,
  Clock,
  Download,
  Printer
} from "lucide-react";
import type { Pessoa, DadosFuncionais } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Página de ficha funcional do servidor
 * Exibe informações completas e histórico profissional de um servidor
 */
export default function FichaFuncional() {
  const params = useParams();
  const { toast } = useToast();
  const servidorId = params.id ? parseInt(params.id) : null;

  // Query para buscar dados do servidor
  const { 
    data: servidor, 
    isLoading: servidorLoading,
    error: servidorError 
  } = useQuery<Pessoa>({
    queryKey: ["/api/pessoas", servidorId],
    enabled: !!servidorId,
    retry: 1,
  });

  // Query para buscar dados funcionais
  const { 
    data: dadosFuncionais,
    isLoading: dadosLoading 
  } = useQuery<DadosFuncionais>({
    queryKey: ["/api/pessoas", servidorId, "dados-funcionais"],
    enabled: !!servidorId,
    retry: 1,
  });

  // Tratamento de erro de autenticação
  if (servidorError && isUnauthorizedError(servidorError)) {
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
   * Volta para a lista de servidores
   */
  const handleBack = () => {
    window.history.back();
  };

  /**
   * Formata CPF para exibição
   */
  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  /**
   * Formata data para exibição
   */
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
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
   * Manipula a impressão da ficha
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Manipula o download da ficha
   */
  const handleDownload = () => {
    toast({
      title: "Download",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const isLoading = servidorLoading || dadosLoading;

  if (isLoading) {
    return (
      <div className="main-layout">
        <Sidebar />
        <main className="main-content">
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-slate-200 rounded w-64"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-64 bg-slate-200 rounded"></div>
                  <div className="h-48 bg-slate-200 rounded"></div>
                </div>
                <div className="h-96 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!servidor) {
    return (
      <div className="main-layout">
        <Sidebar />
        <main className="main-content">
          <div className="p-6">
            <div className="text-center py-12">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Servidor não encontrado
              </h3>
              <p className="text-slate-500 mb-6">
                O servidor solicitado não existe ou foi removido.
              </p>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <Sidebar />
      
      <main className="main-content">
        <Header 
          title="Ficha Funcional"
          breadcrumbs={[
            { label: "Gestão de Pessoas" },
            { label: "Servidores", href: "/pessoas/servidores" },
            { label: "Ficha Funcional" }
          ]}
          actions={
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={handlePrint}
                data-testid="print-button"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDownload}
                data-testid="download-button"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline" 
                onClick={handleBack}
                data-testid="back-button"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          }
        />

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informações pessoais */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informações Pessoais
                    </CardTitle>
                    <Badge 
                      variant={servidor.isActive ? "default" : "secondary"}
                      className={servidor.isActive ? "status-badge success" : "status-badge"}
                    >
                      {servidor.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-start space-x-6">
                    <Avatar className="w-20 h-20">
                      <AvatarFallback className="bg-primary-100 text-primary-600 font-medium text-xl">
                        {getInitials(servidor.nome)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {servidor.nome}
                        </h2>
                        {servidor.nomeSocial && (
                          <p className="text-sm text-slate-600">
                            Nome Social: {servidor.nomeSocial}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">CPF:</span>
                          <span className="ml-2 font-medium">
                            {formatCPF(servidor.cpf)}
                          </span>
                        </div>
                        {servidor.rg && (
                          <div>
                            <span className="text-slate-500">RG:</span>
                            <span className="ml-2 font-medium">{servidor.rg}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-500">Data de Nascimento:</span>
                          <span className="ml-2 font-medium">
                            {servidor.dataNascimento ? formatDate(servidor.dataNascimento) : "Não informado"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Sexo:</span>
                          <span className="ml-2 font-medium">
                            {servidor.sexo === 'M' ? 'Masculino' : 'Feminino'}
                          </span>
                        </div>
                        {servidor.estadoCivil && (
                          <div>
                            <span className="text-slate-500">Estado Civil:</span>
                            <span className="ml-2 font-medium">{servidor.estadoCivil}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {(servidor.nomePai || servidor.nomeMae) && (
                    <>
                      <Separator className="my-6" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {servidor.nomePai && (
                          <div>
                            <span className="text-slate-500">Nome do Pai:</span>
                            <span className="ml-2 font-medium">{servidor.nomePai}</span>
                          </div>
                        )}
                        {servidor.nomeMae && (
                          <div>
                            <span className="text-slate-500">Nome da Mãe:</span>
                            <span className="ml-2 font-medium">{servidor.nomeMae}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Dados funcionais */}
              {dadosFuncionais && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Dados Funcionais
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Matrícula:</span>
                        <span className="ml-2 font-medium">{dadosFuncionais.matricula}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Situação:</span>
                        <Badge 
                          variant="secondary"
                          className={dadosFuncionais.situacao === 'ATIVO' ? "status-badge success" : "status-badge"}
                        >
                          {dadosFuncionais.situacao}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-slate-500">Data de Posse:</span>
                        <span className="ml-2 font-medium">
                          {formatDate(dadosFuncionais.dataPosse)}
                        </span>
                      </div>
                      {dadosFuncionais.dataNomeacao && (
                        <div>
                          <span className="text-slate-500">Data de Nomeação:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(dadosFuncionais.dataNomeacao)}
                          </span>
                        </div>
                      )}
                      {dadosFuncionais.dataExercicio && (
                        <div>
                          <span className="text-slate-500">Data de Exercício:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(dadosFuncionais.dataExercicio)}
                          </span>
                        </div>
                      )}
                    </div>

                    {dadosFuncionais.observacoes && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <span className="text-slate-500 block mb-2">Observações:</span>
                          <p className="text-slate-900">{dadosFuncionais.observacoes}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Histórico (placeholder) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Histórico Profissional
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">Nenhum histórico registrado</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar de informações */}
            <div className="space-y-6">
              {/* Contato */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contato</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {servidor.telefone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{servidor.telefone}</span>
                    </div>
                  )}
                  
                  {servidor.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{servidor.email}</span>
                    </div>
                  )}
                  
                  {!servidor.telefone && !servidor.email && (
                    <p className="text-sm text-slate-500">
                      Nenhum contato cadastrado
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Endereço */}
              {(servidor.endereco || servidor.cep) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Endereço
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    {servidor.endereco && (
                      <p className="text-sm text-slate-900 mb-2">
                        {servidor.endereco}
                      </p>
                    )}
                    {servidor.cep && (
                      <p className="text-sm text-slate-500">
                        CEP: {servidor.cep}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Ações rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ações</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    data-testid="edit-servidor-button"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Editar Dados
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    data-testid="view-frequency-button"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Frequência
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    data-testid="view-allowances-button"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Ver Diárias
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
