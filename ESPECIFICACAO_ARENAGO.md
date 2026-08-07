# ESPECIFICAÇÃO DO ARENAGO
**Sistema de Gerenciamento de Centros Esportivos**

---

## 1. ESCOPO DO SISTEMA

### O QUE O ARENAGO FAZ:

ArenaGo é um sistema web de gerenciamento integrado para centros esportivos que automatiza:

- **Cadastro e autenticação de usuários** com diferentes perfis e permissões
- **Gerenciamento de quadras** (futsal, vôlei, basquete, tênis, etc.)
- **Sistema de reservas** com calendário visual e bloqueio automático de horários
- **Geração automática de comandas** vinculadas às reservas
- **Registro de consumo** de produtos (bebidas, lanches, equipamentos)
- **Controle de estoque** básico de produtos
- **Fechamento de comandas** com cálculo de valores
- **Painel administrativo** com relatórios, gráficos e controles
- **Gestão de funcionários** com permissões granulares
- **Histórico completo** de reservas, consumos e movimentações

### O QUE O ARENAGO NÃO FAZ:

- Processamento de pagamentos online (pagamento é registrado manualmente)
- Integração com sistemas externos de pagamento
- Sistema de agendamento automático (cliente escolhe manualmente)
- Inteligência artificial ou machine learning
- Reconhecimento facial ou biometria
- IoT (sensores inteligentes)
- Blockchain
- Integração com redes sociais
- Análise preditiva
- Geolocalização
- Notificações via SMS ou push
- Aplicativo mobile (apenas web)
- Integração com fornecedores
- Sistema de assinatura recorrente

---

## 2. PERFIS DE USUÁRIOS

### 2.1 ADMINISTRADOR

**Descrição:** Proprietário ou gerente principal do centro esportivo.

**Permissões:**
- CRUD completo de usuários (criar, visualizar, editar, deletar)
- CRUD completo de quadras
- CRUD completo de produtos e categorias
- Visualizar e gerenciar todas as reservas
- Cancelar reservas sem restrições
- Visualizar e gerenciar todas as comandas
- Alterar status de comandas (aberta, fechada, paga)
- Registrar pagamentos manuais
- Acessar painel administrativo completo
- Gerar relatórios personalizados
- Visualizar dashboard com indicadores
- Configurar preços de produtos
- Configurar horários de funcionamento
- Editar dados da empresa

**Ações principais:**
- Monitorar receitas
- Analisar ocupação das quadras
- Controlar funcionários
- Gerar relatórios de desempenho
- Configurar sistema

### 2.2 FUNCIONÁRIO

**Descrição:** Atendente ou gerente de quadras que opera o dia a dia.

**Permissões:**
- Visualizar todas as reservas do dia
- Criar reservas manualmente (se autorizado)
- Visualizar apenas comandas abertas
- Adicionar consumo às comandas
- Visualizar produtos disponíveis
- Buscar clientes
- Editar próprio perfil

**Restrições:**
- Não pode deletar reservas
- Não pode cancelar reservas (apenas admin pode)
- Não pode criar usuários
- Não pode acessar relatórios completos
- Não pode visualizar dados financeiros
- Não pode alterar preços

**Ações principais:**
- Registrar chegada do cliente
- Adicionar bebidas e lanches ao consumo
- Fechar comanda (apenas redireciona para o admin)
- Fornecer informações sobre disponibilidade

### 2.3 CLIENTE

**Descrição:** Usuário que aluga as quadras.

**Permissões:**
- Editar próprio perfil
- Visualizar quadras disponíveis
- Fazer reservas
- Visualizar suas próprias reservas
- Visualizar suas próprias comandas
- Visualizar histórico de utilizações

**Restrições:**
- Não pode ver reservas de outros clientes
- Não pode acessar dados de outros clientes
- Não pode criar usuários
- Não pode acessar painel administrativo
- Não pode cancelar reservas (apenas admin)

**Ações principais:**
- Verificar disponibilidade
- Fazer reserva
- Visualizar comanda gerada
- Consultar histórico

---

## 3. FUNCIONALIDADES

### 3.1 CADASTRO E AUTENTICAÇÃO

**Objetivo:** Gerenciar acesso ao sistema e dados de usuários.

**Como funciona:**
- Cadastro com email, senha (hash bcrypt), nome, telefone, CPF/CNPJ
- Validação de email único
- Login com email e senha
- Recuperação de senha por email
- Perfil de usuário editável

**Quem utiliza:**
- Todos os usuários

**Fluxo:**
1. Usuário acessa página de cadastro
2. Preenche formulário (email, senha, nome, telefone)
3. Sistema valida dados
4. Cria usuário no banco
5. Usuário recebe confirmação
6. Pode fazer login

---

### 3.2 CADASTRO DE QUADRAS

**Objetivo:** Registrar todas as quadras disponíveis no centro.

**Como funciona:**
- Cadastro com: nome, tipo (futsal, vôlei, basquete, tênis), descrição, capacidade, tamanho
- Cada quadra tem horário de funcionamento (início e fim)
- Cada quadra tem duração padrão de reserva (ex: 1 hora)
- Ativar/desativar quadras

**Quem utiliza:**
- Administrador

**Fluxo:**
1. Admin acessa gerenciamento de quadras
2. Clica em "Nova Quadra"
3. Preenche dados
4. Define horários de funcionamento
5. Salva quadra
6. Quadra fica disponível para reservas

---

### 3.3 CADASTRO DE PRODUTOS E CATEGORIAS

**Objetivo:** Registrar produtos que podem ser consumidos durante a reserva.

**Como funciona:**
- Categorias: Bebidas, Lanches, Equipamentos, Aluguel de acessórios
- Produtos com: nome, descrição, preço, categoria, estoque, ativo/inativo
- Produtos inativos não aparecem para seleção
- Produtos com estoque zerado não podem ser adicionados

**Quem utiliza:**
- Administrador
- Funcionário (apenas visualiza)

**Fluxo:**
1. Admin cria categoria
2. Admin cria produto
3. Funcionário seleciona no momento do consumo

---

### 3.4 AGENDA DE RESERVAS

**Objetivo:** Permitir visualização e gerenciamento de todas as reservas.

**Como funciona:**
- Visualização em lista por data
- Filtros por quadra, data, status
- Cores diferentes para status (confirmada, ativa, encerrada, cancelada)
- Exibição de cliente, horário, quadra

**Quem utiliza:**
- Administrador
- Funcionário
- Cliente (apenas suas reservas)

**Fluxo:**
1. Usuário acessa agenda
2. Seleciona data e quadra
3. Visualiza todas as reservas
4. Pode clicar em reserva para ver detalhes

---

### 3.5 CALENDÁRIO/DISPONIBILIDADE

**Objetivo:** Mostrar visualmente horários disponíveis para reserva.

**Como funciona:**
- Calendário mensal que mostra quadras com disponibilidade
- Ao selecionar uma quadra, mostra grid de horários (dias × horas)
- Horários ocupados em vermelho (bloqueado)
- Horários livres em verde (disponível)
- Horários fora do funcionamento em cinza (fechado)
- Duração configurável de reserva

**Quem utiliza:**
- Cliente
- Funcionário (ao fazer reserva manual)

**Fluxo:**
1. Cliente seleciona quadra
2. Vê calendário de disponibilidade
3. Seleciona data e horário
4. Confirma reserva

---

### 3.6 RESERVA DE QUADRA

**Objetivo:** Permitir que cliente reserve uma quadra.

**Como funciona:**
- Cliente seleciona quadra, data e horário
- Sistema verifica disponibilidade em tempo real
- Cria registro de reserva
- Gera comanda automaticamente
- Envia confirmação
- Estatus inicial: "Confirmada"

**Quem utiliza:**
- Cliente
- Funcionário (pode criar para cliente)

**Fluxo:**
1. Cliente entra no sistema
2. Seleciona quadra
3. Seleciona data
4. Seleciona horário
5. Confirma detalhes
6. Sistema bloqueia horário
7. Gera comanda
8. Exibe confirmação com número da reserva

**Regras:**
- Não pode reservar no passado
- Não pode reservar se quadra está inativa
- Não pode reservar se horário está ocupado
- Uma reserva = uma comanda

---

### 3.7 BLOQUEIO DE HORÁRIOS

**Objetivo:** Garantir que uma quadra não seja reservada duas vezes no mesmo horário.

**Como funciona:**
- Ao confirmar reserva, horário é marcado como ocupado
- Horário bloqueado fica indisponível
- Ao cancelar reserva, horário é liberado
- Funcionário pode bloquear horários manualmente (pausa, manutenção)

**Quem utiliza:**
- Sistema (automático)
- Funcionário (bloqueio manual)

**Fluxo:**
1. Cliente faz reserva para 14:00-15:00
2. Esse período fica bloqueado
3. Outro cliente vê como indisponível
4. Só libera se reserva for cancelada

---

### 3.8 GERAÇÃO DE COMANDAS

**Objetivo:** Criar comanda vinculada à reserva para registro de consumo.

**Como funciona:**
- Comanda criada automaticamente ao confirmar reserva
- Comanda recebe número único (ex: CMD-20260807-001)
- Vinculada a cliente, quadra, data e horário
- Estatus inicial: "Aberta"
- Armazena todos os consumos

**Quem utiliza:**
- Sistema (automático)

**Fluxo:**
1. Reserva confirmada
2. Sistema gera comanda automaticamente
3. Comanda recebe ID único
4. Fica disponível para adicionar consumos

---

### 3.9 REGISTRO DE CONSUMO

**Objetivo:** Rastrear o que cliente consumiu durante a reserva.

**Como funciona:**
- Funcionário seleciona a comanda
- Busca por número da comanda ou nome do cliente
- Seleciona produto
- Insere quantidade
- Valor é calculado automaticamente (preço × quantidade)
- Produto é adicionado à comanda
- Estoque é diminuído (se habilitado)
- Funcionário pode remover item antes de fechar

**Quem utiliza:**
- Funcionário

**Fluxo:**
1. Cliente chega e agenda de reservas mostra sua reserva
2. Funcionário localiza comanda (número ou cliente)
3. Abre comanda
4. Cliente pede 2 refrigerantes
5. Funcionário adiciona "Refrigerante" (quantidade: 2)
6. Sistema calcula: 6,00 × 2 = 12,00
7. Item aparece na comanda
8. Processo se repete a cada consumo

---

### 3.10 FECHAMENTO E PAGAMENTO DE COMANDA

**Objetivo:** Finalizar comanda e registrar pagamento.

**Como funciona:**
- Comanda exibe: cliente, itens, quantidades, preços, total
- Total = aluguel da quadra + todos os consumos
- Funcionário confirma fechamento
- Comanda passa para admin confirmar pagamento
- Admin registra forma de pagamento (dinheiro, débito, crédito, pix)
- Comanda muda para "Paga"
- Resgata valor totalizador

**Quem utiliza:**
- Funcionário (fecha)
- Administrador (confirma pagamento)

**Fluxo:**
1. Cliente usa quadra de 14:00 a 15:00
2. Consumiu 2 refrigerantes e 1 lanche
3. Funcionário abre comanda
4. Vê: Aluguel Quadra: 100,00 + Consumos: 25,00 = Total: 125,00
5. Clica "Fechar Comanda"
6. Muda para "Aguardando Pagamento"
7. Admin acessa e confirma recebimento em dinheiro
8. Comanda vai para "Paga"
9. Reserva vai para "Finalizada"

---

### 3.11 PAINEL ADMINISTRATIVO

**Objetivo:** Centralizar controles e informações gerenciais.

**Como funciona:**
- Menu com: Dashboard, Quadras, Reservas, Clientes, Funcionários, Produtos, Comandas, Relatórios, Configurações
- Acesso apenas para admin
- Dados em tempo real
- Opções de filtro e busca

**Quem utiliza:**
- Administrador

**Fluxo:**
1. Admin loga no sistema
2. Vai para Dashboard
3. Vê indicadores principais
4. Pode navegar para outras seções

