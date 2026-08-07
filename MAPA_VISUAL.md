# 📊 Mapa de Implementação Visual - ArenaGo v1.0.0

## 🏗️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE BROWSER                          │
│  http://localhost:5173 (React + Vite + TailwindCSS)         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Login      │  │   Dashboard  │  │   Perfil     │      │
│  │   Cadastro   │  │   (Cliente)  │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Router + Context API + Axios Service         │  │
│  │  (AuthContext, ToastContext, API Interceptors)      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTP
                    Authorization: Bearer {JWT}
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              SERVIDOR BACKEND (Node.js)                      │
│  http://localhost:5000 (Express.js)                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Middlewares: CORS, bodyParser, Auth, Permissions   │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Routes (11 arquivos, 45+ endpoints)                 │  │
│  │ ├─ /auth     ├─ /usuarios  ├─ /quadras             │  │
│  │ ├─ /reservas ├─ /comandas  ├─ /produtos            │  │
│  │ ├─ /categorias ├─ /bloqueios ├─ /disponibilidade   │  │
│  │ └─ /dashboard                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Controllers (10 arquivos)                           │  │
│  │ Lógica de Negócio:                                  │  │
│  │ ├─ Validação de reservas                           │  │
│  │ ├─ Sincronização de estoque                        │  │
│  │ ├─ Cálculo de totais                               │  │
│  │ └─ Verificação de permissões                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Prisma ORM (Query Builder)                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Driver MySQL                                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS                            │
│              MySQL (arenago)                                │
│                                                              │
│  ┌──────────┬───────────┬──────────┬──────────┬──────────┐ │
│  │ Usuario  │ Quadra    │ Reserva  │ Comanda  │ Produto  │ │
│  ├──────────┼───────────┼──────────┼──────────┼──────────┤ │
│  │ Categoria│ Bloqueio  │ Historico│ItemComda│   ...    │ │
│  └──────────┴───────────┴──────────┴──────────┴──────────┘ │
│                                                              │
│  10 Tabelas com Relacionamentos                            │
│  Validações em Banco de Dados                              │
│  Índices para Performance                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CADASTRO                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Frontend: POST /api/auth/registro                           │
│ ├─ nome, email, telefone, cpf, senha                       │
│ └─ Validações no frontend:                                 │
│    ├─ Email válido                                         │
│    ├─ CPF válido                                           │
│    ├─ Telefone válido                                      │
│    └─ Senha >= 6 caracteres                                │
│                                                              │
│ Backend: authController.registro()                          │
│ ├─ Validações no backend:                                  │
│ │  ├─ Email único                                          │
│ │  ├─ Formato válido                                       │
│ │  └─ Telefone válido                                      │
│ ├─ Hash da senha com bcrypt (10 rounds)                   │
│ ├─ Insere no banco                                         │
│ ├─ Gera JWT token (7 dias)                                │
│ └─ Retorna usuario + token                                │
│                                                              │
│ Frontend: AuthContext.login(usuario, token)                │
│ ├─ Salva token em localStorage                            │
│ ├─ Salva usuario em estado                                │
│ └─ Redireciona para /dashboard                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. LOGIN                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Frontend: POST /api/auth/login                             │
│ ├─ email, senha                                            │
│ └─ Validações no frontend                                 │
│                                                              │
│ Backend: authController.login()                            │
│ ├─ Busca usuario por email                               │
│ ├─ Compara senha com bcrypt                              │
│ ├─ Gera JWT token (7 dias)                               │
│ └─ Retorna usuario + token                               │
│                                                              │
│ Frontend: AuthContext.login(usuario, token)                │
│ └─ Redireciona para /dashboard                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3. REQUISIÇÕES AUTENTICADAS                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Frontend: Qualquer requisição para /api                    │
│ ├─ axios interceptor adiciona header:                      │
│ │  Authorization: Bearer {token}                           │
│ └─ Envia requisição                                        │
│                                                              │
│ Backend: authMiddleware verifica                           │
│ ├─ Extrai token do header                                 │
│ ├─ Decodifica JWT                                         │
│ ├─ Se inválido ou expirado:                               │
│ │  └─ Retorna 401 Unauthorized                           │
│ └─ Se válido:                                             │
│    ├─ Salva usuario em req.usuario                       │
│    └─ Passa para próximo middleware                      │
│                                                              │
│ Backend: permissionMiddleware verifica                     │
│ ├─ Checa req.usuario.perfil                              │
│ ├─ Compara com permissões da rota                        │
│ ├─ Se não autorizado:                                    │
│ │  └─ Retorna 403 Forbidden                             │
│ └─ Se autorizado:                                        │
│    └─ Executa controller                                │
│                                                              │
│ Frontend: axios interceptor em resposta                    │
│ ├─ Se 401:                                                │
│ │  ├─ Limpa localStorage                                 │
│ │  ├─ Redireciona para /login                            │
│ │  └─ Mostra toast "Sessão expirada"                     │
│ └─ Se outros erros:                                      │
│    └─ Passa erro para componente                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 4. LOGOUT                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Frontend: useAuth().logout()                                │
│ ├─ Limpa localStorage                                      │
│ ├─ Limpa estado de usuario                                │
│ └─ Redireciona para /login                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Fluxo de Reserva

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CLIENTE SELECIONA QUADRA                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Frontend: GET /api/quadras                                 │
│ Backend: quadrasController.listar()                        │
│ └─ Retorna list de quadras ativas                         │
│                                                              │
│ Frontend: User seleciona uma quadra                        │
│ └─ Navega para /reserva/nova?quadraId=X                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. CLIENTE ESCOLHE DATA/HORA (EM DESENVOLVIMENTO)         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Frontend: GET /api/disponibilidade?quadraId=X&...        │
│ Backend: disponibilidadeController.obter()                │
│ ├─ Gera grid de horários                                 │
│ ├─ Marca como ocupado se tiver reserva                  │
│ ├─ Marca como bloqueado se tiver bloqueio               │
│ └─ Retorna disponibilidade                              │
│                                                              │
│ Frontend: User seleciona data/hora                        │
│ └─ Navega para confirmação                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3. CONFIRMAÇÃO DA RESERVA                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Frontend: Mostra resumo (quadra, data, hora, preço)       │
│ └─ User clica "Confirmar"                                │
│                                                              │
│ Frontend: POST /api/reservas                              │
│ ├─ quadraId, dataReserva, horarioInicio, duracao        │
│ └─ Envia com token JWT                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 4. BACKEND PROCESSA RESERVA                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Backend: reservasController.criar()                        │
│                                                              │
│ Validações:                                               │
│ ├─ Quadra existe e está ativa                            │
│ ├─ Data/hora no futuro                                  │
│ ├─ Horário dentro do horário de funcionamento           │
│ ├─ SEM conflito com outras reservas CONFIRMADA/ATIVA   │
│ └─ SEM bloqueios no horário                             │
│                                                              │
│ Transações:                                              │
│ ├─ Cria Reserva (status: CONFIRMADA)                    │
│ │  ├─ numeroReserva: RSV-20240101-0001                 │
│ │  ├─ usuarioId: do token                             │
│ │  ├─ quadraId: selecionada                           │
│ │  ├─ dataReserva: selecionada                        │
│ │  ├─ horarioInicio: selecionado                      │
│ │  ├─ horarioFim: calculado                           │
│ │  └─ duracao: em minutos                             │
│ │                                                      │
│ ├─ Cria Comanda (AUTOMÁTICO)                           │
│ │  ├─ numeroComanda: CMD-20240101-0001                │
│ │  ├─ status: ABERTA                                  │
│ │  ├─ valorAluguel: preço/hora * duracao              │
│ │  ├─ subtotalConsumos: 0 (inicialmente)              │
│ │  └─ total: = valorAluguel                           │
│ │                                                      │
│ └─ Liga Reserva ↔ Comanda (FK)                         │
│                                                              │
│ Response: 201 Created                                     │
│ └─ Retorna Reserva + Comanda + numeroReserva            │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 5. COMANDA PRONTA PARA CONSUMO                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Funcionário pode:                                          │
│ ├─ Adicionar itens (produtos) à comanda                  │
│ │  ├─ POST /api/comandas/:id/items                     │
│ │  ├─ Valida se tem estoque                            │
│ │  ├─ Decrementa estoque do produto                    │
│ │  └─ Recalcula total da comanda                       │
│ │                                                      │
│ ├─ Remover itens                                        │
│ │  ├─ DELETE /api/comandas/:id/items/:itemId          │
│ │  ├─ Devolve estoque                                 │
│ │  └─ Recalcula total                                │
│ │                                                      │
│ ├─ Fechar comanda                                       │
│ │  ├─ PUT /api/comandas/:id/fechar                   │
│ │  └─ status: AGUARDANDO_PAGAMENTO                   │
│ │                                                      │
│ └─ Registrar pagamento                                 │
│    ├─ PUT /api/comandas/:id/pagamento                │
│    ├─ status: PAGA                                   │
│    └─ Atualiza Reserva status: FINALIZADA            │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 6. CANCELAMENTO DE RESERVA                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Cliente:                                                   │
│ ├─ DELETE /api/reservas/:id                             │
│ ├─ Validação: 2 horas antes da reserva                 │
│ └─ Se válido:                                           │
│    ├─ Reserva status: CANCELADA                        │
│    └─ Comanda status: CANCELADA                        │
│                                                              │
│ Admin:                                                     │
│ ├─ DELETE /api/reservas/:id                             │
│ ├─ Sem restrição de tempo                              │
│ ├─ Registra motivo                                      │
│ └─ Cancela Reserva e Comanda                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Estrutura Frontend

