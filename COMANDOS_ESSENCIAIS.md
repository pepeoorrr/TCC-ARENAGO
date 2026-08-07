# 🔧 Comandos Essenciais - ArenaGo

## 🚀 INICIAR O PROJETO (Primeira Vez)

### Terminal 1: Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env com credenciais MySQL
npm run prisma:migrate
npm run dev
```

**Resultado esperado:**
```
✓ Server rodando em http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

**Resultado esperado:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

---

## ⚡ INICIAR O PROJETO (Vezes Seguintes)

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

---

## 🧪 TESTAR A APLICAÇÃO

### Teste de Cadastro
1. Abra http://localhost:5173
2. Clique "Criar Conta"
3. Preencha dados (CPF 12345678901 é válido)
4. Clique "Criar Conta"

### Teste de Login
1. Vá para /login (ou clique "Voltar ao Login")
2. Use email e senha cadastrados
3. Deve ir para Dashboard Cliente

### Teste como Admin
```bash
# Conecte ao banco MySQL
mysql -u root -p arenago

# Altere perfil
UPDATE Usuario SET perfil = 'ADMIN' WHERE email = 'seu@email.com';
EXIT;
```

Logout e login novamente. Agora verá Dashboard Admin.

---

## 📊 GERENCIAR BANCO DE DADOS

### Executar Migrações
```bash
cd backend
npm run prisma:migrate
```

### Regenerar Cliente Prisma
```bash
cd backend
npm run prisma:generate
```

### Acessar Banco Diretamente
```bash
mysql -u root -p arenago
```

### Queries Úteis
```sql
-- Ver todos usuários
SELECT id, nome, email, perfil, ativo FROM Usuario;

-- Mudar perfil de usuário
UPDATE Usuario SET perfil = 'ADMIN' WHERE email = 'seu@email.com';

-- Criar quadra de teste
INSERT INTO Quadra (nome, tipo, precoHora, horarioInicio, horarioFim, durationPadraoMinutos, ativa) 
VALUES ('Quadra 1', 'FUTSAL', 100.00, '08:00', '22:00', 60, true);

-- Ver quadras
SELECT * FROM Quadra;

-- Ver reservas
SELECT r.id, r.numeroReserva, r.dataReserva, r.horarioInicio, r.status 
FROM Reserva r 
JOIN Usuario u ON r.usuarioId = u.id;

-- Ver comandas
SELECT c.id, c.numeroComanda, c.status, c.total 
FROM Comanda c;

-- Limpar dados de teste
DELETE FROM Usuario WHERE email LIKE '%teste%';
DELETE FROM Quadra;
```

---

## 🛠️ BUILD & PRODUÇÃO

### Build Backend (Não aplicável - Node.js puro)
Backend não precisa build, apenas dependências instaladas.

### Build Frontend
```bash
cd frontend
npm run build
```

Gera pasta `dist/` pronta para deploy.

### Preview de Produção
```bash
cd frontend
npm run preview
```

Acesse http://localhost:4173 para ver build de produção.

---

## 🐛 DEBUG & TROUBLESHOOTING

### Ver Logs do Backend
```bash
# Terminal já mostra logs
# Para mais verbose:
cd backend
DEBUG=prisma:* npm run dev
```

### Ver Logs do Frontend
```bash
# Abra DevTools (F12)
# Vá para Console
# Você verá logs do React e requisições HTTP
```

### Ver Requisições HTTP
```bash
# No DevTools (F12)
# Vá para aba "Network"
# Faça uma ação (login, criar reserva, etc)
# Verá todas as requisições com status, body, response
```

### Limpar Cache/Storage
```bash
# No DevTools (F12)
# Application → Storage → Clear Site Data

# Ou via Console:
localStorage.clear()
sessionStorage.clear()
```

### Resetar Banco de Dados
```bash
# OPção 1: Deletar database e recriar
mysql -u root -p -e "DROP DATABASE arenago; CREATE DATABASE arenago;"

# Opção 2: Delete migrations e recrie
cd backend
rm -rf prisma/migrations
npm run prisma:migrate
```