---

### 3.12 HISTÓRICO DE UTILIZAÇÕES

**Objetivo:** Rastrear todas as ações do cliente no sistema.

**Como funciona:**
- Cliente vê: data, quadra, horário, comanda, consumo, valor pago, status
- Filtro por período
- Ordenação por data

**Quem utiliza:**
- Cliente
- Admin

**Fluxo:**
1. Cliente acessa "Minha Conta" → "Histórico"
2. Vê todas suas reservas passadas
3. Pode clicar em uma para ver detalhes

---

### 3.13 CONTROLE DE ESTOQUE

**Objetivo:** Rastrear quantidade de produtos disponíveis.

**Como funciona:**
- Cada produto tem estoque atual
- Ao adicionar consumo, estoque diminui
- Admin pode fazer ajustes manuais
- Avisos quando estoque baixo
- Produtos com estoque 0 não podem ser adicionados

**Quem utiliza:**
- Admin
- Sistema (automático ao consumir)

**Fluxo:**
1. Admin cadastra Refrigerante com estoque 50
2. Funcionário adiciona 2 refrigerantes à comanda
3. Estoque fica 48
4. Se estoque chegar a 5, sistema emite alerta

---

### 3.14 RELATÓRIOS

**Objetivo:** Gerar dados consolidados para análise.

**Como funciona:**
- Relatórios filtráveis por data, quadra, cliente, produto
- Exportação em PDF ou CSV
- Tipos: Ocupação, Receita, Consumo, Clientes, Produtos

**Quem utiliza:**
- Administrador

**Fluxo:**
1. Admin vai para "Relatórios"
2. Seleciona tipo e período
3. Clica gerar
4. Visualiza dados
5. Pode exportar

---

### 3.15 DASHBOARD

**Objetivo:** Visualizar indicadores principais em um painel.

**Como funciona:**
- Cards com: receita do dia, reservas do dia, ocupação, produtos mais vendidos
- Gráficos de receita, ocupação, clientes, evolução mensal
- Tabelas: próximas reservas, últimas comandas, clientes frequentes

**Quem utiliza:**
- Administrador

**Fluxo:**
1. Admin loga
2. Vê dashboard automaticamente
3. Visualiza indicadores principais
4. Pode navegar para detalhes

---

## 4. FLUXO COMPLETO DO SISTEMA

### 4.1 FLUXO: CLIENTE FAZENDO PRIMEIRA RESERVA

```
Cliente acessa sistema
          ↓
Faz cadastro (email, senha, nome, telefone)
          ↓
Recebe confirmação
          ↓
Faz login
          ↓
Vê quadras disponíveis
          ↓
Seleciona quadra
          ↓
Vê calendário de disponibilidade
          ↓
Seleciona data e horário
          ↓
Confirma: quadra, data, horário, valor
          ↓
Sistema bloqueia horário
          ↓
Comanda é gerada automaticamente
          ↓
Cliente recebe confirmação (número da reserva)
          ↓
Cliente vê seus dados e comanda gerada
          ↓
Fluxo continua em 4.2
```

### 4.2 FLUXO: CLIENTE CHEGANDO PARA USAR QUADRA

```
Cliente chega no centro
          ↓
Funcionário consulta agenda/buscador
          ↓
Localiza reserva do cliente
          ↓
Verifica comanda criada
          ↓
Cliente entra na quadra
          ↓
Reserva muda para "Ativa"
          ↓
Cliente usa quadra durante 1 hora
          ↓
Cliente pede consumo (refrigerante, lanche)
          ↓
Funcionário adiciona itens à comanda
          ↓
Cliente termina de usar quadra
          ↓
Funcionário fecha comanda (soma tudo)
          ↓
Fluxo continua em 4.3
```

### 4.3 FLUXO: FECHAMENTO E PAGAMENTO

```
Funcionário acessa comanda
          ↓
Visualiza: aluguel quadra + consumos
          ↓
Valor total: 100,00 (quadra) + 25,00 (consumo) = 125,00
          ↓
Clica "Fechar Comanda"
          ↓
Comanda muda para "Aguardando Pagamento"
          ↓
Admin recebe notificação
          ↓
Admin acessa comanda
          ↓
Registra forma de pagamento (dinheiro, débito, crédito, pix)
          ↓
Comanda muda para "Paga"
          ↓
Reserva muda para "Finalizada"
          ↓
Sistema libera horário se necessário
          ↓
Fluxo completo encerrado
```

### 4.4 FLUXO: CLIENTE CONSULTANDO DISPONIBILIDADE E NÃO RESERVANDO

```
Cliente acessa sistema
          ↓
Seleciona quadra
          ↓
Vê calendário: horários livres em verde, ocupados em vermelho
          ↓
Percebe que está tudo ocupado na data desejada
          ↓
Seleciona outra data
          ↓
Encontra horário disponível
          ↓
Mas resolve não reservar agora
          ↓
Sai do sistema
          ↓
Nenhuma ação é registrada
```

### 4.5 FLUXO: CANCELAMENTO DE RESERVA

```
Cliente logado
          ↓
Acessa histórico ou próximas reservas
          ↓
Vê reserva com status "Confirmada"
          ↓
Clica "Cancelar Reserva" (máximo 2 horas antes)
          ↓
Sistema pede confirmação
          ↓
Cliente confirma cancelamento
          ↓
Reserva muda para "Cancelada"
          ↓
Comanda muda para "Cancelada"
          ↓
Horário é liberado
          ↓
Outros clientes veem horário como disponível
          ↓
Se comanda tiver pagamento, admin refaz manualmente
```

### 4.6 FLUXO: ADMIN CANCELANDO RESERVA (FORÇA)

```
Admin acessa agenda
          ↓
Seleciona uma reserva (qualquer status)
          ↓
Clica "Cancelar Reserva"
          ↓
Sistema pede motivo (manutenção, erro, outro)
          ↓
Admin insere motivo
          ↓
Confirma cancelamento
          ↓
Reserva muda para "Cancelada pelo Admin"
          ↓
Comanda muda para "Cancelada"
          ↓
Horário é liberado
          ↓
Cliente recebe notificação (se houver email)
          ↓
Admin registra devolução se houver pagamento
```

### 4.7 FLUXO: FUNCIONÁRIO CRIANDO RESERVA MANUALMENTE

```
Funcionário acessa agenda
          ↓
Clica "Nova Reserva"
          ↓
Busca cliente por nome/email
          ↓
Se não existe, cria cliente rapidamente
          ↓
Seleciona quadra
          ↓
Seleciona data e horário
          ↓
Confirma
          ↓
Sistema bloqueia horário
          ↓
Comanda é gerada
          ↓
Funcionário pode deixar reserva como "Ativa" (cliente já está lá)
          ↓
Processo continua normal
```

### 4.8 FLUXO: BLOQUEIO MANUAL DE HORÁRIOS

```
Admin ou Funcionário acessa agenda
          ↓
Clica "Bloquear Horário"
          ↓
Seleciona quadra, data, horário
          ↓
Seleciona motivo (manutenção, limpeza, evento)
          ↓
Confirma
          ↓
Horário fica bloqueado (não pode ser reservado)
          ↓
Clientes veem como ocupado
          ↓
Admin pode desbloquear depois
```

### 4.9 FLUXO: ADMIN GERENCIANDO PRODUTOS

```
Admin acessa Produtos
          ↓
Vê lista de categorias
          ↓
Seleciona categoria ou cria nova
          ↓
Adiciona novo produto:
  - Nome, descrição, preço, categoria, estoque
          ↓
Ativa produto
          ↓
Produto fica disponível para consumo
          ↓
Admin pode editar preço a qualquer momento
          ↓
Admin pode desativar (não aparece mais para consumo)
          ↓
Admin pode ver estoque em tempo real
```

### 4.10 FLUXO: CLIENTE RENOVANDO RESERVA

```
Cliente consulta histórico
          ↓
Vê reserva passada
          ↓
Clica "Renovar"
          ↓
Sistema abre formulário com mesma quadra e horário
          ↓
Cliente seleciona data (próxima disponível)
          ↓
Sistema sugere mesmo horário (se disponível)
          ↓
Cliente confirma
          ↓
Nova reserva é criada
          ↓
Nova comanda é gerada
```

---

## 5. TELAS DO SISTEMA

### 5.1 TELA: LOGIN

**Nome:** Tela de Login

**Objetivo:** Autenticar usuário no sistema.

**Campos:**
- Email (texto, obrigatório)
- Senha (password, obrigatório)
- "Lembrar-me" (checkbox, opcional)

**Botões:**
- Entrar (submit)
- Criar Conta (link para cadastro)
- Esqueci Minha Senha (link para recuperação)

**Informações Exibidas:**
- Logo da aplicação
- Nome: "ArenaGo"
- Mensagem de erro (se credenciais inválidas)
- Link para registro

**Ações Possíveis:**
- Inserir email e senha
- Submeter formulário
- Ir para cadastro
- Ir para recuperação de senha

**Validações:**
- Email: formato válido, obrigatório
- Senha: mínimo 6 caracteres, obrigatória
- Credenciais inválidas: mostrar erro genérico

**Mensagens:**
- "Email ou senha incorretos"
- "Por favor, preencha todos os campos"
- "Seu email ainda não foi confirmado" (se houver confirmação)

---

### 5.2 TELA: CADASTRO

**Nome:** Tela de Registro

**Objetivo:** Criar nova conta de usuário.

**Campos:**
- Nome Completo (texto, obrigatório)
- Email (email, obrigatório)
- Telefone (texto, obrigatório)
- CPF (máscara, obrigatório)
- Senha (password, obrigatório)
- Confirmar Senha (password, obrigatório)
- Aceitar termos (checkbox, obrigatório)

**Botões:**
- Registrar (submit)
- Voltar para Login (link)

**Informações Exibidas:**
- Requisitos de senha (mínimo 6 caracteres)
- Mensagens de erro em tempo real
- Indicador de força da senha

**Ações Possíveis:**
- Preencher formulário
- Submeter
- Voltar para login

**Validações:**
- Email: formato válido, único no banco
- Telefone: 10-11 dígitos
- CPF: válido e único
- Senha: mínimo 6 caracteres, caracteres especiais recomendados
- Senhas devem ser iguais
- Termos devem ser aceitos

**Mensagens:**
- "Email já cadastrado"
- "CPF já cadastrado"
- "Senhas não conferem"
- "Registrado com sucesso! Faça login"
- "Por favor, aceite os termos"

---

### 5.3 TELA: DASHBOARD (CLIENTE)

**Nome:** Dashboard Cliente

**Objetivo:** Visualizar reservas próximas e informações importantes.

**Informações Exibidas:**
- Boas-vindas "Olá, [Nome do Cliente]"
- Card: Próxima Reserva (quadra, data, horário, status)
- Card: Últimas Reservas (tabela com 5 últimas)
- Card: Saldo de Créditos (se houver sistema de créditos)
- Link rápido: "Fazer Nova Reserva"
- Link rápido: "Ver Minhas Reservas"
- Link rápido: "Meu Histórico"

**Botões:**
- Fazer Nova Reserva (primário)
- Ver Todas as Reservas (secundário)
- Ver Histórico (secundário)
- Editar Perfil (no menu)
- Sair (no menu)

**Ações Possíveis:**
- Clicar em "Fazer Nova Reserva" → vai para seleção de quadra
- Clicar em reserva listada → ver detalhes
- Acessar histórico completo
- Editar informações pessoais

**Filtros:**
- Período (últimos 7 dias, 30 dias, 3 meses)

---

### 5.4 TELA: SELEÇÃO DE QUADRA

**Nome:** Escolha de Quadra

**Objetivo:** Cliente seleciona quadra para reserva.

**Informações Exibidas:**
- Cards com quadras disponíveis
- Para cada quadra: nome, tipo, descrição, foto, capacidade, preço/hora
- Status: Disponível ou Indisponível

