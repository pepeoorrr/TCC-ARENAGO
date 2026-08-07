const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const usuariosController = {
  async obterPerfil(req, res, next) {
    try {
      const { id } = req.usuario;

      const usuario = await prisma.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          cpf: true,
          endereco: true,
          perfil: true,
          ativo: true,
          dataCriacao: true
        }
      });

      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      res.json(usuario);
    } catch (erro) {
      next(erro);
    }
  },

  async atualizarPerfil(req, res, next) {
    try {
      const { id } = req.usuario;
      const { nome, telefone, endereco } = req.body;

      const usuario = await prisma.usuario.update({
        where: { id },
        data: {
          nome: nome || undefined,
          telefone: telefone || undefined,
          endereco: endereco || undefined
        },
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true
        }
      });

      res.json({
        mensagem: 'Perfil atualizado com sucesso',
        usuario
      });
    } catch (erro) {
      next(erro);
    }
  },

  async listar(req, res, next) {
    try {
      const { perfil, ativo, busca, pagina = 1, limite = 20 } = req.query;

      const where = {};
      if (perfil) where.perfil = perfil;
      if (ativo !== undefined) where.ativo = ativo === 'true';
      if (busca) where.nome = { contains: busca };

      const usuarios = await prisma.usuario.findMany({
        where,
        skip: (pagina - 1) * limite,
        take: parseInt(limite),
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          perfil: true,
          ativo: true,
          dataCriacao: true
        }
      });

      const total = await prisma.usuario.count({ where });

      res.json({
        total,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        dados: usuarios
      });
    } catch (erro) {
      next(erro);
    }
  },

  async obter(req, res, next) {
    try {
      const { id } = req.params;

      const usuario = await prisma.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          cpf: true,
          endereco: true,
          perfil: true,
          ativo: true,
          dataCriacao: true
        }
      });

      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      res.json(usuario);
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const { nome, email, telefone, cpf, perfil, ativo } = req.body;
      const bcrypt = require('bcrypt');

      if (!nome || !email) {
        return res.status(400).json({ erro: 'Nome e email são obrigatórios' });
      }

      // Gerar senha temporária
      const senhaTemporaria = Math.random().toString(36).substring(2, 8);
      const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

      const usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          telefone,
          cpf,
          perfil: perfil || 'FUNCIONARIO',
          ativo: ativo !== false,
          senha: senhaHash
        },
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true
        }
      });

      res.status(201).json({
        mensagem: 'Usuário criado com sucesso',
        usuario,
        senhaTemporaria: '(enviada por email)'
      });
    } catch (erro) {
      next(erro);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const { nome, telefone, endereco, perfil, ativo } = req.body;

      const usuario = await prisma.usuario.update({
        where: { id },
        data: {
          nome: nome || undefined,
          telefone: telefone || undefined,
          endereco: endereco || undefined,
          perfil: perfil || undefined,
          ativo: ativo !== undefined ? ativo : undefined
        }
      });

      res.json({
        mensagem: 'Usuário atualizado com sucesso',
        usuario
      });
    } catch (erro) {
      next(erro);
    }
  },

  async deletar(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar se tem reservas ativas
      const reservasAtivas = await prisma.reserva.count({
        where: {
          usuarioId: id,
          status: { in: ['CONFIRMADA', 'ATIVA'] }
        }
      });

      if (reservasAtivas > 0) {
        return res.status(400).json({ erro: 'Não é possível deletar usuário com reservas ativas' });
      }

      await prisma.usuario.delete({
        where: { id }
      });

      res.json({ mensagem: 'Usuário deletado com sucesso' });
    } catch (erro) {
      next(erro);
    }
  }
};

module.exports = usuariosController;
