# 📊 Relatório de Análise do Projeto

## 1. 🏗️ Identificação e visão geral

- **Nome do projeto:** ArenaGo
- **Objetivo identificado:** Plataforma de gerenciamento e agendamento de quadras esportivas de areia, com interface para reservas e painel administrativo.
- **Problema que o sistema pretende resolver:** Facilitar a busca, reserva e gestão de quadras esportivas, incluindo controle de horários, histórico de agendamentos, comandas e produtos.
- **Funcionalidades do MVP descritas:**
  - Busca de quadras por cidade, modalidade e data.
  - Reserva de quadras.
  - Favoritos.
  - Histórico de reservas.
  - Painel administrativo com dados de reservas, faturamento, quadras e usuários.
  - Controle de comandas e produtos indicado pela modelagem do banco.
- **Tecnologias principais:**
  - React
  - Vite
  - Tailwind CSS
  - Node.js
  - Express
  - Prisma ORM
  - MySQL/MariaDB
- **Linguagens utilizadas:**
  - JavaScript/JSX
  - SQL
  - TypeScript em arquivo de configuração do Prisma

### Evidências consultadas

- `README.md` — apresenta o nome ArenaGo, objetivo geral, tecnologias, estrutura e funcionalidades previstas para o frontend.
- `frontend/package.json` — identifica o projeto frontend `arenago`, com React, Vite e Tailwind.
- `backend/package.json` — identifica backend Node.js com Express, Prisma e adapter MariaDB.
- `backend/prisma/schema.prisma` — define models para usuários, quadras, reservas, comandas, produtos e itens de comanda.
- `frontend/src/components/ArenaGoLayout.jsx` — contém a tela principal com busca, cards de quadras, favoritos, reservas em memória e painel administrativo.

## 2. 📂 Organização do repositório

```text
TCC-ARENAGO/
├── README.md
├── PROMPT_ANALISE_REPOSITORIO_AV2_PIS.md
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── prisma.config.ts
│   ├── config/
│   │   └── prisma.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │       ├── migration_lock.toml
│   │       └── 20260603110341_init/
│   │           └── migration.sql
│   └── src/
│       └── server.js
└── frontend/
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.css
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        └── components/
            └── ArenaGoLayout.jsx
```

### Responsabilidade das pastas

- `backend` — servidor Node.js/Express, configuração do Prisma e modelagem/migrations do banco.
- `backend/src` — ponto de entrada do servidor Express.
- `backend/config` — configuração de inicialização do Prisma Client.
- `backend/prisma` — schema Prisma e migrations.
- `frontend` — aplicação React criada com Vite.
- `frontend/src` — componentes, estilos e ponto de entrada do React.

### Análise da organização

- Separação entre frontend e backend: **adequada**, pois há pastas separadas para `frontend` e `backend`.
- Nomes de pastas e arquivos: **parcialmente adequados**. A separação principal é clara, mas o backend ainda não possui organização por rotas, controllers, services ou middlewares.
- Arquivos de configuração: **parcialmente adequados**. Existem `package.json`, `vite.config.js`, `prisma.config.ts`, `.env.example` e `.gitignore`. Não foi identificado `tailwind.config.js`, embora o Tailwind esteja integrado pelo plugin `@tailwindcss/vite`.
- Organização mínima do projeto: **atende parcialmente**, com frontend e backend iniciados, mas backend ainda concentrado em um único arquivo de servidor.

## 3. 📘 README e documentação inicial

**Localização:** `README.md`

