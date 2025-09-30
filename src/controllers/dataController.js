const DataStorage = require('../models/HybridDataStorage');

class DataController {
  
  async getAllData(req, res) {
    try {
      const data = await DataStorage.loadData();
      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao carregar dados',
        error: error.message
      });
    }
  }

  async saveData(req, res) {
    try {
      const { historyData, backups, caixaData, valoresNaoEncontrados } = req.body;

      if (!historyData || typeof historyData !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Dados de histórico inválidos'
        });
      }

      const dataToSave = {
        historyData: historyData,
        backups: backups || [],
        caixaData: caixaData || { pending: {}, completed: {} },
        valoresNaoEncontrados: valoresNaoEncontrados || []
      };

      const success = await DataStorage.saveData(dataToSave);
      
      if (success) {
        res.json({
          success: true,
          message: 'Dados salvos com sucesso'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao salvar dados'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao processar dados',
        error: error.message
      });
    }
  }

  async createBackup(req, res) {
    try {
      const { isAutomatic = false } = req.body;
      const currentData = await DataStorage.loadData();
      
      const backup = await DataStorage.createBackup(currentData, isAutomatic);
      
      if (backup) {
        res.json({
          success: true,
          message: 'Backup criado com sucesso',
          backup: backup
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao criar backup'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar backup',
        error: error.message
      });
    }
  }

  async restoreBackup(req, res) {
    try {
      const { backupIndex } = req.body;
      
      if (typeof backupIndex !== 'number' || backupIndex < 0) {
        return res.status(400).json({
          success: false,
          message: 'Índice de backup inválido'
        });
      }

      const success = await DataStorage.restoreFromBackup(backupIndex);
      
      if (success) {
        const restoredData = await DataStorage.loadData();
        res.json({
          success: true,
          message: 'Backup restaurado com sucesso',
          data: restoredData
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Backup não encontrado'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao restaurar backup',
        error: error.message
      });
    }
  }

  async clearAllData(req, res) {
    try {
      const success = await DataStorage.clearAllData();
      
      if (success) {
        res.json({
          success: true,
          message: 'Todos os dados foram limpos'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao limpar dados'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao limpar dados',
        error: error.message
      });
    }
  }

  async updateDayData(req, res) {
    try {
      const { dayKey } = req.params;
      const { transactions, notFound, moveToCompleted = false } = req.body;
      
      if (!dayKey || !transactions) {
        return res.status(400).json({
          success: false,
          message: 'Chave do dia e transações são obrigatórios'
        });
      }

      const success = await DataStorage.updateDayData(dayKey, transactions, notFound, moveToCompleted);
      
      if (success) {
        res.json({
          success: true,
          message: 'Dados do dia atualizados com sucesso',
          dayData: { transactions, notFound }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao atualizar dados do dia'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar dados do dia',
        error: error.message
      });
    }
  }
}

module.exports = new DataController();