// Estrutura de Rotas do Frontend ArenaGo

/**
 * ROTAS PÚBLICAS (Sem autenticação)
 */

// GET / → Home (redireciona para login se não autenticado)
// GET /login → Login page
// GET /cadastro → Cadastro page
// GET /nao-autorizado → Página 403
// GET * → Página 404

/**
 * ROTAS PRIVADAS - CLIENTE (CLIENTE)
 */

// GET /dashboard → Redireciona para /dashboard/cliente
// GET /dashboard/cliente → DashboardCliente (próximas reservas, histórico)

// GET /nova-reserva → NovaReserva (seleção de quadra)
// GET /reserva/nova?quadraId=X → CalendarioReserva (seleção data/hora) [EM DESENVOLVIMENTO]
// GET /reserva/:id → DetalhesReserva (visualizar e cancelar) [EM DESENVOLVIMENTO]

// GET /perfil → Perfil (visualizar e editar dados)

/**
 * ROTAS PRIVADAS - FUNCIONÁRIO (FUNCIONARIO, ADMIN)
 */

// GET /dashboard/funcionario → DashboardFuncionario (agenda, próximas reservas)
// GET /agenda → Agenda (listagem de reservas do dia) [EM DESENVOLVIMENTO]
// GET /comanda/:id → DetalhesComanda (gerenciar itens, calcular total) [EM DESENVOLVIMENTO]
// GET /comanda/:id/pagamento → RegistroPagamento (processar pagamento) [EM DESENVOLVIMENTO]

/**
 * ROTAS PRIVADAS - ADMIN (ADMIN)
 */

// GET /dashboard/admin → DashboardAdmin (KPIs, estatísticas)

// GET /gerenciamento/quadras → GerenciamentoQuadras (CRUD) [EM DESENVOLVIMENTO]
// GET /gerenciamento/quadras/:id → EditarQuadra (formulário) [EM DESENVOLVIMENTO]

// GET /gerenciamento/produtos → GerenciamentoProdutos (CRUD) [EM DESENVOLVIMENTO]
// GET /gerenciamento/produtos/:id → EditarProduto (formulário) [EM DESENVOLVIMENTO]

// GET /gerenciamento/usuarios → GerenciamentoClientes (listagem e CRUD) [EM DESENVOLVIMENTO]
// GET /gerenciamento/usuarios/:id → EditarUsuario (formulário) [EM DESENVOLVIMENTO]

// GET /gerenciamento/bloqueios → GerenciamentoBloqueios (CRUD) [EM DESENVOLVIMENTO]
// GET /gerenciamento/bloqueios/:id → EditarBloqueio (formulário) [EM DESENVOLVIMENTO]

// GET /gerenciamento/relatorios → Relatórios (vendas, ocupação, etc) [FUTURO]

/**
 * ROTAS PRIVADAS - QUALQUER USUÁRIO AUTENTICADO
 */

// GET /perfil → Perfil (visualizar e editar dados)
// GET /alterar-senha → AlterarSenha (formulário) [EM DESENVOLVIMENTO]

/**
 * MAPA DE NAVEGAÇÃO POR PERFIL
 */

/*
CLIENTE:
├─ /login (público)
├─ /cadastro (público)
├─ /dashboard/cliente
│  ├─ Próximas Reservas
│  │  └─ Clica em Reserva → /reserva/:id
│  ├─ Botão "+ Nova Reserva" → /nova-reserva
│  └─ Link "Perfil" → /perfil
├─ /nova-reserva
│  └─ Seleciona Quadra → /reserva/nova?quadraId=X
├─ /reserva/nova?quadraId=X [EM DESENVOLVIMENTO]
│  └─ Confirma → /reserva/:id
├─ /reserva/:id
│  └─ Visualiza e cancela
└─ /perfil
   └─ Edita dados

FUNCIONÁRIO:
├─ /login
├─ /dashboard/funcionario
│  └─ Reservas do dia
│  └─ Link "Agenda" → /agenda
├─ /agenda
│  └─ Lista reservas
│  └─ Clica em reserva → /comanda/:id
├─ /comanda/:id
│  ├─ Adiciona itens
│  └─ Clica "Pagar" → /comanda/:id/pagamento
├─ /comanda/:id/pagamento
│  └─ Registra pagamento
└─ /perfil

ADMIN:
├─ /login
├─ /dashboard/admin
│  ├─ KPIs e gráficos
│  └─ Links para gerenciamento no header
├─ /gerenciamento/quadras
│  ├─ Tabela de quadras
│  └─ Clica em ação → Cria/Edita/Deleta
├─ /gerenciamento/produtos
│  └─ Mesma estrutura
├─ /gerenciamento/usuarios
│  └─ Mesma estrutura
├─ /gerenciamento/bloqueios
│  └─ Mesma estrutura
└─ /perfil
*/

/**
 * COMPONENTES UTILIZADOS EM CADA PÁGINA
 */

/*
Login.jsx:
├─ Card
├─ Input (email, senha)
├─ Button
├─ Alert
└─ Link para Cadastro

Cadastro.jsx:
├─ Card
├─ Input (nome, email, telefone, cpf, senha)
├─ Button
└─ Alert

DashboardCliente.jsx:
├─ Header com "Meu Perfil" e "Sair"
├─ Card com "Nova Reserva"
├─ Card "Próximas Reservas" com Table
├─ Card "Estatísticas"
└─ Table "Histórico de Reservas"

DashboardAdmin.jsx:
├─ Header com links para gerenciamento
├─ Grid de Cards com KPIs
├─ Card "Próximas Reservas"
└─ Table "Produtos Mais Vendidos"

NovaReserva.jsx:
├─ Header com "Voltar"
├─ Input para busca/filtro
├─ Grid de Cards para cada quadra
└─ Button para selecionar

Perfil.jsx:
├─ Header com "Voltar"
├─ Card com informações (read-only)
├─ Form com nome/telefone (editável)
├─ Buttons Editar/Salvar/Cancelar
└─ Seção de Segurança
*/

