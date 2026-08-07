const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

const router = express.Router();

// Dashboard (ADMIN)
router.get('/', permissionMiddleware(['ADMIN']), dashboardController.obterDados);

module.exports = router;