**Campos:**
- Filtro por tipo (futsal, vôlei, basquete, tênis)
- Busca por nome

**Botões:**
- Selecionar (em cada card)
- Voltar

**Ações Possíveis:**
- Filtrar quadras
- Buscar quadra
- Selecionar quadra → vai para calendário

**Cards mostram:**
- Foto/imagem da quadra
- Nome
- Tipo
- Descrição breve
- Capacidade
- Preço por hora
- Botão "Selecionar"

---

### 5.5 TELA: CALENDÁRIO DE DISPONIBILIDADE

**Nome:** Calendário e Horários

**Objetivo:** Cliente seleciona data e horário.

**Informações Exibidas:**
- Calendário mensal (mostra dias com disponibilidade)
- Grid de horários (após selecionar dia)
- Horários funcionamento: 06:00 até 22:00
- Duração padrão: 1 hora

**Grid de Horários:**
- Colunas: horários (06:00, 07:00, 08:00, etc.)
- Células coloridas:
  - Verde: disponível
  - Vermelho: ocupado
  - Cinza: fora do horário

**Campos:**
- Seletor de mês/ano

**Botões:**
- Próximo (navegação calendário)
- Anterior (navegação calendário)
- Confirmar (após selecionar horário)
- Voltar

**Ações Possíveis:**
- Navegar calendário
- Clicar em dia disponível
- Selecionar horário
- Confirmar seleção → vai para confirmação

**Validações:**
- Não pode selecionar data passada
- Não pode selecionar horário ocupado
- Não pode selecionar fora do funcionamento

---

### 5.6 TELA: CONFIRMAÇÃO DE RESERVA

**Nome:** Resumo da Reserva

**Objetivo:** Cliente confirma detalhes antes de finalizar.

**Informações Exibidas:**
- Quadra: nome, tipo, descrição
- Data: ex "Terça, 10 de Agosto de 2026"
- Horário: 14:00 - 15:00 (1 hora)
- Preço: R$ 100,00
- Cliente: nome
- Total: R$ 100,00

**Campos:**
- Nenhum (apenas visualização)

**Botões:**
- Confirmar Reserva (primário)
- Voltar (secundário)

**Ações Possíveis:**
- Confirmar → cria reserva, gera comanda
- Voltar → retorna ao calendário

**Mensagens:**
- "Reserva confirmada com sucesso!"
- "Seu número de reserva: RSV-20260810-001"
- "Uma comanda foi gerada automaticamente"

---

### 5.7 TELA: MINHAS RESERVAS (CLIENTE)

**Nome:** Reservas do Cliente

**Objetivo:** Visualizar todas as reservas do cliente.

**Informações Exibidas:**
- Tabela com colunas:
  - Data
  - Horário
  - Quadra
  - Status (Confirmada, Ativa, Finalizada, Cancelada)
  - Ações

**Filtros:**
- Status (todas, próximas, passadas)
- Período (data início e fim)
- Quadra

**Botões:**
- Nova Reserva (primário)
- Filtrar (aplicar filtros)

**Ações por Linha:**
- Ver Detalhes (ícone)
- Cancelar (ícone, se status "Confirmada" e com antecedência)
- Renovar (ícone)

**Ações Possíveis:**
- Filtrar reservas
- Clicar em reserva para detalhes
- Cancelar reserva (com confirmação)
- Renovar reserva
- Fazer nova reserva

**Validações:**
- Só mostra próprias reservas
- Cancelamento: máximo 2 horas antes

---

### 5.8 TELA: DETALHES DA RESERVA

**Nome:** Informações da Reserva

**Objetivo:** Ver detalhes completos de uma reserva.

**Informações Exibidas:**
- Número da Reserva: RSV-20260810-001
- Cliente: João Silva
- Quadra: Futsal Premium
- Data: 10 de Agosto de 2026
- Horário: 14:00 - 15:00
- Status: Ativa
- Comanda Gerada: CMD-20260810-001
- Valor: R$ 100,00

**Seção Consumos:**
- Tabela com produtos consumidos (se houver)
  - Produto, Quantidade, Valor Unitário, Subtotal

**Total Final:**
- Aluguel Quadra: R$ 100,00
- Consumos: R$ 0,00
- Total: R$ 100,00

**Botões:**
- Voltar
- Cancelar Reserva (se aplicável)
- Renovar

**Ações Possíveis:**
- Visualizar consumos
- Cancelar reserva
- Renovar
- Voltar para lista

---

### 5.9 TELA: DASHBOARD (ADMINISTRADOR)

**Nome:** Dashboard Administrativo

**Objetivo:** Visualizar indicadores principais do negócio.

**Cards Principais:**
- Receita do Dia: R$ 2.450,00
- Receita do Mês: R$ 45.320,00
- Reservas Hoje: 8
- Reservas Confirmadas: 15
- Taxa de Ocupação: 75%
- Produtos com Baixo Estoque: 3

**Gráficos:**
- Receita Diária (últimos 30 dias, gráfico de linha)
- Receita por Quadra (últimos 30 dias, gráfico de barras)
- Ocupação por Hora (hoje, gráfico de área)
- Produtos Mais Vendidos (ranking top 5)

**Tabelas:**
- Próximas Reservas (próximas 10)
- Comandas Aguardando Pagamento (número, cliente, valor)
- Últimos Clientes Cadastrados (5 últimos)

**Filtros:**
- Período (hoje, esta semana, este mês, customizado)
- Quadra

**Botões:**
- Ver Todos os Relatórios
- Configurações

**Ações Possíveis:**
- Filtrar dados
- Clicar em comanda aguardando pagamento → ir para detalhe e pagamento
- Clicar em reserva → ir para detalhes
- Acessar relatórios completos

---

### 5.10 TELA: AGENDA DE RESERVAS (ADMIN/FUNCIONÁRIO)

**Nome:** Agenda de Reservas

**Objetivo:** Gerenciar todas as reservas do dia ou período.

**Informações Exibidas:**
- Visualização: Lista ou Calendário (seletor)
- Se Lista:
  - Tabela com: Hora, Quadra, Cliente, Status, Ações
- Se Calendário:
  - Grid com quadras (linha) × horários (coluna)
  - Cores: verde (livre), vermelho (ocupado), cinza (fechado)

**Filtros:**
- Data (seletor de data)
- Quadra (dropdown)
- Status (dropdown)
- Cliente (busca)

**Botões:**
- Nova Reserva (primário)
- Filtrar
- Bloquear Horário

**Ações por Linha/Cell:**
- Ver Detalhes (ícone)
- Editar (ícone)
- Cancelar (ícone, admin)
- Marcar como Ativa (ícone)
- Abrir Comanda (ícone)

**Ações Possíveis:**
- Visualizar todas as reservas
- Filtrar por período, quadra, status
- Criar nova reserva
- Ver detalhes
- Iniciar comanda
- Cancelar reserva (admin)
- Bloquear horário para manutenção

---

### 5.11 TELA: GERENCIAMENTO DE QUADRAS

**Nome:** Quadras

**Objetivo:** Gerenciar cadastro de quadras.

**Informações Exibidas:**
- Tabela com:
  - Nome
  - Tipo
  - Tamanho
  - Capacidade
  - Preço/hora
  - Status (Ativa/Inativa)
  - Ações

**Filtros:**
- Tipo (dropdown)
- Status (todas, ativas, inativas)

**Botões:**
- Nova Quadra (primário)
- Filtrar

**Ações por Linha:**
- Ver Detalhes (ícone)
- Editar (ícone)
- Ativar/Desativar (toggle)
- Deletar (ícone)

**Ações Possíveis:**
- Criar quadra nova
- Editar quadra
- Ativar/desativar
- Deletar quadra
- Filtrar

**Modal: Nova Quadra**
- Nome (texto, obrigatório)
- Tipo (dropdown: Futsal, Vôlei, Basquete, Tênis, Outro)
- Descrição (textarea)
- Tamanho (ex: 40m × 20m)
- Capacidade (número)
- Preço por Hora (decimal)
- Horário Funcionamento Início (seletor de hora)
- Horário Funcionamento Fim (seletor de hora)
- Duração Padrão Reserva (dropdown: 1h, 2h, etc.)
- Ativa (checkbox)

---

### 5.12 TELA: GERENCIAMENTO DE PRODUTOS

**Nome:** Produtos

**Objetivo:** Gerenciar cadastro de produtos consumíveis.

**Informações Exibidas:**
- Abas: Categorias | Produtos
- Tabela Produtos com:
  - Nome
  - Categoria
  - Preço
  - Estoque Atual
  - Status (Ativo/Inativo)
  - Ações

**Filtros:**
- Categoria (dropdown)
- Status (todas, ativas, inativas)
- Estoque Baixo (checkbox)

**Botões:**
- Nova Categoria (secundário)
- Novo Produto (primário)
- Filtrar

**Ações por Linha:**
- Ver Detalhes (ícone)
- Editar (ícone)
- Ativar/Desativar (toggle)
- Ajustar Estoque (ícone)
- Deletar (ícone)

**Ações Possíveis:**
- Criar categoria
- Criar produto
- Editar produto
- Ajustar estoque manualmente
- Ativar/desativar
- Deletar

**Modal: Novo Produto**
- Nome (texto, obrigatório)
- Descrição (textarea)
- Categoria (dropdown, obrigatório)
- Preço (decimal, obrigatório)
- Estoque Inicial (número, obrigatório)
- Estoque Mínimo (número, alerta quando chega)
- Ativo (checkbox)

---

### 5.13 TELA: GERENCIAMENTO DE CLIENTES

**Nome:** Clientes

**Objetivo:** Gerenciar dados de clientes.

**Informações Exibidas:**
- Tabela com:
  - Nome
  - Email
  - Telefone
  - CPF
  - Data Cadastro
  - Reservas (número)
  - Ações

**Filtros:**
- Status (ativo, inativo)
- Data Cadastro (período)
- Busca por nome/email/CPF

**Botões:**
- Novo Cliente (primário)
- Filtrar

**Ações por Linha:**
- Ver Detalhes (ícone)
- Editar (ícone)
- Ver Histórico (ícone)
- Bloquear (ícone, admin)
- Deletar (ícone)

**Ações Possíveis:**
- Criar cliente
- Editar dados
- Ver histórico de reservas
- Bloquear cliente
- Deletar cliente

**Modal: Novo Cliente**
- Nome (texto, obrigatório)
- Email (email, obrigatório)
- Telefone (texto, obrigatório)
- CPF (máscara, obrigatório)
- Endereço (texto)
- Ativo (checkbox)

---

### 5.14 TELA: COMANDAS (FUNCIONÁRIO)

**Nome:** Comandas Abertas

**Objetivo:** Gerenciar consumo durante reserva.

**Informações Exibidas:**
- Tabela com:
  - Número Comanda
  - Cliente
  - Quadra
  - Horário
  - Status (Aberta, Fechada, Paga)
  - Total Atual
  - Ações

**Filtros:**
- Status (todas, abertas, fechadas)
- Cliente (busca)
- Quadra (dropdown)

**Botões:**
- Buscar Comanda (searchbar primário)

**Ações por Linha:**
- Abrir Comanda (ícone/botão)
- Ver Detalhes (ícone)

**Ações Possíveis:**
- Buscar comanda por número ou cliente
- Abrir comanda para adicionar consumo
- Ver detalhes

---

### 5.15 TELA: DETALHE DE COMANDA (FUNCIONÁRIO)

**Nome:** Comanda Detalhes

**Objetivo:** Adicionar consumo e registrar itens.

**Informações Exibidas:**
- Cabeçalho:
  - Número Comanda: CMD-20260810-001
  - Cliente: João Silva
  - Quadra: Futsal Premium
  - Horário: 14:00 - 15:00
  - Status: Aberta

- Tabela de Itens:
  - Produto
  - Quantidade
  - Preço Unitário
  - Subtotal
  - Remover (ícone)

