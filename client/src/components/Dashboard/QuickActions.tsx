import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  UserPlus, 
  CalendarPlus, 
  FileText, 
  BarChart3,
  ChevronRight,
  AlertTriangle,
  Clock,
  Info
} from "lucide-react";

/**
 * Interface para uma ação rápida
 */
interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
}

/**
 * Interface para um alerta
 */
interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  icon: React.ElementType;
}

/**
 * Interface para propriedades do componente QuickActions
 */
interface QuickActionsProps {
  /** Callback para navegação */
  onNavigate?: (path: string) => void;
}

/**
 * Configuração das ações rápidas
 */
const quickActions: QuickAction[] = [
  {
    id: "novo-servidor",
    label: "Novo Servidor",
    icon: UserPlus,
    color: "text-primary-600",
    onClick: () => console.log("Novo servidor"),
  },
  {
    id: "nova-escala",
    label: "Nova Escala",
    icon: CalendarPlus,
    color: "text-emerald-600",
    onClick: () => console.log("Nova escala"),
  },
  {
    id: "licenca-medica",
    label: "Licença Médica",
    icon: FileText,
    color: "text-amber-600",
    onClick: () => console.log("Licença médica"),
  },
  {
    id: "gerar-relatorio",
    label: "Gerar Relatório",
    icon: BarChart3,
    color: "text-purple-600",
    onClick: () => console.log("Gerar relatório"),
  },
];

/**
 * Alertas do sistema
 */
const systemAlerts: Alert[] = [
  {
    id: "diarias-vencendo",
    type: "warning",
    title: "3 diárias vencendo hoje",
    description: "Necessário aprovação urgente",
    icon: AlertTriangle,
  },
  {
    id: "licencas-vencidas",
    type: "error",
    title: "Licenças médicas vencidas",
    description: "5 servidores precisam renovar",
    icon: Clock,
  },
  {
    id: "backup-realizado",
    type: "info",
    title: "Backup realizado",
    description: "Sistema atualizado às 02:00",
    icon: Info,
  },
];

/**
 * Obtém a configuração de cores para um tipo de alerta
 */
const getAlertConfig = (type: Alert['type']) => {
  switch (type) {
    case 'warning':
      return {
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        iconColor: "text-amber-600",
        titleColor: "text-amber-900",
        descColor: "text-amber-700",
      };
    case 'error':
      return {
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        iconColor: "text-red-600",
        titleColor: "text-red-900",
        descColor: "text-red-700",
      };
    case 'info':
      return {
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        iconColor: "text-blue-600",
        titleColor: "text-blue-900",
        descColor: "text-blue-700",
      };
    default:
      return {
        bgColor: "bg-slate-50",
        borderColor: "border-slate-200",
        iconColor: "text-slate-600",
        titleColor: "text-slate-900",
        descColor: "text-slate-700",
      };
  }
};

/**
 * Componente de ações rápidas e alertas
 * Fornece acesso rápido às funcionalidades principais e exibe alertas importantes
 */
export default function QuickActions({ onNavigate }: QuickActionsProps) {
  
  /**
   * Manipula o clique em uma ação rápida
   */
  const handleActionClick = (action: QuickAction) => {
    action.onClick();
    // TODO: Implementar navegação específica
  };

  /**
   * Manipula o clique em um alerta
   */
  const handleAlertClick = (alert: Alert) => {
    // TODO: Implementar ação específica para cada tipo de alerta
    console.log("Alerta clicado:", alert);
  };

  return (
    <div className="space-y-6">
      {/* Card de Ações Rápidas */}
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              className="w-full justify-between h-auto py-3 px-4 bg-slate-50 hover:bg-slate-100 transition-colors"
              onClick={() => handleActionClick(action)}
              data-testid={`quick-action-${action.id}`}
            >
              <div className="flex items-center space-x-3">
                <action.icon className={cn("w-4 h-4", action.color)} />
                <span className="text-sm font-medium text-slate-900">
                  {action.label}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Card de Alertas */}
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Alertas
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {systemAlerts.length === 0 ? (
            <div className="text-center py-4">
              <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Nenhum alerta no momento</p>
            </div>
          ) : (
            systemAlerts.map((alert) => {
              const config = getAlertConfig(alert.type);
              
              return (
                <button
                  key={alert.id}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors hover:shadow-sm",
                    config.bgColor,
                    config.borderColor
                  )}
                  onClick={() => handleAlertClick(alert)}
                  data-testid={`alert-${alert.id}`}
                >
                  <div className="flex items-start space-x-3">
                    <alert.icon className={cn("w-4 h-4 mt-0.5", config.iconColor)} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium", config.titleColor)}>
                        {alert.title}
                      </p>
                      <p className={cn("text-xs mt-1", config.descColor)}>
                        {alert.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
