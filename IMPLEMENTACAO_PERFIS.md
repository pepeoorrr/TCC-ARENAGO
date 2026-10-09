# Perfis, estabelecimentos e testes

O ArenaGo usa `ADMIN`, `PROPRIETARIO` e `CLIENTE`. Um proprietário administra vários estabelecimentos, cada um com seu catálogo, estoque e quadras. O admin cria proprietários e atribui os locais. O cadastro público sempre cria clientes.

## Banco e primeiro acesso

Requer Node.js 24, MySQL e as variáveis descritas em `backend/.env.example`. `JWT_SECRET` precisa de pelo menos 16 caracteres. A configuração da URL permanece em `prisma.config.ts`, compatível com Prisma 7.

Na pasta `backend`:

```powershell
npm ci
npx prisma generate
npx prisma migrate deploy
```

A migração `20261009120000_estabelecimentos_comandas` foi preparada para uma base sem dados de negócio. O histórico anterior de migrações foi mantido. Não é necessário executar reset. Ela adiciona estabelecimentos, substitui o perfil de funcionário e permite várias comandas por reserva.

Para o primeiro administrador, configure `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mínimo 8 caracteres) e, opcionalmente, `ADMIN_NAME` no ambiente local. Execute `npm run admin:create`. O comando recusa criar outro administrador quando já existe um; os próximos usuários são cadastrados pelo painel. Não há credenciais padrão ou envio de senha por email. Remova as variáveis de bootstrap depois do uso.

Execute `npm run dev` no backend. Na pasta `frontend`, configure `VITE_API_URL`, execute `npm ci` e `npm run dev`.

## Fluxo de uso

1. Admin cria um usuário proprietário, informando a senha inicial, ou promove uma conta existente. Em Estabelecimentos, cadastra e atribui os locais.
2. Proprietário seleciona um local e cadastra categorias, produtos, estoque, quadras e bloqueios.
3. Cliente escolhe local, quadra, data e horário. A reserva cria automaticamente a comanda do responsável, com aluguel proporcional à duração.
4. Proprietário abre comandas para outros participantes, buscando clientes cadastrados por email exato. Cada reserva admite uma comanda por cliente. Participantes não pagam aluguel nessa versão.
5. Proprietário lança consumos, fecha comandas e registra pagamento. Admin também pode executar essas operações. O cliente acompanha somente sua própria comanda.
6. A reserva é finalizada quando todas as comandas não canceladas estiverem pagas. Comanda sem consumo e de participante pode ser cancelada; a comanda do responsável é cancelada junto com a reserva. Consumo ou pagamento impede cancelamento simples. Cliente precisa de duas horas de antecedência para cancelar uma reserva.

Usuários, estabelecimentos e catálogo são desativados, preservando registros históricos. Não há estorno, convite, participante sem conta, comanda avulsa ou pagamento online nesta versão.

## Organização do código e API

- `backend/src/app.js` monta a aplicação sem abrir porta ou conectar automaticamente ao banco. `server.js` inicializa as dependências de produção.
- `backend/src/services/` contém autorização, contas, catálogo, reservas, comandas e operação. Banco, relógio e identificadores podem ser substituídos nos testes.
- `frontend/src/components/Workspace.jsx` oferece navegação e seleção de estabelecimento. As páginas operacionais são compartilhadas por admin e proprietário.

APIs novas/alteradas:

- `GET/POST /estabelecimentos`, `PUT/DELETE /estabelecimentos/:id`.
- `estabelecimentoId` em criação de quadras/produtos/categorias e filtros de listagem, agenda, comandas e dashboard. A seleção no frontend não concede autorização; todas as consultas são limitadas pelo usuário autenticado.
- `GET /usuarios/buscar-cliente?email=...`: admin/proprietário recebe apenas identificação mínima de cliente ativo.
- `POST /reservas`: cliente usa sua própria identidade; admin/proprietário informa `usuarioId` do cliente.
- `POST /comandas/:reservaId` recebe `{ usuarioId }`. A resposta detalhada de reserva usa `comandas[]`, com visibilidade conforme o perfil.
- `POST /comandas/:id/pagamento`: `formaPagamento` aceita `PIX`, `CARTAO` ou `DINHEIRO`; troco é calculado no servidor.
- Perfil e situação da conta são consultados no banco em toda requisição autenticada. As respostas nunca incluem hash de senha.

## Testes

Backend, sem banco nem servidor HTTP nos testes unitários:

```powershell
cd backend
npm run test:unit
```

Frontend, com API simulada:

```powershell
cd frontend
npm run test:unit
npm run build
```

Integração: o runner cria um banco de nome aleatório `arenago_<uuid>_test`, aplica todas as migrações, executa os testes HTTP e remove somente o banco que criou. Nunca reseta o banco informado na URL. Exige um usuário com permissão de criar/remover bancos. Para evitar o servidor remoto da aplicação, use MySQL local ou Docker:

```powershell
docker run --detach --rm --name arenago-tests --publish 127.0.0.1:33316:3306 --env MYSQL_ROOT_PASSWORD=senha-local-de-teste mysql:8.4
# Aguarde a mensagem "ready for connections" em: docker logs arenago-tests
cd backend
$env:TEST_DATABASE_URL = 'mysql://root:senha-local-de-teste@127.0.0.1:33316/arenago_test'
npm run test:integration
docker stop arenago-tests
```

`TEST_DATABASE_URL` seleciona o servidor de testes; na ausência, o runner usa o servidor de `DATABASE_URL`, sempre criando uma base distinta. As credenciais acima são exclusivamente para o contêiner local descartável.

Cobertura funcional: permissões, isolamento por proprietário/local, sessão atualizada, reserva e aluguel, comandas por participante, pagamentos, rollback, concorrência de estoque e reservas, navegação, formulários, troca de local e consulta do cliente.