- Resumo Financeiro:
  - Aluguel Quadra: R$ 100,00
  - Subtotal Consumos: R$ 0,00
  - Total: R$ 100,00

**Campos:**
- Seletor de Produto (dropdown com produtos disponíveis)
- Quantidade (número, padrão 1)

**Botões:**
- Adicionar Item (primário)
- Fechar Comanda (primário, vermelho)
- Voltar

**Ações Possíveis:**
- Selecionar produto
- Inserir quantidade
- Adicionar item → tabela atualiza
- Remover item
- Fechar comanda → vai para admin confirmar pagamento

**Validações:**
- Produto selecionado obrigatório
- Quantidade mínima 1
- Estoque: não pode adicionar se estoque 0
- Comanda não pode ter 0 itens ao fechar

**Mensagens:**
- "Produto adicionado com sucesso"
- "Estoque insuficiente para este produto"
- "Comanda fechada. Aguardando pagamento."

---

### 5.16 TELA: COMANDAS (ADMIN)

**Nome:** Comandas - Painel Administrativo

**Objetivo:** Gerenciar pagamentos e status de comandas.

**Informações Exibidas:**
- Tabela com:
  - Número Comanda
  - Cliente
  - Quadra
  - Data/Hora
  - Status (Aberta, Fechada, Aguardando, Paga)
  - Total
  - Ações

**Filtros:**
- Status (todas, abertas, fechadas, aguardando pagamento, pagas)
- Data (período)
- Cliente (busca)

**Botões:**
- Filtrar

**Ações por Linha:**
- Ver Detalhes (ícone)
- Registrar Pagamento (ícone, se aguardando)
- Editar (ícone)
- Cancelar (ícone)

**Ações Possíveis:**
- Filtrar comandas
- Ver detalhes completos
- Registrar pagamento
- Editar itens
- Cancelar comanda

---

### 5.17 TELA: PAGAMENTO DE COMANDA

**Nome:** Registrar Pagamento

**Objetivo:** Registrar como pagamento foi feito.

**Informações Exibidas:**
- Detalhes Comanda:
  - Número, cliente, quadra, total
- Itens: tabela com produtos e valores

**Campos:**
- Forma de Pagamento (radio buttons):
  - Dinheiro
  - Débito
  - Crédito
  - PIX
  - Outro

- Valor Recebido (decimal)
- Troco (calculado automaticamente)
- Observações (textarea, opcional)

**Botões:**
- Confirmar Pagamento (primário, verde)
- Voltar

**Ações Possíveis:**
- Selecionar forma de pagamento
- Inserir valor recebido (troco calcula automaticamente)
- Adicionar observações
- Confirmar pagamento

**Validações:**
- Forma de pagamento obrigatória
- Valor recebido >= total
- Calculadora de troco em tempo real

**Mensagens:**
- "Pagamento registrado com sucesso!"
- "Comanda finalizada"
- "Valor insuficiente"

---

### 5.18 TELA: RELATÓRIOS

**Nome:** Relatórios

**Objetivo:** Gerar relatórios diversos.

**Informações Exibidas:**
- Lista de tipos de relatório:
  - Ocupação de Quadras
  - Receita
  - Consumo de Produtos
  - Clientes
  - Funcionários
  - Comparativo Períodos

**Campos (ao selecionar relatório):**
- Data Início (date picker)
- Data Fim (date picker)
- Filtros específicos (quadra, categoria produto, etc.)

**Botões:**
- Gerar Relatório (primário)
- Exportar PDF
- Exportar CSV
- Limpar Filtros

**Ações Possíveis:**
- Selecionar tipo de relatório
- Definir período
- Aplicar filtros
- Gerar
- Exportar em PDF ou CSV
- Voltar

---

### 5.19 TELA: CONFIGURAÇÕES

**Nome:** Configurações do Sistema

**Objetivo:** Gerenciar configurações gerais.

**Seções:**
- Dados da Empresa
  - Nome, CNPJ, Telefone, Email, Endereço, Site
  
- Horários de Funcionamento
  - Hora Abertura, Hora Fechamento
  
- Unidades Padrão
  - Duração Padrão Reserva
  - Aviso de Cancelamento (horas)
  
- Notificações
  - Email confirmação reserva (on/off)
  - Email comanda fechada (on/off)
  
- Segurança
  - Alterar Senha Admin
  - Logs de Acesso (visualizar)

**Botões:**
- Salvar Alterações (primário)
- Cancelar

**Ações Possíveis:**
- Editar dados empresa
- Alterar horários
- Ativar/desativar notificações
- Alterar senha
- Ver logs

---

### 5.20 TELA: PERFIL DO USUÁRIO

**Nome:** Meu Perfil

**Objetivo:** Editar dados pessoais.

**Informações Exibidas:**
- Foto/Avatar (opcional)
- Dados pessoais (editáveis)

**Campos:**
- Nome Completo
- Email
- Telefone
- CPF
- Endereço

**Abas:**
- Dados Pessoais
- Segurança (alterar senha)
- Preferências (notificações)

**Botões:**
- Salvar Alterações (primário)
- Cancelar

**Ações Possíveis:**
- Editar dados
- Alterar senha
- Configurar notificações
- Salvar

---

### 5.21 TELA: GERENCIAMENTO DE FUNCIONÁRIOS (ADMIN)

**Nome:** Funcionários

**Objetivo:** Gerenciar contas de funcionários.

**Informações Exibidas:**
- Tabela com:
  - Nome
  - Email
  - Função
  - Data Admissão
  - Status (Ativo/Inativo)
  - Ações

**Botões:**
- Novo Funcionário (primário)
- Filtrar

**Ações por Linha:**
- Ver Detalhes (ícone)
- Editar (ícone)
- Ativar/Desativar (toggle)
- Deletar (ícone)

**Ações Possíveis:**
- Criar funcionário
- Editar dados
- Ativar/desativar
- Deletar

**Modal: Novo Funcionário**
- Nome (texto, obrigatório)
- Email (email, obrigatório)
- Telefone (texto)
- CPF (máscara)
- Função (dropdown: Atendente, Gerenciador, Outro)
- Data Admissão (date)
- Ativo (checkbox)

---

## 6. ESTRUTURA DO MENU

### MENU - CLIENTE (Usuário não autenticado)

```
ArenaGo
├─ Home (Landing Page)
├─ Sobre
├─ Contato
├─ Login
└─ Cadastro
```

### MENU - CLIENTE (Usuário autenticado)

```
ArenaGo
├─ Dashboard
│  └─ Minhas Reservas
├─ Nova Reserva
├─ Minhas Reservas
├─ Histórico
├─ Meu Perfil
│  ├─ Dados Pessoais
│  ├─ Segurança
│  └─ Preferências
└─ Sair
```

### MENU - FUNCIONÁRIO

```
ArenaGo
├─ Dashboard
│  └─ Resumo do Dia
├─ Agenda
│  ├─ Reservas do Dia
│  ├─ Nova Reserva
│  └─ Bloquear Horário
├─ Comandas
│  ├─ Comandas Abertas
│  └─ Buscar Comanda
├─ Quadras
│  └─ Status das Quadras
├─ Meu Perfil
│  ├─ Dados Pessoais
│  └─ Segurança
└─ Sair
```

### MENU - ADMINISTRADOR

```
ArenaGo
├─ Dashboard
│  ├─ Indicadores Principais
│  ├─ Gráficos
│  └─ Resumo do Dia
├─ Gerenciamento
│  ├─ Quadras
│  ├─ Produtos
│  ├─ Categorias
│  ├─ Clientes
│  └─ Funcionários
├─ Operações
│  ├─ Agenda de Reservas
│  ├─ Comandas
│  │  ├─ Comandas Abertas
│  │  ├─ Comandas Fechadas
│  │  └─ Aguardando Pagamento
│  └─ Nova Reserva
├─ Relatórios
│  ├─ Ocupação
│  ├─ Receita
│  ├─ Consumo
│  ├─ Clientes
│  ├─ Funcionários
│  └─ Customizado
├─ Configurações
│  ├─ Dados da Empresa
│  ├─ Horários
│  ├─ Notificações
│  ├─ Segurança
│  └─ Logs
├─ Meu Perfil
│  ├─ Dados Pessoais
│  └─ Segurança
└─ Sair
```

---

## 7. BANCO DE DADOS

### 7.1 TABELA: USUARIOS

**Função:** Armazenar dados de todos os usuários.

**Campos:**
- id (PK, UUID)
- nome (varchar, obrigatório)
- email (varchar, único, obrigatório)
- senha (varchar, hash bcrypt, obrigatório)
- telefone (varchar)
- cpf (varchar, único)
- endereco (varchar)
- perfil (enum: CLIENTE, FUNCIONARIO, ADMIN, obrigatório)
- ativo (boolean, padrão true)
- data_criacao (timestamp)
- data_atualizacao (timestamp)

**Relacionamentos:**
- 1 : N com RESERVAS
- 1 : N com COMANDAS
- 1 : N com HISTORICO

---

### 7.2 TABELA: QUADRAS

**Função:** Armazenar dados de quadras/espaços esportivos.

**Campos:**
- id (PK, UUID)
- nome (varchar, obrigatório)
- tipo (enum: FUTSAL, VOLEI, BASQUETE, TENIS, OUTRO, obrigatório)
- descricao (text)
- tamanho (varchar, ex: "40m x 20m")
- capacidade (integer, obrigatório)
- preco_hora (decimal, obrigatório)
- horario_inicio (time, ex: 06:00)
- horario_fim (time, ex: 22:00)
- duracao_padrao_minutos (integer, padrão 60)
- ativa (boolean, padrão true)
- data_criacao (timestamp)
- data_atualizacao (timestamp)

**Relacionamentos:**
- 1 : N com RESERVAS
- 1 : N com BLOQUEIOS

---

### 7.3 TABELA: RESERVAS

**Função:** Armazenar registro de todas as reservas.

**Campos:**
- id (PK, UUID)
- numero_reserva (varchar, único, ex: RSV-20260810-001)
- usuario_id (FK para USUARIOS, obrigatório)
- quadra_id (FK para QUADRAS, obrigatório)
- data_reserva (date, obrigatório)
- horario_inicio (time, obrigatório)
- horario_fim (time, obrigatório)
- status (enum: CONFIRMADA, ATIVA, FINALIZADA, CANCELADA, padrão CONFIRMADA)
- motivo_cancelamento (varchar, opcional)
- cancelada_por (FK para USUARIOS, opcional)
- valor_aluguel (decimal, obrigatório)
- comanda_id (FK para COMANDAS, único, gerada automaticamente)
- data_criacao (timestamp)
- data_atualizacao (timestamp)

**Relacionamentos:**
- N : 1 com USUARIOS
- N : 1 com QUADRAS
- 1 : 1 com COMANDAS

---

### 7.4 TABELA: COMANDAS

**Função:** Armazenar registro de consumo e pagamento.

**Campos:**
- id (PK, UUID)
- numero_comanda (varchar, único, ex: CMD-20260810-001)
- reserva_id (FK para RESERVAS, obrigatório)
- usuario_id (FK para USUARIOS, obrigatório)
- status (enum: ABERTA, FECHADA, AGUARDANDO_PAGAMENTO, PAGA, CANCELADA, padrão ABERTA)
- subtotal_consumos (decimal, padrão 0)
- valor_aluguel (decimal, obrigatório)
- total (decimal, obrigatório)
- forma_pagamento (varchar, ex: DINHEIRO, DEBITO, CREDITO, PIX)
- valor_pago (decimal, opcional)
- troco (decimal, opcional)
- observacoes (text, opcional)
- data_fechamento (timestamp, opcional)
- data_pagamento (timestamp, opcional)
- data_criacao (timestamp)
- data_atualizacao (timestamp)

**Relacionamentos:**
- 1 : 1 com RESERVAS
- N : 1 com USUARIOS
- 1 : N com ITENS_COMANDA

---

### 7.5 TABELA: ITENS_COMANDA

**Função:** Armazenar itens consumidos em cada comanda.