| Item esperado | Situação | Evidência |
|---|---|---|
| Nome do projeto | Atende | `README.md` — título “ArenaGo - Plataforma de Agendamento de Quadras Esportivas” |
| Problema que o sistema resolve | Parcial | `README.md` — descreve agendamento e gerenciamento de quadras, mas não apresenta uma seção específica de problema |
| Objetivo do projeto | Parcial | `README.md` — descreve a aplicação como plataforma de gerenciamento e agendamento |
| Funcionalidades do MVP | Parcial | `README.md` — lista funcionalidades da interface, mas mistura funcionalidades implementadas visualmente com próximos passos |
| Tecnologias utilizadas | Atende | `README.md` — React, Vite, Tailwind CSS e JavaScript/JSX |
| Instruções para execução local | Parcial | `README.md` — informa `npm install`, `npm run dev` e `npm run build`, mas não diferencia frontend e backend nem descreve variáveis de ambiente do backend |
| Divisão entre frontend, backend e banco | Não atende | `README.md` — estrutura documentada parece apenas do frontend e não descreve `backend` ou Prisma |

### Histórico de commits e participação

- Histórico disponível para análise: **Sim**
- Participação dos integrantes identificável: **Parcial**
- Evidências: `git log` local apresenta dois commits, um por `Pedro Oliveira Rios Ramalho` e outro por `hfcosta`. Isso indica participação no histórico, mas não comprova divisão formal de tarefas do grupo.

> Não foi atribuída autoria individual de funcionalidades além do que aparece nas mensagens de commit.

### Professor como colaborador

**Situação:** NÃO VERIFICÁVEL PELO REPOSITÓRIO

## 4. ⚙️ Backend

- **Localização:** `backend`
- **Linguagem:** JavaScript
- **Framework principal:** Express
- **Arquivo de inicialização:** `backend/src/server.js`
- **Servidor configurado:** Sim

### Estrutura identificada

- `backend/src/server.js` — inicializa Express, aplica `express.json()`, define rotas `/` e `/health`, inicia servidor na porta 3000 e testa conexão com banco.
- `backend/config/prisma.js` — configura Prisma Client usando adapter MariaDB e variáveis de ambiente.
- `backend/prisma/schema.prisma` — define datasource, generator, enums e models.
- `backend/prisma/migrations/20260603110341_init/migration.sql` — migration SQL inicial.

### Organização interna

- Rotas: **parcial**, existem apenas rotas diretamente em `server.js`.
- Controllers: **NÃO IDENTIFICADO**.
- Services: **NÃO IDENTIFICADO**.
- Middlewares: **parcial**, apenas `express.json()` foi identificado.
- Configuração do banco: **identificada** em `backend/config/prisma.js` e `backend/prisma.config.ts`.
- Validações: **NÃO IDENTIFICADO**.
- Tratamento de erros: **parcial**, apenas na conexão inicial e na rota `/health`.

### Funcionalidades implementadas

- Servidor Express com rota raiz informativa — Evidência: `backend/src/server.js`.
- Health check com consulta simples ao banco via Prisma — Evidência: `backend/src/server.js`.
- Configuração do Prisma Client com adapter MariaDB — Evidência: `backend/config/prisma.js`.

### Fluxo das requisições

```text
GET /health → rota em server.js → prisma.$queryRaw SELECT 1 → banco de dados → resposta JSON
```

O fluxo existe apenas para verificação de saúde da API. Não foram identificadas rotas de domínio para usuários, quadras, reservas, comandas ou produtos. Portanto, o fluxo completo para funcionalidades do MVP é interrompido na ausência de rotas/controllers específicos.

## 5. 🗄️ Banco de dados e Prisma ORM

- **Tipo de banco:** MySQL/MariaDB
- **ORM:** Prisma
- **Configuração principal:** `backend/config/prisma.js` e `backend/prisma.config.ts`
- **Schema Prisma:** `backend/prisma/schema.prisma`
- **Migrations:** Sim
- **Localização das migrations:** `backend/prisma/migrations`

### Models ou entidades identificadas

- `Usuario` — usuários do sistema; campos principais: `id`, `email`, `senhaHash`, `perfil`, `ativo`, datas de criação/atualização.
- `Quadra` — quadras disponíveis; campos principais: `id`, `nome`, `tipo`, `valorHora`, `ativa`.
- `Reserva` — agendamentos; campos principais: cliente, quadra, data, horários, duração e status.
- `Comanda` — consumo vinculado opcionalmente a reserva e cliente; campos principais: status, total, datas.
- `Produto` — produtos vendidos; campos principais: nome, preço, estoque e status.
- `ComandaItem` — itens de comanda; campos principais: comanda, produto, quantidade, preço unitário e subtotal.

