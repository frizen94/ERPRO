import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Calendar, 
  Receipt, 
  Shield, 
  BarChart3, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  LayoutDashboard,
  Building
} from "lucide-react";

/**
 * Interface para itens do menu lateral
 */
interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: MenuItem[];
  badge?: string | number;
}

/**
 * Dados do menu de navegação
 */
const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    id: "pessoas",
    label: "Gestão de Pessoas",
    icon: Users,
    children: [
      { id: "servidores", label: "Servidores", icon: Users, path: "/pessoas/servidores" },
      { id: "terceirizados", label: "Terceirizados", icon: Users, path: "/pessoas/terceirizados" },
      { id: "fichas", label: "Fichas Funcionais", icon: Users, path: "/pessoas/fichas" },
      { id: "dados-bancarios", label: "Dados Bancários", icon: Users, path: "/pessoas/dados-bancarios" },
    ],
  },
  {
    id: "frequencia",
    label: "Frequência",
    icon: Calendar,
    children: [
      { id: "escalas", label: "Escalas", icon: Calendar, path: "/frequencia/escalas" },
      { id: "afastamentos", label: "Afastamentos", icon: Calendar, path: "/frequencia/afastamentos" },
      { id: "substituicoes", label: "Substituições", icon: Calendar, path: "/frequencia/substituicoes" },
      { id: "licencas", label: "Licenças", icon: Calendar, path: "/frequencia/licencas" },
    ],
  },
  {
    id: "diarias",
    label: "Diárias",
    icon: Receipt,
    path: "/diarias",
    badge: "3",
  },
  {
    id: "armamento",
    label: "Armamento",
    icon: Shield,
    path: "/armamento",
  },
  {
    id: "relatorios",
    label: "Relatórios",
    icon: BarChart3,
    children: [
      { id: "pessoal", label: "Pessoal", icon: BarChart3, path: "/relatorios/pessoal" },
      { id: "frequencia-rel", label: "Frequência", icon: BarChart3, path: "/relatorios/frequencia" },
      { id: "financeiro", label: "Financeiro", icon: BarChart3, path: "/relatorios/financeiro" },
      { id: "personalizados", label: "Personalizados", icon: BarChart3, path: "/relatorios/personalizados" },
    ],
  },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: Settings,
    path: "/configuracoes",
  },
];

/**
 * Componente de menu lateral
 * Permite navegação entre as diferentes seções do sistema
 */
export default function Sidebar() {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["pessoas", "frequencia", "relatorios"]);

  /**
   * Alterna a expansão de um item do menu
   */
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  /**
   * Verifica se um item está ativo
   */
  const isActive = (path?: string) => {
    if (!path) return false;
    return location === path || (path !== "/" && location.startsWith(path));
  };

  /**
   * Renderiza um item do menu
   */
  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.path);

    if (hasChildren) {
      return (
        <div key={item.id} className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between h-auto py-2.5 px-3 text-sm font-medium",
              level > 0 && "ml-6",
              "hover:bg-slate-100 text-slate-700"
            )}
            onClick={() => toggleExpanded(item.id)}
            data-testid={`menu-toggle-${item.id}`}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-4 h-4 text-slate-500" />
              <span>{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </Button>
          
          {isExpanded && (
            <div className="ml-6 space-y-1">
              {item.children.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    const LinkComponent = item.path ? Link : "div";

    return (
      <LinkComponent
        key={item.id}
        href={item.path || "#"}
        className={cn(
          "block w-full",
          level > 0 && "ml-6"
        )}
      >
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-auto py-2.5 px-3 text-sm font-medium",
            active 
              ? "text-primary-700 bg-primary-50 hover:bg-primary-100" 
              : "text-slate-700 hover:bg-slate-100"
          )}
          data-testid={`menu-item-${item.id}`}
        >
          <div className="flex items-center space-x-3 flex-1">
            <item.icon className={cn(
              "w-4 h-4",
              active ? "text-primary-600" : "text-slate-500"
            )} />
            <span>{item.label}</span>
          </div>
          {item.badge && (
            <Badge 
              variant="secondary" 
              className="bg-amber-100 text-amber-800 text-xs"
            >
              {item.badge}
            </Badge>
          )}
        </Button>
      </LinkComponent>
    );
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-slate-200 z-30">
      <div className="flex flex-col h-full">
        {/* Cabeçalho do Logo */}
        <div className="flex items-center px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Building className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">SigmaERP</h1>
              <p className="text-xs text-slate-500">Sistema Integrado</p>
            </div>
          </div>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>

        {/* Perfil do Usuário */}
        <div className="px-4 py-4 border-t border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                Administrador
              </p>
              <p className="text-xs text-slate-500 truncate">Sistema</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-600"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="logout-button"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