**Campos:**
- id (PK, UUID)
- comanda_id (FK para COMANDAS, obrigatório)
- produto_id (FK para PRODUTOS, obrigatório)
- quantidade (integer, obrigatório)
- preco_unitario (decimal, obrigatório)
- subtotal (decimal, calculado: quantidade × preco_unitario)
- data_criacao (timestamp)

**Relacionamentos:**
- N : 1 com COMANDAS
- N : 1 com PRODUTOS

---

### 7.6 TABELA: PRODUTOS

**Função:** Armazenar catálogo de produtos consumíveis.

**Campos:**
- id (PK, UUID)
- nome (varchar, obrigatório)
- descricao (text)
- categoria_id (FK para CATEGORIAS, obrigatório)
- preco (decimal, obrigatório)
- estoque_atual (integer, obrigatório)
- estoque_minimo (integer, padrão 5)
- ativo (boolean, padrão true)
- data_criacao (timestamp)
- data_atualizacao (timestamp)

**Relacionamentos:**
- N : 1 com CATEGORIAS
- 1 : N com ITENS_COMANDA

---

### 7.7 TABELA: CATEGORIAS

**Função:** Armazenar categorias de produtos.

**Campos:**
- id (PK, UUID)
- nome (varchar, único, obrigatório)
- descricao (text)
- ativa (boolean, padrão true)
- data_criacao (timestamp)

**Relacionamentos:**
- 1 : N com PRODUTOS

---

### 7.8 TABELA: BLOQUEIOS

**Função:** Armazenar horários bloqueados para manutenção ou eventos.

**Campos:**
- id (PK, UUID)
- quadra_id (FK para QUADRAS, obrigatório)
- data_bloqueio (date, obrigatório)
- horario_inicio (time, obrigatório)
- horario_fim (time, obrigatório)
- motivo (varchar: MANUTENCAO, LIMPEZA, EVENTO, OUTRO, obrigatório)
- criado_por (FK para USUARIOS, obrigatório)
- data_criacao (timestamp)

**Relacionamentos:**
- N : 1 com QUADRAS
- N : 1 com USUARIOS

---

### 7.9 TABELA: HISTORICO

**Função:** Armazenar histórico de ações para auditoria.

**Campos:**
- id (PK, UUID)
- usuario_id (FK para USUARIOS, obrigatório)
- tipo_acao (varchar: CRIACAO, EDICAO, DELECAO, PAGAMENTO, CANCELAMENTO)
- entidade (varchar: USUARIO, QUADRA, RESERVA, COMANDA, PRODUTO)
- entidade_id (UUID)
- descricao (text)
- dados_anteriores (JSON, opcional)
- dados_novos (JSON, opcional)
- ip_address (varchar, opcional)
- data_acao (timestamp)

**Relacionamentos:**
- N : 1 com USUARIOS

---

### 7.10 RELACIONAMENTOS RESUMO

```
USUARIOS
├─ 1 : N → RESERVAS
├─ 1 : N → COMANDAS
├─ 1 : N → BLOQUEIOS
└─ 1 : N → HISTORICO

QUADRAS
├─ 1 : N → RESERVAS
└─ 1 : N → BLOQUEIOS

RESERVAS
├─ N : 1 → USUARIOS
├─ N : 1 → QUADRAS
└─ 1 : 1 → COMANDAS

COMANDAS
├─ 1 : 1 → RESERVAS
├─ N : 1 → USUARIOS
└─ 1 : N → ITENS_COMANDA

ITENS_COMANDA
├─ N : 1 → COMANDAS
└─ N : 1 → PRODUTOS

PRODUTOS
├─ N : 1 → CATEGORIAS
└─ 1 : N → ITENS_COMANDA

CATEGORIAS
└─ 1 : N → PRODUTOS
```

---

## 8. REGRAS DE NEGÓCIO

### RN01
Uma quadra não pode ter duas reservas no mesmo horário.

### RN02
Uma comanda só pode existir se houver uma reserva.

### RN03
Produtos com estoque = 0 não podem ser adicionados ao consumo.

### RN04
O administrador pode cancelar qualquer reserva e deve informar o motivo.

### RN05
Um cliente só pode visualizar suas próprias reservas e comandas.

### RN06
Funcionário pode criar reserva manualmente apenas para cliente cadastrado.

### RN07
Comanda só pode ser paga após estar no status "Aguardando Pagamento".

### RN08
Horário de funcionamento é configurável por quadra (ex: 06:00 - 22:00).

### RN09
Duração padrão de reserva é 1 hora, podendo ser alterada por quadra.

### RN10
Cliente pode cancelar reserva com no mínimo 2 horas de antecedência.

### RN11
Cancelamento de reserva libera automaticamente o horário.

### RN12
Preço da comanda = valor aluguel + somatório consumos.

### RN13
Aluguel deve ser pago em conjunto com consumos (não há aluguel sem comanda).

### RN14
Cada reserva gera exatamente uma comanda.

### RN15
Cliente não pode fazer duas reservas que se sobrepõem no tempo.

### RN16
Funcionário não pode deletar registros (apenas admin).

### RN17
Alteração de preço de produto afeta apenas comandas futuras (abertas/pendentes).

### RN18
Estoque de produto diminui ao adicionar item à comanda.

### RN19
Estoque não pode ser negativo (validação antes de adicionar consumo).

### RN20
Comanda com consumo não pode ter itens removidos (apenas admin, com justificativa).

### RN21
Comanda cancelada gera registro de cancelamento na auditoria.

### RN22
Bloqueio manual de horário previne qualquer reserva naquele período.

### RN23
Blocagem deve ter motivo definido (manutenção, limpeza, evento).

### RN24
Admin pode desbloquear horários a qualquer momento.

### RN25
Reserva não pode ser feita em data passada.

### RN26
Reserva não pode ser feita fora do horário de funcionamento da quadra.

### RN27
Email deve ser único no sistema (para USUARIOS).

### RN28
CPF deve ser único (se preenchido).

### RN29
Senha deve ter mínimo 6 caracteres (hash bcrypt obrigatório).

### RN30
Funcionário pode visualizar apenas as reservas e comandas (não painel administrativo).

### RN31
Cliente pode visualizar apenas suas próprias informações.

### RN32
Relatórios são acessíveis apenas para admin.

### RN33
Cada ação é registrada no HISTORICO para auditoria.

### RN34
Comanda não pode ser criada sem reserva vinculada.

### RN35
Quando estoque chega ao mínimo, gera alerta para admin.

---

## 9. REQUISITOS FUNCIONAIS

### RF01
Sistema deve permitir cadastro de usuário com: nome, email, senha, telefone, CPF.

### RF02
Sistema deve validar unicidade de email.

### RF03
Sistema deve validar CPF (se preenchido).

### RF04
Sistema deve fazer hash de senha com bcrypt.

### RF05
Sistema deve permitir login com email e senha.

### RF06
Sistema deve permitir recuperação de senha via email.

### RF07
Sistema deve permitir edição de perfil do usuário.

### RF08
Sistema deve permitir cadastro de quadra com: nome, tipo, descrição, tamanho, capacidade, preço/hora, horário funcionamento.

### RF09
Sistema deve permitir ativar/desativar quadras.

### RF10
Sistema deve permitir visualização de disponibilidade em calendário.

### RF11
Sistema deve permitir cliente fazer reserva selecionando: quadra, data, horário.

### RF12
Sistema deve bloquear automaticamente horário quando reserva é confirmada.

### RF13
Sistema deve gerar comanda automaticamente ao confirmar reserva.

### RF14
Sistema deve permitir funcionário visualizar agenda do dia.

### RF15
Sistema deve permitir funcionário buscar e abrir comanda.

### RF16
Sistema deve permitir adicionar consumo à comanda selecionando produto e quantidade.

### RF17
Sistema deve calcular valor de consumo automaticamente (preço × quantidade).

### RF18
Sistema deve diminuir estoque automaticamente ao adicionar consumo.

### RF19
Sistema deve exibir total de comanda (aluguel + consumos).

### RF20
Sistema deve permitir funcionário fechar comanda.

### RF21
Sistema deve permitir admin registrar pagamento de comanda com forma de pagamento.

### RF22
Sistema deve calcular troco automaticamente.

### RF23
Sistema deve permitir admin criar categoria de produto.

### RF24
Sistema deve permitir admin criar produto com: nome, descrição, categoria, preço, estoque.

### RF25
Sistema deve permitir editar produto (nome, descrição, preço, estoque).

### RF26
Sistema deve permitir deletar produto (apenas admin).

### RF27
Sistema deve permitir criar funcionário com email, nome, telefone, CPF, função.

### RF28
Sistema deve permitir editar dados de funcionário.

### RF29
Sistema deve permitir ativar/desativar funcionário.

### RF30
Sistema deve permitir admin visualizar lista de clientes.

### RF31
Sistema deve permitir admin criar cliente manualmente.

### RF32
Sistema deve permitir admin editar dados de cliente.

### RF33
Sistema deve permitir admin bloquear cliente (impedir reservas).

### RF34
Sistema deve permitir cliente visualizar suas reservas.

### RF35
Sistema deve permitir cliente cancelar reserva (com antecedência mínima).

### RF36
Sistema deve permitir cliente ver suas comandas e histórico.

### RF37
Sistema deve permitir admin visualizar todas as reservas.

### RF38
Sistema deve permitir admin cancelar reserva informando motivo.

### RF39
Sistema deve permitir admin/funcionário bloquear horário manualmente.

### RF40
Sistema deve gerar Dashboard com indicadores: receita, reservas, ocupação.

### RF41
Sistema deve permitir gerar relatório de ocupação por período.

### RF42
Sistema deve permitir gerar relatório de receita por período.

### RF43
Sistema deve permitir gerar relatório de consumo de produtos.

### RF44
Sistema deve permitir exportar relatório em PDF.

### RF45
Sistema deve permitir exportar relatório em CSV.

---

## 10. REQUISITOS NÃO FUNCIONAIS

### RNF01
Sistema deve estar disponível 24/7 (uptime mínimo 99%).

### RNF02
Tempo de resposta máximo para qualquer tela: 2 segundos.

### RNF03
Sistema deve suportar mínimo 100 usuários simultâneos.

### RNF04
Senhas devem ser criptografadas com bcrypt.

### RNF05
Banco de dados deve ter backup automático diário.

### RNF06
Interface deve ser responsiva (desktop e tablet).

### RNF07
Navegação deve ser intuitiva e clara.

### RNF08
Sistema deve registrar todas as ações para auditoria.

### RNF09
Logs devem ser mantidos por mínimo 1 ano.

### RNF10
Sistema deve validar todas as entradas de usuário.

### RNF11
Erros deve ser tratados graciosamente com mensagens claras.

### RNF12
Código deve ser modular e bem documentado.

### RNF13
Deve haver tratamento de exceções em todos os endpoints.

### RNF14
Permissões devem ser verificadas em cada ação sensível.

### RNF15
Dados sensíveis não devem ser expostos em logs ou erros.

### RNF16
Sistema deve impedir SQL injection.

### RNF17
Campos de entrada devem ter tamanho máximo definido.

### RNF18
Imagens devem ser otimizadas para web.

### RNF19
Código deve seguir padrões ESLint/Prettier (JavaScript).

### RNF20
Testes unitários devem cobrir mínimo 70% do código.

---

## 11. APIs - ENDPOINTS REST

### AUTENTICAÇÃO

#### POST /auth/registro
**Descrição:** Criar nova conta de usuário.

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11999999999",
  "cpf": "12345678900",
  "senha": "senha123",
  "confirmarSenha": "senha123"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "nome": "João Silva",
  "email": "joao@email.com",
  "perfil": "CLIENTE",
  "token": "jwt_token"
}
```

---

#### POST /auth/login
**Descrição:** Autenticar usuário.

**Request:**
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "nome": "João Silva",
  "email": "joao@email.com",
  "perfil": "CLIENTE",
  "token": "jwt_token"
}
```

