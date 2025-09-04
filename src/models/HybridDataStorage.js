const SupabaseDataStorage = require('./SupabaseDataStorage');
const FallbackDataStorage = require('./FallbackDataStorage');

class HybridDataStorage {
  constructor() {
    this.useSupabase = true;
    this.supabase = SupabaseDataStorage;
    this.fallback = FallbackDataStorage;
  }

  async initDatabase() {
    try {
      // Tentar inicializar o Supabase
      await this.supabase.initDatabase();
      
      // Testar se consegue carregar dados do Supabase
      await this.supabase.loadData();
      
      console.log('✅ Usando Supabase como armazenamento principal');
      this.useSupabase = true;
    } catch (error) {
      console.log('⚠️  Supabase indisponível, usando armazenamento local');
      console.log('💡 Execute as tabelas no Supabase Dashboard e reinicie o servidor');
      this.useSupabase = false;
      await this.fallback.initDatabase();
    }
  }

  async loadData() {
    try {
      if (this.useSupabase) {
        return await this.supabase.loadData();
      } else {
        return await this.fallback.loadData();
      }
    } catch (error) {
      console.error('Erro ao carregar dados, tentando fallback...', error);
      this.useSupabase = false;
      return await this.fallback.loadData();
    }
  }

  async saveData(data) {
    try {
      if (this.useSupabase) {
        const success = await this.supabase.saveData(data);
        if (success) return true;
        
        // Se falhar, usar fallback
        console.log('⚠️  Supabase falhou, salvando localmente');
        this.useSupabase = false;
        return await this.fallback.saveData(data);
      } else {
        return await this.fallback.saveData(data);
      }
    } catch (error) {
      console.error('Erro ao salvar dados, usando fallback...', error);
      this.useSupabase = false;
      return await this.fallback.saveData(data);
    }
  }

  async createBackup(data, isAutomatic = false) {
    try {
      if (this.useSupabase) {
        return await this.supabase.createBackup(data, isAutomatic);
      } else {
        return await this.fallback.createBackup(data, isAutomatic);
      }
    } catch (error) {
      console.error('Erro ao criar backup, usando fallback...', error);
      this.useSupabase = false;
      return await this.fallback.createBackup(data, isAutomatic);
    }
  }

  async clearAllData() {
    try {
      if (this.useSupabase) {
        return await this.supabase.clearAllData();
      } else {
        return await this.fallback.clearAllData();
      }
    } catch (error) {
      console.error('Erro ao limpar dados, usando fallback...', error);
      this.useSupabase = false;
      return await this.fallback.clearAllData();
    }
  }

  async restoreFromBackup(backupIndex) {
    try {
      if (this.useSupabase) {
        return await this.supabase.restoreFromBackup(backupIndex);
      } else {
        return await this.fallback.restoreFromBackup(backupIndex);
      }
    } catch (error) {
      console.error('Erro ao restaurar backup, usando fallback...', error);
      this.useSupabase = false;
      return await this.fallback.restoreFromBackup(backupIndex);
    }
  }

  async updateDayData(dayKey, transactions, notFound = [], moveToCompleted = false) {
    try {
      if (this.useSupabase) {
        return await this.supabase.updateDayData(dayKey, transactions, notFound, moveToCompleted);
      } else {
        return await this.fallback.updateDayData(dayKey, transactions, notFound, moveToCompleted);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do dia, usando fallback...', error);
      this.useSupabase = false;
      return await this.fallback.updateDayData(dayKey, transactions, notFound, moveToCompleted);
    }
  }

  getStorageType() {
    return this.useSupabase ? 'Supabase' : 'Local';
  }
}

module.exports = new HybridDataStorage();