```
frontend/src/
│
├─ App.jsx
│  └─ React Router Setup
│     ├─ Rotas Públicas: /, /login, /cadastro
│     ├─ Rotas Privadas:
│     │  ├─ /dashboard/cliente
│     │  ├─ /dashboard/admin
│     │  ├─ /dashboard/funcionario
│     │  ├─ /nova-reserva
│     │  ├─ /perfil
│     │  ├─ /gerenciamento/*
│     │  └─ /agenda
│     └─ Rotas de Erro: /nao-autorizado, 404
│
├─ main.jsx
│  └─ React entry point
│
├─ App.css
├─ index.css (Tailwind)
│
├─ components/
│  ├─ UI.jsx
│  │  ├─ Button (primary, secondary, danger, success)
│  │  ├─ Input (com validação)
│  │  ├─ Card
│  │  ├─ Alert (info, success, warning, error)
│  │  ├─ Loading
│  │  ├─ Table
│  │  └─ Modal
│  │
│  └─ PrivateRoute.jsx
│     ├─ Loading spinner
│     ├─ Auth check
│     ├─ Permission check
│     └─ Redirect se necessário
│
├─ pages/
│  ├─ Login.jsx ✅
│  │  ├─ Email input
│  │  ├─ Senha input
│  │  ├─ Validação
│  │  └─ Link para Cadastro
│  │
│  ├─ Cadastro.jsx ✅
│  │  ├─ Nome input
│  │  ├─ Email input
│  │  ├─ Telefone input (validação)
│  │  ├─ CPF input (validação)
│  │  ├─ Senha input
│  │  ├─ Confirmar Senha
│  │  └─ Link para Login
│  │
│  ├─ DashboardCliente.jsx ✅
│  │  ├─ Próximas Reservas
│  │  ├─ Histórico de Reservas (table)
│  │  ├─ Estatísticas Rápidas
│  │  └─ Botão "+ Nova Reserva"
│  │
│  ├─ DashboardAdmin.jsx ✅
│  │  ├─ KPI: Receita do Dia
│  │  ├─ KPI: Receita do Mês
│  │  ├─ KPI: Reservas Hoje
│  │  ├─ KPI: Taxa de Ocupação
│  │  ├─ KPI: Reservas Confirmadas
│  │  ├─ KPI: Produtos Baixo Estoque
│  │  ├─ KPI: Comandas Aguardando
│  │  ├─ Próximas Reservas
│  │  └─ Produtos Mais Vendidos (table)
│  │
│  ├─ NovaReserva.jsx ✅
│  │  ├─ Filtro de Quadras
│  │  └─ Grid de Cards
│  │     ├─ Ícone do tipo
│  │     ├─ Nome da quadra
│  │     ├─ Horários
│  │     ├─ Preço
│  │     └─ Botão selecionar
│  │
│  ├─ Perfil.jsx ✅
│  │  ├─ Info Read-Only: Email, CPF
│  │  ├─ Form Editável: Nome, Telefone
│  │  ├─ Botões: Editar, Salvar, Cancelar
│  │  └─ Seção Segurança
│  │
│  ├─ CalendarioReserva.jsx ⏳
│  ├─ ConfirmacaoReserva.jsx ⏳
│  ├─ DetalhesReserva.jsx ⏳
│  ├─ DashboardFuncionario.jsx ⏳
│  ├─ Agenda.jsx ⏳
│  ├─ DetalhesComanda.jsx ⏳
│  ├─ RegistroPagamento.jsx ⏳
│  └─ Gerenciamento/*.jsx ⏳
│
├─ context/
│  ├─ AuthContext.jsx ✅
│  │  ├─ Estado: usuario, token, loading
│  │  ├─ localStorage persistence
│  │  ├─ login(usuario, token)
│  │  ├─ logout()
│  │  ├─ estaAutenticado()
│  │  ├─ temPermissao(perfis)
│  │  └─ Custom hook: useAuth()
│  │
│  └─ ToastContext.jsx ✅
│     ├─ ToastProvider
│     ├─ useToast hook
│     ├─ addToast(message, type, duration)
│     ├─ removeToast(id)
│     └─ ToastContainer + Toast Component
│
├─ services/
│  └─ api.js ✅
│     ├─ axios instance com baseURL
│     ├─ Request interceptor (Bearer token)
│     ├─ Response interceptor (401 handling)
│     ├─ authAPI (4 endpoints)
│     ├─ usuariosAPI (7 endpoints)
│     ├─ quadrasAPI (5 endpoints)
│     ├─ reservasAPI (5 endpoints)
│     ├─ comandasAPI (8 endpoints)
│     ├─ produtosAPI (5 endpoints)
│     ├─ categoriasAPI (4 endpoints)
│     ├─ bloqueiosAPI (3 endpoints)
│     ├─ disponibilidadeAPI (1 endpoint)
│     └─ dashboardAPI (1 endpoint)
│
├─ utils/
│  ├─ (vazio - pronto para helpers)
│  ├─ formatters.js (futuro)
│  ├─ validators.js (futuro)
│  └─ constants.js (futuro)
│
└─ styles/
   ├─ globals.css (Tailwind)
   └─ (arquivos CSS adicionais)
```

