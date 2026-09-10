const prisma = require('../lib/prisma');

const categoriasController = {
  async listar(req, res, next) {
    try {
      const categorias = await prisma.categoria.findMany({
        include: {
          _count: { select: { produtos: true } }
        },
        orderBy: { dataCriacao: 'desc' }
      });

      res.json(categorias);
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const { nome, descricao } = req.body;

      if (!nome) {
        return res.status(400).json({ erro: 'Nome é obrigatório' });
      }

      const categoria = await prisma.categoria.create({
        data: {
          nome,
          descricao
        }
      });

      res.status(201).json({
        mensagem: 'Categoria criada com sucesso',
        categoria
      });
    } catch (erro) {
      next(erro);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const { nome, descricao, ativa } = req.body;

      const categoria = await prisma.categoria.update({
        where: { id },
        data: {
          nome: nome || undefined,
          descricao: descricao || undefined,
          ativa: ativa !== undefined ? ativa : undefined
        }
      });

      res.json({
        mensagem: 'Categoria atualizada com sucesso',
        categoria
      });
    } catch (erro) {
      next(erro);
    }
  },

  async deletar(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar se tem produtos
      const produtos = await prisma.produto.count({
        where: { categoriaId: id }
      });

      if (produtos > 0) {
        return res.status(400).json({ erro: 'Não é possível deletar categoria com produtos' });
      }

      await prisma.categoria.delete({
        where: { id }
      });

      res.json({ mensagem: 'Categoria deletada com sucesso' });
    } catch (erro) {
      next(erro);
    }
  }
};

module.exports = categoriasController;
