const XLSX = require('xlsx');
const path = require('path');

async function testExcelFile() {
    try {
        const filePath = path.join(__dirname, '../../02-09-25.xls');
        console.log('📁 Analisando arquivo:', filePath);

        // Ler o arquivo Excel
        const workbook = XLSX.readFile(filePath, { cellDates: true });
        console.log('📋 Planilhas encontradas:', workbook.SheetNames);

        // Analisar a primeira planilha
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        console.log('📊 Analisando planilha:', sheetName);

        // Converter para array
        const dataRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        console.log('🔢 Total de linhas:', dataRows.length);

        // Mostrar primeiras 10 linhas para análise
        console.log('\n📝 Estrutura do arquivo:');
        dataRows.slice(0, 10).forEach((row, index) => {
            console.log(`Linha ${index + 1}:`, row);
        });

        // Procurar cabeçalho
        console.log('\n🔍 Procurando cabeçalho...');
        const headerKeywords = {
            date: ['data'],
            history: ['histórico', 'descri', 'lançamento', 'historico'],
            obs: ['obs', 'observa'],
            value: ['valor', 'crédito']
        };

        let headerRowIndex = -1;
        let headerRow = null;

        for (let i = 0; i < Math.min(dataRows.length, 15); i++) {
            const row = dataRows[i].map(cell => String(cell || '').toLowerCase());
            
            const hasDateColumn = headerKeywords.date.some(kw => 
                row.some(cell => cell.includes(kw))
            );
            const hasValueColumn = headerKeywords.value.some(kw => 
                row.some(cell => cell.includes(kw))
            );

            console.log(`  Linha ${i + 1}: Data=${hasDateColumn}, Valor=${hasValueColumn}`, row);
            
            if (hasDateColumn && hasValueColumn) {
                headerRowIndex = i;
                headerRow = row;
                console.log(`✅ Cabeçalho encontrado na linha ${i + 1}`);
                break;
            }
        }

        if (headerRowIndex === -1) {
            console.log('❌ Cabeçalho não encontrado!');
            return;
        }

        // Mapear colunas
        const findColumnIndex = (keywords) => {
            for (const keyword of keywords) {
                const index = headerRow.findIndex(cell => cell.includes(keyword));
                if (index !== -1) return index;
            }
            return -1;
        };

        const columnMap = {
            date: findColumnIndex(headerKeywords.date),
            history: findColumnIndex(headerKeywords.history),
            obs: findColumnIndex(headerKeywords.obs),
            value: findColumnIndex(headerKeywords.value)
        };

        console.log('\n📍 Mapeamento de colunas:', columnMap);

        // Processar algumas transações de exemplo
        console.log('\n💰 Transações de exemplo:');
        const dataStartIndex = headerRowIndex + 1;
        
        for (let i = dataStartIndex; i < Math.min(dataStartIndex + 5, dataRows.length); i++) {
            const row = dataRows[i];
            if (!row || row.length === 0) continue;

            const dateValue = row[columnMap.date];
            const historico = String(row[columnMap.history] || '').trim();
            const valorStr = String(row[columnMap.value] || '').replace(',', '.').trim();
            const valor = parseFloat(valorStr);

            if (!isNaN(valor) && valor !== 0) {
                console.log(`  Linha ${i + 1}: Data=${dateValue}, Histórico=${historico.substring(0, 50)}..., Valor=${valor}`);
            }
        }

    } catch (error) {
        console.error('❌ Erro ao processar arquivo:', error.message);
    }
}

// Executar teste
testExcelFile().then(() => {
    console.log('\n✅ Análise concluída!');
}).catch(console.error);