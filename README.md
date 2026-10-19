# ArenaGo - Plataforma de Agendamento de Quadras Esportivas

Aplicação React moderna para gerenciamento e agendamento de quadras esportivas de areia com dashboard administrativo completo.

**Estrutura atual:** [perfis, estabelecimentos, comandas individuais e execução dos testes](IMPLEMENTACAO_PERFIS.md). Esse guia descreve o backend e frontend atuais, a migração e o cadastro do primeiro administrador.

## Tecnologias Utilizadas

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
