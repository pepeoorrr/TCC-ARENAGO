# ArenaGo - Sistema de Gerenciamento de Quadras Esportivas

## 📋 Visão Geral

ArenaGo é uma aplicação completa para gerenciar reservas de quadras esportivas, incluindo sistema de cobrança integrado. O sistema diferencia perfis de usuários (Cliente, Funcionário e Admin) com funcionalidades específicas para cada um.

## 🎯 Funcionalidades Principais

### Para Clientes
- ✅ Cadastro e Login
- ✅ Visualizar quadras disponíveis
- ✅ Fazer reservas de quadras
- ✅ Visualizar histórico de reservas
- ✅ Cancelar reservas (com aviso de 2 horas)
- ✅ Editar perfil

### Para Funcionários
- ✅ Ver agenda do dia
- ✅ Gerenciar comandas (consumo de produtos)
- ✅ Registrar pagamentos
- ✅ Controlar estoque de produtos

### Para Administradores
- ✅ Dashboard com KPIs
- ✅ Gerenciar quadras
- ✅ Gerenciar produtos e categorias
- ✅ Gerenciar usuários
- ✅ Visualizar relatórios

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** com Express.js
- **Prisma ORM** para gerenciamento de banco de dados
- **MySQL** como banco de dados
- **JWT** para autenticação
- **bcrypt** para criptografia de senhas

### Frontend
- **React** com Vite
- **React Router** para navegação
- **Context API** para gerenciamento de estado
- **Axios** para requisições HTTP
- **Tailwind CSS** para estilos

## 📦 Instalação

### Pré-requisitos
- Node.js >= 16
- npm ou yarn
- MySQL 8.0+

### Backend

1. Entre no diretório do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Configure a conexão com o banco de dados em `.env`:
```env
DATABASE_URL="mysql://user:password@localhost:3306/arenago"
JWT_SECRET="sua_chave_secreta_aqui"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

5. Execute as migrações do Prisma:
```bash
npm run prisma:migrate
```

6. Inicie o servidor:
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:5000`

### Frontend

1. Entre no diretório do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Configure a URL da API em `.env`:
```env
VITE_API_URL="http://localhost:5000/api"
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Token) para autenticação:

1. Usuário faz login e recebe um token
2. Token é armazenado no localStorage
3. Token é enviado em todas as requisições na header `Authorization`
4. Token expira após 7 dias
5. Usuário é deslogado automaticamente se token expirar

### Credenciais de Teste (Demo)

Para testes, use qualquer email e senha:
- Email: `seu.email@exemplo.com`
- Senha: `123456`

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **Usuario**: Usuários do sistema (CLIENTE, FUNCIONARIO, ADMIN)
- **Quadra**: Quadras esportivas
- **Reserva**: Reservas de quadras
- **Comanda**: Consumo de produtos (gerada automaticamente com reserva)
- **ItemComanda**: Itens consumidos na comanda
- **Produto**: Produtos disponíveis
- **Categoria**: Categorias de produtos
- **Bloqueio**: Bloqueios de tempo (manutenção, limpeza)
- **Historico**: Auditoria de ações

## 🎨 Estrutura de Diretórios

### Backend
```
backend/
├── src/
│   ├── server.js
│   ├── controllers/        # Lógica de negócio
│   ├── routes/            # Definição de rotas
│   ├── middlewares/       # Middlewares de autenticação e validação
│   └── utils/             # Funções utilitárias
├── prisma/
│   ├── schema.prisma      # Definição do banco de dados
│   └── migrations/        # Histórico de migrações
├── package.json
└── .env
```

### Frontend
```
frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── components/        # Componentes reutilizáveis
│   ├── pages/            # Páginas da aplicação
│   ├── services/         # Serviços de API
│   ├── context/          # Context API (Auth, Toast)
│   ├── utils/            # Funções utilitárias
│   └── styles/           # Estilos globais
├── vite.config.js
├── package.json
└── .env
```

## 🚀 Scripts Disponíveis

### Backend
```bash
npm run dev           # Inicia em desenvolvimento (com nodemon)
npm start            # Inicia em produção
npm run prisma:migrate # Executa migrações
npm run prisma:generate # Regenera cliente Prisma
```

### Frontend
```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Cria build de produção
npm run preview      # Visualiza build de produção
```

## 📝 Fluxos Principais

### Fluxo de Reserva
1. Cliente seleciona quadra
2. Sistema mostra disponibilidade
3. Cliente escolhe data/hora
4. Sistema valida conflitos
5. Comanda é criada automaticamente
6. Reserva ativada

### Fluxo de Pagamento
1. Funcionário abre comanda
2. Adiciona produtos consumidos
3. Sistema desconta estoque
4. Funcionário fecha comanda
5. Cliente paga
6. Reserva finalizada

## 🔒 Segurança

- Senhas são criptografadas com bcrypt (10 salt rounds)
- JWT para tokens de autenticação
- CORS configurado para aceitar requisições do frontend
- Validação de entrada em todos os endpoints
- Verificação de permissões em endpoints sensíveis

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- Desktop (1920px e acima)
- Tablet (768px - 1024px)
- Mobile (até 767px)

## 🤝 Contribuindo

Este é um projeto acadêmico. Sinta-se livre para fazer fork e contribuir.

## 📄 Licença

Este projeto é fornecido como está para fins educacionais.

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação
2. Verifique os logs do servidor
3. Abra uma issue no repositório

---

**Versão**: 1.0.0  
**Última atualização**: 2024