---

## 🏗️ Estrutura Backend

```
backend/src/
│
├─ server.js
│  └─ Express Setup
│     ├─ CORS middleware
│     ├─ bodyParser
│     ├─ Logger
│     ├─ Routes registration (11 files)
│     ├─ Error handler
│     └─ Server startup
│
├─ middlewares/
│  ├─ authMiddleware.js
│  │  ├─ Verifica JWT token
│  │  ├─ Decodifica token
│  │  ├─ Salva usuario em req.usuario
│  │  └─ Retorna 401 se inválido
│  │
│  ├─ permissionMiddleware.js
│  │  ├─ Higher-order function
│  │  ├─ Recebe array de perfis permitidos
│  │  ├─ Valida req.usuario.perfil
│  │  └─ Retorna 403 se não autorizado
│  │
│  └─ errorHandler.js
│     ├─ Catch-all error handler
│     ├─ Mapeia erros Prisma (P2002, P2025, etc)
│     ├─ Valida estrutura de erro
│     └─ Retorna JSON consistente
│
├─ routes/
│  ├─ authRoutes.js (4 endpoints)
│  │  ├─ POST /registro
│  │  ├─ POST /login
│  │  ├─ POST /recuperar-senha
│  │  └─ POST /redefinir-senha
│  │
│  ├─ usuariosRoutes.js (7 endpoints)
│  │  ├─ GET /perfil (private)
│  │  ├─ PUT /perfil (private)
│  │  ├─ GET / (admin)
│  │  ├─ GET /:id (admin)
│  │  ├─ POST / (admin)
│  │  ├─ PUT /:id (admin)
│  │  └─ DELETE /:id (admin)
│  │
│  ├─ quadrasRoutes.js (5 endpoints)
│  ├─ reservasRoutes.js (5 endpoints)
│  ├─ comandasRoutes.js (8 endpoints)
│  ├─ produtosRoutes.js (5 endpoints)
│  ├─ categoriasRoutes.js (4 endpoints)
│  ├─ bloqueiosRoutes.js (3 endpoints)
│  ├─ disponibilidadeRoutes.js (1 endpoint)
│  ├─ dashboardRoutes.js (1 endpoint)
│  └─ ... (11 files total, 45+ endpoints)
│
├─ controllers/
│  ├─ authController.js
│  │  ├─ registro() → cria usuario + JWT
│  │  ├─ login() → valida senha + JWT
│  │  ├─ recuperarSenha() → placeholder
│  │  └─ redefinirSenha() → placeholder
│  │
│  ├─ reservasController.js
│  │  ├─ listar() → filtrado por permissão
│  │  ├─ obter(id)
│  │  ├─ criar() → valida conflito + cria comanda
│  │  ├─ atualizar(id)
│  │  └─ cancelar(id) → com regras de negócio
│  │
│  ├─ comandasController.js
│  │  ├─ listar() → filtrado por permissão
│  │  ├─ obter(id)
│  │  ├─ adicionarItem() → desconta estoque
│  │  ├─ removerItem() → devolve estoque
│  │  ├─ fechar() → status AGUARDANDO_PAGAMENTO
│  │  ├─ registrarPagamento() → status PAGA
│  │  └─ cancelar()
│  │
│  ├─ quadrasController.js (5 funções)
│  ├─ usuariosController.js (7 funções)
│  ├─ produtosController.js (5 funções)
│  ├─ categoriasController.js (4 funções)
│  ├─ bloqueiosController.js (3 funções)
│  ├─ disponibilidadeController.js (1 função)
│  ├─ dashboardController.js (1 função com 10 KPIs)
│  └─ ... (10 files total)
│
├─ utils/
│  └─ gerador.js
│     ├─ gerarNumeroReserva() → RSV-20240101-0001
│     ├─ gerarNumeroComanda() → CMD-20240101-0001
│     ├─ temPermissao(perfil, permitidos)
│     ├─ formatarMoeda(valor)
│     └─ validarHorario(hora)
│
└─ (outros arquivos de configuração)

prisma/
├─ schema.prisma
│  ├─ Usuario (8 fields, enums)
│  ├─ Quadra (10 fields)
│  ├─ Reserva (10 fields, FK relationships)
│  ├─ Comanda (9 fields, calculations)
│  ├─ ItemComanda (5 fields)
│  ├─ Produto (8 fields)
│  ├─ Categoria (3 fields)
│  ├─ Bloqueio (5 fields)
│  ├─ Historico (6 fields)
│  └─ Enums: Perfil, TipoQuadra, StatusReserva, StatusComanda, etc
│
└─ migrations/
   └─ 20260603110341_init/
      └─ migration.sql (DDL gerado por Prisma)
```