/**
 * FLUXO DE ESTADO (CONTEXT API)
 */

/*
AuthContext:
├─ usuario { id, email, perfil, nome, ... }
├─ token { valor, expira em 7 dias }
├─ loading { boolean }
├─ Functions:
│  ├─ login(usuario, token) → salva em localStorage
│  ├─ logout() → limpa localStorage
│  ├─ estaAutenticado() → verifica se tem token
│  └─ temPermissao(perfis) → verifica perfil
└─ Custom Hook: useAuth()

ToastContext:
├─ toasts { id, message, type }
└─ Functions:
   ├─ addToast(message, type, duration)
   └─ removeToast(id)
*/

/**
 * SERVIÇOS DE API (services/api.js)
 */

/*
authAPI:
├─ registro(dados)
├─ login(email, senha)
├─ recuperarSenha(email)
└─ redefinirSenha(token, novaSenha)

usuariosAPI:
├─ obterPerfil()
├─ atualizarPerfil(dados)
├─ listar(filtros)
├─ obter(id)
├─ criar(dados)
├─ atualizar(id, dados)
└─ deletar(id)

quadrasAPI:
├─ listar(filtros)
├─ obter(id)
├─ criar(dados)
├─ atualizar(id, dados)
└─ deletar(id)

reservasAPI:
├─ listar(filtros)
├─ obter(id)
├─ criar(dados)
├─ atualizar(id, dados)
└─ cancelar(id, motivo)

comandasAPI:
├─ listar(filtros)
├─ obter(id)
├─ adicionarItem(id, produto)
├─ removerItem(id, itemId)
├─ fechar(id)
├─ registrarPagamento(id, dados)
└─ cancelar(id)

produtosAPI:
├─ listar(filtros)
├─ obter(id)
├─ criar(dados)
├─ atualizar(id, dados)
└─ deletar(id)

categoriasAPI:
├─ listar()
├─ criar(dados)
├─ atualizar(id, dados)
└─ deletar(id)

bloqueiosAPI:
├─ listar()
├─ criar(dados)
└─ deletar(id)

disponibilidadeAPI:
└─ obter(quadraId, dataInicio, dataFim)

dashboardAPI:
└─ obter() → KPIs para admin
*/

/**
 * COMPONENTES DE UI (components/UI.jsx)
 */

/*
Button:
├─ Props: variant, size, disabled, onClick, className
├─ Variants: primary, secondary, danger, success
└─ Sizes: sm, md, lg

Input:
├─ Props: label, type, value, onChange, error, required, disabled
└─ Mostra erro abaixo do input

Card:
├─ Props: children, className
└─ Container com sombra e padding

Alert:
├─ Props: type, message, onClose
└─ Types: info, success, warning, error

Loading:
└─ Spinner + texto "Carregando..."

Table:
├─ Props: headers, rows, actions
└─ Renderiza tabela HTML com TailwindCSS

Modal:
├─ Props: isOpen, title, children, onClose, onConfirm
└─ Diálogo com botões Cancelar/Confirmar

PrivateRoute:
├─ Props: children, permissoes
├─ Verificações:
│  ├─ Se loading → Loading spinner
│  ├─ Se não autenticado → Redireciona para /login
│  ├─ Se sem permissão → Redireciona para /nao-autorizado
│  └─ Se ok → Renderiza children
└─ Usado como: <PrivateRoute permissoes={['ADMIN']}><Admin /></PrivateRoute>
*/

/**
 * ESTILOS (Tailwind CSS)
 */

/*
Cores:
├─ Primary: blue (brand colors)
├─ Success: green (sucesso)
├─ Warning: yellow (alerta)
├─ Danger: red (erro)
├─ Neutral: gray (backgrounds)
└─ Info: blue (informação)

Responsive:
├─ Mobile: até 640px (padrão)
├─ Tablet: 640px-1024px (md:)
└─ Desktop: 1024px+ (lg:)

Componentes padronizados:
├─ Buttons: px-4 py-2 rounded font-semibold
├─ Inputs: px-4 py-2 border rounded-lg focus:ring-2
├─ Cards: bg-white rounded-lg shadow-md p-6
└─ Headers: bg-white shadow border-b
*/

/**
 * FLUXO DE ERRO HANDLING
 */

/*
1. Erro em API:
   ├─ axios interceptor captura
   ├─ Se 401 (não autorizado):
   │  ├─ Limpa localStorage
   │  ├─ Redireciona para /login
   │  └─ Mostra toast "Sessão expirada"
   └─ Se outro erro:
      ├─ Retorna error para componente
      ├─ Componente mostra Alert com mensagem
      └─ useToast().addToast() para notificação

2. Erro em validação:
   ├─ Form valida dados
   ├─ Se inválido:
   │  ├─ Mostra erros nos inputs
   │  └─ Desabilita submit
   └─ Se válido:
      └─ Envia para API

3. Erro em componente:
   ├─ Try/catch captura
   ├─ Salva em estado de erro
   ├─ Mostra Alert
   └─ Permite retry
*/

export default routes;
