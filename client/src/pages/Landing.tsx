import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Users, BarChart3, Shield, Clock, ArrowRight } from "lucide-react";

/**
 * Interface para características do sistema
 */
interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

/**
 * Características principais do SigmaERP
 */
const features: Feature[] = [
  {
    icon: Users,
    title: "Gestão de Pessoas",
    description: "Controle completo de servidores, terceirizados e dados funcionais",
    color: "text-blue-600",
  },
  {
    icon: Clock,
    title: "Controle de Frequência",
    description: "Escalas, afastamentos, substituições e licenças médicas",
    color: "text-emerald-600",
  },
  {
    icon: BarChart3,
    title: "Relatórios Avançados", 
    description: "Relatórios personalizáveis com análises detalhadas",
    color: "text-purple-600",
  },
  {
    icon: Shield,
    title: "Gestão de Armamento",
    description: "Controle rigoroso de armamentos e responsabilidades",
    color: "text-amber-600",
  },
];

/**
 * Página de landing para usuários não autenticados
 * Apresenta o sistema e permite acesso via login
 */
export default function Landing() {
  
  /**
   * Inicia o processo de login
   */
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="relative bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">SigmaERP</h1>
                <p className="text-sm text-slate-500">Sistema Integrado de Gestão</p>
              </div>
            </div>

            {/* Botão de login */}
            <Button
              onClick={handleLogin}
              className="btn-primary px-6 py-2"
              data-testid="login-button"
            >
              Entrar no Sistema
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Seção hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Sistema Corporativo Seguro
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Gestão Organizacional
            <span className="text-primary-600 block">Completa e Integrada</span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            O SigmaERP é a solução completa para gestão de pessoas, frequência, diárias e armamento. 
            Interface moderna, relatórios avançados e controle total dos processos organizacionais.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleLogin}
              className="btn-primary px-8 py-3 text-lg"
              data-testid="hero-login-button"
            >
              Acessar Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Cards de características */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="border-slate-200 hover:shadow-lg transition-shadow duration-300"
            >
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Seção de funcionalidades detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-3xl font-bold text-slate-900 mb-6">
              Funcionalidades Principais
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-slate-900">Gestão de Pessoas Completa</h4>
                  <p className="text-slate-600">CRUD de funcionários, dados bancários e histórico profissional</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-slate-900">Controle de Frequência Avançado</h4>
                  <p className="text-slate-600">Escalas, licenças, substituições e controle de afastamentos</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-slate-900">Relatórios Personalizáveis</h4>
                  <p className="text-slate-600">Relatórios detalhados com exportação em PDF, Excel e CSV</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-slate-900">Gestão de Armamento</h4>
                  <p className="text-slate-600">Controle rigoroso de armamentos e rastreabilidade completa</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">
                Acesso Seguro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-600">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span>Autenticação segura integrada</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Controle de acesso por níveis</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span>Auditoria completa de ações</span>
                </div>
                <div className="pt-4">
                  <Button
                    onClick={handleLogin}
                    className="w-full btn-primary"
                    data-testid="card-login-button"
                  >
                    Entrar no Sistema
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Building className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">SigmaERP</p>
                <p className="text-xs text-slate-500">Sistema Integrado de Gestão</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              © 2024 SigmaERP. Sistema corporativo para gestão organizacional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