---

#### POST /auth/recuperar-senha
**Descrição:** Iniciar processo de recuperação de senha.

**Request:**
```json
{
  "email": "joao@email.com"
}
```

**Response (200):**
```json
{
  "mensagem": "Email de recuperação enviado"
}
```

---

#### POST /auth/redefinir-senha
**Descrição:** Redefinir senha com token.

**Request:**
```json
{
  "token": "reset_token",
  "nova_senha": "novaSenha123"
}
```

**Response (200):**
```json
{
  "mensagem": "Senha alterada com sucesso"
}
```

---

### USUÁRIOS

#### GET /usuarios/perfil
**Descrição:** Obter dados do usuário autenticado.

**Response (200):**
```json
{
  "id": "uuid",
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11999999999",
  "cpf": "12345678900",
  "endereco": "Rua X, 123",
  "perfil": "CLIENTE",
  "ativo": true
}
```

---

#### PUT /usuarios/perfil
**Descrição:** Atualizar dados do usuário autenticado.

**Request:**
```json
{
  "nome": "João Silva",
  "telefone": "11999999999",
  "endereco": "Rua X, 456"
}
```

**Response (200):**
```json
{
  "mensagem": "Perfil atualizado com sucesso"
}
```

---

#### GET /usuarios
**Descrição:** Listar usuários (ADMIN only).

**Query Params:**
- `perfil`: CLIENTE, FUNCIONARIO, ADMIN
- `ativo`: true, false
- `busca`: nome ou email
- `pagina`: 1
- `limite`: 20

**Response (200):**
```json
{
  "total": 100,
  "pagina": 1,
  "dados": [
    {
      "id": "uuid",
      "nome": "João Silva",
      "email": "joao@email.com",
      "perfil": "CLIENTE",
      "ativo": true,
      "dataCriacao": "2026-01-15T10:00:00Z"
    }
  ]
}
```

---

#### POST /usuarios
**Descrição:** Criar usuário (ADMIN only).

**Request:**
```json
{
  "nome": "Maria",
  "email": "maria@email.com",
  "telefone": "11999999999",
  "cpf": "98765432100",
  "perfil": "FUNCIONARIO",
  "funcao": "Atendente",
  "ativo": true
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "nome": "Maria",
  "email": "maria@email.com",
  "perfil": "FUNCIONARIO"
}
```

---

#### PUT /usuarios/:id
**Descrição:** Atualizar usuário (ADMIN only).

**Request:**
```json
{
  "nome": "Maria Silva",
  "telefone": "11999999999",
  "ativo": true
}
```

**Response (200):**
```json
{
  "mensagem": "Usuário atualizado com sucesso"
}
```

---

#### DELETE /usuarios/:id
**Descrição:** Deletar usuário (ADMIN only).

**Response (200):**
```json
{
  "mensagem": "Usuário deletado com sucesso"
}
```

---

### QUADRAS

#### GET /quadras
**Descrição:** Listar quadras (todos).

**Query Params:**
- `tipo`: FUTSAL, VOLEI, BASQUETE, TENIS
- `ativa`: true, false
- `busca`: nome

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nome": "Futsal Premium",
    "tipo": "FUTSAL",
    "descricao": "Quadra com piso especial",
    "tamanho": "40x20",
    "capacidade": 10,
    "precoHora": 100.00,
    "horarioInicio": "06:00",
    "horarioFim": "22:00",
    "durationPadraoMinutos": 60,
    "ativa": true
  }
]
```

---

#### POST /quadras
**Descrição:** Criar quadra (ADMIN only).

**Request:**
```json
{
  "nome": "Futsal Premium",
  "tipo": "FUTSAL",
  "descricao": "Quadra com piso especial",
  "tamanho": "40x20",
  "capacidade": 10,
  "precoHora": 100.00,
  "horarioInicio": "06:00",
  "horarioFim": "22:00",
  "durationPadraoMinutos": 60,
  "ativa": true
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "nome": "Futsal Premium",
  "tipo": "FUTSAL",
  "precoHora": 100.00
}
```

---

#### GET /quadras/:id
**Descrição:** Obter detalhes de uma quadra.

**Response (200):**
```json
{
  "id": "uuid",
  "nome": "Futsal Premium",
  "tipo": "FUTSAL",
  "descricao": "Quadra com piso especial",
  "tamanho": "40x20",
  "capacidade": 10,
  "precoHora": 100.00,
  "horarioInicio": "06:00",
  "horarioFim": "22:00",
  "durationPadraoMinutos": 60,
  "ativa": true
}
```

---

#### PUT /quadras/:id
**Descrição:** Atualizar quadra (ADMIN only).

**Request:**
```json
{
  "precoHora": 120.00,
  "ativa": true
}
```

**Response (200):**
```json
{
  "mensagem": "Quadra atualizada com sucesso"
}
```

---

#### DELETE /quadras/:id
**Descrição:** Deletar quadra (ADMIN only).

**Response (200):**
```json
{
  "mensagem": "Quadra deletada com sucesso"
}
```

---

### DISPONIBILIDADE

#### GET /disponibilidade/quadras/:id
**Descrição:** Obter disponibilidade de uma quadra em período.

**Query Params:**
- `dataInicio`: YYYY-MM-DD (obrigatório)
- `dataFim`: YYYY-MM-DD (obrigatório)

**Response (200):**
```json
{
  "quadraId": "uuid",
  "quadraNome": "Futsal Premium",
  "disponibilidade": [
    {
      "data": "2026-08-10",
      "horarios": [
        {
          "hora": "06:00",
          "disponivel": true,
          "duracao": 60
        },
        {
          "hora": "07:00",
          "disponivel": false,
          "duracao": 60,
          "motivo": "Reservado"
        }
      ]
    }
  ]
}
```

---

### RESERVAS

#### POST /reservas
**Descrição:** Criar reserva (CLIENTE ou FUNCIONARIO).

**Request:**
```json
{
  "quadraId": "uuid",
  "data": "2026-08-10",
  "horarioInicio": "14:00",
  "duracao": 60
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "numeroReserva": "RSV-20260810-001",
  "quadraId": "uuid",
  "data": "2026-08-10",
  "horarioInicio": "14:00",
  "horarioFim": "15:00",
  "status": "CONFIRMADA",
  "valorAluguel": 100.00,
  "comandaId": "uuid"
}
```

---

#### GET /reservas
**Descrição:** Listar reservas (todos veem suas próprias, ADMIN vê todas).

**Query Params:**
- `status`: CONFIRMADA, ATIVA, FINALIZADA, CANCELADA
- `dataInicio`: YYYY-MM-DD
- `dataFim`: YYYY-MM-DD
- `quadraId`: uuid
- `usuarioId`: uuid (ADMIN only)

**Response (200):**
```json
{
  "total": 50,
  "dados": [
    {
      "id": "uuid",
      "numeroReserva": "RSV-20260810-001",
      "cliente": "João Silva",
      "quadra": "Futsal Premium",
      "data": "2026-08-10",
      "horarioInicio": "14:00",
      "horarioFim": "15:00",
      "status": "CONFIRMADA",
      "valorAluguel": 100.00,
      "comandaId": "uuid"
    }
  ]
}
```

---

#### GET /reservas/:id
**Descrição:** Obter detalhes de reserva.

**Response (200):**
```json
{
  "id": "uuid",
  "numeroReserva": "RSV-20260810-001",
  "usuarioId": "uuid",
  "quadraId": "uuid",
  "data": "2026-08-10",
  "horarioInicio": "14:00",
  "horarioFim": "15:00",
  "status": "CONFIRMADA",
  "valorAluguel": 100.00,
  "comandaId": "uuid",
  "dataCriacao": "2026-08-09T15:30:00Z"
}
```

---

#### PUT /reservas/:id
**Descrição:** Atualizar reserva (CLIENTE pode mudar data, ADMIN pode tudo).

**Request:**
```json
{
  "data": "2026-08-15",
  "horarioInicio": "15:00",
  "duracao": 60
}
```

**Response (200):**
```json
{
  "mensagem": "Reserva atualizada com sucesso"
}
```

---

#### DELETE /reservas/:id
**Descrição:** Cancelar reserva (CLIENTE com antecedência, ADMIN sempre).

**Request (ADMIN):**
```json
{
  "motivo": "Solicitação do cliente"
}
```

**Response (200):**
```json
{
  "mensagem": "Reserva cancelada com sucesso"
}
```

---

### COMANDAS

#### POST /comandas/:reservaId
**Descrição:** Criar comanda (automático ao criar reserva, mas disponível manual).

**Response (201):**
```json
{
  "id": "uuid",
  "numeroComanda": "CMD-20260810-001",
  "reservaId": "uuid",
  "status": "ABERTA",
  "subtotalConsumos": 0,
  "valorAluguel": 100.00,
  "total": 100.00
}
```

---

#### GET /comandas
**Descrição:** Listar comandas (CLIENTE próprias, FUNCIONARIO abertas, ADMIN todas).

**Query Params:**
- `status`: ABERTA, FECHADA, AGUARDANDO_PAGAMENTO, PAGA, CANCELADA
- `dataInicio`: YYYY-MM-DD
- `dataFim`: YYYY-MM-DD

**Response (200):**
```json
{
  "total": 30,
  "dados": [
    {
      "id": "uuid",
      "numeroComanda": "CMD-20260810-001",
      "cliente": "João Silva",
      "quadra": "Futsal Premium",
      "status": "ABERTA",
      "subtotalConsumos": 0,
      "valorAluguel": 100.00,
      "total": 100.00,
      "dataCriacao": "2026-08-10T14:00:00Z"
    }
  ]
}
```

---

#### GET /comandas/:id
**Descrição:** Obter detalhes de comanda com itens.

**Response (200):**
```json
{
  "id": "uuid",
  "numeroComanda": "CMD-20260810-001",
  "reservaId": "uuid",
  "usuarioId": "uuid",
  "status": "ABERTA",
  "itens": [
    {
      "id": "uuid",
      "produto": "Refrigerante",
      "quantidade": 2,
      "precoUnitario": 6.00,
      "subtotal": 12.00
    }
  ],
  "subtotalConsumos": 12.00,
  "valorAluguel": 100.00,
  "total": 112.00
}
```

---

#### POST /comandas/:id/itens
**Descrição:** Adicionar item à comanda (FUNCIONARIO).

**Request:**
```json
{
  "produtoId": "uuid",
  "quantidade": 2
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "produtoId": "uuid",
  "produto": "Refrigerante",
  "quantidade": 2,
  "precoUnitario": 6.00,
  "subtotal": 12.00
}
```

---

#### DELETE /comandas/:id/itens/:itemId
**Descrição:** Remover item de comanda (FUNCIONARIO em comanda aberta).

**Response (200):**
```json
{
  "mensagem": "Item removido com sucesso"
}
```

---

#### PUT /comandas/:id/fechar
**Descrição:** Fechar comanda (FUNCIONARIO).

**Response (200):**
```json
{
  "id": "uuid",
  "numeroComanda": "CMD-20260810-001",
  "status": "FECHADA",
  "total": 112.00,
  "mensagem": "Comanda fechada. Aguardando pagamento"
}
```

---

#### POST /comandas/:id/pagamento
**Descrição:** Registrar pagamento (ADMIN).

**Request:**
```json
{
  "formaPagamento": "DINHEIRO",
  "valorPago": 112.00,
  "troco": 0,
  "observacoes": "Pagamento em dinheiro"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "PAGA",
  "valorPago": 112.00,
  "troco": 0,
  "mensagem": "Pagamento registrado com sucesso"
}
```

---

### PRODUTOS

#### GET /produtos
**Descrição:** Listar produtos.

**Query Params:**
- `categoriaId`: uuid
- `ativo`: true, false
- `busca`: nome
- `comEstoque`: true (apenas com estoque > 0)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nome": "Refrigerante",
    "descricao": "Refrigerante 2L",
    "categoria": "Bebidas",
    "preco": 6.00,
    "estoqueAtual": 50,
    "estoqueMinimo": 5,
    "ativo": true
  }
]
```

