const express = require('express');
const quadrasController = require('../controllers/quadrasController');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

const router = express.Router();

// Listar todas as quadras (todos)
router.get('/', quadrasController.listar);

// Obter detalhes de uma quadra (todos)
router.get('/:id', quadrasController.obter);

// Criar quadra (ADMIN)
router.post('/', permissionMiddleware(['ADMIN']), quadrasController.criar);

// Atualizar quadra (ADMIN)
router.put('/:id', permissionMiddleware(['ADMIN']), quadrasController.atualizar);

// Deletar quadra (ADMIN)
router.delete('/:id', permissionMiddleware(['ADMIN']), quadrasController.deletar);

module.exports = router;
