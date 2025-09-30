const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_KEY não encontrados no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportAllData() {
  try {
    console.log('📦 Exportando todos os dados do Supabase...\n');

    // Exportar conference_days
    console.log('📋 Exportando conference_days...');
    const { data: conferenceDays, error: daysError } = await supabase
      .from('conference_days')
      .select('*');

    if (daysError) {
      console.warn('⚠️  Erro ao exportar conference_days:', daysError.message);
    }

    // Exportar transactions
    console.log('📋 Exportando transactions...');
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*');

    if (transError) {
      console.warn('⚠️  Erro ao exportar transactions:', transError.message);
    }

    // Exportar not_found_values
    console.log('📋 Exportando not_found_values...');
    const { data: notFoundValues, error: nfError } = await supabase
      .from('not_found_values')
      .select('*');

    if (nfError) {
      console.warn('⚠️  Erro ao exportar not_found_values:', nfError.message);
    }

    // Exportar caixa_days
    console.log('📋 Exportando caixa_days...');
    const { data: caixaDays, error: caixaDaysError } = await supabase
      .from('caixa_days')
      .select('*');

    if (caixaDaysError) {
      console.warn('⚠️  Erro ao exportar caixa_days:', caixaDaysError.message);
    }

    // Exportar caixa_transactions
    console.log('📋 Exportando caixa_transactions...');
    const { data: caixaTransactions, error: caixaTransError } = await supabase
      .from('caixa_transactions')
      .select('*');

    if (caixaTransError) {
      console.warn('⚠️  Erro ao exportar caixa_transactions:', caixaTransError.message);
    }

    // Exportar valores_nao_encontrados_global
    console.log('📋 Exportando valores_nao_encontrados_global...');
    const { data: valoresGlobal, error: valoresError } = await supabase
      .from('valores_nao_encontrados_global')
      .select('*');

    if (valoresError) {
      console.warn('⚠️  Erro ao exportar valores_nao_encontrados_global:', valoresError.message);
    }

    // Exportar backups
    console.log('📋 Exportando backups...');
    const { data: backups, error: backupsError } = await supabase
      .from('backups')
      .select('*')
      .order('timestamp', { ascending: false });

    if (backupsError) {
      console.warn('⚠️  Erro ao exportar backups:', backupsError.message);
    }

    // Preparar dados para exportação
    const exportData = {
      exportedAt: new Date().toISOString(),
      supabaseUrl: supabaseUrl,
      tables: {
        conference_days: conferenceDays || [],
        transactions: transactions || [],
        not_found_values: notFoundValues || [],
        caixa_days: caixaDays || [],
        caixa_transactions: caixaTransactions || [],
        valores_nao_encontrados_global: valoresGlobal || [],
        backups: backups || []
      },
      statistics: {
        conference_days: conferenceDays?.length || 0,
        transactions: transactions?.length || 0,
        not_found_values: notFoundValues?.length || 0,
        caixa_days: caixaDays?.length || 0,
        caixa_transactions: caixaTransactions?.length || 0,
        valores_nao_encontrados_global: valoresGlobal?.length || 0,
        backups: backups?.length || 0
      }
    };

    // Salvar arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `supabase-backup-${timestamp}.json`;
    const backupDir = path.join(__dirname, '../backups');

    await fs.mkdir(backupDir, { recursive: true });
    const filepath = path.join(backupDir, filename);

    await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));

    console.log('\n✅ Backup exportado com sucesso!');
    console.log('📁 Arquivo:', filepath);
    console.log('\n📊 Estatísticas:');
    console.log(`   - Dias de conferência: ${exportData.statistics.conference_days}`);
    console.log(`   - Transações: ${exportData.statistics.transactions}`);
    console.log(`   - Valores não encontrados: ${exportData.statistics.not_found_values}`);
    console.log(`   - Dias de caixa: ${exportData.statistics.caixa_days}`);
    console.log(`   - Transações de caixa: ${exportData.statistics.caixa_transactions}`);
    console.log(`   - Valores não encontrados global: ${exportData.statistics.valores_nao_encontrados_global}`);
    console.log(`   - Backups internos: ${exportData.statistics.backups}`);

    return filepath;

  } catch (error) {
    console.error('❌ Erro ao exportar dados:', error);
    throw error;
  }
}

// Executar exportação
exportAllData()
  .then(() => {
    console.log('\n✨ Processo concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Processo falhou:', error);
    process.exit(1);
  });