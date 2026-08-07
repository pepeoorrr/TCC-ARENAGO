const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authController = {
  // Registro de novo usuário
  async registro(req, res, next) {
    try {
      const { nome, email, telefone, cpf, senha, confirmarSenha } = req.body;

      // Validações
      if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
      }

      if (senha.length < 6) {
        return res.status(400).json({ erro: 'Senha deve ter no mínimo 6 caracteres' });
      }

      if (senha !== confirmarSenha) {
        return res.status(400).json({ erro: 'Senhas não conferem' });
      }

      // Verificar se email já existe
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email }
      });

      if (usuarioExistente) {
        return res.status(400).json({ erro: 'Email já cadastrado' });
      }

      // Fazer hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);

      // Criar usuário
      const usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          telefone,
          cpf,
          senha: senhaHash,
          perfil: 'CLIENTE'
        },
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true
        }
      });

      // Gerar token JWT
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
        process.env.JWT_SECRET || 'seu_secret_key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        mensagem: 'Usuário cadastrado com sucesso',
        usuario,
        token
      });
    } catch (erro) {
      next(erro);
    }
  },

  // Login
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
      }

      // Buscar usuário
      const usuario = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!usuario || !usuario.ativo) {
        return res.status(401).json({ erro: 'Email ou senha incorretos' });
      }

      // Comparar senhas
      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) {
        return res.status(401).json({ erro: 'Email ou senha incorretos' });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
        process.env.JWT_SECRET || 'seu_secret_key',
        { expiresIn: '7d' }
      );

      res.json({
        mensagem: 'Login realizado com sucesso',
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil
        },
        token
      });
    } catch (erro) {
      next(erro);
    }
  },

  // Recuperar senha (simplificado - apenas enviar email)
  async recuperarSenha(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ erro: 'Email é obrigatório' });
      }

      // Verificar se usuário existe
      const usuario = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!usuario) {
        // Não revelar se email existe (segurança)
        return res.json({
          mensagem: 'Se o email existe, você receberá um link de recuperação'
        });
      }

      // TODO: Enviar email com link de recuperação
      // Por enquanto, apenas retorna mensagem

      res.json({
        mensagem: 'Email de recuperação enviado (função em desenvolvimento)'
      });
    } catch (erro) {
      next(erro);
    }
  },

  // Redefinir senha
  async redefinirSenha(req, res, next) {
    try {
      const { token, novaSenha } = req.body;

      if (!token || !novaSenha) {
        return res.status(400).json({ erro: 'Token e nova senha são obrigatórios' });
      }

      // TODO: Verificar token de reset (implementar sistema de tokens)
      // Por enquanto, apenas placeholder

      res.json({
        mensagem: 'Funcionalidade em desenvolvimento'
      });
    } catch (erro) {
      next(erro);
    }
  }
};

module.exports = authController;
