# 🚀 Guia Rápido - Como Começar

## ⚡ Iniciando em 5 Minutos

### 1️⃣ Preparar Backend

```bash
# Entrar no diretório
cd backend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# IMPORTANTE: Editar .env com suas credenciais MySQL
# DATABASE_URL="mysql://user:password@localhost:3306/arenago"
# JWT_SECRET="sua_chave_secreta_aqui"

# Executar migrations
npm run prisma:migrate

# Iniciar servidor
npm run dev
```

✅ Backend rodando em: **http://localhost:5000**

---

### 2️⃣ Preparar Frontend

```bash
# Em outra aba/janela do terminal
cd frontend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Iniciar servidor de desenvolvimento
npm run dev
```

✅ Frontend rodando em: **http://localhost:5173**

---

## 🎭 Testando Diferentes Perfis

### Perfil CLIENTE
1. Acesse http://localhost:5173
2. Clique em "Criar Conta"
3. Preencha o formulário
4. Será criado como CLIENTE automaticamente
5. Verá Dashboard Cliente com opção de nova reserva

### Perfil FUNCIONARIO ou ADMIN
**Para adicionar manualmente** (requer acesso ao MySQL):

```sql
-- Conectar ao banco
mysql -u seu_usuario -p arenago

-- Consultar usuários
SELECT id, email, perfil FROM Usuario;

-- Atualizar perfil
UPDATE Usuario SET perfil = 'ADMIN' WHERE email = 'seu.email@exemplo.com';
UPDATE Usuario SET perfil = 'FUNCIONARIO' WHERE email = 'outro.email@exemplo.com';

-- Fazer logout e login novamente para ver mudanças
```

---

## 📋 Estrutura de Dados Essencial

### Para Testar Reservas, Precisa De:

1. **Quadras** (criadas via Admin)
   - Vá para `/gerenciamento/quadras` (como admin)
   - Crie algumas quadras (Futsal, Volei, Basquete, etc)

2. **Produtos** (para consumo)
   - Vá para `/gerenciamento/produtos` (como admin)
   - Crie categorias e produtos

3. **Agora pode fazer reserva**
   - Como cliente, clique "+ Nova Reserva"
   - Selecione uma quadra
   - Escolha data/hora (em desenvolvimento)

---

## 🔧 Troubleshooting

### Erro: "Cannot reach database"
```
❌ Problema: Banco de dados não está rodando
✅ Solução: Inicie o MySQL/MariaDB

# Windows (se instalado como serviço)
net start MySQL80

# Ou use a ferramenta de gerenciamento do MySQL
```

### Erro: "Invalid JWT"
```
❌ Problema: Token expirado ou inválido
✅ Solução: Faça logout e login novamente
- Limpe localStorage: F12 → Application → Storage → Clear All
- Faça login novamente
```

### Erro: "Cannot GET /api/..."
```
❌ Problema: Backend não está rodando
✅ Solução: Verifique se está em npm run dev na pasta backend
- Verifique porta 5000 em uso: netstat -ano | findstr :5000 (Windows)
- Altere PORT em .env se necessário
```

### Erro: "CORS error"
```
❌ Problema: Frontend e Backend desconectados
✅ Solução: Verifique FRONTEND_URL em backend/.env
- Deve ser: http://localhost:5173
- Reinicie o backend após alteração
```

---

## 📱 Testando no Mobile/Tablet

1. Descubra seu IP local:
```bash
# Windows
ipconfig
# Procure por "IPv4 Address" (ex: 192.168.1.100)

# Mac/Linux
ifconfig | grep inet
```

2. Acesse no dispositivo:
```
http://192.168.1.100:5173
```

3. Certifique-se que ambos estão na mesma rede WiFi

---

## 💡 Dicas de Desenvolvimento

### Ver logs do servidor
```bash
# Terminal do Backend
npm run dev

# Você verá:
# ✓ Server rodando em http://localhost:5000
# GET /api/usuarios/perfil 200
# POST /api/reservas 201
# etc...
```

### Inspecionar requisições
```bash
# Abra DevTools no navegador (F12)
# Vá para aba "Network"
# Faça uma ação (login, criar reserva, etc)
# Verá todas as requisições HTTP
```

### Editar dados no banco
```bash
# Use ferramentas como:
# - MySQL Workbench
# - DBeaver
# - phpMyAdmin
# - TablePlus

# Ou via terminal:
mysql -u seu_usuario -p arenago
SELECT * FROM Usuario;
UPDATE Usuario SET ativo = true WHERE id = 1;
```

---

## 🎯 Fluxo Recomendado de Testes

### 1. Setup Inicial
- [ ] Backend rodando
- [ ] Frontend rodando
- [ ] Banco criado e com migrations

### 2. Teste de Autenticação
- [ ] Criar conta como cliente
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Token armazenado em localStorage

### 3. Teste de Admin
- [ ] Alterar perfil via banco para ADMIN
- [ ] Login como ADMIN
- [ ] Vê Dashboard Admin com KPIs
- [ ] Acessa `/gerenciamento/quadras`

### 4. Teste de Reserva
- [ ] Como admin, cria algumas quadras
- [ ] Como cliente, vai em "+ Nova Reserva"
- [ ] Seleciona uma quadra
- [ ] (Em desenvolvimento) Seleciona data/hora

### 5. Teste de Comanda
- [ ] Como admin, cria alguns produtos
- [ ] Uma reserva cria automaticamente uma comanda
- [ ] Funcionário pode adicionar itens à comanda
- [ ] Registra pagamento

---

## 📚 Documentação Adicional

- `README_ARENAGO.md` - Documentação completa do projeto
- `RESUMO_IMPLEMENTACAO.md` - Status de implementação
- `ESPECIFICACAO_ARENAGO.md` - Especificação técnica (se existir)
- `backend/src/` - Comentários no código

---

## ❓ Perguntas Frequentes

**P: Como faço para resetar o banco?**
A: Delete a pasta `backend/prisma/migrations` e execute `npm run prisma:migrate` novamente

**P: Como adiciono novos usuários?**
A: Use o endpoint POST /api/usuarios (como admin) ou crie conta via frontend

**P: Como mudo a porta do servidor?**
A: Edite `PORT` em `backend/.env` e reinicie

**P: Como vejo as queries SQL?**
A: Adicione `DEBUG="prisma:*"` no seu .env e reinicie

**P: Como faço para deploy?**
A: Veja documentação em `DEPLOY.md` (será criado)

---

## 🎓 Próximos Passos

Após tudo funcionando:

1. **Completar Frontend**
   - Páginas de calendário/confirmação de reserva
   - Páginas de gerenciamento (admin)
   - Páginas de agenda (funcionário)

2. **Adicionar Testes**
   - Testes unitários
   - Testes de integração
   - Testes E2E

3. **Melhorias**
   - Adicionar chat/suporte
   - Histórico de pagamentos
   - Relatórios em PDF
   - Notificações por email

4. **Deploy**
   - Preparar para produção
   - Configurar CI/CD
   - Hostear em servidor

---

**Sucesso no setup! 🎉**  
Qualquer problema, verifique os logs ou consulte a documentação.