---

#### POST /produtos
**Descrição:** Criar produto (ADMIN only).

**Request:**
```json
{
  "nome": "Refrigerante",
  "descricao": "Refrigerante 2L",
  "categoriaId": "uuid",
  "preco": 6.00,
  "estoqueInicial": 50,
  "estoqueminimo": 5,
  "ativo": true
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "nome": "Refrigerante",
  "preco": 6.00,
  "estoqueAtual": 50
}
```

---

#### PUT /produtos/:id
**Descrição:** Atualizar produto (ADMIN only).

**Request:**
```json
{
  "preco": 7.00,
  "estoqueAtual": 48
}
```

**Response (200):**
```json
{
  "mensagem": "Produto atualizado com sucesso"
}
```

---

#### DELETE /produtos/:id
**Descrição:** Deletar produto (ADMIN only).

**Response (200):**
```json
{
  "mensagem": "Produto deletado com sucesso"
}
```

---

### CATEGORIAS

#### GET /categorias
**Descrição:** Listar categorias.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nome": "Bebidas",
    "descricao": "Bebidas em geral",
    "ativa": true
  }
]
```

---

#### POST /categorias
**Descrição:** Criar categoria (ADMIN only).

**Request:**
```json
{
  "nome": "Bebidas",
  "descricao": "Bebidas em geral",
  "ativa": true
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "nome": "Bebidas"
}
```

---

### BLOQUEIOS

#### POST /bloqueios
**Descrição:** Bloquear horário (ADMIN/FUNCIONARIO).

**Request:**
```json
{
  "quadraId": "uuid",
  "data": "2026-08-10",
  "horarioInicio": "12:00",
  "horarioFim": "13:00",
  "motivo": "MANUTENCAO"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "quadraId": "uuid",
  "data": "2026-08-10",
  "status": "Bloqueado"
}
```

---

#### DELETE /bloqueios/:id
**Descrição:** Desbloquear horário (ADMIN).

**Response (200):**
```json
{
  "mensagem": "Bloqueio removido com sucesso"
}
```

---

### RELATÓRIOS

#### GET /relatorios/ocupacao
**Descrição:** Relatório de ocupação (ADMIN only).

**Query Params:**
- `dataInicio`: YYYY-MM-DD
- `dataFim`: YYYY-MM-DD
- `quadraId`: uuid (opcional)

**Response (200):**
```json
{
  "periodo": "2026-08-01 a 2026-08-31",
  "totalReservas": 120,
  "taxaOcupacao": 75.5,
  "porQuadra": [
    {
      "quadra": "Futsal Premium",
      "reservas": 45,
      "ocupacao": 80
    }
  ]
}
```

---

#### GET /relatorios/receita
**Descrição:** Relatório de receita (ADMIN only).

**Query Params:**
- `dataInicio`: YYYY-MM-DD
- `dataFim`: YYYY-MM-DD

**Response (200):**
```json
{
  "periodo": "2026-08-01 a 2026-08-31",
  "totalReceita": 15000.00,
  "porQuadra": [
    {
      "quadra": "Futsal Premium",
      "receita": 6000.00
    }
  ],
  "porProduto": [
    {
      "produto": "Refrigerante",
      "quantidade": 200,
      "receita": 1200.00
    }
  ]
}
```

---

#### GET /relatorios/consumo
**Descrição:** Relatório de consumo de produtos (ADMIN only).

**Query Params:**
- `dataInicio`: YYYY-MM-DD
- `dataFim`: YYYY-MM-DD
- `categoriaId`: uuid (opcional)

**Response (200):**
```json
{
  "periodo": "2026-08-01 a 2026-08-31",
  "produtos": [
    {
      "id": "uuid",
      "nome": "Refrigerante",
      "quantidade": 200,
      "valor": 1200.00,
      "percentual": 15.5
    }
  ]
}
```

---

#### GET /relatorios/clientes
**Descrição:** Relatório de clientes (ADMIN only).

**Response (200):**
```json
{
  "totalClientes": 350,
  "clientesAtivos": 280,
  "clientesInativos": 70,
  "novosMes": 45,
  "clientesMaisFrequentes": [
    {
      "nome": "João Silva",
      "reservas": 50,
      "totalGasto": 5000.00
    }
  ]
}
```

---

#### GET /relatorios/exportar/:tipo
**Descrição:** Exportar relatório em PDF ou CSV.

**Query Params:**
- `formato`: PDF ou CSV
- `dataInicio`: YYYY-MM-DD
- `dataFim`: YYYY-MM-DD

**Response:**
- Arquivo PDF ou CSV para download

---

### DASHBOARD

#### GET /dashboard
**Descrição:** Dados do dashboard (ADMIN only).

**Response (200):**
```json
{
  "receitaHoje": 2450.00,
  "receitaMes": 45320.00,
  "reservasHoje": 8,
  "reservasConfirmadas": 15,
  "taxaOcupacao": 75,
  "produtosBaixoEstoque": 3,
  "proximasReservas": [
    {
      "numeroReserva": "RSV-20260810-001",
      "cliente": "João Silva",
      "quadra": "Futsal Premium",
      "horario": "14:00"
    }
  ],
  "comandasAguardando": 5,
  "graficoReceita": [],
  "graficoOcupacao": []
}
```

---

## 12. DASHBOARD

### CARDS PRINCIPAIS

**Card 1: Receita do Dia**
- Valor: R$ 2.450,00
- Variação: +15% vs dia anterior (mostrar ↑ verde)
- Clicável: abre relatório de receita do dia

**Card 2: Receita do Mês**
- Valor: R$ 45.320,00
- Meta: R$ 50.000,00 (mostrar barra de progresso)
- Percentual: 90,6%

**Card 3: Reservas Hoje**
- Número: 8
- Capacidade: 20 (mostrar percentual)
- Status: 6 Confirmadas, 2 Ativas

**Card 4: Taxa de Ocupação**
- Percentual: 75%
- Barra visual (0-100%)
- Comparação com dia anterior

**Card 5: Produtos com Baixo Estoque**
- Número: 3
- Clicável: mostra lista de produtos
- Alerta visual (amarelo)

**Card 6: Comandas Aguardando Pagamento**
- Número: 5
- Valor Total: R$ 1.230,00
- Clicável: abre lista para processar

### GRÁFICOS

**Gráfico 1: Receita Diária (últimos 30 dias)**
- Tipo: Linha
- Eixo X: Data
- Eixo Y: Valor em R$
- Interativo: hover mostra valor
- Filtro: últimos 7, 30, 90 dias

**Gráfico 2: Receita por Quadra**
- Tipo: Barras horizontais
- Ordenado: maior receita primeiro
- Top 5 quadras
- Clicável: filtra agenda por quadra

**Gráfico 3: Ocupação por Hora (hoje)**
- Tipo: Área
- Eixo X: Hora (06:00 a 22:00)
- Eixo Y: Ocupação (%)
- Múltiplas linhas: uma por quadra principal

**Gráfico 4: Produtos Mais Vendidos**
- Tipo: Ranking (top 5)
- Lista: Produto, Quantidade, Valor
- Ícones de categoria

### TABELAS

**Tabela 1: Próximas Reservas (próximas 10)**
- Colunas: Hora, Quadra, Cliente, Status
- Ordenação: por hora (crescente)
- Cores: verde (confirmada), azul (ativa)
- Clicável: mostra detalhes completos

**Tabela 2: Comandas Aguardando Pagamento**
- Colunas: Número, Cliente, Quadra, Total, Ação
- Ação: "Processar Pagamento"
- Cores: amarelo fundo para chamar atenção

**Tabela 3: Últimos Clientes Cadastrados**
- Colunas: Nome, Email, Data, Ação
- Ação: "Ver Perfil"
- Últimos 5

### FILTROS

**Período:**
- Radio buttons: Hoje, Esta Semana, Este Mês, Customizado
- Se Customizado: date pickers (início/fim)
- Padrão: Este Mês

**Quadra:**
- Dropdown: Todas ou selecionar específica
- Atualiza gráficos e tabelas em tempo real

**Status:**
- Checkboxes: Confirmada, Ativa, Finalizada (para filtros de reserva)

### BOTÕES

**Botão 1: Nova Reserva**
- Cor: Primária (azul)
- Posição: Topo direito
- Ação: Abre modal de nova reserva

**Botão 2: Ver Relatórios Completos**
- Cor: Secundária
- Posição: Topo
- Ação: Vai para página de relatórios

**Botão 3: Exportar Dashboard**
- Cor: Terciária
- Ação: Exporta screenshot ou PDF

---

## 13. RELATÓRIOS

### 13.1 RELATÓRIO: OCUPAÇÃO DE QUADRAS

**Objetivo:** Analisar uso de quadras no período.

**Filtros:**
- Período (data início e fim)
- Quadra (todas ou específica)

**Dados Exibidos:**
- Total de reservas no período
- Taxa de ocupação geral (%)
- Taxa de ocupação por quadra
- Horários mais ocupados
- Horários com menor ocupação
- Receita gerada por ocupação
- Gráfico: ocupação por dia
- Gráfico: ocupação por hora (heatmap)
- Ranking quadras mais ocupadas

**Exportação:** PDF, CSV

---

### 13.2 RELATÓRIO: RECEITA

**Objetivo:** Análise financeira do período.

**Filtros:**
- Período
- Quadra (opcional)

**Dados Exibidos:**
- Receita total do período
- Receita por dia (evolução)
- Receita por quadra
- Receita por produto
- Ticket médio por reserva
- Ticket médio por comanda
- Formas de pagamento mais usadas
- Gráfico: receita diária
- Gráfico: receita por quadra (pizza ou barras)
- Gráfico: receita aluguel vs consumo

**Exportação:** PDF, CSV

---

### 13.3 RELATÓRIO: CONSUMO DE PRODUTOS

**Objetivo:** Analisar consumo de bebidas, lanches, etc.

**Filtros:**
- Período
- Categoria de produto
- Quadra (opcional)

**Dados Exibidos:**
- Produtos mais consumidos (ranking)
- Produtos com menor consumo
- Quantidade total consumida
- Receita por produto
- Receita por categoria
- Estoque movimentado
- Produtos próximos do fim de estoque
- Gráfico: produtos top 10
- Gráfico: consumo por categoria

**Exportação:** PDF, CSV

---

### 13.4 RELATÓRIO: CLIENTES

**Objetivo:** Análise do base de clientes.

**Filtros:**
- Período de cadastro
- Status (ativo/inativo)

**Dados Exibidos:**
- Total de clientes
- Clientes novos no período
- Clientes ativos
- Clientes com reservas no período
- Clientes mais frequentes
- Gasto médio por cliente
- Ticket médio de cada cliente
- Últimas 10 clientelas cadastradas
- Gráfico: crescimento de clientes

**Exportação:** PDF, CSV

---

### 13.5 RELATÓRIO: FUNCIONÁRIOS

**Objetivo:** Análise de desempenho de funcionários.

**Filtros:**
- Período
- Funcionário (todos ou específico)

**Dados Exibidos:**
- Total de movimentações por funcionário
- Reservas criadas
- Comandas fechadas
- Erros (itens removidos, cancelamentos)
- Desempenho (maior agilidade)
- Gráfico: atividades por funcionário

**Exportação:** PDF, CSV

---

### 13.6 RELATÓRIO: COMPARATIVO

**Objetivo:** Comparar dois períodos.

**Filtros:**
- Período 1 (data início/fim)
- Período 2 (data início/fim)

**Dados Exibidos:**
- Comparação receita
- Comparação ocupação
- Comparação reservas
- Comparação clientes
- Variação (%)
- Gráfico comparativo lado a lado

**Exportação:** PDF, CSV

---

## 14. CASOS DE USO

### CU01: CLIENTE FAZENDO RESERVA

**Ator Principal:** Cliente

**Pré-condição:** Cliente está logado

**Fluxo Principal:**
1. Cliente navega até "Nova Reserva"
2. Sistema exibe lista de quadras disponíveis
3. Cliente seleciona uma quadra
4. Sistema exibe calendário de disponibilidade
5. Cliente seleciona data
6. Sistema exibe grade de horários (verde = disponível, vermelho = ocupado)
7. Cliente seleciona horário
8. Sistema calcula valor (preço quadra × duração)
9. Cliente confirma
10. Sistema cria reserva com status "CONFIRMADA"
11. Sistema gera comanda automaticamente
12. Sistema exibe número da reserva
13. Cliente recebe confirmação

**Pós-condição:** Reserva criada, horário bloqueado, comanda gerada

**Fluxos Alternativos:**
- FA1: Horário selecionado fica ocupado durante seleção → sistema avisa e volta ao calendário
- FA2: Cliente cancela → volta à lista de quadras

---

### CU02: CLIENTE CANCELANDO RESERVA

**Ator Principal:** Cliente

**Pré-condição:** Cliente tem reserva com status "CONFIRMADA"

**Fluxo Principal:**
1. Cliente acessa "Minhas Reservas"
2. Sistema exibe lista de reservas do cliente
3. Cliente seleciona uma reserva com status "CONFIRMADA"
4. Sistema exibe botão "Cancelar"
5. Cliente clica "Cancelar"
6. Sistema verifica: faltam 2+ horas? → SIM
7. Sistema pede confirmação
8. Cliente confirma
9. Sistema muda reserva para "CANCELADA"
10. Sistema libera horário
11. Sistema muda comanda para "CANCELADA"
12. Sistema exibe confirmação

**Pós-condição:** Reserva cancelada, horário liberado

**Fluxos Alternativos:**
- FA1: Menos de 2 horas para reserva → sistema bloqueia cancelamento com mensagem

---

### CU03: FUNCIONÁRIO REGISTRANDO CONSUMO

**Ator Principal:** Funcionário

**Pré-condição:** Cliente chegou, reserva em status "ATIVA"

**Fluxo Principal:**
1. Funcionário acessa "Comandas"
2. Funcionário busca comanda por número ou nome do cliente
3. Sistema exibe comanda aberta
4. Funcionário clica "Abrir Comanda"
5. Funcionário vê grid com aluguel + consumos
6. Cliente pede consumo (ex: 2 refrigerantes)
7. Funcionário seleciona produto "Refrigerante"
8. Funcionário insere quantidade "2"
9. Sistema calcula: 2 × 6,00 = 12,00
10. Funcionário clica "Adicionar"
11. Sistema valida estoque (50 >= 2) → OK
12. Sistema adiciona item à comanda
13. Sistema diminui estoque (50 → 48)
14. Sistema recalcula total
15. Funcionário clica "Adicionar Novo Item" (se houver mais)
16. Repetir passos 6-14
17. Cliente termina e funcionário clica "Fechar Comanda"
18. Sistema muda comanda para "FECHADA"
19. Sistema muda para "AGUARDANDO PAGAMENTO"
20. Funcionário entrega comprovante

**Pós-condição:** Comanda fechada, aguardando pagamento

---

### CU04: ADMIN REGISTRANDO PAGAMENTO

**Ator Principal:** Administrador

**Pré-condição:** Comanda com status "AGUARDANDO PAGAMENTO"

**Fluxo Principal:**
1. Admin acessa Dashboard
2. Admin vê card "Comandas Aguardando Pagamento"
3. Admin clica em "5 Aguardando"
4. Sistema exibe lista de comandas
5. Admin clica em comanda
6. Sistema exibe detalhes (itens, total)
7. Admin clica "Registrar Pagamento"
8. Sistema abre modal de pagamento
9. Admin seleciona forma: "DINHEIRO"
10. Admin insere "Valor Recebido": 112.00
11. Sistema calcula troco: 0
12. Admin clica "Confirmar Pagamento"
13. Sistema muda comanda para "PAGA"
14. Sistema muda reserva para "FINALIZADA"
15. Sistema registra no histórico
16. Sistema exibe confirmação

**Pós-condição:** Comanda paga, reserva finalizada, dinheiro registrado

---

### CU05: ADMIN CONSULTANDO DASHBOARD

**Ator Principal:** Administrador

**Pré-condição:** Admin logado

**Fluxo Principal:**
1. Admin faz login
2. Sistema redireciona para Dashboard
3. Admin vê cards principais (receita, ocupação, etc.)
4. Admin vê gráficos de receita, ocupação, produtos top
5. Admin vê tabela de próximas reservas
6. Admin muda filtro de período (dropdown)
7. Sistema atualiza todos os dados
8. Admin vê gráfico de receita diária mudou
9. Admin clica em "Ver Relatórios Completos"
10. Sistema vai para página de relatórios

**Pós-condição:** Admin visualizou indicadores principais

---

### CU06: ADMIN CRIANDO NOVO USUÁRIO

**Ator Principal:** Administrador

**Pré-condição:** Admin logado

**Fluxo Principal:**
1. Admin navega para "Gerenciamento" → "Usuários"
2. Admin clica "Novo Usuário"
3. Sistema exibe formulário
4. Admin preenche: nome, email, telefone, CPF
5. Admin seleciona perfil: "FUNCIONARIO"
6. Admin clica "Criar"
7. Sistema valida (email único, CPF válido)
8. Sistema gera senha temporária
9. Sistema cria usuário
10. Sistema envia email com acesso
11. Sistema exibe confirmação

**Pós-condição:** Usuário criado, email de acesso enviado

---

### CU07: ADMIN GERANDO RELATÓRIO DE RECEITA

**Ator Principal:** Administrador

**Pré-condição:** Admin logado

**Fluxo Principal:**
1. Admin navega para "Relatórios"
2. Admin seleciona "Receita"
3. Admin seleciona período: "Este Mês"
4. Admin clica "Gerar Relatório"
5. Sistema processa dados
6. Sistema exibe tabelas: receita diária, por quadra, por produto
7. Sistema exibe gráficos
8. Admin clica "Exportar PDF"
9. Sistema gera PDF
10. Admin baixa arquivo

**Pós-condição:** Relatório gerado e exportado

---

### CU08: CLIENTE RENOVANDO RESERVA

**Ator Principal:** Cliente

**Pré-condição:** Cliente logado, tem histórico de reservas

**Fluxo Principal:**
1. Cliente acessa "Histórico"
2. Cliente vê lista de reservas passadas
3. Cliente seleciona uma reserva (ex: Futsal Premium, 14:00-15:00)
4. Cliente clica "Renovar"
5. Sistema abre formulário com mesma quadra e horário pré-selecionados
6. Cliente seleciona data: "próxima quinta-feira"
7. Sistema valida disponibilidade
8. Sistema mostra valor: R$ 100,00
9. Cliente confirma
10. Sistema cria nova reserva
11. Sistema gera comanda
12. Cliente recebe confirmação

**Pós-condição:** Nova reserva criada com mesmos dados da anterior

---

### CU09: FUNCIONÁRIO BLOQUEANDO HORÁRIO

**Ator Principal:** Funcionário

**Pré-condição:** Funcionário logado, acesso à agenda

**Fluxo Principal:**
1. Funcionário acessa "Agenda"
2. Funcionário clica "Bloquear Horário"
3. Sistema abre modal
4. Funcionário seleciona quadra
5. Funcionário seleciona data
6. Funcionário seleciona horário (início e fim)
7. Funcionário seleciona motivo: "MANUTENCAO"
8. Funcionário clica "Confirmar"
9. Sistema valida (sem conflitos com reservas)
10. Sistema bloqueia horário
11. Sistema exibe confirmação

**Pós-condição:** Horário bloqueado, não pode ser reservado

---

### CU10: ADMIN CANCELANDO RESERVA

**Ator Principal:** Administrador

**Pré-condição:** Admin logado, reserva existe

**Fluxo Principal:**
1. Admin acessa "Agenda de Reservas"
2. Admin localiza reserva
3. Admin clica "Cancelar"
4. Sistema abre modal
5. Admin seleciona motivo: "Solicitação do cliente"
6. Admin adiciona observações (opcional)
7. Admin clica "Confirmar"
8. Sistema cancela reserva
9. Sistema libera horário
10. Sistema registra no histórico
11. Sistema envia notificação (se sistema tiver email)
12. Admin vê confirmação

**Pós-condição:** Reserva cancelada, cliente notificado

---

## 15. MVP (MINIMUM VIABLE PRODUCT)

### VERSÃO 1.0 - FUNCIONALIDADES ESSENCIAIS

A primeira versão do ArenaGo entregará:

#### AUTENTICAÇÃO
- [x] Cadastro de usuários (cliente)
- [x] Login/Logout
- [x] Perfil de usuário (edição)

#### QUADRAS
- [x] Cadastro de quadras (admin)
- [x] Visualização de quadras disponíveis
- [x] Ativar/desativar quadras
- [x] Editar quadras

#### RESERVAS
- [x] Cliente fazer reserva (data, horário, quadra)
- [x] Visualizar disponibilidade em calendário
- [x] Bloqueio automático de horários
- [x] Cliente visualizar suas reservas
- [x] Cliente cancelar reserva (com antecedência)
- [x] Funcionário criar reserva manualmente
- [x] Admin visualizar todas as reservas
- [x] Admin cancelar reserva

#### COMANDAS
- [x] Geração automática de comanda na reserva
- [x] Funcionário adicionar consumo
- [x] Funcionário fechar comanda
- [x] Admin registrar pagamento
- [x] Visualizar comanda com detalhes

#### PRODUTOS
- [x] Cadastro de produtos
- [x] Cadastro de categorias
- [x] Controle de estoque básico
- [x] Editar produtos
- [x] Deletar produtos

#### PAINEL ADMINISTRATIVO
- [x] Dashboard com indicadores básicos (receita, reservas, ocupação)
- [x] Gráficos simples (receita, ocupação)
- [x] Agenda de reservas
- [x] Gerenciamento de clientes
- [x] Gerenciamento de quadras
- [x] Gerenciamento de produtos

#### FUNCIONALIDADES NÃO INCLUÍDAS NO MVP
- [ ] Recuperação de senha por email
- [ ] Sistema de notificações (email/SMS)
- [ ] Relatórios avançados (exportação PDF/CSV)
- [ ] Gerenciamento de funcionários
- [ ] Bloqueio manual de horários
- [ ] Histórico de auditoria completo
- [ ] Ajustes manuais de estoque
- [ ] Dashboard com gráficos avançados
- [ ] Renovação de reservas
- [ ] Clientes frequentes
- [ ] Comparativo de períodos
- [ ] Roles avançados de funcionário

### CRONOGRAMA ESTIMADO MVP
- Backend: 4 semanas
- Frontend: 4 semanas
- Testes: 2 semanas
- **Total: 10 semanas**

### TECNOLOGIAS MVP
- **Frontend:** React, JavaScript, Vite
- **Backend:** Node.js, Express
- **Banco:** MySQL + Prisma ORM
- **Autenticação:** JWT (token)
- **Validação:** Joi ou similar
- **Hash:** bcrypt

---

## CONCLUSÃO

O ArenaGo é um sistema completo e viável para ser desenvolvido em um TCC, utilizando tecnologias modernas e práticas profissionais de desenvolvimento. O MVP proposto pode ser entregue em 10 semanas de desenvolvimento focado, e as funcionalidades adicionais podem ser implementadas em versões futuras.

O documento de especificação fornece base sólida para:
- Desenvolvimento do backend (APIs REST)
- Desenvolvimento do frontend (componentes React)
- Estrutura do banco de dados (Prisma schema)
- Testes e validações
- Documentação de código

**Próximos passos:**
1. Criar Prisma schema baseado na modelagem
2. Estruturar projeto Express com middlewares
3. Implementar APIs do MVP
4. Desenvolver interfaces React
5. Testar e validar
6. Deploy