### Modelagem

| Elemento | Situação | Evidência |
|---|---|---|
| Models principais definidos | Atende | `backend/prisma/schema.prisma` |
| Chaves primárias | Atende | `backend/prisma/schema.prisma` — todos os models possuem `@id` |
| Chaves estrangeiras e relações | Atende | `backend/prisma/schema.prisma` e `backend/prisma/migrations/20260603110341_init/migration.sql` |
| Campos coerentes com o domínio | Atende | `backend/prisma/schema.prisma` — usuários, quadras, reservas, comandas e produtos |
| Prisma Client utilizado no backend | Atende | `backend/config/prisma.js` e `backend/src/server.js` |
| Operação real de banco em rota/controller | Parcial | `backend/src/server.js` — apenas health check com consulta simples, sem operação de domínio |

### Operações Prisma encontradas

- `findMany`, `findUnique` ou equivalente: **NÃO IDENTIFICADO**.
- `create`: **NÃO IDENTIFICADO**.
- `update`: **NÃO IDENTIFICADO**.
- `delete`: **NÃO IDENTIFICADO**.
- Outras operações: `prisma.$connect()` e `prisma.$queryRaw` em `backend/src/server.js`.

### Banco no servidor de produção

A existência de `.env`, `.env.example`, `prisma.config.ts`, schema e migration indica preparação para conexão com banco, mas não comprova criação efetiva do banco em servidor de produção.

**Situação:** PARCIALMENTE EVIDENCIADO

Não foi exposto conteúdo de variáveis sensíveis.

## 6. 🌐 Rotas da API e arquivo do Insomnia

### Rotas encontradas no backend

| Método | Endpoint | Arquivo | Operação realizada | Usa Prisma |
|---|---|---|---|---|
| GET | `/` | `backend/src/server.js` | Retorna mensagem textual informando que a API está online | Não |
| GET | `/health` | `backend/src/server.js` | Verifica conexão com banco e retorna status em JSON | Sim |

### Adequação das rotas

- Uso adequado dos métodos HTTP: **parcial**, pois `GET` é adequado para raiz e health check, mas não há rotas do domínio.
- Organização por funcionalidade: **não atende**, as rotas estão diretamente no arquivo `server.js` e não há módulos por recurso.
- Clareza dos nomes: **parcial**, `/health` é claro, mas não representa funcionalidades do MVP.
- Existência de parâmetros: **NÃO IDENTIFICADO**.
- Recebimento de JSON: **parcial**, `express.json()` está configurado, mas não há rotas que recebam corpo JSON.
- Respostas em JSON: **parcial**, `/health` responde JSON; `/` responde texto.
- Relação com funcionalidades essenciais do MVP: **não atende**, não há endpoints para quadras, reservas, usuários, comandas ou produtos.

### Arquivo exportado do Insomnia

- **Arquivo encontrado:** NÃO IDENTIFICADO
- **Formato:** NÃO IDENTIFICADO
- **Rotas organizadas por funcionalidade:** Não
- **Nomes claros nas requisições:** Não
- **Exemplos de corpo JSON:** Não
- **Parâmetros e variáveis configurados:** Não
- **Compatibilidade com as rotas do backend:** Não

Não foi encontrado arquivo exportado do Insomnia no repositório analisado.

## 7. 🎨 Frontend

- **Localização:** `frontend`
- **Framework:** React
- **Linguagem:** JavaScript/JSX
- **Ferramenta de criação/build:** Vite
- **Tailwind CSS:** Configurado e utilizado
- **Roteamento:** NÃO IDENTIFICADO

### Arquivos principais

