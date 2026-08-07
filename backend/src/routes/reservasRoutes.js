const express = require('express');
const reservasController = require('../controllers/reservasController');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

const router = express.Router();

// Listar reservas (cliente vê suas, admin vê todas, funcionário vê da agenda)
router.get('/', reservasController.listar);

// Obter detalhes de uma reserva
router.get('/:id', reservasController.obter);

// Criar reserva (CLIENTE e FUNCIONARIO)
router.post('/', permissionMiddleware(['CLIENTE', 'FUNCIONARIO']), reservasController.criar);

// Atualizar reserva (CLIENTE e ADMIN)
router.put('/:id', permissionMiddleware(['CLIENTE', 'ADMIN']), reservasController.atualizar);

// Cancelar reserva
router.delete('/:id', reservasController.cancelar);

module.exports = router;
