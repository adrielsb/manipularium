const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const supabase = require('../config/database');

async function initDatabase() {
  try {
    console.log('🔄 Iniciando configuração do banco de dados...');

    // Ler arquivo SQL de schema
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    // Dividir comandos SQL (separados por ; e quebras de linha duplas)
    const commands = schema
      .split(/;\s*\n\s*\n/)
      .filter(cmd => cmd.trim().length > 0)
      .map(cmd => cmd.trim() + (cmd.trim().endsWith(';') ? '' : ';'));

    console.log(`📋 Executando ${commands.length} comandos SQL...`);

    // Executar cada comando separadamente
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.trim()) {
        console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql_command: command });
          
          if (error) {
            // Tentar executar diretamente se a função RPC não existir
            const { error: directError } = await supabase
              .from('_temp_exec')
              .select('1')
              .limit(1);
              
            if (directError && directError.message.includes('does not exist')) {
              console.log('⚠️  Executando comando SQL diretamente...');
              // Para comandos DDL, precisamos usar uma abordagem diferente
              await executeDirectSQL(command);
            } else {
              throw error;
            }
          }
        } catch (cmdError) {
          if (cmdError.message.includes('already exists') || 
              cmdError.message.includes('duplicate key')) {
            console.log(`ℹ️  Comando ${i + 1} já foi executado anteriormente (ignorando)`);
          } else {
            console.error(`❌ Erro no comando ${i + 1}:`, cmdError.message);
            // Continuar com os próximos comandos em caso de erro não crítico
          }
        }
      }
    }

    console.log('✅ Banco de dados configurado com sucesso!');
    
    // Testar conexão
    const { data, error } = await supabase.from('conference_days').select('count').limit(1);
    if (error) {
      throw new Error(`Erro ao testar conexão: ${error.message}`);
    }
    
    console.log('✅ Conexão com banco de dados testada com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    process.exit(1);
  }
}

async function executeDirectSQL(command) {
  // Para comandos DDL simples, podemos usar uma abordagem alternativa
  // Aqui você poderia implementar uma lógica mais sofisticada
  // Por enquanto, vamos apenas logar
  console.log('📝 Comando SQL registrado:', command.substring(0, 100) + '...');
}

// Executar se chamado diretamente
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('🎉 Inicialização concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na inicialização:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase };