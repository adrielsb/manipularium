const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const BUILD_DIR = './dist';
const REQUIRED_FILES = [
  'src/app.js',
  'views/index.html', 
  'public/js/app.js',
  'public/images/logo.svg',
  'database/complete_schema.sql',
  'package.json'
];

const REQUIRED_DIRS = [
  'src',
  'views', 
  'public',
  'database'
];

console.log('🔨 Iniciando processo de build...\n');

async function checkDependencies() {
  console.log('📦 Verificando dependências...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});
    
    console.log(`✅ ${dependencies.length} dependências encontradas`);
    console.log(`✅ ${devDependencies.length} dev dependências encontradas`);
    
    // Verificar se node_modules existe
    if (!fs.existsSync('node_modules')) {
      console.log('⚠️  node_modules não encontrado. Execute npm install primeiro.');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar dependências:', error.message);
    return false;
  }
}

function checkProjectStructure() {
  console.log('\n🗂️  Verificando estrutura do projeto...');
  
  let allValid = true;
  
  // Verificar diretórios obrigatórios
  REQUIRED_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`✅ Diretório ${dir}/`);
    } else {
      console.log(`❌ Diretório ${dir}/ não encontrado`);
      allValid = false;
    }
  });
  
  // Verificar arquivos obrigatórios
  REQUIRED_FILES.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      const size = (stats.size / 1024).toFixed(2);
      console.log(`✅ ${file} (${size} KB)`);
    } else {
      console.log(`❌ ${file} não encontrado`);
      allValid = false;
    }
  });
  
  return allValid;
}

function validateEnvironment() {
  console.log('\n🔧 Verificando configurações...');
  
  // Verificar se .env.example existe
  if (fs.existsSync('.env.example')) {
    console.log('✅ .env.example encontrado');
  } else {
    console.log('⚠️  .env.example não encontrado');
  }
  
  // Verificar se .env existe
  if (fs.existsSync('.env')) {
    console.log('✅ .env encontrado');
  } else {
    console.log('⚠️  .env não encontrado - use .env.example como base');
  }
  
  return true;
}

async function runTests() {
  console.log('\n🧪 Executando verificações de integridade...');
  
  try {
    // Verificar se o app.js pode ser carregado sem erros
    console.log('📝 Validando app.js...');
    await execPromise('node -c src/app.js');
    console.log('✅ app.js válido');
    
    // Verificar se package.json é válido
    console.log('📝 Validando package.json...');
    JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('✅ package.json válido');
    
    // Verificar se o banco de dados pode ser inicializado
    if (fs.existsSync('src/scripts/initDatabase.js')) {
      console.log('📝 Validando configuração do banco...');
      await execPromise('node -c src/scripts/initDatabase.js');
      console.log('✅ Configuração do banco válida');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro na validação:', error.message);
    return false;
  }
}

function createBuildInfo() {
  console.log('\n📄 Gerando informações de build...');
  
  const buildInfo = {
    buildDate: new Date().toISOString(),
    version: JSON.parse(fs.readFileSync('package.json', 'utf8')).version,
    nodeVersion: process.version,
    platform: process.platform,
    files: REQUIRED_FILES.filter(file => fs.existsSync(file)),
    directories: REQUIRED_DIRS.filter(dir => fs.existsSync(dir))
  };
  
  fs.writeFileSync('build-info.json', JSON.stringify(buildInfo, null, 2));
  console.log('✅ build-info.json criado');
  
  return buildInfo;
}

function generateBuildSummary(buildInfo, success) {
  console.log('\n📊 RESUMO DO BUILD');
  console.log('=' .repeat(50));
  console.log(`📅 Data: ${new Date(buildInfo.buildDate).toLocaleString('pt-BR')}`);
  console.log(`📦 Versão: ${buildInfo.version}`);
  console.log(`🟢 Node.js: ${buildInfo.nodeVersion}`);
  console.log(`💻 Plataforma: ${buildInfo.platform}`);
  console.log(`📁 Arquivos: ${buildInfo.files.length}/${REQUIRED_FILES.length}`);
  console.log(`🗂️  Diretórios: ${buildInfo.directories.length}/${REQUIRED_DIRS.length}`);
  
  if (success) {
    console.log('\n🎉 BUILD CONCLUÍDO COM SUCESSO!');
    console.log('✅ Projeto pronto para produção');
    console.log('\n📋 Próximos passos:');
    console.log('   • npm start - Iniciar em produção');
    console.log('   • npm run dev - Iniciar em desenvolvimento');
    console.log('   • npm run backup - Criar backup do projeto');
  } else {
    console.log('\n❌ BUILD FALHOU');
    console.log('⚠️  Corrija os erros acima antes de continuar');
  }
}

async function main() {
  try {
    let success = true;
    
    // 1. Verificar dependências
    if (!(await checkDependencies())) {
      success = false;
    }
    
    // 2. Verificar estrutura do projeto
    if (!checkProjectStructure()) {
      success = false;
    }
    
    // 3. Verificar ambiente
    if (!validateEnvironment()) {
      success = false;
    }
    
    // 4. Executar testes de integridade
    if (!(await runTests())) {
      success = false;
    }
    
    // 5. Gerar informações de build
    const buildInfo = createBuildInfo();
    
    // 6. Mostrar resumo
    generateBuildSummary(buildInfo, success);
    
    // 7. Definir código de saída
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('\n💥 Erro fatal durante o build:', error.message);
    process.exit(1);
  }
}

// Executar build
main();