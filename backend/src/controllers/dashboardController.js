const prisma = require('../lib/prisma');

const dashboardController = {
  async obterDados(req, res, next) {
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const dataFimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      // 1. Receita do dia
      const comandasDia = await prisma.comanda.findMany({
        where: {
          dataPagamento: {
            gte: hoje,
            lt: new Date(hoje.getTime() + 24 * 60 * 60 * 1000)
          },
          status: 'PAGA'
        }
      });

      const receitaDia = comandasDia.reduce((sum, c) => sum + parseFloat(c.total), 0);

      // 2. Receita do mês
      const comandasMes = await prisma.comanda.findMany({
        where: {
          dataPagamento: {
            gte: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
            lte: dataFimMes
          },
          status: 'PAGA'
        }
      });

      const receitaMes = comandasMes.reduce((sum, c) => sum + parseFloat(c.total), 0);

      // 3. Reservas do dia
      const reservasHoje = await prisma.reserva.count({
        where: {
          dataReserva: hoje,
          status: { in: ['CONFIRMADA', 'ATIVA'] }
        }
      });

      // 4. Reservas confirmadas (próximas)
      const reservasConfirmadas = await prisma.reserva.count({
        where: {
          status: 'CONFIRMADA',
          dataReserva: { gte: hoje }
        }
      });

      // 5. Taxa de ocupação
      const totalQuadras = await prisma.quadra.count({ where: { ativa: true } });
      const taxaOcupacao = totalQuadras > 0 ? Math.round((reservasHoje / totalQuadras) * 100) : 0;

      // 6. Produtos com baixo estoque
      const produtosBaixoEstoque = await prisma.produto.count({
        where: {
          ativo: true,
          estoqueAtual: { lte: prisma.produto.fields.estoqueMinimo }
        }
      });

      // 7. Próximas reservas (10 próximas)
      const proximasReservas = await prisma.reserva.findMany({
        where: {
          dataReserva: { gte: hoje },
          status: { in: ['CONFIRMADA', 'ATIVA'] }
        },
        include: {
          usuario: { select: { nome: true } },
          quadra: { select: { nome: true } }
        },
        orderBy: { dataReserva: 'asc' },
        take: 10
      });

      // 8. Comandas aguardando pagamento
      const comandasAguardando = await prisma.comanda.count({
        where: { status: 'AGUARDANDO_PAGAMENTO' }
      });

      // 9. Produtos mais vendidos
      const produtosMaisVendidos = await prisma.itemComanda.groupBy({
        by: ['produtoId'],
        _sum: { quantidade: true },
        where: {
          comanda: {
            dataPagamento: {
              gte: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
              lte: dataFimMes
            }
          }
        },
        orderBy: { _sum: { quantidade: 'desc' } },
        take: 5
      });

      // Buscar detalhes dos produtos
      const produtos = await prisma.produto.findMany({
        where: {
          id: { in: produtosMaisVendidos.map(p => p.produtoId) }
        }
      });

      const produtosMaisVendidosDetalhes = produtosMaisVendidos.map(pv => {
        const produto = produtos.find(p => p.id === pv.produtoId);
        return {
          produtoId: pv.produtoId,
          nome: produto?.nome,
          quantidade: pv._sum.quantidade,
          receita: (pv._sum.quantidade || 0) * parseFloat(produto?.preco || 0)
        };
      });

      res.json({
        receitaDia,
        receitaMes,
        reservasHoje,
        reservasConfirmadas,
        taxaOcupacao,
        produtosBaixoEstoque,
        comandasAguardando,
        proximasReservas: proximasReservas.map(r => ({
          numeroReserva: r.numeroReserva,
          cliente: r.usuario.nome,
          quadra: r.quadra.nome,
          data: r.dataReserva,
          horario: r.horarioInicio
        })),
        produtosMaisVendidos: produtosMaisVendidosDetalhes
      });
    } catch (erro) {
      next(erro);
    }
  }
};

module.exports = dashboardController;
