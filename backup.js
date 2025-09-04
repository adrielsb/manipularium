const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const BACKUP_DIR = './backups';
const MAX_BACKUPS = 5;

// Diretórios e arquivos para incluir no backup
const ITEMS_TO_BACKUP = [
  'src',
  'public', 
  'views',
  'database',
  'data',
  'package.json',
  'package-lock.json',
  '.env.example',
  'test-upload.js',
  'README.md'
];

async function createBackup() {
  try {
    // Criar pasta de backup se não existir
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Gerar nome do arquivo com data e hora (incluindo milissegundos)
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/:/g, '-')
      .replace('T', '_')
      .replace(/\./g, '-');
    
    const backupFileName = `backup_${timestamp}.tar.gz`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    // Filtrar apenas items que existem
    const existingItems = ITEMS_TO_BACKUP.filter(item => {
      try {
        fs.accessSync(item);
        return true;
      } catch {
        return false;
      }
    });

    if (existingItems.length === 0) {
      console.log('❌ Nenhum arquivo para fazer backup encontrado.');
      return;
    }

    // Verificar se já existe um backup com o mesmo nome e adicionar sufixo se necessário
    let finalBackupPath = backupPath;
    let finalBackupFileName = backupFileName;
    
    if (fs.existsSync(backupPath)) {
      const randomSuffix = Math.random().toString(36).substring(2, 5);
      const nameWithoutExt = backupFileName.replace('.tar.gz', '');
      finalBackupFileName = `${nameWithoutExt}_${randomSuffix}.tar.gz`;
      finalBackupPath = path.join(BACKUP_DIR, finalBackupFileName);
    }
    
    // Criar comando tar para backup
    const itemsString = existingItems.join(' ');
    const command = `tar -czf "${finalBackupPath}" ${itemsString}`;
    
    console.log('📦 Criando backup...');
    await execPromise(command);
    
    console.log(`✅ Backup criado: ${finalBackupFileName}`);
    
    // Limpar backups antigos (manter apenas os últimos 5)
    cleanOldBackups();
    
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error.message);
  }
}

function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup_') && file.endsWith('.tar.gz'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.time - a.time); // Ordenar por data (mais recente primeiro)

    // Remover backups extras se houver mais que MAX_BACKUPS
    if (files.length > MAX_BACKUPS) {
      const filesToDelete = files.slice(MAX_BACKUPS);
      
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Backup antigo removido: ${file.name}`);
      });
    }
    
    // Listar backups atuais
    const currentBackups = files.slice(0, MAX_BACKUPS);
    console.log(`\n📂 Backups salvos (${currentBackups.length}/${MAX_BACKUPS}):`);
    currentBackups.forEach((file, index) => {
      const size = fs.statSync(file.path).size;
      const sizeMB = (size / 1024 / 1024).toFixed(2);
      console.log(`   ${index + 1}. ${file.name} (${sizeMB} MB)`);
    });
    
  } catch (error) {
    console.error('⚠️  Erro ao limpar backups antigos:', error.message);
  }
}

function listBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('📂 Pasta de backups não existe ainda.');
      return;
    }

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup_') && file.endsWith('.tar.gz'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime,
        size: fs.statSync(path.join(BACKUP_DIR, file)).size
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
      console.log('📂 Nenhum backup encontrado.');
      return;
    }

    console.log(`\n📂 Backups disponíveis (${files.length}/${MAX_BACKUPS}):`);
    files.forEach((file, index) => {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      const date = file.time.toLocaleString('pt-BR');
      console.log(`   ${index + 1}. ${file.name}`);
      console.log(`      📅 ${date} | 📦 ${sizeMB} MB`);
    });
  } catch (error) {
    console.error('❌ Erro ao listar backups:', error.message);
  }
}

// Processar argumentos da linha de comando
const args = process.argv.slice(2);
const command = args[0];

if (command === 'list') {
  listBackups();
} else {
  createBackup();
}