const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node:fetch');
const path = require('path');

async function testFileUpload() {
  try {
    const filePath = path.join(__dirname, '../../02-09-25.xls');
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      console.log('❌ Arquivo não encontrado:', filePath);
      return;
    }

    console.log('📁 Testando upload do arquivo:', filePath);

    // Criar FormData
    const form = new FormData();
    form.append('planilha', fs.createReadStream(filePath));

    // Fazer upload
    console.log('⏳ Enviando arquivo...');
    const response = await fetch('http://localhost:3000/api/files/upload', {
      method: 'POST',
      body: form
    });

    const result = await response.json();
    console.log('📤 Resposta do servidor:', result);

    if (result.success) {
      console.log('✅ Upload realizado com sucesso!');
      console.log('💰 Total de transações processadas:', result.data.transactions.length);
      
      // Mostrar algumas transações
      console.log('\n📋 Primeiras 5 transações:');
      result.data.transactions.slice(0, 5).forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.data} - ${t.historico.substring(0, 40)}... - R$ ${t.valor}`);
      });
    } else {
      console.log('❌ Erro no upload:', result.message);
    }

  } catch (error) {
    console.error('💥 Erro durante o teste:', error.message);
  }
}

// Verificar se o servidor está rodando
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/data');
    if (response.ok) {
      console.log('✅ Servidor está rodando');
      return true;
    }
  } catch {
    console.log('❌ Servidor não está rodando em http://localhost:3000');
    return false;
  }
}

async function main() {
  console.log('🧪 Teste de Upload de Arquivo\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('💡 Execute: npm run dev');
    return;
  }

  await testFileUpload();
}

main().catch(console.error);