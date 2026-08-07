const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.post('/recuperar-senha', authController.recuperarSenha);
router.post('/redefinir-senha', authController.redefinirSenha);

module.exports = router;
