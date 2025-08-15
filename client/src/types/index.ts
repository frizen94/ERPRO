/**
 * Tipos e interfaces compartilhados da aplicação
 */

// Tipos de status para elementos da interface
export type StatusType = 'success' | 'warning' | 'error' | 'info';

// Interface para cards de estatísticas do dashboard
export interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
}

// Interface para atividades recentes
export interface RecentActivity {
  id: number;
  tipo: string;
  descricao: string;
  data: Date;
  pessoaNome?: string;
  status?: StatusType;
}

// Interface para itens de menu
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  children?: MenuItem[];
  isExpanded?: boolean;
  badge?: string | number;
}

// Interface para filtros de busca
export interface SearchFilters {
  nome?: string;
  cpf?: string;
  tipoPessoa?: string;
  dataInicio?: Date;
  dataFim?: Date;
  status?: string;
}

// Interface para paginação
export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

// Interface para dados de tabela
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Interface para ações de contexto
export interface ContextAction {
  id: string;
  label: string;
  icon: string;
  action: (item: any) => void;
  variant?: 'default' | 'destructive';
}

// Interface para notificações
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: StatusType;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// Interface para formulários
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: any;
}

// Interface para resposta de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Interface para estatísticas do dashboard
export interface DashboardStats {
  totalServidores: number;
  afastamentosAtivos: number;
  diariasPendentes: number;
  armamentoEmUso: number;
}

// Tipos para status de elementos
export type EscalaStatus = 'AGENDADA' | 'PRESENTE' | 'FALTOU' | 'JUSTIFICADA';
export type DiariaStatus = 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'EM_ANALISE';
export type ArmamentoSituacao = 'DISPONIVEL' | 'EM_USO' | 'MANUTENCAO' | 'BAIXADO';
export type PessoaTipo = 'S' | 'T'; // Servidor ou Terceirizado
export type SituacaoFuncional = 'ATIVO' | 'INATIVO' | 'APOSENTADO' | 'EXONERADO';
