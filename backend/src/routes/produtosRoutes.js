const express = require('express');
const produtosController = require('../controllers/produtosController');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

const router = express.Router();

// Listar produtos (todos - apenas ativos)
router.get('/', produtosController.listar);

// Obter produto específico
router.get('/:id', produtosController.obter);

// Criar produto (ADMIN)
router.post('/', permissionMiddleware(['ADMIN']), produtosController.criar);

// Atualizar produto (ADMIN)
router.put('/:id', permissionMiddleware(['ADMIN']), produtosController.atualizar);

// Deletar produto (ADMIN)
router.delete('/:id', permissionMiddleware(['ADMIN']), produtosController.deletar);

module.exports = router;
