require('dotenv').config();
const supabase = require('../config/database');

async function createTables() {
  console.log('🔄 Criando tabelas no Supabase...');

  try {
    // Verificar se as tabelas já existem
    const { data: tables, error: listError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['transactions', 'not_found_values', 'conference_days', 'backups']);

    if (listError) {
      console.log('⚠️  Não foi possível verificar tabelas existentes, tentando criar...');
    } else {
      const existingTables = tables.map(t => t.table_name);
      console.log('📋 Tabelas existentes:', existingTables);
    }

    // Tentar inserir dados de teste para verificar se as tabelas existem
    console.log('🧪 Testando existência das tabelas...');

    // Teste conference_days
    try {
      const { error: testError1 } = await supabase
        .from('conference_days')
        .select('day_key')
        .limit(1);
      
      if (testError1) {
        console.log('❌ Tabela conference_days não existe');
        console.log('💡 Por favor, execute o SQL manualmente no Supabase Dashboard:');
        console.log('📝 SQL para conference_days:');
        console.log(`
CREATE TABLE IF NOT EXISTS conference_days (
    day_key VARCHAR(20) PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
      } else {
        console.log('✅ Tabela conference_days existe');
      }
    } catch (error) {
      console.log('❌ Erro ao testar conference_days:', error.message);
    }

    // Teste transactions
    try {
      const { error: testError2 } = await supabase
        .from('transactions')
        .select('id')
        .limit(1);
      
      if (testError2) {
        console.log('❌ Tabela transactions não existe');
        console.log('💡 SQL para transactions:');
        console.log(`
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    day_key VARCHAR(20) NOT NULL,
    original_id INTEGER NOT NULL,
    date_value VARCHAR(20) NOT NULL,
    historico TEXT NOT NULL,
    cpf_cnpj VARCHAR(50),
    valor DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'unmatched' CHECK (status IN ('unmatched', 'matched', 'needs-review')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
      } else {
        console.log('✅ Tabela transactions existe');
      }
    } catch (error) {
      console.log('❌ Erro ao testar transactions:', error.message);
    }

    // Teste not_found_values
    try {
      const { error: testError3 } = await supabase
        .from('not_found_values')
        .select('id')
        .limit(1);
      
      if (testError3) {
        console.log('❌ Tabela not_found_values não existe');
        console.log('💡 SQL para not_found_values:');
        console.log(`
CREATE TABLE IF NOT EXISTS not_found_values (
    id SERIAL PRIMARY KEY,
    day_key VARCHAR(20) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
      } else {
        console.log('✅ Tabela not_found_values existe');
      }
    } catch (error) {
      console.log('❌ Erro ao testar not_found_values:', error.message);
    }

    // Teste backups
    try {
      const { error: testError4 } = await supabase
        .from('backups')
        .select('id')
        .limit(1);
      
      if (testError4) {
        console.log('❌ Tabela backups não existe');
        console.log('💡 SQL para backups:');
        console.log(`
CREATE TABLE IF NOT EXISTS backups (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data JSONB NOT NULL,
    is_auto BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
      } else {
        console.log('✅ Tabela backups existe');
      }
    } catch (error) {
      console.log('❌ Erro ao testar backups:', error.message);
    }

    console.log('\n📋 INSTRUÇÕES:');
    console.log('1. Acesse o Supabase Dashboard: https://plazfamleohfuxnvybsm.supabase.co');
    console.log('2. Vá na seção "SQL Editor"');
    console.log('3. Execute os comandos SQL mostrados acima para criar as tabelas');
    console.log('4. Execute o comando: npm run dev');

    console.log('\n✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createTables()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha:', error);
      process.exit(1);
    });
}

module.exports = { createTables };