import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  ArrowRight,
  User,
  FileText,
  Clock,
  Download,
  Eye
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { RecentActivity } from "@/types";

/**
 * Interface para propriedades do componente RecentActivity
 */
interface RecentActivityProps {
  /** Lista de atividades recentes */
  activities?: RecentActivity[];
  /** Estado de carregamento */
  isLoading?: boolean;
}

/**
 * Configuração de cores e ícones por tipo de atividade
 */
const activityConfig = {
  pessoa_criada: {
    color: "bg-emerald-500",
    icon: User,
    action: "Ver",
  },
  diaria_criada: {
    color: "bg-blue-500",
    icon: FileText,
    action: "Revisar",
  },
  relatorio_gerado: {
    color: "bg-amber-500",
    icon: Download,
    action: "Download",
  },
  dados_atualizados: {
    color: "bg-purple-500",
    icon: Eye,
    action: "Ver",
  },
  default: {
    color: "bg-slate-500",
    icon: Clock,
    action: "Ver",
  },
};

/**
 * Obtém a configuração visual para um tipo de atividade
 */
const getActivityConfig = (tipo: string) => {
  return activityConfig[tipo as keyof typeof activityConfig] || activityConfig.default;
};

/**
 * Formata a data relativa em português
 */
const formatTimeAgo = (date: Date) => {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: ptBR,
  });
};

/**
 * Componente de atividades recentes
 * Exibe as últimas ações realizadas no sistema
 */
export default function RecentActivity({ activities = [], isLoading = false }: RecentActivityProps) {
  
  /**
   * Manipula o clique em uma atividade
   */
  const handleActivityClick = (activity: RecentActivity) => {
    // TODO: Implementar navegação específica por tipo de atividade
    console.log("Atividade clicada:", activity);
  };

  if (isLoading) {
    return (
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="w-48 h-6 bg-slate-200 rounded animate-pulse"></div>
            <div className="w-20 h-4 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-4 animate-pulse">
                <div className="w-2 h-2 bg-slate-200 rounded-full mt-2"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
                  <div className="w-1/4 h-3 bg-slate-200 rounded"></div>
                </div>
                <div className="w-16 h-6 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Atividades Recentes
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary-600 hover:text-primary-700 font-medium"
            data-testid="view-all-activities"
          >
            Ver todas
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const config = getActivityConfig(activity.tipo);
              const IconComponent = config.icon;
              
              return (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-4 group hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                >
                  {/* Indicador colorido */}
                  <div 
                    className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      config.color
                    )}
                  />
                  
                  {/* Conteúdo da atividade */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">
                      {activity.pessoaNome && (
                        <span className="font-medium">{activity.pessoaNome}</span>
                      )}
                      {activity.pessoaNome ? " " : ""}
                      {activity.descricao}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <IconComponent className="w-3 h-3" />
                      {formatTimeAgo(activity.data)}
                    </p>
                  </div>
                  
                  {/* Ação */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-600 hover:text-primary-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleActivityClick(activity)}
                    data-testid={`activity-action-${activity.id}`}
                  >
                    {config.action}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
