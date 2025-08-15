import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import ServidoresList from "@/pages/pessoas/ServidoresList";
import ServidorForm from "@/pages/pessoas/ServidorForm";
import FichaFuncional from "@/pages/pessoas/FichaFuncional";
import EscalasList from "@/pages/frequencia/EscalasList";
import AfastamentosList from "@/pages/frequencia/AfastamentosList";
import DiariasList from "@/pages/diarias/DiariasList";
import ArmamentoList from "@/pages/armamento/ArmamentoList";
import RelatoriosList from "@/pages/relatorios/RelatoriosList";

/**
 * Componente de roteamento principal da aplicação
 * Gerencia as rotas baseado no estado de autenticação do usuário
 */
function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostra página de loading/landing para usuários não autenticados
  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Rotas para usuários autenticados
  return (
    <Switch>
      {/* Dashboard principal */}
      <Route path="/" component={Dashboard} />
      
      {/* Rotas de gestão de pessoas */}
      <Route path="/pessoas/servidores" component={ServidoresList} />
      <Route path="/pessoas/servidor/novo" component={ServidorForm} />
      <Route path="/pessoas/servidor/:id/editar" component={ServidorForm} />
      <Route path="/pessoas/servidor/:id/ficha" component={FichaFuncional} />
      
      {/* Rotas de frequência */}
      <Route path="/frequencia/escalas" component={EscalasList} />
      <Route path="/frequencia/afastamentos" component={AfastamentosList} />
      
      {/* Rotas de diárias */}
      <Route path="/diarias" component={DiariasList} />
      
      {/* Rotas de armamento */}
      <Route path="/armamento" component={ArmamentoList} />
      
      {/* Rotas de relatórios */}
      <Route path="/relatorios" component={RelatoriosList} />
      
      {/* Página 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Componente raiz da aplicação
 * Configura providers necessários e renderiza o roteador
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
