const express = require('express');
const bloqueiosController = require('../controllers/bloqueiosController');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

const router = express.Router();

// Listar bloqueios (ADMIN/FUNCIONÁRIO)
router.get('/', permissionMiddleware(['ADMIN', 'FUNCIONARIO']), bloqueiosController.listar);

// Criar bloqueio (ADMIN/FUNCIONÁRIO)
router.post('/', permissionMiddleware(['ADMIN', 'FUNCIONARIO']), bloqueiosController.criar);

// Deletar bloqueio (ADMIN)
router.delete('/:id', permissionMiddleware(['ADMIN']), bloqueiosController.deletar);

module.exports = router;
