import {
  users,
  pessoas,
  dadosFuncionais,
  afastamentos,
  escalas,
  diarias,
  armamento,
  controleArmamento,
  cargos,
  unidades,
  municipios,
  estados,
  tiposAfastamento,
  tiposEscala,
  statusDiaria,
  tiposArma,
  type User,
  type UpsertUser,
  type Pessoa,
  type InsertPessoa,
  type DadosFuncionais,
  type InsertDadosFuncionais,
  type Afastamento,
  type InsertAfastamento,
  type Escala,
  type InsertEscala,
  type Diaria,
  type InsertDiaria,
  type Armamento,
  type InsertArmamento,
  type ControleArmamento,
  type Cargo,
  type Unidade,
  type Municipio,
  type Estado,
  type TipoAfastamento,
  type TipoEscala,
  type StatusDiaria,
  type TipoArma,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, like, sql, count } from "drizzle-orm";

/**
 * Interface para operações de armazenamento do sistema ERP
 * Define todas as operações CRUD necessárias para o funcionamento do sistema
 */
export interface IStorage {
  // Operações de usuário (obrigatórias para Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Operações de pessoas
  getPessoas(filters?: { nome?: string; cpf?: string; tipoPessoa?: string }): Promise<Pessoa[]>;
  getPessoaById(id: number): Promise<Pessoa | undefined>;
  getPessoaByCpf(cpf: string): Promise<Pessoa | undefined>;
  createPessoa(pessoa: InsertPessoa): Promise<Pessoa>;
  updatePessoa(id: number, pessoa: Partial<InsertPessoa>): Promise<Pessoa>;
  deletePessoa(id: number): Promise<void>;

  // Operações de dados funcionais
  getDadosFuncionaisByPessoaId(pessoaId: number): Promise<DadosFuncionais | undefined>;
  createDadosFuncionais(dados: InsertDadosFuncionais): Promise<DadosFuncionais>;
  updateDadosFuncionais(id: number, dados: Partial<InsertDadosFuncionais>): Promise<DadosFuncionais>;

  // Operações de afastamentos
  getAfastamentos(filters?: { pessoaId?: number; ativo?: boolean }): Promise<Afastamento[]>;
  createAfastamento(afastamento: InsertAfastamento): Promise<Afastamento>;
  updateAfastamento(id: number, afastamento: Partial<InsertAfastamento>): Promise<Afastamento>;

  // Operações de escalas
  getEscalas(filters?: { data?: Date; pessoaId?: number; unidadeId?: number }): Promise<Escala[]>;
  createEscala(escala: InsertEscala): Promise<Escala>;
  updateEscala(id: number, escala: Partial<InsertEscala>): Promise<Escala>;

  // Operações de diárias
  getDiarias(filters?: { pessoaId?: number; statusId?: number; dataInicio?: Date; dataFim?: Date }): Promise<Diaria[]>;
  createDiaria(diaria: InsertDiaria): Promise<Diaria>;
  updateDiaria(id: number, diaria: Partial<InsertDiaria>): Promise<Diaria>;

  // Operações de armamento
  getArmamentos(filters?: { situacao?: string; tipoArmaId?: number }): Promise<Armamento[]>;
  createArmamento(armamento: InsertArmamento): Promise<Armamento>;
  updateArmamento(id: number, armamento: Partial<InsertArmamento>): Promise<Armamento>;

  // Operações auxiliares
  getCargos(): Promise<Cargo[]>;
  getUnidades(): Promise<Unidade[]>;
  getMunicipios(): Promise<Municipio[]>;
  getEstados(): Promise<Estado[]>;
  getTiposAfastamento(): Promise<TipoAfastamento[]>;
  getTiposEscala(): Promise<TipoEscala[]>;
  getStatusDiaria(): Promise<StatusDiaria[]>;
  getTiposArma(): Promise<TipoArma[]>;

  // Estatísticas para dashboard
  getDashboardStats(): Promise<{
    totalServidores: number;
    afastamentosAtivos: number;
    diariasPendentes: number;
    armamentoEmUso: number;
  }>;

