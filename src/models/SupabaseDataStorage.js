const supabase = require('../config/database');

class SupabaseDataStorage {
  
  async initDatabase() {
    try {
      // Apenas testar se consegue conectar com o Supabase
      // As tabelas devem ser criadas manualmente no Dashboard do Supabase
      const { data, error } = await supabase
        .from('conference_days')
        .select('count')
        .limit(1);
      
      console.log('✅ Banco de dados inicializado');
    } catch (error) {
      console.error('Erro ao inicializar banco:', error);
      throw error; // Permitir que o HybridDataStorage use o fallback
    }
  }

  async loadData() {
    try {
      // Carregar dias de conferência
      const { data: days, error: daysError } = await supabase
        .from('conference_days')
        .select('*');

      if (daysError) throw daysError;

      // Carregar transações
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('original_id');

      if (transactionsError) throw transactionsError;

      // Carregar valores não encontrados
      const { data: notFoundValues, error: notFoundError } = await supabase
        .from('not_found_values')
        .select('*');

      if (notFoundError) throw notFoundError;

      // Carregar backups
      const { data: backups, error: backupsError } = await supabase
        .from('backups')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      if (backupsError) throw backupsError;

      // Organizar dados no formato esperado
      const historyData = { pending: {}, completed: {} };

      // Agrupar transações e valores não encontrados por dia
      const dayGroups = {};

      transactions.forEach(transaction => {
        if (!dayGroups[transaction.day_key]) {
          dayGroups[transaction.day_key] = {
            transactions: [],
            notFound: []
          };
        }
        
        dayGroups[transaction.day_key].transactions.push({
          id: transaction.original_id,
          data: transaction.date_value,
          historico: transaction.historico,
          cpfCnpj: transaction.cpf_cnpj,
          valor: parseFloat(transaction.valor),
          status: transaction.status
        });
      });

      notFoundValues.forEach(nf => {
        if (dayGroups[nf.day_key]) {
          dayGroups[nf.day_key].notFound.push(parseFloat(nf.valor));
        }
      });

      // Classificar por status (pending/completed)
      days.forEach(day => {
        if (dayGroups[day.day_key]) {
          historyData[day.status][day.day_key] = dayGroups[day.day_key];
        }
      });

      // Carregar dados de caixa
      const { data: caixaDays, error: caixaError } = await supabase
        .from('caixa_days')
        .select('*');

      const caixaData = { pending: {}, completed: {} };

      if (!caixaError && caixaDays) {
        const { data: caixaTransactions, error: caixaTransError } = await supabase
          .from('caixa_transactions')
          .select('*')
          .order('original_id');

        if (!caixaTransError && caixaTransactions) {
          const caixaDayGroups = {};

          caixaTransactions.forEach(transaction => {
            if (!caixaDayGroups[transaction.day_key]) {
              caixaDayGroups[transaction.day_key] = {
                transactions: [],
                totalConferido: 0
              };
            }

            caixaDayGroups[transaction.day_key].transactions.push({
              id: transaction.original_id,
              data: transaction.date_value,
              historico: transaction.historico,
              cpfCnpj: transaction.cpf_cnpj,
              valor: parseFloat(transaction.valor),
              status: transaction.status,
              transferredAt: transaction.transferred_at,
              originalStatus: transaction.original_status
            });

            caixaDayGroups[transaction.day_key].totalConferido += parseFloat(transaction.valor);
          });

          caixaDays.forEach(day => {
            if (caixaDayGroups[day.day_key]) {
              caixaData[day.status][day.day_key] = caixaDayGroups[day.day_key];
            }
          });
        }
      }

      // Carregar valores não encontrados globais
      const { data: valoresGlobais, error: valoresError } = await supabase
        .from('valores_nao_encontrados_global')
        .select('*')
        .order('data_hora', { ascending: false });

      const valoresNaoEncontrados = !valoresError && valoresGlobais
        ? valoresGlobais.map(v => ({
            valor: parseFloat(v.valor),
            dia: v.dia,
            dataHora: v.data_hora,
            tentativas: v.tentativas
          }))
        : [];

      return {
        historyData,
        caixaData,
        valoresNaoEncontrados,
        backups: backups.map(backup => ({
          timestamp: backup.timestamp,
          data: backup.data,
          isAuto: backup.is_auto
        }))
      };

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return {
        historyData: { pending: {}, completed: {} },
        caixaData: { pending: {}, completed: {} },
        valoresNaoEncontrados: [],
        backups: []
      };
    }
  }

