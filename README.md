# ArenaGo - Plataforma de Agendamento de Quadras Esportivas

Aplicação React moderna para gerenciamento e agendamento de quadras esportivas de areia com dashboard administrativo completo.

**Estrutura atual:** [perfis, estabelecimentos, comandas individuais e execução dos testes](IMPLEMENTACAO_PERFIS.md). Esse guia descreve o backend e frontend atuais, a migração e o cadastro do primeiro administrador.

## Tecnologias Utilizadas

> Para a arquitetura atual e publicação, consulte a seção **Deploy** abaixo.
> As descrições de telas e estrutura nas seções antigas são históricas.

- **React** - Biblioteca JavaScript para interfaces de usuário
- **Vite** - Build tool e dev server ultrarrápido
- **Tailwind CSS** - Framework CSS utilitário
- **JavaScript/JSX** - Linguagem de programação

## Estrutura do Projeto

```
TCC-ARENAGO/
├── src/
│   ├── components/
│   │   └── ArenaGoLayout.jsx       # Componente principal da aplicação
│   ├── App.jsx                     # Componente raiz
│   ├── App.css                     # Estilos da aplicação
│   ├── main.jsx                    # Ponto de entrada
│   └── index.css                   # Estilos globais com Tailwind
├── index.html                      # HTML principal
├── package.json                    # Dependências e scripts
├── vite.config.js                  # Configuração do Vite
├── tailwind.config.js              # Configuração do Tailwind CSS
├── postcss.config.js               # Configuração do PostCSS
└── .gitignore                      # Arquivos ignorados pelo Git
```

## Instalação

### Seed do administrador

Com as dependências do backend instaladas e as migrações aplicadas, configure
`DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mínimo de 8 caracteres) e,
opcionalmente, `ADMIN_NAME` no arquivo `backend/.env`, conforme `.env.example`.

```bash
cd backend
npm run prisma:seed
```

O seed `backend/prisma/seed.js` cria um usuário ativo com perfil `ADMIN` e senha
criptografada com bcrypt. Se já existir um administrador, encerra sem alterações.
Se o email pertencer a outro usuário, informa o conflito sem alterar seu perfil.
Remova as credenciais de bootstrap do `.env` após executar o seed.

1. **Instalar dependências:**
```bash
npm install
```

2. **Iniciar servidor de desenvolvimento:**
```bash
npm run dev
```

3. **Build para produção:**
```bash
npm run build
```

## Funcionalidades

### 1. **Header**
- Logo e descrição do serviço
- Botões de "Entrar" e "Criar Conta"

### 2. **Hero Section**
- Imagem hero com gradiente
- Barra de busca interativa (Cidade, Modalidade, Data)
- Call-to-action "Buscar Quadras"

### 3. **Quadras em Destaque**
- Grid responsivo com 3 arenas de exemplo
- Informações: nome, localização, preço, esporte
- Botões de "Reservar"

### 4. **Funcionalidades do Sistema**
- 8 cards com recursos principais
- Design limpo e moderno

### 5. **Painel Administrativo**
- 4 cards com estatísticas (Reservas, Faturamento, Quadras Ativas, Usuários Online)
- Tabela com histórico de agendamentos
- Status de pagamento

### 6. **Footer**
- Informações da empresa
- Links de recursos
- Dados de contato

## Design

- **Paleta de cores**: Preto, Branco, Amarelo (#fbbf24), Zinc
- **Responsividade**: Mobile-first com breakpoints MD e XL
- **Efeitos**: Hover transitions, scale effects, blur backgrounds

## Como Usar o Componente

O componente `ArenaGoLayout` é autossuficiente e pode ser importado em qualquer página:

```jsx
import ArenaGoLayout from './components/ArenaGoLayout';

function App() {
  return <ArenaGoLayout />;
}