  // Atividades recentes
  getRecentActivities(): Promise<Array<{
    id: number;
    tipo: string;
    descricao: string;
    data: Date;
    pessoaNome?: string;
  }>>;
}

/**
 * Implementação do storage usando PostgreSQL com Drizzle ORM
 * Classe responsável por todas as operações de persistência de dados
 */
export class DatabaseStorage implements IStorage {
  /**
   * Busca usuário por ID
   * @param id - ID do usuário
   * @returns Dados do usuário ou undefined se não encontrado
   */
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  /**
   * Cria ou atualiza dados do usuário
   * @param userData - Dados do usuário para inserção/atualização
   * @returns Dados do usuário criado/atualizado
   */
  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  /**
   * Lista pessoas com filtros opcionais
   * @param filters - Filtros para busca (nome, CPF, tipo de pessoa)
   * @returns Array de pessoas
   */
  async getPessoas(filters?: { nome?: string; cpf?: string; tipoPessoa?: string }): Promise<Pessoa[]> {
    let query = db.select().from(pessoas).where(eq(pessoas.isActive, true));

    if (filters?.nome) {
      query = query.where(like(pessoas.nome, `%${filters.nome}%`));
    }
    if (filters?.cpf) {
      query = query.where(eq(pessoas.cpf, filters.cpf));
    }
    if (filters?.tipoPessoa) {
      query = query.where(eq(pessoas.tipoPessoa, filters.tipoPessoa));
    }

    return await query.orderBy(desc(pessoas.createdAt));
  }

  /**
   * Busca pessoa por ID
   * @param id - ID da pessoa
   * @returns Dados da pessoa ou undefined se não encontrada
   */
  async getPessoaById(id: number): Promise<Pessoa | undefined> {
    const [pessoa] = await db
      .select()
      .from(pessoas)
      .where(and(eq(pessoas.id, id), eq(pessoas.isActive, true)));
    return pessoa;
  }

  /**
   * Busca pessoa por CPF
   * @param cpf - CPF da pessoa
   * @returns Dados da pessoa ou undefined se não encontrada
   */
  async getPessoaByCpf(cpf: string): Promise<Pessoa | undefined> {
    const [pessoa] = await db
      .select()
      .from(pessoas)
      .where(and(eq(pessoas.cpf, cpf), eq(pessoas.isActive, true)));
    return pessoa;
  }

  /**
   * Cria nova pessoa
   * @param pessoa - Dados da pessoa para criação
   * @returns Dados da pessoa criada
   */
  async createPessoa(pessoa: InsertPessoa): Promise<Pessoa> {
    const [novaPessoa] = await db.insert(pessoas).values(pessoa).returning();
    return novaPessoa;
  }

  /**
   * Atualiza dados de uma pessoa
   * @param id - ID da pessoa
   * @param pessoa - Dados para atualização
   * @returns Dados da pessoa atualizada
   */
  async updatePessoa(id: number, pessoa: Partial<InsertPessoa>): Promise<Pessoa> {
    const [pessoaAtualizada] = await db
      .update(pessoas)
      .set({ ...pessoa, updatedAt: new Date() })
      .where(eq(pessoas.id, id))
      .returning();
    return pessoaAtualizada;
  }

