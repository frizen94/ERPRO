import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Moon, 
  Bell, 
  Plus, 
  ChevronRight 
} from "lucide-react";

/**
 * Interface para props do componente Header
 */
interface HeaderProps {
  /** Título da página atual */
  title: string;
  /** Breadcrumbs para navegação */
  breadcrumbs?: Array<{ label: string; href?: string }>;
  /** Ações customizadas do cabeçalho */
  actions?: React.ReactNode;
}

/**
 * Componente de cabeçalho da aplicação
 * Exibe breadcrumbs, título da página e ações de usuário
 */
export default function Header({ title, breadcrumbs = [], actions }: HeaderProps) {
  
  /**
   * Alterna entre tema claro e escuro
   */
  const handleThemeToggle = () => {
    // TODO: Implementar funcionalidade de mudança de tema
    console.log("Alternar tema");
  };

  /**
   * Abre painel de notificações
   */
  const handleNotifications = () => {
    // TODO: Implementar painel de notificações
    console.log("Abrir notificações");
  };

  /**
   * Abre menu de ações rápidas
   */
  const handleQuickActions = () => {
    // TODO: Implementar menu de ações rápidas
    console.log("Ações rápidas");
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Breadcrumbs e Título */}
          <div className="flex-1">
            {breadcrumbs.length > 0 && (
              <nav className="flex items-center space-x-2 text-sm mb-1">
                <span className="text-slate-500">SigmaERP</span>
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    {crumb.href ? (
                      <a 
                        href={crumb.href}
                        className="text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="text-slate-900 font-medium">
                        {crumb.label}
                      </span>
                    )}
                  </div>
                ))}
              </nav>
            )}
            <h1 className="text-xl font-semibold text-slate-900">
              {title}
            </h1>
          </div>

          {/* Ações do Cabeçalho */}
          <div className="flex items-center space-x-4">
            {/* Ações customizadas */}
            {actions}
            
            {/* Alternador de Tema */}
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              onClick={handleThemeToggle}
              data-testid="theme-toggle"
            >
              <Moon className="w-4 h-4" />
            </Button>
            
            {/* Notificações */}
            <Button
              variant="ghost"
              size="sm"
              className="relative text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              onClick={handleNotifications}
              data-testid="notifications-button"
            >
              <Bell className="w-4 h-4" />
              <Badge 
                className="absolute -top-1 -right-1 w-3 h-3 p-0 bg-red-500 hover:bg-red-500 text-[10px] flex items-center justify-center"
              >
                3
              </Badge>
            </Button>

            {/* Ações Rápidas */}
            <Button
              className="bg-primary-600 hover:bg-primary-700 text-white"
              onClick={handleQuickActions}
              data-testid="quick-actions"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Novo</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
