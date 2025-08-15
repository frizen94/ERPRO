import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Save, ArrowLeft, User } from "lucide-react";
import { insertPessoaSchema } from "@shared/schema";
import type { Pessoa, Municipio, Estado } from "@shared/schema";

/**
 * Schema de validação para o formulário de servidor
 */
const servidorFormSchema = insertPessoaSchema.extend({
  confirmCpf: z.string().min(11, "CPF deve ter 11 dígitos"),
}).refine(data => data.cpf === data.confirmCpf, {
  message: "CPFs não coincidem",
  path: ["confirmCpf"],
});

type ServidorFormData = z.infer<typeof servidorFormSchema>;

/**
 * Página de formulário para cadastro/edição de servidores
 * Permite criar novos servidores ou editar existentes
 */
export default function ServidorForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!params.id;
  const servidorId = params.id ? parseInt(params.id) : null;

  // Query para buscar dados do servidor (apenas em modo de edição)
  const { data: servidor } = useQuery<Pessoa>({
    queryKey: ["/api/pessoas", servidorId],
    enabled: isEdit && !!servidorId,
    retry: 1,
  });

  // Queries para dados auxiliares
  const { data: estados = [] } = useQuery<Estado[]>({
    queryKey: ["/api/estados"],
    retry: 1,
  });

  const { data: municipios = [] } = useQuery<Municipio[]>({
    queryKey: ["/api/municipios"],
    retry: 1,
  });

  // Configuração do formulário
  const form = useForm<ServidorFormData>({
    resolver: zodResolver(servidorFormSchema),
    defaultValues: {
      nome: "",
      nomeSocial: "",
      cpf: "",
      confirmCpf: "",
      rg: "",
      dataNascimento: "",
      sexo: "M",
      estadoCivil: "",
      nomePai: "",
      nomeMae: "",
      telefone: "",
      email: "",
      endereco: "",
      cep: "",
      tipoPessoa: "S", // Servidor
      isActive: true,
    },
  });

  // Carrega dados do servidor para edição
  useEffect(() => {
    if (servidor) {
      form.reset({
        ...servidor,
        confirmCpf: servidor.cpf,
        dataNascimento: servidor.dataNascimento || "",
        nomeSocial: servidor.nomeSocial || "",
        rg: servidor.rg || "",
        estadoCivil: servidor.estadoCivil || "",
        nomePai: servidor.nomePai || "",
        nomeMae: servidor.nomeMae || "",
        telefone: servidor.telefone || "",
        email: servidor.email || "",
        endereco: servidor.endereco || "",
        cep: servidor.cep || "",
      });
    }
  }, [servidor, form]);

  // Mutation para salvar servidor
  const saveServidorMutation = useMutation({
    mutationFn: async (data: ServidorFormData) => {
      const { confirmCpf, ...serverData } = data;
      
      if (isEdit && servidorId) {
        return await apiRequest("PUT", `/api/pessoas/${servidorId}`, serverData);
      } else {
        return await apiRequest("POST", "/api/pessoas", serverData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pessoas"] });
      toast({
        title: "Sucesso",
        description: `Servidor ${isEdit ? "atualizado" : "cadastrado"} com sucesso`,
      });
      setLocation("/pessoas/servidores");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi deslogado. Redirecionando...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: `Falha ao ${isEdit ? "atualizar" : "cadastrar"} servidor`,
        variant: "destructive",
      });
    },
  });

  /**
   * Submete o formulário
   */
  const onSubmit = (data: ServidorFormData) => {
    saveServidorMutation.mutate(data);
  };

  /**
   * Cancela a operação e volta para a lista
   */
  const handleCancel = () => {
    setLocation("/pessoas/servidores");
  };

  /**
   * Formata CPF durante a digitação
   */
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  return (
    <div className="main-layout">
      <Sidebar />
      
      <main className="main-content">
        <Header 
          title={isEdit ? "Editar Servidor" : "Novo Servidor"}
          breadcrumbs={[
            { label: "Gestão de Pessoas" },
            { label: "Servidores", href: "/pessoas/servidores" },
            { label: isEdit ? "Editar" : "Novo" }
          ]}
          actions={
            <Button 
              variant="outline" 
              onClick={handleCancel}
              data-testid="cancel-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          }
        />

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-nome" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nomeSocial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Social</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-nome-social" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="000.000.000-00"
                              maxLength={14}
                              onChange={(e) => {
                                const formatted = formatCPF(e.target.value);
                                field.onChange(formatted.replace(/\D/g, ""));
                              }}
                              value={formatCPF(field.value || "")}
                              data-testid="input-cpf"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmCpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar CPF *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="000.000.000-00"
                              maxLength={14}
                              onChange={(e) => {
                                const formatted = formatCPF(e.target.value);
                                field.onChange(formatted.replace(/\D/g, ""));
                              }}
                              value={formatCPF(field.value || "")}
                              data-testid="input-confirm-cpf"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-rg" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dataNascimento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="date"
                              data-testid="input-data-nascimento"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sexo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sexo *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-sexo">
                                <SelectValue placeholder="Selecione o sexo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="M">Masculino</SelectItem>
                              <SelectItem value="F">Feminino</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estadoCivil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado Civil</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-estado-civil">
                                <SelectValue placeholder="Selecione o estado civil" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SOLTEIRO">Solteiro(a)</SelectItem>
                              <SelectItem value="CASADO">Casado(a)</SelectItem>
                              <SelectItem value="DIVORCIADO">Divorciado(a)</SelectItem>
                              <SelectItem value="VIUVO">Viúvo(a)</SelectItem>
                              <SelectItem value="UNIAO_ESTAVEL">União Estável</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nomePai"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Pai</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-nome-pai" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nomeMae"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Mãe</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-nome-mae" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contato e Endereço */}
              <Card>
                <CardHeader>
                  <CardTitle>Contato e Endereço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="(00) 00000-0000"
                              data-testid="input-telefone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              placeholder="email@exemplo.com"
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="00000-000"
                              maxLength={9}
                              data-testid="input-cep"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço Completo</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Rua, número, complemento, bairro"
                            rows={3}
                            data-testid="textarea-endereco"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Botões de ação */}
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  data-testid="cancel-form-button"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="btn-primary"
                  disabled={saveServidorMutation.isPending}
                  data-testid="save-button"
                >
                  {saveServidorMutation.isPending ? (
                    <>
                      <div className="loading-spinner w-4 h-4 mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEdit ? "Atualizar" : "Cadastrar"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
