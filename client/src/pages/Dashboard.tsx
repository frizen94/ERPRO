import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import StatsCards from "@/components/Dashboard/StatsCards";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import QuickActions from "@/components/Dashboard/QuickActions";
import DataTables from "@/components/Dashboard/DataTables";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { DashboardStats, RecentActivity as ActivityType } from "@/types";
import { useEffect } from "react";

/**
 * Página principal do dashboard
 * Exibe visão geral do sistema com estatísticas, atividades e ações rápidas
 */
export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Query para estatísticas do dashboard
  const { 
    data: stats, 
    isLoading: statsLoading,
    error: statsError 
  } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    retry: 1,
  });

  // Query para atividades recentes
  const { 
    data: activities, 
    isLoading: activitiesLoading,
    error: activitiesError 
  } = useQuery<ActivityType[]>({
    queryKey: ["/api/dashboard/activities"],
    retry: 1,
  });

  // Tratamento de erros de autenticação
  useEffect(() => {
    if (statsError && isUnauthorizedError(statsError)) {
      toast({
        title: "Não autorizado",
        description: "Você foi deslogado. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [statsError, toast]);

  useEffect(() => {
    if (activitiesError && isUnauthorizedError(activitiesError)) {
      toast({
        title: "Não autorizado", 
        description: "Você foi deslogado. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [activitiesError, toast]);

  // Verifica autenticação
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  /**
   * Manipula o clique no botão de ação rápida
   */
  const handleQuickCreate = () => {
    toast({
      title: "Ação rápida",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  /**
   * Formata a data atual
   */
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
    });
  };

  return (
    <div className="main-layout">
      <Sidebar />
      
      <main className="main-content">
        <Header 
          title="Dashboard"
          breadcrumbs={[{ label: "Dashboard" }]}
          actions={
            <Button 
              className="btn-primary"
              onClick={handleQuickCreate}
              data-testid="header-quick-action"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo
            </Button>
          }
        />

        <div className="p-6">
          {/* Título da página */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Dashboard
            </h1>
            <p className="text-slate-600">
              Visão geral do sistema - {getCurrentDate()}
            </p>
          </div>

          {/* Cards de estatísticas */}
          <div className="mb-8">
            <StatsCards 
              stats={stats}
              isLoading={statsLoading}
            />
          </div>

          {/* Grid de conteúdo principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Atividades recentes - 2/3 da largura */}
            <div className="lg:col-span-2">
              <RecentActivity 
                activities={activities}
                isLoading={activitiesLoading}
              />
            </div>

            {/* Ações rápidas - 1/3 da largura */}
            <div>
              <QuickActions />
            </div>
          </div>

          {/* Tabelas de dados */}
          <div className="mt-8">
            <DataTables />
          </div>
        </div>
      </main>

      {/* Botão de ação flutuante */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          onClick={handleQuickCreate}
          data-testid="floating-action-button"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
