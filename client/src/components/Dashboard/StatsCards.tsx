import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Watch, 
  Receipt, 
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle
} from "lucide-react";
import type { DashboardStats } from "@/types";

/**
 * Interface para propriedades do componente StatsCards
 */
interface StatsCardsProps {
  /** Dados estatísticos do dashboard */
  stats?: DashboardStats;
  /** Estado de carregamento */
  isLoading?: boolean;
}

/**
 * Interface para configuração de um card de estatística
 */
interface StatCardConfig {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  getValue: (stats: DashboardStats) => number;
  getChange: () => { value: string; type: 'positive' | 'negative' | 'neutral' | 'urgent' };
}

/**
 * Configuração dos cards de estatísticas
 */
const statsConfig: StatCardConfig[] = [
  {
    id: "total-servidores",
    title: "Total de Servidores",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    getValue: (stats) => stats.totalServidores,
    getChange: () => ({ value: "+2.5%", type: "positive" as const }),
  },
  {
    id: "afastamentos-ativos",
    title: "Afastamentos Ativos",
    icon: Watch,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    getValue: (stats) => stats.afastamentosAtivos,
    getChange: () => ({ value: "-1.2%", type: "negative" as const }),
  },
  {
    id: "diarias-pendentes",
    title: "Diárias Pendentes",
    icon: Receipt,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    getValue: (stats) => stats.diariasPendentes,
    getChange: () => ({ value: "Urgente", type: "urgent" as const }),
  },
  {
    id: "armamento-em-uso",
    title: "Armamento em Uso",
    icon: Shield,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    getValue: (stats) => stats.armamentoEmUso,
    getChange: () => ({ value: "OK", type: "positive" as const }),
  },
];

/**
 * Renderiza o ícone de tendência baseado no tipo de mudança
 */
const getTrendIcon = (type: string) => {
  switch (type) {
    case 'positive':
      return <TrendingUp className="w-3 h-3" />;
    case 'negative':
      return <TrendingDown className="w-3 h-3" />;
    case 'urgent':
      return <AlertTriangle className="w-3 h-3" />;
    default:
      return <Minus className="w-3 h-3" />;
  }
};

/**
 * Obtém a cor do badge baseado no tipo de mudança
 */
const getBadgeColor = (type: string) => {
  switch (type) {
    case 'positive':
      return "text-emerald-600";
    case 'negative':
      return "text-amber-600";
    case 'urgent':
      return "text-red-600";
    default:
      return "text-slate-600";
  }
};

/**
 * Componente de cards de estatísticas do dashboard
 * Exibe métricas principais do sistema em cards visuais
 */
export default function StatsCards({ stats, isLoading = false }: StatsCardsProps) {
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                <div className="w-16 h-4 bg-slate-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="w-20 h-8 bg-slate-200 rounded"></div>
                <div className="w-32 h-4 bg-slate-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((config) => (
          <Card key={config.id} className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  config.bgColor
                )}>
                  <config.icon className={cn("w-5 h-5", config.color)} />
                </div>
                <Badge variant="outline" className="text-slate-400">
                  --
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 mb-1">--</p>
                <p className="text-sm text-slate-600">{config.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((config) => {
        const value = config.getValue(stats);
        const change = config.getChange();
        
        return (
          <Card 
            key={config.id} 
            className="border-slate-200 hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  config.bgColor
                )}>
                  <config.icon className={cn("w-5 h-5", config.color)} />
                </div>
                
                <Badge 
                  variant="outline" 
                  className={cn(
                    "font-medium flex items-center gap-1",
                    getBadgeColor(change.type)
                  )}
                  data-testid={`stat-change-${config.id}`}
                >
                  {getTrendIcon(change.type)}
                  {change.value}
                </Badge>
              </div>
              
              <div>
                <p 
                  className="text-3xl font-bold text-slate-900 mb-1"
                  data-testid={`stat-value-${config.id}`}
                >
                  {value.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-slate-600">{config.title}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
