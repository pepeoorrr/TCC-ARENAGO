import express from "express";
import { prisma } from "../config/prisma.js";

const app = express();

const PORT = 3000;

app.use(express.json());

// Função para testar a conexão com o banco de dados
async function testarConexaoDB() {
  try {
    await prisma.$connect();
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar com o banco de dados:", error.message);
    process.exit(1);
  }
}

app.get("/", (req, res) => {
  res.send("ArenaGo API online!");
});

// Endpoint para verificar a saúde da API e conexão com o banco
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "conectado",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      database: "desconectado",
      error: error.message
    });
  }
});

// Iniciar servidor e testar conexão
app.listen(PORT, async () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  await testarConexaoDB();
});