---

## 📊 Estado da Implementação

```
┌─────────────────────────────────────────────────────┐
│                 COMPLETO ✅                          │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ✅ Backend:                                         │
│    ├─ Arquitetura                                  │
│    ├─ Autenticação (JWT + bcrypt)                 │
│    ├─ 45+ Endpoints                               │
│    ├─ Lógica de Negócio                           │
│    ├─ Validações                                  │
│    └─ Tratamento de Erro                          │
│                                                      │
│ ✅ Documentação:                                    │
│    ├─ 8 guias                                      │
│    ├─ Especificação                               │
│    ├─ Arquitetura                                 │
│    ├─ Checklist                                   │
│    └─ Roadmap                                     │
│                                                      │
│ ✅ Frontend Fundação:                               │
│    ├─ Routing                                      │
│    ├─ Autenticação                                │
│    ├─ Componentes UI                              │
│    ├─ Contextos                                   │
│    └─ API Service                                 │
│                                                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              EM DESENVOLVIMENTO ⏳                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ⏳ Frontend Pages (50% completo):                   │
│    ├─ Calendário (data/hora)                      │
│    ├─ Confirmação de Reserva                      │
│    ├─ Detalhes de Reserva                         │
│    ├─ Dashboard Funcionário                       │
│    ├─ Agenda                                       │
│    ├─ Comanda                                      │
│    ├─ Pagamento                                    │
│    └─ Gerenciamento (quadras, produtos, users)   │
│                                                      │
│ ⏳ Testes:                                          │
│    ├─ Unitários                                   │
│    ├─ Integração                                  │
│    └─ E2E                                         │
│                                                      │
│ ⏳ Deploy & Produção:                               │
│    ├─ Docker                                      │
│    ├─ CI/CD                                       │
│    └─ Performance                                 │
│                                                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ PROGRESSO GERAL: 60% COMPLETO                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Backend:     ████████████████████ 100%              │
│ Frontend:    ██████████░░░░░░░░░░░ 50%               │
│ Docs:        ████████████████████ 100%              │
│ Testes:      ░░░░░░░░░░░░░░░░░░░░░  0%               │
│ Deploy:      ░░░░░░░░░░░░░░░░░░░░░  0%               │
│ ─────────────────────────────────                  │
│ TOTAL:       ██████████░░░░░░░░░░░ 60%               │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Próximos Passos Recomendados

```
SEMANA 1: Completar Fluxo de Reserva
├─ [ ] Calendário/Disponibilidade
├─ [ ] Confirmação
├─ [ ] Testes E2E
└─ ⏱️ ~40 horas

SEMANA 2: Completar Gerenciamento
├─ [ ] Admin Quadras
├─ [ ] Admin Produtos
├─ [ ] Admin Usuários
└─ ⏱️ ~30 horas

SEMANA 3: Completar Funcionário
├─ [ ] Agenda
├─ [ ] Comanda
├─ [ ] Pagamento
└─ ⏱️ ~25 horas

SEMANA 4: Qualidade & Deploy
├─ [ ] Testes Unitários
├─ [ ] Otimizações
├─ [ ] Docker
└─ ⏱️ ~35 horas

TOTAL: ~8-10 semanas de desenvolvimento
```

---

**Fim do Mapa Visual**  
Para mais informações, consulte a documentação completa.
