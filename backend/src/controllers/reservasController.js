const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { gerarNumeroReserva } = require('../utils/gerador');

const reservasController = {
  async listar(req, res, next) {
    try {
      const { status, dataInicio, dataFim, quadraId, usuarioId } = req.query;
      const { id: usuarioLogado, perfil } = req.usuario;

      const where = {};

      // Filtros
      if (status) where.status = status;
      if (quadraId) where.quadraId = quadraId;
      if (dataInicio || dataFim) {
        where.dataReserva = {};
        if (dataInicio) where.dataReserva.gte = new Date(dataInicio);
        if (dataFim) where.dataReserva.lte = new Date(dataFim);
      }

      // Permissões: cliente vê apenas suas reservas, admin vê todas
      if (perfil === 'CLIENTE') {
        where.usuarioId = usuarioLogado;
      } else if (usuarioId && perfil === 'ADMIN') {
        where.usuarioId = usuarioId;
      }

      const reservas = await prisma.reserva.findMany({
        where,
        include: {
          usuario: { select: { id: true, nome: true, email: true } },
          quadra: { select: { id: true, nome: true, precoHora: true } }
        },
        orderBy: { dataReserva: 'desc' }
      });

      res.json(reservas);
    } catch (erro) {
      next(erro);
    }
  },

  async obter(req, res, next) {
    try {
      const { id } = req.params;
      const { id: usuarioLogado, perfil } = req.usuario;

      const reserva = await prisma.reserva.findUnique({
        where: { id },
        include: {
          usuario: true,
          quadra: true,
          comanda: {
            include: { itens: { include: { produto: true } } }
          }
        }
      });

      if (!reserva) {
        return res.status(404).json({ erro: 'Reserva não encontrada' });
      }

      // Verificar permissão
      if (perfil === 'CLIENTE' && reserva.usuarioId !== usuarioLogado) {
        return res.status(403).json({ erro: 'Acesso negado' });
      }

      res.json(reserva);
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const { quadraId, data, horarioInicio, duracao } = req.body;
      const { id: usuarioLogado } = req.usuario;

      if (!quadraId || !data || !horarioInicio || !duracao) {
        return res.status(400).json({ erro: 'Quadra, data, horário e duração são obrigatórios' });
      }

      // Buscar quadra
      const quadra = await prisma.quadra.findUnique({
        where: { id: quadraId }
      });

      if (!quadra || !quadra.ativa) {
        return res.status(404).json({ erro: 'Quadra não encontrada ou inativa' });
      }

      // Calcular horário fim
      const [horaInicio, minutoInicio] = horarioInicio.split(':');
      const dataReserva = new Date(data);
      const inicio = new Date(dataReserva);
      inicio.setHours(parseInt(horaInicio), parseInt(minutoInicio), 0, 0);

      const fim = new Date(inicio.getTime() + duracao * 60000);
      const horarioFim = `${fim.getHours().toString().padStart(2, '0')}:${fim.getMinutes().toString().padStart(2, '0')}`;

      // Verificar sobreposição de reservas
      const reservaSobreposicao = await prisma.reserva.findFirst({
        where: {
          quadraId,
          dataReserva: {
            equals: dataReserva
          },
          OR: [
            {
              AND: [
                { horarioInicio: { lte: horarioInicio } },
                { horarioFim: { gt: horarioInicio } }
              ]
            },
            {
              AND: [
                { horarioInicio: { lt: horarioFim } },
                { horarioFim: { gte: horarioFim } }
              ]
            }
          ],
          status: { in: ['CONFIRMADA', 'ATIVA'] }
        }
      });

      if (reservaSobreposicao) {
        return res.status(400).json({ erro: 'Horário indisponível para esta quadra' });
      }

      // Verificar bloqueios
      const bloqueio = await prisma.bloqueio.findFirst({
        where: {
          quadraId,
          dataBloqueio: dataReserva,
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

      if (bloqueio) {
        return res.status(400).json({ erro: 'Quadra bloqueada neste horário' });
      }

      // Criar reserva
      const numeroReserva = gerarNumeroReserva();
      const reserva = await prisma.reserva.create({
        data: {
          numeroReserva,
          usuarioId: usuarioLogado,
          quadraId,
          dataReserva,
          horarioInicio,
          horarioFim,
          status: 'CONFIRMADA',
          valorAluguel: quadra.precoHora
        },
        include: { usuario: true, quadra: true }
      });

      // Gerar comanda automaticamente
      const numeroComanda = `CMD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString().slice(2, 6)}`;
      const comanda = await prisma.comanda.create({
        data: {
          numeroComanda,
          reservaId: reserva.id,
          usuarioId: usuarioLogado,
          valorAluguel: quadra.precoHora,
          total: quadra.precoHora,
          status: 'ABERTA'
        }
      });

      // Atualizar reserva com ID da comanda
      const reservaAtualizada = await prisma.reserva.update({
        where: { id: reserva.id },
        data: { comandaId: comanda.id },
        include: { usuario: true, quadra: true, comanda: true }
      });

      res.status(201).json({
        mensagem: 'Reserva criada com sucesso',
        reserva: reservaAtualizada
      });
    } catch (erro) {
      next(erro);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const { data, horarioInicio, duracao } = req.body;
      const { id: usuarioLogado, perfil } = req.usuario;

      const reserva = await prisma.reserva.findUnique({
        where: { id },
        include: { quadra: true }
      });

      if (!reserva) {
        return res.status(404).json({ erro: 'Reserva não encontrada' });
      }

      // Verificar permissão
      if (perfil === 'CLIENTE' && reserva.usuarioId !== usuarioLogado) {
        return res.status(403).json({ erro: 'Acesso negado' });
      }

      // Verificar se pode alterar
      if (reserva.status !== 'CONFIRMADA') {
        return res.status(400).json({ erro: 'Apenas reservas confirmadas podem ser alteradas' });
      }

      // TODO: Validar nova data/horário

      const reservaAtualizada = await prisma.reserva.update({
        where: { id },
        data: {
          dataReserva: data ? new Date(data) : undefined,
          horarioInicio: horarioInicio || undefined
        },
        include: { usuario: true, quadra: true }
      });

      res.json({
        mensagem: 'Reserva atualizada com sucesso',
        reserva: reservaAtualizada
      });
    } catch (erro) {
      next(erro);
    }
  },

  async cancelar(req, res, next) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const { id: usuarioLogado, perfil } = req.usuario;

      const reserva = await prisma.reserva.findUnique({
        where: { id }
      });

      if (!reserva) {
        return res.status(404).json({ erro: 'Reserva não encontrada' });
      }

      // Verificar permissão
      if (perfil === 'CLIENTE') {
        if (reserva.usuarioId !== usuarioLogado) {
          return res.status(403).json({ erro: 'Acesso negado' });
        }

        // Verificar antecedência de 2 horas
        const dataReserva = new Date(reserva.dataReserva);
        const agora = new Date();
        const diferencaHoras = (dataReserva - agora) / (1000 * 60 * 60);

        if (diferencaHoras < 2) {
          return res.status(400).json({ erro: 'Cancelamento requer mínimo 2 horas de antecedência' });
        }
      }

      // Cancelar reserva
      const reservaCancelada = await prisma.reserva.update({
        where: { id },
        data: {
          status: 'CANCELADA',
          motivoCancelamento: motivo || 'Cancelado pelo cliente',
          canceladaPorId: perfil === 'ADMIN' ? usuarioLogado : null
        }
      });

      // Cancelar comanda se existir
      if (reserva.comandaId) {
        await prisma.comanda.update({
          where: { id: reserva.comandaId },
          data: { status: 'CANCELADA' }
        });
      }

      res.json({
        mensagem: 'Reserva cancelada com sucesso',
        reserva: reservaCancelada
      });
    } catch (erro) {
      next(erro);
    }
  }
};

module.exports = reservasController;