  /**
   * Remove pessoa (soft delete)
   * @param id - ID da pessoa
   */
  async deletePessoa(id: number): Promise<void> {
    await db
      .update(pessoas)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(pessoas.id, id));
  }

  /**
   * Busca dados funcionais por ID da pessoa
   * @param pessoaId - ID da pessoa
   * @returns Dados funcionais ou undefined se não encontrados
   */
  async getDadosFuncionaisByPessoaId(pessoaId: number): Promise<DadosFuncionais | undefined> {
    const [dados] = await db
      .select()
      .from(dadosFuncionais)
      .where(and(eq(dadosFuncionais.pessoaId, pessoaId), eq(dadosFuncionais.isActive, true)));
    return dados;
  }

  /**
   * Cria novos dados funcionais
   * @param dados - Dados funcionais para criação
   * @returns Dados funcionais criados
   */
  async createDadosFuncionais(dados: InsertDadosFuncionais): Promise<DadosFuncionais> {
    const [novosDados] = await db.insert(dadosFuncionais).values(dados).returning();
    return novosDados;
  }

  /**
   * Atualiza dados funcionais
   * @param id - ID dos dados funcionais
   * @param dados - Dados para atualização
   * @returns Dados funcionais atualizados
   */
  async updateDadosFuncionais(id: number, dados: Partial<InsertDadosFuncionais>): Promise<DadosFuncionais> {
    const [dadosAtualizados] = await db
      .update(dadosFuncionais)
      .set({ ...dados, updatedAt: new Date() })
      .where(eq(dadosFuncionais.id, id))
      .returning();
    return dadosAtualizados;
  }

  /**
   * Lista afastamentos com filtros opcionais
   * @param filters - Filtros para busca
   * @returns Array de afastamentos
   */
  async getAfastamentos(filters?: { pessoaId?: number; ativo?: boolean }): Promise<Afastamento[]> {
    let query = db.select().from(afastamentos).where(eq(afastamentos.isActive, true));

    if (filters?.pessoaId) {
      query = query.where(eq(afastamentos.pessoaId, filters.pessoaId));
    }

    return await query.orderBy(desc(afastamentos.createdAt));
  }

  /**
   * Cria novo afastamento
   * @param afastamento - Dados do afastamento para criação
   * @returns Dados do afastamento criado
   */
  async createAfastamento(afastamento: InsertAfastamento): Promise<Afastamento> {
    const [novoAfastamento] = await db.insert(afastamentos).values(afastamento).returning();
    return novoAfastamento;
  }

  /**
   * Atualiza afastamento
   * @param id - ID do afastamento
   * @param afastamento - Dados para atualização
   * @returns Dados do afastamento atualizado
   */
  async updateAfastamento(id: number, afastamento: Partial<InsertAfastamento>): Promise<Afastamento> {
    const [afastamentoAtualizado] = await db
      .update(afastamentos)
      .set({ ...afastamento, updatedAt: new Date() })
      .where(eq(afastamentos.id, id))
      .returning();
    return afastamentoAtualizado;
  }

  /**
   * Lista escalas com filtros opcionais
   * @param filters - Filtros para busca
   * @returns Array de escalas
   */
  async getEscalas(filters?: { data?: Date; pessoaId?: number; unidadeId?: number }): Promise<Escala[]> {
    let query = db.select().from(escalas).where(eq(escalas.isActive, true));

    if (filters?.data) {
      query = query.where(eq(escalas.dataEscala, filters.data.toISOString().split('T')[0]));
    }
    if (filters?.pessoaId) {
      query = query.where(eq(escalas.pessoaId, filters.pessoaId));
    }
    if (filters?.unidadeId) {
      query = query.where(eq(escalas.unidadeId, filters.unidadeId));
    }

    return await query.orderBy(desc(escalas.dataEscala));
  }

  /**
   * Cria nova escala
   * @param escala - Dados da escala para criação
   * @returns Dados da escala criada
   */
  async createEscala(escala: InsertEscala): Promise<Escala> {
    const [novaEscala] = await db.insert(escalas).values(escala).returning();
    return novaEscala;
  }

  /**
   * Atualiza escala
   * @param id - ID da escala
   * @param escala - Dados para atualização
   * @returns Dados da escala atualizada
   */
  async updateEscala(id: number, escala: Partial<InsertEscala>): Promise<Escala> {
    const [escalaAtualizada] = await db
      .update(escalas)
      .set({ ...escala, updatedAt: new Date() })
      .where(eq(escalas.id, id))
      .returning();
    return escalaAtualizada;
  }

  /**
   * Lista diárias com filtros opcionais
   * @param filters - Filtros para busca
   * @returns Array de diárias
   */
  async getDiarias(filters?: { pessoaId?: number; statusId?: number; dataInicio?: Date; dataFim?: Date }): Promise<Diaria[]> {
    let query = db.select().from(diarias).where(eq(diarias.isActive, true));

    if (filters?.pessoaId) {
      query = query.where(eq(diarias.pessoaId, filters.pessoaId));
    }
    if (filters?.statusId) {
      query = query.where(eq(diarias.statusId, filters.statusId));
    }
    if (filters?.dataInicio) {
      query = query.where(gte(diarias.dataInicio, filters.dataInicio.toISOString().split('T')[0]));
    }
    if (filters?.dataFim) {
      query = query.where(lte(diarias.dataFim, filters.dataFim.toISOString().split('T')[0]));
    }

    return await query.orderBy(desc(diarias.createdAt));
  }

  /**
   * Cria nova diária
   * @param diaria - Dados da diária para criação
   * @returns Dados da diária criada
   */
  async createDiaria(diaria: InsertDiaria): Promise<Diaria> {
    const [novaDiaria] = await db.insert(diarias).values(diaria).returning();
    return novaDiaria;
  }

  /**
   * Atualiza diária
   * @param id - ID da diária
   * @param diaria - Dados para atualização
   * @returns Dados da diária atualizada
   */
  async updateDiaria(id: number, diaria: Partial<InsertDiaria>): Promise<Diaria> {
    const [diariaAtualizada] = await db
      .update(diarias)
      .set({ ...diaria, updatedAt: new Date() })
      .where(eq(diarias.id, id))
      .returning();
    return diariaAtualizada;
  }

  /**
   * Lista armamentos com filtros opcionais
   * @param filters - Filtros para busca
   * @returns Array de armamentos
   */
  async getArmamentos(filters?: { situacao?: string; tipoArmaId?: number }): Promise<Armamento[]> {
    let query = db.select().from(armamento).where(eq(armamento.isActive, true));

    if (filters?.situacao) {
      query = query.where(eq(armamento.situacao, filters.situacao));
    }
    if (filters?.tipoArmaId) {
      query = query.where(eq(armamento.tipoArmaId, filters.tipoArmaId));
    }

    return await query.orderBy(desc(armamento.createdAt));
  }

  /**
   * Cria novo armamento
   * @param armamentoData - Dados do armamento para criação
   * @returns Dados do armamento criado
   */
  async createArmamento(armamentoData: InsertArmamento): Promise<Armamento> {
    const [novoArmamento] = await db.insert(armamento).values(armamentoData).returning();
    return novoArmamento;
  }

  /**
   * Atualiza armamento
   * @param id - ID do armamento
   * @param armamentoData - Dados para atualização
   * @returns Dados do armamento atualizado
   */
  async updateArmamento(id: number, armamentoData: Partial<InsertArmamento>): Promise<Armamento> {
    const [armamentoAtualizado] = await db
      .update(armamento)
      .set({ ...armamentoData, updatedAt: new Date() })
      .where(eq(armamento.id, id))
      .returning();
    return armamentoAtualizado;
  }

  // Métodos auxiliares para buscar dados de referência

  async getCargos(): Promise<Cargo[]> {
    return await db.select().from(cargos).where(eq(cargos.isActive, true));
  }

  async getUnidades(): Promise<Unidade[]> {
    return await db.select().from(unidades).where(eq(unidades.isActive, true));
  }

  async getMunicipios(): Promise<Municipio[]> {
    return await db.select().from(municipios).where(eq(municipios.isActive, true));
  }

  async getEstados(): Promise<Estado[]> {
    return await db.select().from(estados).where(eq(estados.isActive, true));
  }

  async getTiposAfastamento(): Promise<TipoAfastamento[]> {
    return await db.select().from(tiposAfastamento).where(eq(tiposAfastamento.isActive, true));
  }

  async getTiposEscala(): Promise<TipoEscala[]> {
    return await db.select().from(tiposEscala).where(eq(tiposEscala.isActive, true));
  }

  async getStatusDiaria(): Promise<StatusDiaria[]> {
    return await db.select().from(statusDiaria).where(eq(statusDiaria.isActive, true));
  }

  async getTiposArma(): Promise<TipoArma[]> {
    return await db.select().from(tiposArma).where(eq(tiposArma.isActive, true));
  }

  /**
   * Busca estatísticas para o dashboard
   * @returns Objeto com estatísticas principais
   */
  async getDashboardStats(): Promise<{
    totalServidores: number;
    afastamentosAtivos: number;
    diariasPendentes: number;
    armamentoEmUso: number;
  }> {
    // Total de servidores ativos
    const [totalServidoresResult] = await db
      .select({ count: count() })
      .from(pessoas)
      .where(and(eq(pessoas.isActive, true), eq(pessoas.tipoPessoa, 'S')));

    // Afastamentos ativos (sem data fim ou data fim futura)
    const hoje = new Date().toISOString().split('T')[0];
    const [afastamentosAtivosResult] = await db
      .select({ count: count() })
      .from(afastamentos)
      .where(
        and(
          eq(afastamentos.isActive, true),
          lte(afastamentos.dataInicio, hoje),
          sql`(${afastamentos.dataFim} IS NULL OR ${afastamentos.dataFim} >= ${hoje})`
        )
      );

    // Diárias pendentes (status = 1, assumindo que 1 = pendente)
    const [diariasPendentesResult] = await db
      .select({ count: count() })
      .from(diarias)
      .where(and(eq(diarias.isActive, true), eq(diarias.statusId, 1)));

    // Armamento em uso
    const [armamentoEmUsoResult] = await db
      .select({ count: count() })
      .from(armamento)
      .where(and(eq(armamento.isActive, true), eq(armamento.situacao, 'EM_USO')));

    return {
      totalServidores: totalServidoresResult.count,
      afastamentosAtivos: afastamentosAtivosResult.count,
      diariasPendentes: diariasPendentesResult.count,
      armamentoEmUso: armamentoEmUsoResult.count,
    };
  }

  /**
   * Busca atividades recentes do sistema
   * @returns Array com atividades recentes
   */
  async getRecentActivities(): Promise<Array<{
    id: number;
    tipo: string;
    descricao: string;
    data: Date;
    pessoaNome?: string;
  }>> {
    // Este é um exemplo básico. Em um sistema real, você teria uma tabela de auditoria/logs
    const atividades: Array<{
      id: number;
      tipo: string;
      descricao: string;
      data: Date;
      pessoaNome?: string;
    }> = [];

    // Últimas pessoas criadas
    const pessoasRecentes = await db
      .select({
        id: pessoas.id,
        nome: pessoas.nome,
        createdAt: pessoas.createdAt,
      })
      .from(pessoas)
      .where(eq(pessoas.isActive, true))
      .orderBy(desc(pessoas.createdAt))
      .limit(3);

    pessoasRecentes.forEach(pessoa => {
      atividades.push({
        id: pessoa.id,
        tipo: 'pessoa_criada',
        descricao: `Nova pessoa cadastrada: ${pessoa.nome}`,
        data: pessoa.createdAt!,
        pessoaNome: pessoa.nome,
      });
    });

    // Últimas diárias criadas
    const diariasRecentes = await db
      .select({
        id: diarias.id,
        destino: diarias.destino,
        createdAt: diarias.createdAt,
        pessoaNome: pessoas.nome,
      })
      .from(diarias)
      .leftJoin(pessoas, eq(diarias.pessoaId, pessoas.id))
      .where(eq(diarias.isActive, true))
      .orderBy(desc(diarias.createdAt))
      .limit(2);

    diariasRecentes.forEach(diaria => {
      atividades.push({
        id: diaria.id,
        tipo: 'diaria_criada',
        descricao: `Nova diária criada para ${diaria.destino}`,
        data: diaria.createdAt!,
        pessoaNome: diaria.pessoaNome || undefined,
      });
    });

    // Ordena por data decrescente
    return atividades.sort((a, b) => b.data.getTime() - a.data.getTime());
  }
}

export const storage = new DatabaseStorage();
