const express = require('express');
const categoriasController = require('../controllers/categoriasController');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

const router = express.Router();

// Listar categorias (todos)
router.get('/', categoriasController.listar);

// Criar categoria (ADMIN)
router.post('/', permissionMiddleware(['ADMIN']), categoriasController.criar);

// Atualizar categoria (ADMIN)
router.put('/:id', permissionMiddleware(['ADMIN']), categoriasController.atualizar);

// Deletar categoria (ADMIN)
router.delete('/:id', permissionMiddleware(['ADMIN']), categoriasController.deletar);

module.exports = router;
