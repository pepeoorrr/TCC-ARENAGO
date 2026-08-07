const express = require('express');
const comandasController = require('../controllers/comandasController');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

const router = express.Router();

// Listar comandas (cliente vê suas, admin/funcionário vê abertas)
router.get('/', comandasController.listar);

// Obter detalhes de uma comanda
router.get('/:id', comandasController.obter);

// Criar comanda (automático ao criar reserva)
router.post('/:reservaId', permissionMiddleware(['ADMIN', 'FUNCIONARIO']), comandasController.criar);

// Adicionar item à comanda (FUNCIONARIO)
router.post('/:id/itens', permissionMiddleware(['FUNCIONARIO']), comandasController.adicionarItem);

// Remover item da comanda (FUNCIONARIO)
router.delete('/:id/itens/:itemId', permissionMiddleware(['FUNCIONARIO']), comandasController.removerItem);

// Fechar comanda (FUNCIONARIO)
router.put('/:id/fechar', permissionMiddleware(['FUNCIONARIO']), comandasController.fechar);

// Registrar pagamento (ADMIN)
router.post('/:id/pagamento', permissionMiddleware(['ADMIN']), comandasController.registrarPagamento);

// Cancelar comanda (ADMIN)
router.delete('/:id', permissionMiddleware(['ADMIN']), comandasController.cancelar);

module.exports = router;
