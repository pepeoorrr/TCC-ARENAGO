const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const quadrasRoutes = require('./routes/quadrasRoutes');
const reservasRoutes = require('./routes/reservasRoutes');
const comandasRoutes = require('./routes/comandasRoutes');
const produtosRoutes = require('./routes/produtosRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');
const bloqueiosRoutes = require('./routes/bloqueiosRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const disponibilidadeRoutes = require('./routes/disponibilidadeRoutes');

// Importar middlewares
const errorHandler = require('./middlewares/errorHandler');
const authMiddleware = require('./middlewares/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES ====================

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== ROTAS PÚBLICAS ====================

app.use('/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== MIDDLEWARE DE AUTENTICAÇÃO ====================
app.use(authMiddleware);

// ==================== ROTAS PROTEGIDAS ====================

// Usuários
app.use('/usuarios', usuariosRoutes);

// Quadras
app.use('/quadras', quadrasRoutes);

// Disponibilidade
app.use('/disponibilidade', disponibilidadeRoutes);

// Reservas
app.use('/reservas', reservasRoutes);

// Comandas
app.use('/comandas', comandasRoutes);

// Produtos
app.use('/produtos', produtosRoutes);

// Categorias
app.use('/categorias', categoriasRoutes);

// Bloqueios
app.use('/bloqueios', bloqueiosRoutes);

// Dashboard
app.use('/dashboard', dashboardRoutes);

// ==================== TRATAMENTO DE ERROS ====================

// 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Error handler
app.use(errorHandler);

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║      ArenaGo API Server Iniciado       ║
║      Port: ${PORT}                          ║
║      Environment: ${process.env.NODE_ENV || 'development'}       ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
