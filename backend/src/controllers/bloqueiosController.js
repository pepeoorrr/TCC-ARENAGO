const prisma = require('../lib/prisma');

const bloqueiosController = {
  async listar(req, res, next) {
    try {
      const { quadraId, dataInicio, dataFim } = req.query;

      const where = {};
      if (quadraId) where.quadraId = quadraId;
      if (dataInicio || dataFim) {
        where.dataBloqueio = {};
        if (dataInicio) where.dataBloqueio.gte = new Date(dataInicio);
        if (dataFim) where.dataBloqueio.lte = new Date(dataFim);
      }

      const bloqueios = await prisma.bloqueio.findMany({
        where,
        include: {
          quadra: { select: { id: true, nome: true } },
          criadoPor: { select: { id: true, nome: true } }
        },
        orderBy: { dataBloqueio: 'asc' }
      });

      res.json(bloqueios);
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const { quadraId, data, horarioInicio, horarioFim, motivo } = req.body;
      const { id: usuarioLogado } = req.usuario;

      if (!quadraId || !data || !horarioInicio || !horarioFim || !motivo) {
        return res.status(400).json({ erro: 'Quadra, data, horários e motivo são obrigatórios' });
      }

      // Verificar sobreposição com bloqueios existentes
      const dataBloqueio = new Date(data);
      const bloqueioExistente = await prisma.bloqueio.findFirst({
        where: {
          quadraId,
          dataBloqueio: dataBloqueio,
          OR: [
            {
              AND: [
                { horarioInicio: { lte: horarioInicio } },
                { horarioFim: { gt: horarioInicio } }
              ]
            }
          ]
        }
      });

      if (bloqueioExistente) {
        return res.status(400).json({ erro: 'Já existe bloqueio neste período' });
      }

      const bloqueio = await prisma.bloqueio.create({
        data: {
          quadraId,
          dataBloqueio,
          horarioInicio,
          horarioFim,
          motivo,
          criadoPorId: usuarioLogado
        },
        include: { quadra: true, criadoPor: true }
      });

      res.status(201).json({
        mensagem: 'Bloqueio criado com sucesso',
        bloqueio
      });
    } catch (erro) {
      next(erro);
    }
  },

  async deletar(req, res, next) {
    try {
      const { id } = req.params;

      const bloqueio = await prisma.bloqueio.findUnique({
        where: { id }
      });

      if (!bloqueio) {
        return res.status(404).json({ erro: 'Bloqueio não encontrado' });
      }

      await prisma.bloqueio.delete({
        where: { id }
      });

      res.json({ mensagem: 'Bloqueio removido com sucesso' });
    } catch (erro) {
      next(erro);
    }
  }
};

module.exports = bloqueiosController;