- `frontend/src/main.jsx` — ponto de entrada do React.
- `frontend/src/App.jsx` — renderiza o componente principal `ArenaGoLayout`.
- `frontend/src/components/ArenaGoLayout.jsx` — tela principal do sistema.
- `frontend/src/index.css` — importa Tailwind e define estilos globais.
- `frontend/vite.config.js` — configura Vite com React e plugin Tailwind.

### Páginas e componentes

- `ArenaGoLayout` — componente único com header, hero, busca, listagem estática de quadras, favoritos, reserva em memória, seção de funcionalidades, painel administrativo, histórico e footer.

### Análise do desenvolvimento inicial

| Elemento | Situação | Evidência |
|---|---|---|
| Projeto React iniciado | Atende | `frontend/package.json`, `frontend/src/main.jsx` |
| Uso de JavaScript | Atende | `frontend/src/App.jsx`, `frontend/src/components/ArenaGoLayout.jsx` |
| Tailwind configurado ou utilizado | Atende | `frontend/vite.config.js`, `frontend/src/index.css`, classes Tailwind em `ArenaGoLayout.jsx` |
| Telas principais iniciadas | Parcial | `ArenaGoLayout.jsx` contém interface inicial, mas em componente único |
| Componentes organizados | Parcial | há pasta `components`, mas apenas um componente concentra toda a tela |
| Navegação entre páginas | Não atende | não foi identificado React Router ou navegação por páginas |
| Tela conectada ou preparada para API | Não atende | não foram identificadas chamadas HTTP, cliente de API ou variáveis de URL base |

O frontend está iniciado e visualmente representa partes do MVP, porém os dados de quadras, reservas, painel e histórico são estáticos ou mantidos apenas em estado local.

## 8. 🔗 Conexão entre frontend e backend

- **Tipo de comunicação:** NÃO IDENTIFICADO
- **Cliente HTTP:** NÃO IDENTIFICADO
- **Arquivo de configuração da API:** NÃO IDENTIFICADO
- **URL base:** NÃO IDENTIFICADO
- **Variáveis de ambiente:** `backend/.env` e `backend/.env.example`; não foram identificadas variáveis de ambiente no frontend.
- **CORS no backend:** Ausente
- **Proxy no frontend:** Ausente

### Endpoints consumidos pelo frontend

| Endpoint | Método | Componente ou página | Finalidade | Compatível com o backend |
|---|---|---|---|---|
| NÃO IDENTIFICADO | NÃO IDENTIFICADO | NÃO IDENTIFICADO | NÃO IDENTIFICADO | Não |

### Fluxos comprovados

- NÃO IDENTIFICADO fluxo de tela consumindo rota GET do backend.
- NÃO IDENTIFICADO fluxo de formulário enviando dados para rota POST do backend.
- As ações de favoritos e reservas ocorrem em estado local no componente `ArenaGoLayout`.

### Estado da integração

**Não atende:** não foi identificada comunicação entre frontend e backend. O README também registra “Conectar a API backend” como próximo passo, indicando que a integração ainda não foi concluída.

## 9. ✅ O que já está implementado

### Backend

- Servidor Express inicializado em `backend/src/server.js`.
- Middleware `express.json()` configurado.
- Rota raiz `/`.
- Rota `/health` com resposta JSON e consulta simples ao banco via Prisma.
- Teste de conexão com banco ao iniciar o servidor.

### Banco de dados

- Schema Prisma com models, enums, chaves primárias, relações e índices.
- Migration SQL inicial para criação das tabelas.
- Configuração de datasource MySQL e adapter MariaDB.

### Frontend

- Projeto React com Vite iniciado.
- Tailwind configurado via plugin do Vite e importado em `index.css`.
- Interface principal com header, busca, quadras em destaque, favoritos, reserva em memória, painel administrativo, histórico e footer.

### Integração

- Backend utiliza Prisma para health check.
- NÃO IDENTIFICADO integração entre frontend e backend.

## 10. 🚧 O que está incompleto ou em desenvolvimento

