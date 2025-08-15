import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPessoaSchema, insertDadosFuncionaisSchema, insertAfastamentoSchema, insertEscalaSchema, insertDiariaSchema, insertArmamentoSchema } from "@shared/schema";
import { z } from "zod";

/**
 * Registra todas as rotas da API do sistema ERP
 * @param app - Instância do Express
 * @returns Servidor HTTP configurado
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Configuração da autenticação
  await setupAuth(app);

  // Rota de autenticação do usuário
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json({ message: "Falha ao buscar dados do usuário" });
    }
  });

  // Rotas do Dashboard
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Erro ao buscar estatísticas do dashboard:", error);
      res.status(500).json({ message: "Falha ao carregar estatísticas" });
    }
  });

  app.get("/api/dashboard/activities", isAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      console.error("Erro ao buscar atividades recentes:", error);
      res.status(500).json({ message: "Falha ao carregar atividades recentes" });
    }
  });

  // Rotas de Pessoas
  app.get("/api/pessoas", isAuthenticated, async (req, res) => {
    try {
      const { nome, cpf, tipoPessoa } = req.query;
      const pessoas = await storage.getPessoas({
        nome: nome as string,
        cpf: cpf as string,
        tipoPessoa: tipoPessoa as string,
      });
      res.json(pessoas);
    } catch (error) {
      console.error("Erro ao buscar pessoas:", error);
      res.status(500).json({ message: "Falha ao carregar lista de pessoas" });
    }
  });

  app.get("/api/pessoas/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pessoa = await storage.getPessoaById(id);
      
      if (!pessoa) {
        return res.status(404).json({ message: "Pessoa não encontrada" });
      }
      
      res.json(pessoa);
    } catch (error) {
      console.error("Erro ao buscar pessoa:", error);
      res.status(500).json({ message: "Falha ao carregar dados da pessoa" });
    }
  });

  app.post("/api/pessoas", isAuthenticated, async (req, res) => {
    try {
      const pessoaData = insertPessoaSchema.parse(req.body);
      
      // Verifica se CPF já existe
      const pessoaExistente = await storage.getPessoaByCpf(pessoaData.cpf);
      if (pessoaExistente) {
        return res.status(400).json({ message: "CPF já cadastrado no sistema" });
      }
      
      const novaPessoa = await storage.createPessoa(pessoaData);
      res.status(201).json(novaPessoa);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      console.error("Erro ao criar pessoa:", error);
      res.status(500).json({ message: "Falha ao cadastrar pessoa" });
    }
  });

  app.put("/api/pessoas/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pessoaData = insertPessoaSchema.partial().parse(req.body);
      
      const pessoaAtualizada = await storage.updatePessoa(id, pessoaData);
      res.json(pessoaAtualizada);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      console.error("Erro ao atualizar pessoa:", error);
      res.status(500).json({ message: "Falha ao atualizar dados da pessoa" });
    }
  });

  app.delete("/api/pessoas/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePessoa(id);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir pessoa:", error);
      res.status(500).json({ message: "Falha ao excluir pessoa" });
    }
  });

  // Rotas de Dados Funcionais
  app.get("/api/pessoas/:pessoaId/dados-funcionais", isAuthenticated, async (req, res) => {
    try {
      const pessoaId = parseInt(req.params.pessoaId);
      const dados = await storage.getDadosFuncionaisByPessoaId(pessoaId);
      res.json(dados);
    } catch (error) {
      console.error("Erro ao buscar dados funcionais:", error);
      res.status(500).json({ message: "Falha ao carregar dados funcionais" });
    }
  });

  app.post("/api/dados-funcionais", isAuthenticated, async (req, res) => {
    try {
      const dadosData = insertDadosFuncionaisSchema.parse(req.body);
      const novosDados = await storage.createDadosFuncionais(dadosData);
      res.status(201).json(novosDados);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      console.error("Erro ao criar dados funcionais:", error);
      res.status(500).json({ message: "Falha ao cadastrar dados funcionais" });
    }
  });

  // Rotas de Afastamentos
  app.get("/api/afastamentos", isAuthenticated, async (req, res) => {
    try {
      const { pessoaId, ativo } = req.query;
      const afastamentos = await storage.getAfastamentos({
        pessoaId: pessoaId ? parseInt(pessoaId as string) : undefined,
        ativo: ativo === 'true',
      });
      res.json(afastamentos);
    } catch (error) {
      console.error("Erro ao buscar afastamentos:", error);
      res.status(500).json({ message: "Falha ao carregar afastamentos" });
    }
  });

  app.post("/api/afastamentos", isAuthenticated, async (req, res) => {
    try {
      const afastamentoData = insertAfastamentoSchema.parse(req.body);
      const novoAfastamento = await storage.createAfastamento(afastamentoData);
      res.status(201).json(novoAfastamento);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      console.error("Erro ao criar afastamento:", error);
      res.status(500).json({ message: "Falha ao registrar afastamento" });
    }
  });

  // Rotas de Escalas
  app.get("/api/escalas", isAuthenticated, async (req, res) => {
    try {
      const { data, pessoaId, unidadeId } = req.query;
      const escalas = await storage.getEscalas({
        data: data ? new Date(data as string) : undefined,
        pessoaId: pessoaId ? parseInt(pessoaId as string) : undefined,
        unidadeId: unidadeId ? parseInt(unidadeId as string) : undefined,
      });
      res.json(escalas);
    } catch (error) {
      console.error("Erro ao buscar escalas:", error);
      res.status(500).json({ message: "Falha ao carregar escalas" });
    }
  });

  app.post("/api/escalas", isAuthenticated, async (req, res) => {
    try {
      const escalaData = insertEscalaSchema.parse(req.body);
      const novaEscala = await storage.createEscala(escalaData);
      res.status(201).json(novaEscala);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      console.error("Erro ao criar escala:", error);
      res.status(500).json({ message: "Falha ao cadastrar escala" });
    }
  });

  // Rotas de Diárias
  app.get("/api/diarias", isAuthenticated, async (req, res) => {
    try {
      const { pessoaId, statusId, dataInicio, dataFim } = req.query;
      const diarias = await storage.getDiarias({
        pessoaId: pessoaId ? parseInt(pessoaId as string) : undefined,
        statusId: statusId ? parseInt(statusId as string) : undefined,
        dataInicio: dataInicio ? new Date(dataInicio as string) : undefined,
        dataFim: dataFim ? new Date(dataFim as string) : undefined,
      });
      res.json(diarias);
    } catch (error) {
      console.error("Erro ao buscar diárias:", error);
      res.status(500).json({ message: "Falha ao carregar diárias" });
    }
  });

  app.post("/api/diarias", isAuthenticated, async (req, res) => {
    try {
      const diariaData = insertDiariaSchema.parse(req.body);
      const novaDiaria = await storage.createDiaria(diariaData);
      res.status(201).json(novaDiaria);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      console.error("Erro ao criar diária:", error);
      res.status(500).json({ message: "Falha ao registrar diária" });
    }
  });

  // Rotas de Armamento
  app.get("/api/armamentos", isAuthenticated, async (req, res) => {
    try {
      const { situacao, tipoArmaId } = req.query;
      const armamentos = await storage.getArmamentos({
        situacao: situacao as string,
        tipoArmaId: tipoArmaId ? parseInt(tipoArmaId as string) : undefined,
      });
      res.json(armamentos);
    } catch (error) {
      console.error("Erro ao buscar armamentos:", error);
      res.status(500).json({ message: "Falha ao carregar armamentos" });
    }
  });

  app.post("/api/armamentos", isAuthenticated, async (req, res) => {
    try {
      const armamentoData = insertArmamentoSchema.parse(req.body);
      const novoArmamento = await storage.createArmamento(armamentoData);
      res.status(201).json(novoArmamento);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      console.error("Erro ao cadastrar armamento:", error);
      res.status(500).json({ message: "Falha ao cadastrar armamento" });
    }
  });

  // Rotas auxiliares para dados de referência
  app.get("/api/cargos", isAuthenticated, async (req, res) => {
    try {
      const cargos = await storage.getCargos();
      res.json(cargos);
    } catch (error) {
      console.error("Erro ao buscar cargos:", error);
      res.status(500).json({ message: "Falha ao carregar cargos" });
    }
  });

  app.get("/api/unidades", isAuthenticated, async (req, res) => {
    try {
      const unidades = await storage.getUnidades();
      res.json(unidades);
    } catch (error) {
      console.error("Erro ao buscar unidades:", error);
      res.status(500).json({ message: "Falha ao carregar unidades" });
    }
  });

  app.get("/api/municipios", isAuthenticated, async (req, res) => {
    try {
      const municipios = await storage.getMunicipios();
      res.json(municipios);
    } catch (error) {
      console.error("Erro ao buscar municípios:", error);
      res.status(500).json({ message: "Falha ao carregar municípios" });
    }
  });

  app.get("/api/estados", isAuthenticated, async (req, res) => {
    try {
      const estados = await storage.getEstados();
      res.json(estados);
    } catch (error) {
      console.error("Erro ao buscar estados:", error);
      res.status(500).json({ message: "Falha ao carregar estados" });
    }
  });

  app.get("/api/tipos-afastamento", isAuthenticated, async (req, res) => {
    try {
      const tipos = await storage.getTiposAfastamento();
      res.json(tipos);
    } catch (error) {
      console.error("Erro ao buscar tipos de afastamento:", error);
      res.status(500).json({ message: "Falha ao carregar tipos de afastamento" });
    }
  });

  app.get("/api/tipos-escala", isAuthenticated, async (req, res) => {
    try {
      const tipos = await storage.getTiposEscala();
      res.json(tipos);
    } catch (error) {
      console.error("Erro ao buscar tipos de escala:", error);
      res.status(500).json({ message: "Falha ao carregar tipos de escala" });
    }
  });

  app.get("/api/status-diaria", isAuthenticated, async (req, res) => {
    try {
      const status = await storage.getStatusDiaria();
      res.json(status);
    } catch (error) {
      console.error("Erro ao buscar status de diária:", error);
      res.status(500).json({ message: "Falha ao carregar status de diárias" });
    }
  });

  app.get("/api/tipos-arma", isAuthenticated, async (req, res) => {
    try {
      const tipos = await storage.getTiposArma();
      res.json(tipos);
    } catch (error) {
      console.error("Erro ao buscar tipos de arma:", error);
      res.status(500).json({ message: "Falha ao carregar tipos de arma" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
