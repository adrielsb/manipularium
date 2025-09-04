const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Testar processamento direto do arquivo
const filePath = path.join(__dirname, '02-09-25.xls');

console.log('📁 Testando arquivo:', filePath);
console.log('📂 Arquivo existe?', fs.existsSync(filePath));

try {
    // Ler o arquivo
    const workbook = XLSX.readFile(filePath, { cellDates: true });
    console.log('✅ Arquivo lido com sucesso');
    
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const dataRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    
    console.log('📊 Total de linhas:', dataRows.length);
    console.log('\n🔍 Primeiras 5 linhas:');
    dataRows.slice(0, 5).forEach((row, i) => {
        console.log(`Linha ${i + 1}:`, row);
    });
    
    console.log('\n✅ Teste concluído com sucesso!');
} catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
}