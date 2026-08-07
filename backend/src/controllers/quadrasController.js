const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const quadrasController = {
  async listar(req, res, next) {
    try {
      const { tipo, ativa, busca } = req.query;

      const where = {};
      if (tipo) where.tipo = tipo;
      if (ativa !== undefined) where.ativa = ativa === 'true';
      if (busca) where.nome = { contains: busca };

      const quadras = await prisma.quadra.findMany({
        where,
        orderBy: { dataCriacao: 'desc' }
      });

      res.json(quadras);
    } catch (erro) {
      next(erro);
    }
  },

  async obter(req, res, next) {
    try {
      const { id } = req.params;

      const quadra = await prisma.quadra.findUnique({
        where: { id }
      });

      if (!quadra) {
        return res.status(404).json({ erro: 'Quadra não encontrada' });
      }

      res.json(quadra);
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const { nome, tipo, descricao, tamanho, capacidade, precoHora, horarioInicio, horarioFim, durationPadraoMinutos } = req.body;

      if (!nome || !tipo || !capacidade || !precoHora) {
        return res.status(400).json({ erro: 'Nome, tipo, capacidade e preço são obrigatórios' });
      }

      const quadra = await prisma.quadra.create({
        data: {
          nome,
          tipo,
          descricao,
          tamanho,
          capacidade: parseInt(capacidade),
          precoHora: parseFloat(precoHora),
          horarioInicio: horarioInicio || '06:00',
          horarioFim: horarioFim || '22:00',
          durationPadraoMinutos: durationPadraoMinutos || 60,
          ativa: true
        }
      });

      res.status(201).json({
        mensagem: 'Quadra criada com sucesso',
        quadra
      });
    } catch (erro) {
      next(erro);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const dados = req.body;

      // Converter tipos se necessário
      if (dados.capacidade) dados.capacidade = parseInt(dados.capacidade);
      if (dados.precoHora) dados.precoHora = parseFloat(dados.precoHora);
      if (dados.durationPadraoMinutos) dados.durationPadraoMinutos = parseInt(dados.durationPadraoMinutos);

      const quadra = await prisma.quadra.update({
        where: { id },
        data: dados
      });

      res.json({
        mensagem: 'Quadra atualizada com sucesso',
        quadra
      });
    } catch (erro) {
      next(erro);
    }
  },

  async deletar(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar se há reservas nesta quadra
      const reservas = await prisma.reserva.count({
        where: { quadraId: id }
      });

      if (reservas > 0) {
        return res.status(400).json({ erro: 'Não é possível deletar quadra com reservas' });
      }

      await prisma.quadra.delete({
        where: { id }
      });

      res.json({ mensagem: 'Quadra deletada com sucesso' });
    } catch (erro) {
      next(erro);
    }
  }
};

module.exports = quadrasController;
