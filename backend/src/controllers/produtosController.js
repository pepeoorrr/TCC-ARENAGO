const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const produtosController = {
  async listar(req, res, next) {
    try {
      const { categoriaId, ativo, busca, comEstoque } = req.query;

      const where = {};
      if (categoriaId) where.categoriaId = categoriaId;
      if (ativo !== undefined) where.ativo = ativo === 'true';
      if (busca) where.nome = { contains: busca };
      if (comEstoque === 'true') where.estoqueAtual = { gt: 0 };

      const produtos = await prisma.produto.findMany({
        where,
        include: { categoria: true },
        orderBy: { dataCriacao: 'desc' }
      });

      res.json(produtos);
    } catch (erro) {
      next(erro);
    }
  },

  async obter(req, res, next) {
    try {
      const { id } = req.params;

      const produto = await prisma.produto.findUnique({
        where: { id },
        include: { categoria: true }
      });

      if (!produto) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }

      res.json(produto);
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const { nome, descricao, categoriaId, preco, estoqueInicial, estoqueMinimo, ativo } = req.body;

      if (!nome || !categoriaId || !preco) {
        return res.status(400).json({ erro: 'Nome, categoria e preço são obrigatórios' });
      }

      const produto = await prisma.produto.create({
        data: {
          nome,
          descricao,
          categoriaId,
          preco: parseFloat(preco),
          estoqueAtual: parseInt(estoqueInicial) || 0,
          estoqueMinimo: parseInt(estoqueMinimo) || 5,
          ativo: ativo !== false
        },
        include: { categoria: true }
      });

      res.status(201).json({
        mensagem: 'Produto criado com sucesso',
        produto
      });
    } catch (erro) {
      next(erro);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const { nome, descricao, preco, estoqueAtual, estoqueMinimo, ativo } = req.body;

      const produto = await prisma.produto.update({
        where: { id },
        data: {
          nome: nome || undefined,
          descricao: descricao || undefined,
          preco: preco ? parseFloat(preco) : undefined,
          estoqueAtual: estoqueAtual !== undefined ? parseInt(estoqueAtual) : undefined,
          estoqueMinimo: estoqueMinimo !== undefined ? parseInt(estoqueMinimo) : undefined,
          ativo: ativo !== undefined ? ativo : undefined
        },
        include: { categoria: true }
      });

      res.json({
        mensagem: 'Produto atualizado com sucesso',
        produto
      });
    } catch (erro) {
      next(erro);
    }
  },

  async deletar(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar se produto está em uso
      const itens = await prisma.itemComanda.count({
        where: { produtoId: id }
      });

      if (itens > 0) {
        return res.status(400).json({ erro: 'Não é possível deletar produto já utilizado' });
      }

      await prisma.produto.delete({
        where: { id }
      });

      res.json({ mensagem: 'Produto deletado com sucesso' });
    } catch (erro) {
      next(erro);
    }
  }
};

module.exports = produtosController;
