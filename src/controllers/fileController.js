const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs').promises;

class FileController {
  
  async uploadFile(req, res) {
    try {
      console.log('📥 Upload iniciado:', req.file ? req.file.originalname : 'sem arquivo');
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum arquivo foi enviado'
        });
      }

      const filePath = req.file.path;
      console.log('📁 Arquivo salvo em:', filePath);
      
      try {
        const transactions = await this.processExcelFile(filePath);
        console.log(`✅ ${transactions.length} transações processadas`);
        
        // Remover arquivo temporário
        try {
          await fs.unlink(filePath);
        } catch (unlinkError) {
          console.error('⚠️ Erro ao remover arquivo temporário:', unlinkError.message);
        }
        
        res.json({
          success: true,
          message: 'Arquivo processado com sucesso',
          data: {
            transactions: transactions,
            fileName: req.file.originalname
          }
        });
        
      } catch (processError) {
        console.error('❌ Erro no processamento:', processError.message);
        console.error(processError.stack);
        
        // Tentar remover arquivo em caso de erro
        try {
          await fs.unlink(filePath);
        } catch (unlinkError) {
          console.error('⚠️ Erro ao remover arquivo após falha:', unlinkError.message);
        }
        
        throw processError;
      }
      
    } catch (error) {
      console.error('💥 Erro geral no upload:', error.message);
      console.error(error.stack);
      
      res.status(500).json({
        success: false,
        message: 'Erro ao processar arquivo',
        error: error.message
      });
    }
  }

  async processExcelFile(filePath) {
    try {
      const workbook = XLSX.readFile(filePath, { cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const dataRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

      if (dataRows.length === 0) {
        throw new Error('Arquivo vazio ou sem dados válidos');
      }
      
      const { columnMap, dataRowStartIndex } = this.findHeaderAndMapIndices(dataRows);
      const transactions = this.extractTransactions(dataRows, columnMap, dataRowStartIndex);
      
      if (transactions.length === 0) {
        throw new Error('Nenhuma transação válida encontrada no arquivo');
      }
      
      return transactions;
      
    } catch (error) {
      throw new Error(`Erro ao processar arquivo Excel: ${error.message}`);
    }
  }

  findHeaderAndMapIndices(rows) {
    const headerKeywords = {
      date: ['data'],
      history: ['histórico', 'descri', 'lançamento', 'historico'],
      obs: ['obs', 'observa'],
      value: ['valor', 'crédito', 'valor (r$)']
    };
    
    let headerRowIndex = -1;
    let headerRow = null;

    // Procurar cabeçalho nas primeiras 15 linhas (arquivo pode ter cabeçalhos extras)
    for (let i = 0; i < Math.min(rows.length, 15); i++) {
      const row = rows[i].map(cell => String(cell || '').toLowerCase().trim());
      
      const hasDateColumn = headerKeywords.date.some(kw => 
        row.some(cell => cell.includes(kw))
      );
      const hasValueColumn = headerKeywords.value.some(kw => 
        row.some(cell => cell.includes(kw))
      );
      const hasHistoryColumn = headerKeywords.history.some(kw => 
        row.some(cell => cell.includes(kw))
      );
      
      if (hasDateColumn && hasValueColumn && hasHistoryColumn) {
        headerRowIndex = i;
        headerRow = row;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error("Cabeçalho não identificado. Verifique se existem colunas 'Data', 'Histórico' e 'Valor'.");
    }

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

    if (columnMap.date === -1 || columnMap.value === -1 || columnMap.history === -1) {
      throw new Error("Colunas essenciais (Data, Histórico, Valor) não encontradas.");
    }

    return { columnMap, dataRowStartIndex: headerRowIndex + 1 };
  }

  extractTransactions(dataRows, columnMap, startIndex) {
    const transactions = [];
    const uniqueEntries = new Set();
    
    for (let i = startIndex; i < dataRows.length; i++) {
      const row = dataRows[i];
      
      if (!row || row.length === 0 || !row[columnMap.date] || !row[columnMap.value]) {
        continue;
      }

      // Processar data
      const dateValue = row[columnMap.date];
      let dateStr = '';
      
      if (dateValue instanceof Date) {
        dateStr = dateValue.toLocaleDateString('pt-BR');
      } else {
        // Limpar data removendo espaços extras
        dateStr = String(dateValue).trim().replace(/\s+/g, '');
      }
      
      // Pular se a data está vazia ou inválida
      if (!dateStr || dateStr === '') continue;
      
      // Processar histórico
      let historico = String(row[columnMap.history] || '').trim();
      
      // Limpar espaços extras do histórico
      historico = historico.replace(/\s+/g, ' ').trim();
      
      const obs = columnMap.obs !== -1 ? String(row[columnMap.obs] || '').trim() : '';
      
      if (obs && obs !== '') {
        historico += ` (${obs})`;
      }

      // Pular se o histórico está vazio
      if (!historico || historico === '') continue;

      // Extrair CPF/CNPJ do histórico (busca por sequências de 9-14 dígitos)
      const cpfCnpjMatch = historico.match(/\b\d{9,14}\b/);
      const cpfCnpj = cpfCnpjMatch ? cpfCnpjMatch[0] : historico.substring(0, 50);
      
      // Processar valor
      const valorCell = row[columnMap.value];
      let valor = 0;
      
      if (typeof valorCell === 'number') {
        valor = valorCell;
      } else {
        const valorStr = String(valorCell).replace(',', '.').trim();
        valor = parseFloat(valorStr);
      }

      if (!isNaN(valor) && valor !== 0) {
        const entryKey = `${dateStr}_${historico}_${valor}`;
        
        if (!uniqueEntries.has(entryKey)) {
          transactions.push({
            id: i,
            data: dateStr,
            historico: historico,
            cpfCnpj: cpfCnpj,
            valor: valor,
            status: 'unmatched'
          });
          uniqueEntries.add(entryKey);
        }
      }
    }
    
    return transactions;
  }
}

module.exports = new FileController();