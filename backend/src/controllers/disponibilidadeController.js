const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const disponibilidadeController = {
  async obterDisponibilidade(req, res, next) {
    try {
      const { quadraId } = req.params;
      const { dataInicio, dataFim } = req.query;

      if (!dataInicio || !dataFim) {
        return res.status(400).json({ erro: 'dataInicio e dataFim são obrigatórios' });
      }

      // Buscar quadra
      const quadra = await prisma.quadra.findUnique({
        where: { id: quadraId }
      });

      if (!quadra || !quadra.ativa) {
        return res.status(404).json({ erro: 'Quadra não encontrada' });
      }

      // Buscar reservas e bloqueios no período
      const reservas = await prisma.reserva.findMany({
        where: {
          quadraId,
          dataReserva: {
            gte: new Date(dataInicio),
            lte: new Date(dataFim)
          },
          status: { in: ['CONFIRMADA', 'ATIVA'] }
        }
      });

      const bloqueios = await prisma.bloqueio.findMany({
        where: {
          quadraId,
          dataBloqueio: {
            gte: new Date(dataInicio),
            lte: new Date(dataFim)
          }
        }
      });

      // Gerar grade de disponibilidade
      const disponibilidade = [];
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);

      for (let data = new Date(inicio); data <= fim; data.setDate(data.getDate() + 1)) {
        const dataAtual = new Date(data);
        const horarios = [];

        // Gerar horários do dia
        const [horaInicio, minInicio] = quadra.horarioInicio.split(':');
        const [horaFim, minFim] = quadra.horarioFim.split(':');

        for (let hora = parseInt(horaInicio); hora < parseInt(horaFim); hora++) {
          const horario = `${String(hora).padStart(2, '0')}:00`;
          const horarioFimSlot = `${String(hora + 1).padStart(2, '0')}:00`;

          // Verificar se está ocupado
          const ocupado = reservas.some(r =>
            new Date(r.dataReserva).toDateString() === dataAtual.toDateString() &&
            r.horarioInicio <= horario && r.horarioFim > horario
          );

          // Verificar bloqueio
          const bloqueado = bloqueios.some(b =>
            new Date(b.dataBloqueio).toDateString() === dataAtual.toDateString() &&
            b.horarioInicio <= horario && b.horarioFim > horario
          );

          horarios.push({
            hora: horario,
            disponivel: !ocupado && !bloqueado,
            duracao: quadra.durationPadraoMinutos
          });
        }

        disponibilidade.push({
          data: dataAtual.toISOString().split('T')[0],
          horarios
        });
      }

      res.json({
        quadraId,
        quadraNome: quadra.nome,
        disponibilidade
      });
    } catch (erro) {
      next(erro);
    }
  }
};

module.exports = disponibilidadeController;
