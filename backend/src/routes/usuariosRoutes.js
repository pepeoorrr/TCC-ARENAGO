const express = require('express');
const usuariosController = require('../controllers/usuariosController');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

const router = express.Router();

// Obter perfil do usuário autenticado
router.get('/perfil', usuariosController.obterPerfil);

// Atualizar perfil do usuário autenticado
router.put('/perfil', usuariosController.atualizarPerfil);

// Listar usuários (ADMIN)
router.get('/', permissionMiddleware(['ADMIN']), usuariosController.listar);

// Criar usuário (ADMIN)
router.post('/', permissionMiddleware(['ADMIN']), usuariosController.criar);

// Obter usuário específico (ADMIN)
router.get('/:id', permissionMiddleware(['ADMIN']), usuariosController.obter);

// Atualizar usuário (ADMIN)
router.put('/:id', permissionMiddleware(['ADMIN']), usuariosController.atualizar);

// Deletar usuário (ADMIN)
router.delete('/:id', permissionMiddleware(['ADMIN']), usuariosController.deletar);

module.exports = router;
