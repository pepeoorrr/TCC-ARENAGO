const prisma = require('../lib/prisma');

const { gerarNumeroComanda, formatarMoeda } = require('../utils/gerador');

const comandasController = {
  async listar(req, res, next) {
    try {
      const { status, dataInicio, dataFim } = req.query;
      const { id: usuarioLogado, perfil } = req.usuario;

      const where = {};

      if (status) where.status = status;
      if (dataInicio || dataFim) {
        where.dataCriacao = {};
        if (dataInicio) where.dataCriacao.gte = new Date(dataInicio);
        if (dataFim) where.dataCriacao.lte = new Date(dataFim);
      }

      // Cliente vê apenas suas comandas, funcionário vê abertas, admin vê todas
      if (perfil === 'CLIENTE') {
        where.usuarioId = usuarioLogado;
      } else if (perfil === 'FUNCIONARIO') {
        where.status = 'ABERTA';
      }

      const comandas = await prisma.comanda.findMany({
        where,
        include: {
          reserva: { include: { quadra: true } },
          usuario: { select: { id: true, nome: true } }
        },
        orderBy: { dataCriacao: 'desc' }
      });

      res.json(comandas);
    } catch (erro) {
      next(erro);
    }
  },

  async obter(req, res, next) {
    try {
      const { id } = req.params;
      const { id: usuarioLogado, perfil } = req.usuario;

      const comanda = await prisma.comanda.findUnique({
        where: { id },
        include: {
          itens: { include: { produto: true } },
          reserva: { include: { quadra: true } },
          usuario: true
        }
      });

      if (!comanda) {
        return res.status(404).json({ erro: 'Comanda não encontrada' });
      }

      // Verificar permissão
      if (perfil === 'CLIENTE' && comanda.usuarioId !== usuarioLogado) {
        return res.status(403).json({ erro: 'Acesso negado' });
      }

      res.json(comanda);
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const { reservaId } = req.params;

      // Verificar se já existe comanda para esta reserva
      const comandaExistente = await prisma.comanda.findUnique({
        where: { reservaId }
      });

      if (comandaExistente) {
        return res.status(400).json({ erro: 'Comanda já existe para esta reserva' });
      }

      // Buscar reserva
      const reserva = await prisma.reserva.findUnique({
        where: { id: reservaId },
        include: { quadra: true }
      });

      if (!reserva) {
        return res.status(404).json({ erro: 'Reserva não encontrada' });
      }

      // Criar comanda
      const numeroComanda = gerarNumeroComanda();
      const comanda = await prisma.comanda.create({
        data: {
          numeroComanda,
          reservaId,
          usuarioId: reserva.usuarioId,
          valorAluguel: reserva.quadra.precoHora,
          total: reserva.quadra.precoHora,
          status: 'ABERTA'
        },
        include: { itens: true, reserva: true }
      });

      res.status(201).json({
        mensagem: 'Comanda criada com sucesso',
        comanda
      });
    } catch (erro) {
      next(erro);
    }
  },

  async adicionarItem(req, res, next) {
    try {
      const { id } = req.params;
      const { produtoId, quantidade } = req.body;

      if (!produtoId || !quantidade) {
        return res.status(400).json({ erro: 'Produto e quantidade são obrigatórios' });
      }

      // Buscar comanda
      const comanda = await prisma.comanda.findUnique({
        where: { id }
      });

      if (!comanda || comanda.status !== 'ABERTA') {
        return res.status(400).json({ erro: 'Comanda não está aberta' });
      }

      // Buscar produto
      const produto = await prisma.produto.findUnique({
        where: { id: produtoId }
      });

      if (!produto || !produto.ativo) {
        return res.status(404).json({ erro: 'Produto não encontrado ou inativo' });
      }

      if (produto.estoqueAtual < quantidade) {
        return res.status(400).json({ erro: 'Estoque insuficiente' });
      }

      // Calcular subtotal
      const subtotal = produto.preco * quantidade;

      // Criar item
      const item = await prisma.itemComanda.create({
        data: {
          comandaId: id,
          produtoId,
          quantidade,
          precoUnitario: produto.preco,
          subtotal
        },
        include: { produto: true }
      });

      // Atualizar comanda total e estoque
      const novoSubtotal = (await prisma.itemComanda.aggregate({
        where: { comandaId: id },
        _sum: { subtotal: true }
      }))._sum.subtotal || 0;

      const novoTotal = comanda.valorAluguel + novoSubtotal;

      await prisma.comanda.update({
        where: { id },
        data: {
          subtotalConsumos: novoSubtotal,
          total: novoTotal
        }
      });

      // Diminuir estoque
      await prisma.produto.update({
        where: { id: produtoId },
        data: {
          estoqueAtual: produto.estoqueAtual - quantidade
        }
      });

      res.status(201).json({
        mensagem: 'Item adicionado com sucesso',
        item
      });
    } catch (erro) {
      next(erro);
    }
  },

  async removerItem(req, res, next) {
    try {
      const { id, itemId } = req.params;

      const item = await prisma.itemComanda.findUnique({
        where: { id: itemId }
      });

      if (!item || item.comandaId !== id) {
        return res.status(404).json({ erro: 'Item não encontrado' });
      }

      // Remover item
      await prisma.itemComanda.delete({
        where: { id: itemId }
      });

      // Devolver estoque
      await prisma.produto.update({
        where: { id: item.produtoId },
        data: {
          estoqueAtual: { increment: item.quantidade }
        }
      });

      // Recalcular total
      const comanda = await prisma.comanda.findUnique({
        where: { id }
      });

      const novoSubtotal = (await prisma.itemComanda.aggregate({
        where: { comandaId: id },
        _sum: { subtotal: true }
      }))._sum.subtotal || 0;

      const novoTotal = comanda.valorAluguel + novoSubtotal;

      await prisma.comanda.update({
        where: { id },
        data: {
          subtotalConsumos: novoSubtotal,
          total: novoTotal
        }
      });

      res.json({ mensagem: 'Item removido com sucesso' });
    } catch (erro) {
      next(erro);
    }
  },

  async fechar(req, res, next) {
    try {
      const { id } = req.params;

      const comanda = await prisma.comanda.findUnique({
        where: { id }
      });

      if (!comanda || comanda.status !== 'ABERTA') {
        return res.status(400).json({ erro: 'Comanda não está aberta' });
      }

      // Fechar comanda
      const comandaFechada = await prisma.comanda.update({
        where: { id },
        data: {
          status: 'AGUARDANDO_PAGAMENTO',
          dataFechamento: new Date()
        },
        include: { itens: { include: { produto: true } } }
      });

      res.json({
        mensagem: 'Comanda fechada. Aguardando pagamento',
        comanda: comandaFechada
      });
    } catch (erro) {
      next(erro);
    }
  },

  async registrarPagamento(req, res, next) {
    try {
      const { id } = req.params;
      const { formaPagamento, valorPago, troco, observacoes } = req.body;

      if (!formaPagamento) {
        return res.status(400).json({ erro: 'Forma de pagamento é obrigatória' });
      }

      const comanda = await prisma.comanda.findUnique({
        where: { id }
      });

      if (!comanda || comanda.status !== 'AGUARDANDO_PAGAMENTO') {
        return res.status(400).json({ erro: 'Comanda não está aguardando pagamento' });
      }

      // Registrar pagamento
      const comandaPaga = await prisma.comanda.update({
        where: { id },
        data: {
          status: 'PAGA',
          formaPagamento,
          valorPago: parseFloat(valorPago) || comanda.total,
          troco: parseFloat(troco) || 0,
          observacoes,
          dataPagamento: new Date()
        }
      });

      // Atualizar reserva para finalizada
      if (comanda.reservaId) {
        await prisma.reserva.update({
          where: { id: comanda.reservaId },
          data: { status: 'FINALIZADA' }
        });
      }

      res.json({
        mensagem: 'Pagamento registrado com sucesso',
        comanda: comandaPaga
      });
    } catch (erro) {
      next(erro);
    }
  },

  async cancelar(req, res, next) {
    try {
      const { id } = req.params;

      const comanda = await prisma.comanda.findUnique({
        where: { id }
      });

      if (!comanda) {
        return res.status(404).json({ erro: 'Comanda não encontrada' });
      }

      // Cancelar comanda
      const comandaCancelada = await prisma.comanda.update({
        where: { id },
        data: { status: 'CANCELADA' }
      });

      res.json({
        mensagem: 'Comanda cancelada com sucesso',
        comanda: comandaCancelada
      });
    } catch (erro) {
      next(erro);
    }
  }
};

module.exports = comandasController;
