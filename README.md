
# ERPRO - Sistema ERP para Polícia Civil

Sistema de gestão de recursos humanos desenvolvido especificamente para a Polícia Civil, com funcionalidades para controle de servidores, escalas, diárias, armamento e muito mais.

## 🚀 Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: PostgreSQL com Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Autenticação**: Replit Auth

## 📋 Funcionalidades

### 👥 Gestão de Pessoas
- Cadastro de servidores e terceirizados
- Controle de dados funcionais
- Gerenciamento de dados bancários
- Histórico de afastamentos

### 📅 Controle de Frequência
- Sistema de escalas
- Controle de afastamentos
- Gestão de horários

### 💰 Diárias
- Controle de diárias de viagem
- Cálculo automático de valores
- Acompanhamento de status

### 🔫 Armamento
- Controle de armamento
- Registro de retirada/devolução
- Histórico de uso

### 📊 Relatórios
- Relatórios gerenciais
- Estatísticas do sistema
- Exportação de dados

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/frizen94/ERPRO.git
cd ERPRO
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados:
```bash
npm run db:push
```

4. Execute o projeto:
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5000`

## 📁 Estrutura do Projeto

```
├── client/          # Frontend React
├── server/          # Backend Express
├── shared/          # Schemas compartilhados
└── README.md
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Executa em modo produção
- `npm run db:push` - Atualiza o schema do banco

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

Desenvolvido para a Polícia Civil 🚔
