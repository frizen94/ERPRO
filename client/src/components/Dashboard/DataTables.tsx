import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ArrowRight, Users, Receipt } from "lucide-react";

/**
 * Interface para dados de escala
 */
interface EscalaData {
  id: number;
  servidor: string;
  iniciais: string;
  turno: string;
  status: 'PRESENTE' | 'PENDENTE' | 'AFASTADO' | 'FALTOU';
}

/**
 * Interface para dados de diária
 */
interface DiariaData {
  id: number;
  solicitante: string;
  iniciais: string;
  valor: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'EM_ANALISE';
}

/**
 * Interface para propriedades do componente DataTables
 */
interface DataTablesProps {
  /** Dados das escalas do dia */
  escalas?: EscalaData[];
  /** Dados das diárias recentes */
  diarias?: DiariaData[];
  /** Estado de carregamento */
  isLoading?: boolean;
}

/**
 * Dados mock para demonstração (em produção virão da API)
 */
const escalasHoje: EscalaData[] = [
  {
    id: 1,
    servidor: "João Silva",
    iniciais: "JS",
    turno: "08:00 - 17:00",
    status: "PRESENTE",
  },
  {
    id: 2,
    servidor: "Maria Costa",
    iniciais: "MC",
    turno: "14:00 - 22:00",
    status: "PENDENTE",
  },
  {
    id: 3,
    servidor: "Carlos Oliveira",
    iniciais: "CO",
    turno: "22:00 - 06:00",
    status: "AFASTADO",
  },
];

const diariasRecentes: DiariaData[] = [
  {
    id: 1,
    solicitante: "Maria Santos",
    iniciais: "MS",
    valor: "R$ 450,00",
    status: "PENDENTE",
  },
  {
    id: 2,
    solicitante: "Roberto Silva",
    iniciais: "RS",
    valor: "R$ 320,00",
    status: "APROVADA",
  },
  {
    id: 3,
    solicitante: "Ana Lima",
    iniciais: "AL",
    valor: "R$ 680,00",
    status: "EM_ANALISE",
  },
];

/**
 * Configuração de cores para status de escala
 */
const escalaStatusConfig = {
  PRESENTE: {
    label: "Presente",
    color: "bg-emerald-100 text-emerald-800",
  },
  PENDENTE: {
    label: "Pendente",
    color: "bg-amber-100 text-amber-800",
  },
  AFASTADO: {
    label: "Afastado",
    color: "bg-red-100 text-red-800",
  },
  FALTOU: {
    label: "Faltou",
    color: "bg-red-100 text-red-800",
  },
};

/**
 * Configuração de cores para status de diária
 */
const diariaStatusConfig = {
  PENDENTE: {
    label: "Pendente",
    color: "bg-amber-100 text-amber-800",
  },
  APROVADA: {
    label: "Aprovada",
    color: "bg-emerald-100 text-emerald-800",
  },
  REJEITADA: {
    label: "Rejeitada",
    color: "bg-red-100 text-red-800",
  },
  EM_ANALISE: {
    label: "Em Análise",
    color: "bg-blue-100 text-blue-800",
  },
};

/**
 * Componente de skeleton para loading
 */
const TableSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3 animate-pulse">
        <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
          <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
        </div>
        <div className="w-16 h-6 bg-slate-200 rounded"></div>
      </div>
    ))}
  </div>
);

/**
 * Componente de tabelas de dados do dashboard
 * Exibe escalas do dia e diárias recentes em formato de tabela
 */
export default function DataTables({ 
  escalas = escalasHoje, 
  diarias = diariasRecentes, 
  isLoading = false 
}: DataTablesProps) {
  
  /**
   * Manipula o clique para ver todas as escalas
   */
  const handleViewAllEscalas = () => {
    // TODO: Navegar para página de escalas
    console.log("Ver todas as escalas");
  };

  /**
   * Manipula o clique para ver todas as diárias
   */
  const handleViewAllDiarias = () => {
    // TODO: Navegar para página de diárias
    console.log("Ver todas as diárias");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Escalas de Hoje */}
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Escalas de Hoje
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-600 hover:text-primary-700 font-medium"
              onClick={handleViewAllEscalas}
              data-testid="view-all-escalas"
            >
              Ver calendário
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <div className="space-y-3">
              {escalas.map((escala) => {
                const statusConfig = escalaStatusConfig[escala.status];
                
                return (
                  <div 
                    key={escala.id}
                    className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-3 px-3 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs font-medium text-slate-600 bg-slate-200">
                          {escala.iniciais}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {escala.servidor}
                        </p>
                        <p className="text-xs text-slate-600">
                          {escala.turno}
                        </p>
                      </div>
                    </div>
                    
                    <Badge 
                      className={cn(
                        "text-xs font-medium",
                        statusConfig.color
                      )}
                      data-testid={`escala-status-${escala.id}`}
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diárias Recentes */}
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Diárias Recentes
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-600 hover:text-primary-700 font-medium"
              onClick={handleViewAllDiarias}
              data-testid="view-all-diarias"
            >
              Ver todas
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <div className="space-y-3">
              {diarias.map((diaria) => {
                const statusConfig = diariaStatusConfig[diaria.status];
                
                return (
                  <div 
                    key={diaria.id}
                    className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-3 px-3 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs font-medium text-slate-600 bg-slate-200">
                          {diaria.iniciais}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {diaria.solicitante}
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          {diaria.valor}
                        </p>
                      </div>
                    </div>
                    
                    <Badge 
                      className={cn(
                        "text-xs font-medium",
                        statusConfig.color
                      )}
                      data-testid={`diaria-status-${diaria.id}`}
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