  async saveData(data) {
    try {
      console.log('💾 [Supabase] Iniciando saveData...');
      console.log('  - Dias history:', Object.keys(data.historyData.pending).concat(Object.keys(data.historyData.completed)));
      console.log('  - Dias caixa:', data.caixaData ? Object.keys(data.caixaData.pending).concat(Object.keys(data.caixaData.completed)) : 'N/A');

      // Limpar dados existentes (começar do zero a cada save completo)
      console.log('  - Limpando dados antigos...');
      await this.clearAllData(false);

      // Salvar dias de conferência e suas transações
      for (const [status, days] of Object.entries(data.historyData)) {
        for (const [dayKey, dayData] of Object.entries(days)) {
          console.log(`  - Salvando dia ${dayKey} (${status}): ${dayData.transactions.length} transações`);

          // Inserir dia
          await supabase
            .from('conference_days')
            .upsert({
              day_key: dayKey,
              status: status
            });

          // Inserir transações
          if (dayData.transactions && dayData.transactions.length > 0) {
            const transactionsToInsert = dayData.transactions.map(t => ({
              day_key: dayKey,
              original_id: t.id,
              date_value: t.data,
              historico: t.historico,
              cpf_cnpj: t.cpfCnpj,
              valor: t.valor,
              status: t.status
            }));

            const { error: transError } = await supabase
              .from('transactions')
              .insert(transactionsToInsert);

            if (transError) throw transError;
          }

          // Inserir valores não encontrados
          if (dayData.notFound && dayData.notFound.length > 0) {
            const notFoundToInsert = dayData.notFound.map(valor => ({
              day_key: dayKey,
              valor: valor
            }));

            const { error: nfError } = await supabase
              .from('not_found_values')
              .insert(notFoundToInsert);

            if (nfError) throw nfError;
          }
        }
      }

      // Salvar dados de caixa
      if (data.caixaData) {
        for (const [status, days] of Object.entries(data.caixaData)) {
          for (const [dayKey, dayData] of Object.entries(days)) {

            // Inserir dia de caixa
            await supabase
              .from('caixa_days')
              .upsert({
                day_key: dayKey,
                status: status
              });

            // Inserir transações de caixa
            if (dayData.transactions && dayData.transactions.length > 0) {
              const caixaTransactionsToInsert = dayData.transactions.map(t => ({
                day_key: dayKey,
                original_id: t.id,
                date_value: t.data,
                historico: t.historico,
                cpf_cnpj: t.cpfCnpj,
                valor: t.valor,
                status: t.status,
                transferred_at: t.transferredAt,
                original_status: t.originalStatus
              }));

              const { error: caixaTransError } = await supabase
                .from('caixa_transactions')
                .insert(caixaTransactionsToInsert);

              if (caixaTransError) throw caixaTransError;
            }
          }
        }
      }

      // Salvar valores não encontrados globais
      if (data.valoresNaoEncontrados && data.valoresNaoEncontrados.length > 0) {
        const valoresGlobaisToInsert = data.valoresNaoEncontrados.map(v => ({
          valor: v.valor,
          dia: v.dia,
          data_hora: v.dataHora,
          tentativas: v.tentativas
        }));

        const { error: valoresError } = await supabase
          .from('valores_nao_encontrados_global')
          .insert(valoresGlobaisToInsert);

        if (valoresError) throw valoresError;
      }

      console.log('✅ [Supabase] Todos os dados salvos com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ [Supabase] Erro ao salvar dados:', error);
      return false;
    }
  }

  async createBackup(data, isAutomatic = false) {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        data: data.historyData,
        is_auto: isAutomatic
      };

      const { data: newBackup, error } = await supabase
        .from('backups')
        .insert(backupData)
        .select()
        .single();

      if (error) throw error;

      // Manter apenas 5 backups
      const { data: allBackups, error: selectError } = await supabase
        .from('backups')
        .select('id')
        .order('timestamp', { ascending: false });

      if (selectError) throw selectError;

      if (allBackups.length > 5) {
        const backupsToDelete = allBackups.slice(5).map(b => b.id);
        await supabase
          .from('backups')
          .delete()
          .in('id', backupsToDelete);
      }

      return {
        timestamp: newBackup.timestamp,
        data: newBackup.data,
        isAuto: newBackup.is_auto
      };

    } catch (error) {
      console.error('Erro ao criar backup:', error);
      return null;
    }
  }

  async clearAllData(clearBackups = true) {
    try {
      // Limpar em ordem devido às foreign keys
      await supabase.from('not_found_values').delete().neq('id', 0);
      await supabase.from('transactions').delete().neq('id', 0);
      await supabase.from('conference_days').delete().neq('day_key', '');
      await supabase.from('caixa_transactions').delete().neq('id', 0);
      await supabase.from('caixa_days').delete().neq('day_key', '');
      await supabase.from('valores_nao_encontrados_global').delete().neq('id', 0);

      if (clearBackups) {
        await supabase.from('backups').delete().neq('id', 0);
      }

      return true;
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      return false;
    }
  }

  async restoreFromBackup(backupIndex) {
    try {
      const { data: backups, error } = await supabase
        .from('backups')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (backupIndex >= 0 && backupIndex < backups.length) {
        const backupToRestore = backups[backupIndex];
        
        // Limpar dados atuais (exceto backups)
        await this.clearAllData(false);
        
        // Restaurar dados do backup
        await this.saveData({ historyData: backupToRestore.data });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return false;
    }
  }

  async updateDayData(dayKey, transactions, notFound = [], moveToCompleted = false) {
    try {
      const newStatus = moveToCompleted ? 'completed' : 'pending';

      // Atualizar ou inserir o dia
      await supabase
        .from('conference_days')
        .upsert({
          day_key: dayKey,
          status: newStatus
        });

      // Remover transações e valores não encontrados existentes para este dia
      await supabase.from('transactions').delete().eq('day_key', dayKey);
      await supabase.from('not_found_values').delete().eq('day_key', dayKey);

      // Inserir transações atualizadas
      if (transactions && transactions.length > 0) {
        const transactionsToInsert = transactions.map(t => ({
          day_key: dayKey,
          original_id: t.id,
          date_value: t.data,
          historico: t.historico,
          cpf_cnpj: t.cpfCnpj,
          valor: t.valor,
          status: t.status
        }));

        const { error: transError } = await supabase
          .from('transactions')
          .insert(transactionsToInsert);

        if (transError) throw transError;
      }

      // Inserir valores não encontrados
      if (notFound && notFound.length > 0) {
        const notFoundToInsert = notFound.map(valor => ({
          day_key: dayKey,
          valor: valor
        }));

        const { error: nfError } = await supabase
          .from('not_found_values')
          .insert(notFoundToInsert);

        if (nfError) throw nfError;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar dados do dia:', error);
      return false;
    }
  }
}

module.exports = new SupabaseDataStorage();