export default App;
```

## Próximos Passos

- [ ] Conectar a API backend
- [ ] Implementar autenticação
- [ ] Adicionar formulários interativos
- [ ] Integração com sistema de pagamento
- [ ] Gerenciamento de estado com Context API ou Redux

## Autor

Desenvolvido para o Trabalho de Conclusão de Curso (TCC)

## Licença

MIT

## Deploy

O repositório contém dois projetos independentes: `frontend/` (React 18, Vite 7,
React Router 7 com BrowserRouter, Axios e Tailwind) e `backend/` (Express 4,
JavaScript CommonJS, Prisma 7 com adapter MariaDB e MySQL). Os lockfiles de ambos
devem ser mantidos. Use Node **24.11.1** (ou versão compatível 24.x mais recente,
validada antes da publicação). Não existe build TypeScript do backend.

Estado: **PRONTO COM PENDÊNCIAS**. Falta informar a URL real da API e a origem da
Hostinger, configurar e validar o MySQL de produção e revisar o histórico de
migrations se o banco já contiver dados. Nenhum deploy, commit ou push foi feito
durante esta preparação. A branch local é `main`; envie manualmente as alterações
revisadas ao GitHub antes de publicar pelo Render.

### Frontend — Hostinger / Apache

Diretório: `frontend`. Caminho público confirmado: `/tecti/2026/gpec04/`.

```powershell
cd frontend
npm ci
Copy-Item .env.production.example .env.production
```

Preencha `.env.production` (a API deve ser a origem HTTPS real do Render, sem `/api`):

```dotenv
VITE_API_URL=<URL_HTTPS_REAL_DA_API_RENDER>
VITE_PUBLIC_PATH=/tecti/2026/gpec04/
```

Os marcadores entre `< >` são instruções de preenchimento, não valores válidos.
Não coloque tokens, senhas ou DATABASE_URL em variáveis `VITE_*`.
Para desenvolvimento use `.env.development`, copiado de `.env.example`, com
`VITE_API_URL=http://localhost:3000` e `VITE_PUBLIC_PATH=/`.
Evite `.env` genérico no frontend para não reaproveitar configurações locais em produção.

```powershell
npm test
npm run build
npm run preview
```

A build exige caminho explícito e API HTTPS pública. O Vite usa `VITE_PUBLIC_PATH`
como `base`; BrowserRouter usa `import.meta.env.BASE_URL` como `basename`, e o
redirecionamento após 401 respeita esse mesmo caminho. A build gera automaticamente
`dist/.htaccess`, `dist/index.html` e `dist/assets/`. Em produção, JavaScript e CSS
devem começar com `/tecti/2026/gpec04/assets/`.

O `.htaccess` gerado contém:

```apache
Options -MultiViews
DirectoryIndex index.html
RewriteEngine On
RewriteBase /tecti/2026/gpec04/
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

O Apache precisa permitir `.htaccess`, `mod_rewrite` e as diretivas acima. O arquivo
preserva arquivos/diretórios existentes e usa `index.html` para rotas da SPA.
O preview do Vite não executa regras Apache: valide o fallback novamente na Hostinger.

> Transfira o CONTEÚDO da pasta `dist` para a pasta correspondente ao projeto no servidor Apache.

No FileZilla, abra localmente `frontend/dist/` e envie `index.html`, `assets/` e
`.htaccess` (inclua arquivos ocultos) para o diretório que atende
`/tecti/2026/gpec04/`, sob a raiz pública do domínio. Não crie uma subpasta `dist`
no destino. Não envie `.env*`, `node_modules`, código fonte, backend ou `.git`.
Não é necessário executar Node no Apache. Variáveis Vite são incorporadas durante
o build; editar `.env.production` depois do upload não altera a aplicação.

Teste na origem real da Hostinger: `/tecti/2026/gpec04/`,
`/tecti/2026/gpec04/login`, `/tecti/2026/gpec04/cadastro` e, autenticado,
`/tecti/2026/gpec04/perfil`, inclusive atualizando a página diretamente na rota.

### Backend — Render

Configure manualmente no painel, após enviar ao GitHub as alterações revisadas:

```text
Service Type: Web Service
Repository: https://github.com/pepeoorrr/TCC-ARENAGO
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm ci --include=dev && npm run prisma:generate
Start Command: npm start
Health Check Path: /health
Auto Deploy: desabilitado inicialmente; habilitar após validar migrations e integração
```

Variáveis do serviço:

```dotenv
NODE_ENV=production
DATABASE_URL=<URL_MYSQL_DE_PRODUCAO>
JWT_SECRET=<SEGREDO_ALEATORIO_EXCLUSIVO>
FRONTEND_URL=<ORIGEM_HTTPS_REAL_DA_HOSTINGER>
```

`FRONTEND_URL` deve conter protocolo e domínio (e porta, se houver). CORS trabalha
com origem, não com subpasta; se for informada uma URL com caminho, o backend extrai
a origem. Produção exige HTTPS. O acesso usa JWT Bearer no cabeçalho Authorization.
Não use `*`. Não crie `PORT` manualmente: o Render fornece a porta, e o servidor
escuta em `0.0.0.0`. Em desenvolvimento a porta padrão é 3000.

O arquivo `backend/.node-version` seleciona Node 24.11.1. O Prisma CLI está em
devDependencies: `--include=dev` garante sua presença durante a geração e eventual
execução manual das migrations. `npm start` usa `node src/server.js`, sem nodemon.
Não aplique migrations no Build Command ou no Start Command.

Gere um segredo localmente (guarde o resultado somente no ambiente seguro):

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Após publicar, teste `GET <URL_REAL_DA_API>/health`: deve responder
`{"status":"ok"}`. Essa rota confirma que o processo está vivo, não a conexão com
MySQL. Confirme banco por login e leitura autenticada, verificando logs do Render.

### Banco

Prisma 7 usa `DATABASE_URL` no CLI e no cliente de runtime, que utiliza
`@prisma/adapter-mariadb` e o driver `mariadb`. Não há necessidade de DB_HOST,
DB_USER ou DB_PASSWORD separados. Obtenha host, porta, nome do banco, usuário,
senha e requisitos TLS/CA do provedor. Codifique caracteres especiais de usuário
e senha na URL. Permita conexão externa do Render no firewall do provedor.
Confirme as opções TLS compatíveis tanto com Prisma CLI quanto com o driver
MariaDB; não desative validação de certificados para contornar falhas.

Há três migrations versionadas:

- `20260603110341_init`: estrutura inicial.
- `20260910131927_bd_fix`: remove tabelas antigas e cria o novo esquema; perde
  dados dessas tabelas se elas estiverem populadas.
- `20261009120000_estabelecimentos_comandas`: adiciona vínculos obrigatórios com
  estabelecimentos e remove o perfil FUNCIONARIO; exige adaptação prévia em base
  existente com dados. O fluxo atual foi concebido para base nova sem dados.

**Banco já populado: pare antes de migrate deploy.** Faça backup verificado e
planeje conversão/cópia dos dados e vínculos em uma cópia de homologação. Não altere
migrations já aplicadas nem marque migrations como resolvidas sem análise.
Não execute reset. As migrations históricas foram preservadas nesta auditoria.

Para banco novo vazio, ou banco existente cuja atualização tenha sido validada,
execute manualmente de ambiente confiável com DATABASE_URL apontando para a base
correta (terminal local ou Shell do Render, se disponível):

```powershell
cd backend
npm ci --include=dev
npm run prisma:generate
npx prisma validate
npm run prisma:status
# Somente após revisar o destino e os riscos acima:
npm run prisma:deploy
npm run prisma:status
```

`prisma:deploy` equivale a `prisma migrate deploy`; `prisma:status` pode retornar
código não zero quando houver migrations pendentes. Execute a migration antes
de liberar o tráfego de usuários. Os comandos não foram executados no banco de
produção durante esta auditoria. A credencial de migração precisa das permissões
DDL; a credencial de runtime deve ter apenas as permissões necessárias ao aplicativo.

Existe seed manual para o primeiro admin. Configure temporariamente ADMIN_EMAIL,
ADMIN_PASSWORD (mínimo 8 caracteres) e opcionalmente ADMIN_NAME no ambiente que
executará o seed. Execute `npm run prisma:seed` e remova essas variáveis depois.
O seed usa bcrypt e não altera usuários se já houver administrador.

### Validação local e sequência operacional

1. Use Node 24.11.1. Preserve os `.env` existentes; copie os exemplos somente se
   o destino ainda não existir. Backend: `.env` com DATABASE_URL local, JWT_SECRET,
   NODE_ENV=development, PORT=3000 e FRONTEND_URL=http://localhost:5173.
2. Frontend: `.env.development` com os valores locais acima. Em `backend`, execute
   `npm install`, `npm run prisma:generate`, `npx prisma validate`,
   `npm run prisma:status`, `npm test` e `npm start`. Aplique migrations somente
   após a revisão do banco. Verifique `http://localhost:3000/health`.
