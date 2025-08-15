import { sql, relations } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  date,
  decimal,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabela de sessões (obrigatória para Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Tabela de usuários (obrigatória para Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabelas do ERP

// Estados
export const estados = pgTable("estados", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  nome: varchar("nome", { length: 100 }).notNull(),
  sigla: varchar("sigla", { length: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Municípios
export const municipios = pgTable("municipios", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  nome: varchar("nome", { length: 200 }).notNull(),
  estadoId: integer("estado_id").references(() => estados.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tipos de documento
export const tiposDocumento = pgTable("tipos_documento", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  nome: varchar("nome", { length: 50 }).notNull(),
  descricao: text("descricao"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cargos
export const cargos = pgTable("cargos", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  nome: varchar("nome", { length: 100 }).notNull(),
  sigla: varchar("sigla", { length: 10 }),
  cargaHoraria: integer("carga_horaria").notNull(),
  descricao: text("descricao"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Unidades organizacionais
export const unidades = pgTable("unidades", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  nome: varchar("nome", { length: 200 }).notNull(),
  sigla: varchar("sigla", { length: 20 }),
  endereco: text("endereco"),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  municipioId: integer("municipio_id").references(() => municipios.id),
  unidadePaiId: integer("unidade_pai_id").references(() => unidades.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pessoas (servidores e terceirizados)
export const pessoas = pgTable("pessoas", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  nome: varchar("nome", { length: 200 }).notNull(),
  nomeSocial: varchar("nome_social", { length: 200 }),
  cpf: varchar("cpf", { length: 11 }).unique().notNull(),
  rg: varchar("rg", { length: 20 }),
  dataNascimento: date("data_nascimento").notNull(),
  sexo: varchar("sexo", { length: 1 }).notNull(), // M/F
  estadoCivil: varchar("estado_civil", { length: 20 }),
  nomePai: varchar("nome_pai", { length: 200 }),
  nomeMae: varchar("nome_mae", { length: 200 }),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  endereco: text("endereco"),
  municipioId: integer("municipio_id").references(() => municipios.id),
  cep: varchar("cep", { length: 8 }),
  tipoPessoa: varchar("tipo_pessoa", { length: 1 }).notNull(), // S=Servidor, T=Terceirizado
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dados funcionais
export const dadosFuncionais = pgTable("dados_funcionais", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  pessoaId: integer("pessoa_id").references(() => pessoas.id).notNull(),
  matricula: varchar("matricula", { length: 30 }).unique().notNull(),
  cargoId: integer("cargo_id").references(() => cargos.id).notNull(),
  unidadeId: integer("unidade_id").references(() => unidades.id).notNull(),
  dataNomeacao: date("data_nomeacao"),
  dataPosse: date("data_posse").notNull(),
  dataExercicio: date("data_exercicio"),
  situacao: varchar("situacao", { length: 20 }).default("ATIVO"), // ATIVO, INATIVO, APOSENTADO, etc.
  observacoes: text("observacoes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dados bancários
export const dadosBancarios = pgTable("dados_bancarios", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  pessoaId: integer("pessoa_id").references(() => pessoas.id).notNull(),
  banco: varchar("banco", { length: 100 }).notNull(),
  agencia: varchar("agencia", { length: 10 }).notNull(),
  conta: varchar("conta", { length: 20 }).notNull(),
  tipoConta: varchar("tipo_conta", { length: 20 }).default("CORRENTE"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tipos de afastamento
export const tiposAfastamento = pgTable("tipos_afastamento", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: text("descricao"),
  requerDocumento: boolean("requer_documento").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Afastamentos
export const afastamentos = pgTable("afastamentos", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  pessoaId: integer("pessoa_id").references(() => pessoas.id).notNull(),
  tipoAfastamentoId: integer("tipo_afastamento_id").references(() => tiposAfastamento.id).notNull(),
  dataInicio: date("data_inicio").notNull(),
  dataFim: date("data_fim"),
  motivo: text("motivo"),
  numeroProcesso: varchar("numero_processo", { length: 50 }),
  observacoes: text("observacoes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tipos de escala
export const tiposEscala = pgTable("tipos_escala", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: text("descricao"),
  horaInicio: varchar("hora_inicio", { length: 5 }), // HH:MM
  horaFim: varchar("hora_fim", { length: 5 }), // HH:MM
  cargaHoraria: integer("carga_horaria"), // em horas
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Escalas
export const escalas = pgTable("escalas", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  pessoaId: integer("pessoa_id").references(() => pessoas.id).notNull(),
  tipoEscalaId: integer("tipo_escala_id").references(() => tiposEscala.id).notNull(),
  unidadeId: integer("unidade_id").references(() => unidades.id).notNull(),
  dataEscala: date("data_escala").notNull(),
  horaInicio: varchar("hora_inicio", { length: 5 }),
  horaFim: varchar("hora_fim", { length: 5 }),
  status: varchar("status", { length: 20 }).default("AGENDADA"), // AGENDADA, PRESENTE, FALTOU, etc.
  observacoes: text("observacoes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Status de diárias
export const statusDiaria = pgTable("status_diaria", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  nome: varchar("nome", { length: 50 }).notNull(),
  descricao: text("descricao"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Diárias
export const diarias = pgTable("diarias", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  pessoaId: integer("pessoa_id").references(() => pessoas.id).notNull(),
  statusId: integer("status_id").references(() => statusDiaria.id).notNull(),
  destino: varchar("destino", { length: 200 }).notNull(),
  finalidade: text("finalidade").notNull(),
  dataInicio: date("data_inicio").notNull(),
  dataFim: date("data_fim").notNull(),
  valorDiaria: decimal("valor_diaria", { precision: 10, scale: 2 }),
  valorTransporte: decimal("valor_transporte", { precision: 10, scale: 2 }),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }),
  observacoes: text("observacoes"),
  numeroProcesso: varchar("numero_processo", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tipos de arma
export const tiposArma = pgTable("tipos_arma", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  nome: varchar("nome", { length: 100 }).notNull(),
  calibre: varchar("calibre", { length: 50 }),
  categoria: varchar("categoria", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Armamento
export const armamento = pgTable("armamento", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  numeroSerie: varchar("numero_serie", { length: 50 }).unique().notNull(),
  tipoArmaId: integer("tipo_arma_id").references(() => tiposArma.id).notNull(),
  marca: varchar("marca", { length: 100 }),
  modelo: varchar("modelo", { length: 100 }),
  anoFabricacao: integer("ano_fabricacao"),
  situacao: varchar("situacao", { length: 20 }).default("DISPONIVEL"), // DISPONIVEL, EM_USO, MANUTENCAO, etc.
  observacoes: text("observacoes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Controle de armamento
export const controleArmamento = pgTable("controle_armamento", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  armamentoId: integer("armamento_id").references(() => armamento.id).notNull(),
  pessoaId: integer("pessoa_id").references(() => pessoas.id).notNull(),
  dataRetirada: timestamp("data_retirada").notNull(),
  dataDevolucao: timestamp("data_devolucao"),
  finalidade: text("finalidade"),
  observacoes: text("observacoes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relações
export const estadosRelations = relations(estados, ({ many }) => ({
  municipios: many(municipios),
}));

export const municipiosRelations = relations(municipios, ({ one, many }) => ({
  estado: one(estados, {
    fields: [municipios.estadoId],
    references: [estados.id],
  }),
  pessoas: many(pessoas),
  unidades: many(unidades),
}));

export const pessoasRelations = relations(pessoas, ({ one, many }) => ({
  municipio: one(municipios, {
    fields: [pessoas.municipioId],
    references: [municipios.id],
  }),
  dadosFuncionais: many(dadosFuncionais),
  dadosBancarios: many(dadosBancarios),
  afastamentos: many(afastamentos),
  escalas: many(escalas),
  diarias: many(diarias),
  controleArmamento: many(controleArmamento),
}));

export const dadosFuncionaisRelations = relations(dadosFuncionais, ({ one }) => ({
  pessoa: one(pessoas, {
    fields: [dadosFuncionais.pessoaId],
    references: [pessoas.id],
  }),
  cargo: one(cargos, {
    fields: [dadosFuncionais.cargoId],
    references: [cargos.id],
  }),
  unidade: one(unidades, {
    fields: [dadosFuncionais.unidadeId],
    references: [unidades.id],
  }),
}));

export const unidadesRelations = relations(unidades, ({ one, many }) => ({
  municipio: one(municipios, {
    fields: [unidades.municipioId],
    references: [municipios.id],
  }),
  unidadePai: one(unidades, {
    fields: [unidades.unidadePaiId],
    references: [unidades.id],
  }),
  subUnidades: many(unidades),
  dadosFuncionais: many(dadosFuncionais),
  escalas: many(escalas),
}));

export const afastamentosRelations = relations(afastamentos, ({ one }) => ({
  pessoa: one(pessoas, {
    fields: [afastamentos.pessoaId],
    references: [pessoas.id],
  }),
  tipoAfastamento: one(tiposAfastamento, {
    fields: [afastamentos.tipoAfastamentoId],
    references: [tiposAfastamento.id],
  }),
}));

export const escalasRelations = relations(escalas, ({ one }) => ({
  pessoa: one(pessoas, {
    fields: [escalas.pessoaId],
    references: [pessoas.id],
  }),
  tipoEscala: one(tiposEscala, {
    fields: [escalas.tipoEscalaId],
    references: [tiposEscala.id],
  }),
  unidade: one(unidades, {
    fields: [escalas.unidadeId],
    references: [unidades.id],
  }),
}));

export const diariasRelations = relations(diarias, ({ one }) => ({
  pessoa: one(pessoas, {
    fields: [diarias.pessoaId],
    references: [pessoas.id],
  }),
  status: one(statusDiaria, {
    fields: [diarias.statusId],
    references: [statusDiaria.id],
  }),
}));

export const armamentoRelations = relations(armamento, ({ one, many }) => ({
  tipoArma: one(tiposArma, {
    fields: [armamento.tipoArmaId],
    references: [tiposArma.id],
  }),
  controles: many(controleArmamento),
}));

export const controleArmamentoRelations = relations(controleArmamento, ({ one }) => ({
  armamento: one(armamento, {
    fields: [controleArmamento.armamentoId],
    references: [armamento.id],
  }),
  pessoa: one(pessoas, {
    fields: [controleArmamento.pessoaId],
    references: [pessoas.id],
  }),
}));

// Schemas de inserção e tipos
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertPessoaSchema = createInsertSchema(pessoas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDadosFuncionaisSchema = createInsertSchema(dadosFuncionais).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAfastamentoSchema = createInsertSchema(afastamentos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEscalaSchema = createInsertSchema(escalas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiariaSchema = createInsertSchema(diarias).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertArmamentoSchema = createInsertSchema(armamento).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tipos TypeScript
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPessoa = z.infer<typeof insertPessoaSchema>;
export type Pessoa = typeof pessoas.$inferSelect;

export type InsertDadosFuncionais = z.infer<typeof insertDadosFuncionaisSchema>;
export type DadosFuncionais = typeof dadosFuncionais.$inferSelect;

export type InsertAfastamento = z.infer<typeof insertAfastamentoSchema>;
export type Afastamento = typeof afastamentos.$inferSelect;

export type InsertEscala = z.infer<typeof insertEscalaSchema>;
export type Escala = typeof escalas.$inferSelect;

export type InsertDiaria = z.infer<typeof insertDiariaSchema>;
export type Diaria = typeof diarias.$inferSelect;

export type InsertArmamento = z.infer<typeof insertArmamentoSchema>;
export type Armamento = typeof armamento.$inferSelect;

// Tipos para estado
export type Estado = typeof estados.$inferSelect;
export type Municipio = typeof municipios.$inferSelect;
export type Cargo = typeof cargos.$inferSelect;
export type Unidade = typeof unidades.$inferSelect;
export type TipoAfastamento = typeof tiposAfastamento.$inferSelect;
export type TipoEscala = typeof tiposEscala.$inferSelect;
export type StatusDiaria = typeof statusDiaria.$inferSelect;
export type TipoArma = typeof tiposArma.$inferSelect;
export type ControleArmamento = typeof controleArmamento.$inferSelect;