- Arquivo exportado do Insomnia não encontrado.
  - **Evidência:** listagem de arquivos do repositório não contém arquivo Insomnia.
  - **Estado observado:** entrega não identificada.

- Rotas de domínio do backend não encontradas.
  - **Evidência:** `backend/src/server.js`.
  - **Estado observado:** existem apenas `/` e `/health`; não há endpoints para usuários, quadras, reservas, comandas ou produtos.

- Backend sem controllers, services e validações.
  - **Evidência:** estrutura de arquivos em `backend`.
  - **Estado observado:** lógica concentrada no arquivo `server.js`.

- Operações CRUD com Prisma não encontradas.
  - **Evidência:** busca nos arquivos `backend` e conteúdo de `backend/src/server.js`.
  - **Estado observado:** Prisma é usado apenas para conexão e consulta simples de saúde.

- Integração frontend-backend não encontrada.
  - **Evidência:** `frontend/src/components/ArenaGoLayout.jsx` e busca por `fetch`/`axios`.
  - **Estado observado:** reservas e favoritos funcionam apenas em estado local.

- README não documenta backend, banco e execução separada por camada.
  - **Evidência:** `README.md`.
  - **Estado observado:** documentação descreve majoritariamente o frontend.

## 11. 📦 Dependências principais

### Backend

| Dependência | Versão | Finalidade identificada |
|---|---:|---|
| `express` | `^5.2.1` | Servidor HTTP e rotas |
| `@prisma/client` | `^7.8.0` | Prisma Client |
| `@prisma/adapter-mariadb` | `^7.8.0` | Adapter MariaDB para Prisma |
| `dotenv` | `^17.4.2` | Carregamento de variáveis de ambiente |
| `prisma` | `^7.8.0` | CLI/configuração Prisma em desenvolvimento |
| `nodemon` | `^3.1.14` | Execução do servidor em modo desenvolvimento |

### Frontend

| Dependência | Versão | Finalidade identificada |
|---|---:|---|
| `react` | `^18.2.0` | Biblioteca de interface |
| `react-dom` | `^18.2.0` | Renderização React no DOM |
| `tailwindcss` | `^4.3.0` | Estilização utilitária |
| `@tailwindcss/vite` | `^4.3.0` | Integração Tailwind com Vite |
| `@vitejs/plugin-react` | `^4.2.1` | Plugin React para Vite |
| `vite` | `^5.0.8` | Build tool e dev server |
| `autoprefixer` | `^10.4.16` | Pós-processamento CSS |
| `postcss` | `^8.4.31` | Pipeline CSS |
| `@types/react` | `^18.2.43` | Tipos TypeScript para React em desenvolvimento |
| `@types/react-dom` | `^18.2.17` | Tipos TypeScript para React DOM em desenvolvimento |

## 12. 🧭 Arquitetura e padrões identificados

- **Arquitetura predominante:** estrutura simples separada por frontend/backend.
- **Separação de responsabilidades:** parcial. A separação entre camadas existe no nível de pastas, mas o backend ainda não está dividido internamente por rotas, controllers e services; o frontend concentra a interface em um único componente.
- **Padrões identificados:** React funcional com hooks (`useState`), Express com rotas diretas, Prisma Client isolado em arquivo de configuração.
- **Consistência entre os módulos:** parcial. O banco modela entidades coerentes com o domínio, mas as rotas do backend e a interface do frontend ainda não consomem essas entidades.

# 13. 📝 Avaliação conforme os critérios da AV2

## Regras de pontuação

A pontuação abaixo considera apenas evidências encontradas no repositório. Itens dependentes de apresentação, acesso ao GitHub remoto, banco de produção ou confirmação externa foram marcados como não verificáveis quando aplicável.

## Quadro avaliativo