3. Em outro terminal, na pasta `frontend`, execute `npm install`, `npm test` e
   `npm run dev`. Teste login, perfil e os fluxos permitidos para cada perfil.
4. Prepare o MySQL de produção, valide migrações e execute seed se necessário.
   Configure o Render conforme acima; faça o deploy manual somente depois que
   as alterações revisadas estiverem no GitHub. Obtenha a URL pública e teste a API.
5. Preencha `.env.production` com essa URL e o caminho confirmado, gere uma nova
   build, confira preview e transfira o conteúdo da dist pelo FileZilla.
6. Abra o frontend, confira CSS/JS no Network, navegue e atualize uma rota interna.
   Faça login como administrador e confira perfil e dashboard. Crie um proprietário
   e um estabelecimento de teste, confira listagem/edição, cadastre categoria,
   produto e quadra como gestor, crie uma reserva como cliente e confira a comanda.
   Teste desativação/cancelamento apenas em registros de teste e conforme as regras.
   Confira Console, Network, CORS e logs do Render. Só então habilite Auto Deploy,
   mantendo a revisão e aplicação manual de migrations em versões futuras.

### Evidências e limites desta auditoria

- `npm install` passou em ambos os projetos; lockfiles sincronizados.
- 15 testes frontend e 22 testes backend passaram; inclui preflight CORS e health.
- Prisma Client 7.10.1 gerado e schema validado. Nenhuma migration foi aplicada.
- Dependências corrigidas por auditoria npm: bcrypt 6, Vite 7, plugin React 5,
  Vitest 5 e atualizações compatíveis nos lockfiles. Testes repetidos após as mudanças.
  Frontend: auditoria completa sem alertas. Backend: `npm audit --omit=dev` sem
  alertas; auditoria completa ainda aponta três alertas altos em
  nodemon/chokidar/braces, restritos à ferramenta de desenvolvimento. Não execute
  nodemon em produção nem use `npm audit fix --force` indiscriminadamente.
- Build gerada para `/tecti/2026/gpec04/`; index, CSS, JS e `.htaccess` conferidos.
- Preview respondeu 200 para início, login, perfil e assets. Não substitui teste
  em Apache nem validação visual/Console num navegador real.
- `npm start` validado em produção com PORT=3107 e variáveis de teste no processo;
  health e CORS validados sem depender de banco disponível.
- Com banco indisponível, login retorna 500 com mensagem genérica; detalhes ficam
  no log do servidor. Isso não valida uma conexão bem-sucedida ao MySQL externo.
- Não foram identificadas divergências de caixa nos imports locais examinados.
  A execução foi no Windows/Node 24.11.1; Linux e MySQL externo ainda exigem teste.
- Arquivos `.env` reais não estão no índice Git; a busca por nomes no histórico
  encontrou apenas exemplos. As URLs com senha encontradas em documentação são
  exemplos locais. Nenhuma credencial real foi identificada na inspeção realizada;
  isso não equivale a uma certificação de todo o histórico. Se qualquer exemplo
  tiver sido reutilizado como senha real, substitua-o antes da publicação.
- A dist desta auditoria usa API reservada de teste `https://api.invalid`: **não
  envie essa build**. Regere-a com a URL real do Render antes de usar o FileZilla.

Referências: [Render Web Services](https://render.com/docs/web-services),
[Render monorepos](https://render.com/docs/monorepo-support),
[Prisma requisitos](https://docs.prisma.io/docs/orm/reference/system-requirements),
[Apache mod_rewrite](https://httpd.apache.org/docs/2.4/mod/mod_rewrite.html).