### Porta já em Uso
```bash
# Verificar porta em uso (Windows)
netstat -ano | findstr :5000

# Matar processo
taskkill /PID <PID> /F

# Ou mudar porta no .env
PORT=5001
```

---

## 📦 INSTALAR DEPENDÊNCIAS ADICIONAIS

### Backend (Se Precisar)
```bash
cd backend

# Adicionar package
npm install nome-do-pacote

# Remover package
npm uninstall nome-do-pacote

# Atualizar package
npm update nome-do-pacote
```

### Frontend (Se Precisar)
```bash
cd frontend

# Adicionar package
npm install nome-do-pacote

# Para devDependencies
npm install --save-dev nome-do-pacote

# Remover package
npm uninstall nome-do-pacote
```

---

## 🔐 VARIÁVEIS DE AMBIENTE

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="mysql://user:password@localhost:3306/arenago"
JWT_SECRET="sua_chave_secreta_super_segura_123456"
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ArenaGo
VITE_APP_VERSION=1.0.0
```

---

## 🔄 GIT (Se Usar Controle de Versão)

### Inicializar Git
```bash
git init
git add .
git commit -m "Initial commit: ArenaGo v1.0.0"
```

### Ignorar Arquivos
```bash
# Criar .gitignore (se não existir)
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
echo "dist/" >> .gitignore
echo ".DS_Store" >> .gitignore
```

### Commits Comuns
```bash
# Adicionar feature
git add src/pages/Nova.jsx
git commit -m "feat: Add new page Nova.jsx"

# Corrigir bug
git commit -m "fix: Corrigir validação de email"

# Atualizar deps
git commit -m "chore: Update dependencies"
```

---

## 📱 TESTAR EM OUTRO DISPOSITIVO

### Descobrir IP Local
```bash
# Windows
ipconfig
# Procure "IPv4 Address" (ex: 192.168.1.100)

# Mac/Linux
ifconfig | grep inet
```

### Acessar do Celular/Tablet
1. Certifique que estão na mesma rede WiFi
2. Acesse `http://192.168.1.100:5173` no navegador
3. Frontend funcionará normalmente

**Nota**: Backend precisa estar configurado com `FRONTEND_URL` correto.

---

## 🚀 PRÓXIMO DEPLOY

### Antes de Deploy
```bash
# Verificar erros
cd frontend
npm run build

# Verificar no preview
npm run preview

# Verificar se backend passa nos testes
cd ../backend
npm run test  # Quando testes forem adicionados
```

### Deploy Frontend (Exemplo: Vercel)
```bash
npm install -g vercel
vercel
# Siga prompts
```

### Deploy Backend (Exemplo: Heroku)
```bash
heroku login
heroku create seu-app-nome
git push heroku main
```

---

## 📝 DICAS ÚTEIS

### Recarregar Backend (Nodemon)
O backend com `npm run dev` já recarrega automaticamente ao salvar.

### Recarregar Frontend (Vite HMR)
Frontend recarrega automaticamente ao salvar (Hot Module Reload).

### Debug em Tempo Real
```bash
# Abra DevTools: F12 ou Right-Click → Inspect

# Vá para Sources
# Coloque breakpoints no código
# Recarregue a página (F5)
# Debug passo a passo
```

### Testar Offline
```bash
# Desconecte internet
# Aplicação mostrará erro de conexão (normal)
# Reconecte internet
# Clique botão de retry (se implementado)
```

---

## ✅ VERIFICAÇÃO ANTES DE COMEÇAR A DESENVOLVER

- [x] Backend rodando em http://localhost:5000 ✓
- [x] Frontend rodando em http://localhost:5173 ✓
- [x] Banco de dados criado e migrations executadas ✓
- [x] Consegue cadastrar usuário ✓
- [x] Consegue fazer login ✓
- [x] Consegue ver Dashboard ✓
- [x] Consegue fazer logout ✓

Se todas as caixas estão verificadas, está pronto para desenvolvimento! 🎉

---

**Última Atualização**: 2024  
**Versão**: 1.0.0  
**Status**: ✅ Ready to Use