| Critério | Valor máximo | Nota atribuída | Evidências e justificativa |
|---|---:|---:|---|
| Organização do repositório, README e professor como colaborador | 1,5 | 0,9 | Repositório separado em `frontend` e `backend`, com README existente. README documenta principalmente frontend e não descreve backend/banco. Professor como colaborador é NÃO VERIFICÁVEL PELO REPOSITÓRIO. |
| Banco de dados criado e coerente com o MVP | 2,0 | 1,6 | `schema.prisma` e migration definem entidades coerentes com reservas de quadras, usuários, comandas e produtos. Criação em servidor de produção é NÃO VERIFICÁVEL PELO REPOSITÓRIO. |
| Arquivo exportado do Insomnia com as rotas organizadas | 1,5 | 0,0 | Arquivo exportado do Insomnia não identificado. |
| Backend iniciado com integração ao banco usando Prisma ORM | 2,0 | 1,1 | Express e Prisma configurados, com `/health` usando `prisma.$queryRaw`. Não há rotas de domínio nem operações CRUD com Prisma. |
| Frontend iniciado em React, JavaScript e Tailwind | 1,5 | 1,3 | React, Vite, JavaScript/JSX e Tailwind estão configurados e usados. Interface inicial existe, mas concentrada em um componente e sem API. |
| Conexão inicial entre frontend e backend | 1,0 | 0,0 | Não foram encontradas chamadas HTTP, cliente de API, CORS ou proxy. README indica conexão com API como próximo passo. |
| Clareza na apresentação e divisão de tarefas do grupo | 0,5 | 0,2 | Histórico local mostra commits de dois autores, mas não há documentação de divisão de tarefas; apresentação é NÃO VERIFICÁVEL PELO REPOSITÓRIO. |
| **Total verificável no repositório** | **10,0** | **5,1** | Soma das notas atribuídas com base nas evidências disponíveis. |

### Observação sobre o total

- **Pontuação obtida nos itens verificáveis:** 5,1
- **Pontos dependentes de apresentação ou verificação externa:** parte de organização/professor colaborador, banco de produção e apresentação/divisão formal de tarefas.
- **Nota máxima que pode ser confirmada apenas pelo repositório:** inferior a 10,0, pois professor como colaborador, banco de produção e apresentação oral não podem ser confirmados somente pelos arquivos locais.

Não foi transformado automaticamente em nota zero aquilo que depende exclusivamente de verificação externa, exceto entregáveis ausentes no próprio repositório, como o arquivo do Insomnia e a integração frontend-backend.

## 14. 📌 Síntese por critério

### 14.1 Organização do repositório e README — máximo 1,5

- **Situação:** Parcial
- **Evidências:** `README.md`, `frontend`, `backend`
- **Aspectos comprovados:** separação entre frontend e backend; README com nome, tecnologias e funcionalidades visuais.
- **Aspectos ausentes:** documentação do backend, banco, Prisma, variáveis de ambiente e execução por camada.
- **Aspectos não verificáveis:** professor como colaborador.
- **Nota sugerida:** 0,9/1,5

### 14.2 Banco de dados e coerência com o MVP — máximo 2,0

- **Situação:** Parcial
- **Evidências:** `backend/prisma/schema.prisma`, `backend/prisma/migrations/20260603110341_init/migration.sql`, `backend/prisma/migrations/migration_lock.toml`
- **Models/tabelas principais:** usuários, quadras, reservas, comandas, produtos e itens de comanda.
- **Coerência com o MVP:** boa aderência ao domínio de reserva de quadras e gestão administrativa.
- **Criação no servidor de produção:** Não verificável.
- **Nota sugerida:** 1,6/2,0

### 14.3 Insomnia e organização das rotas — máximo 1,5

- **Situação:** Não atende
- **Evidências:** listagem de arquivos do repositório.
- **Organização das requisições:** NÃO IDENTIFICADO.
- **Compatibilidade com o backend:** NÃO IDENTIFICADO.
- **Nota sugerida:** 0,0/1,5

### 14.4 Backend com Prisma ORM — máximo 2,0

