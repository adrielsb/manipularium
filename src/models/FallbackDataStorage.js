const fs = require('fs').promises;
const path = require('path');

class FallbackDataStorage {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.dataFile = path.join(this.dataDir, 'conference-data.json');
    
    this.initStorage();
  }

  async initStorage() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      
      try {
        await fs.access(this.dataFile);
      } catch {
        await this.saveData({
          historyData: { pending: {}, completed: {} },
          backups: []
        });
      }
    } catch (error) {
      console.error('Erro ao inicializar armazenamento local:', error);
    }
  }

  async loadData() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erro ao carregar dados locais:', error);
      return {
        historyData: { pending: {}, completed: {} },
        backups: []
      };
    }
  }

  async saveData(data) {
    try {
      await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados locais:', error);
      return false;
    }
  }

  async createBackup(data, isAutomatic = false) {
    try {
      const timestamp = new Date().toISOString();
      const backupData = {
        timestamp,
        data: JSON.parse(JSON.stringify(data.historyData)),
        isAuto: isAutomatic
      };
      
      const currentData = await this.loadData();
      currentData.backups.unshift(backupData);
      
      if (currentData.backups.length > 5) {
        currentData.backups = currentData.backups.slice(0, 5);
      }
      
      await this.saveData(currentData);
      return backupData;
    } catch (error) {
      console.error('Erro ao criar backup local:', error);
      return null;
    }
  }

  async clearAllData() {
    try {
      const emptyData = {
        historyData: { pending: {}, completed: {} },
        backups: []
      };
      await this.saveData(emptyData);
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados locais:', error);
      return false;
    }
  }

  async restoreFromBackup(backupIndex) {
    try {
      const currentData = await this.loadData();
      if (backupIndex >= 0 && backupIndex < currentData.backups.length) {
        const backupToRestore = currentData.backups[backupIndex];
        currentData.historyData = JSON.parse(JSON.stringify(backupToRestore.data));
        await this.saveData(currentData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao restaurar backup local:', error);
      return false;
    }
  }

  async updateDayData(dayKey, transactions, notFound = [], moveToCompleted = false) {
    try {
      const currentData = await this.loadData();
      const dayData = { transactions, notFound };

      if (moveToCompleted) {
        if (currentData.historyData.pending[dayKey]) {
          delete currentData.historyData.pending[dayKey];
        }
        currentData.historyData.completed[dayKey] = dayData;
      } else {
        if (currentData.historyData.completed[dayKey]) {
          delete currentData.historyData.completed[dayKey];
        }
        currentData.historyData.pending[dayKey] = dayData;
      }

      await this.saveData(currentData);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar dados do dia local:', error);
      return false;
    }
  }

  async initDatabase() {
    console.log('⚠️  Usando armazenamento local como fallback');
  }
}

module.exports = new FallbackDataStorage();