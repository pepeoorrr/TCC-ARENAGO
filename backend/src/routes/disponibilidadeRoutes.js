const express = require('express');
const disponibilidadeController = require('../controllers/disponibilidadeController');

const router = express.Router();

// Obter disponibilidade de uma quadra em um período
router.get('/quadras/:quadraId', disponibilidadeController.obterDisponibilidade);

module.exports = router;
