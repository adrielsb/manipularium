const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// GET /api/data - Obter todos os dados
router.get('/', dataController.getAllData);

// POST /api/data - Salvar dados
router.post('/', dataController.saveData);

// POST /api/data/backup - Criar backup
router.post('/backup', dataController.createBackup);

// POST /api/data/restore - Restaurar backup
router.post('/restore', dataController.restoreBackup);

// DELETE /api/data - Limpar todos os dados
router.delete('/', dataController.clearAllData);

// PUT /api/data/day/:dayKey - Atualizar dados de um dia específico
router.put('/day/:dayKey', dataController.updateDayData);

module.exports = router;