- **Situação:** Parcial
- **Evidências:** `backend/src/server.js`, `backend/config/prisma.js`, `backend/package.json`
- **Servidor Node.js/Express:** iniciado e configurado.
- **Prisma configurado:** sim, com adapter MariaDB e variáveis de ambiente.
- **Operação no banco:** apenas consulta simples de health check.
- **Resposta em JSON:** rota `/health` responde JSON.
- **Nota sugerida:** 1,1/2,0

### 14.5 Frontend com React, JavaScript e Tailwind — máximo 1,5

- **Situação:** Atende parcialmente
- **Evidências:** `frontend/package.json`, `frontend/vite.config.js`, `frontend/src/index.css`, `frontend/src/components/ArenaGoLayout.jsx`
- **React iniciado:** sim.
- **JavaScript:** sim, com arquivos `.jsx`.
- **Tailwind:** configurado e utilizado.
- **Telas e componentes:** tela principal iniciada, mas em componente único e com dados locais.
- **Nota sugerida:** 1,3/1,5

### 14.6 Conexão frontend-backend — máximo 1,0

- **Situação:** Não atende
- **Evidências:** `frontend/src/components/ArenaGoLayout.jsx`, busca por chamadas HTTP, `README.md`
- **Fluxo identificado:** NÃO IDENTIFICADO.
- **Compatibilidade das rotas e dados:** não aplicável, pois o frontend não consome endpoints.
- **Nota sugerida:** 0,0/1,0

### 14.7 Apresentação e divisão de tarefas — máximo 0,5

- **Situação:** Parcialmente comprovável
- **Evidências no repositório:** histórico local de commits com dois autores; documentação de divisão de tarefas NÃO IDENTIFICADA.
- **O que precisa ser verificado na apresentação:** participação efetiva dos integrantes, divisão de responsabilidades e entendimento técnico das partes implementadas.
- **Nota sugerida:** 0,2/0,5

## 15. 🔍 Pontos para verificação durante a apresentação

- Verificar se o grupo consegue demonstrar a rota `/health` conectando ao banco configurado.
- Verificar se o banco de produção ou ambiente externo foi realmente criado, pois isso não é comprovável pelos arquivos locais.
- Verificar por que as entidades do Prisma ainda não possuem rotas de domínio no backend.
- Verificar se existe arquivo do Insomnia fora do repositório e se ele corresponde às rotas reais.
- Verificar como o frontend pretende consumir as rotas do backend, já que não há chamadas HTTP no código atual.
- Verificar se favoritos e reservas exibidos no frontend são apenas estado local ou se há persistência planejada.
- Verificar a divisão de tarefas entre os integrantes, pois o repositório mostra commits, mas não documenta responsabilidades.
- Verificar se o professor está como colaborador no repositório remoto, pois essa informação não está disponível nos arquivos locais.

## 16. 📋 Conclusão

O projeto apresenta uma estrutura inicial clara, com frontend e backend separados. O frontend está iniciado com React, JavaScript, Vite e Tailwind, contendo uma interface visual para busca, reserva em memória, favoritos, histórico e painel administrativo. O backend está iniciado com Express e Prisma, possui health check e configuração de conexão com MySQL/MariaDB.

A modelagem do banco é a parte mais completa do projeto neste momento: há schema Prisma e migration com entidades coerentes com o domínio de agendamento de quadras, usuários, reservas, comandas e produtos. Porém, essas entidades ainda não aparecem integradas a rotas reais de domínio no backend.

Os principais entregáveis não encontrados ou incompletos são o arquivo exportado do Insomnia, rotas organizadas da API para as funcionalidades do MVP, operações CRUD com Prisma e conexão entre frontend e backend. O README existe e é útil para o frontend, mas não documenta adequadamente backend, banco, Prisma ou execução completa do projeto.

Com base apenas nas evidências disponíveis no repositório, a nota sugerida é **5,1/10,0**, com ressalva de que itens como professor colaborador, banco em produção e apresentação/divisão de tarefas dependem de verificação externa.
