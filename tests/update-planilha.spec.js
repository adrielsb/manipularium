const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Teste de atualização de planilha', () => {

  test('deve manter dados ao atualizar planilha e recarregar página', async ({ page }) => {
    // Configurar logs do console
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });

    // Acessar aplicação
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    console.log('\n📂 Passo 1: Carregar planilha do dia 24/09 (primeira vez)');

    // Carregar arquivo
    const fileInput = page.locator('#fileInput');
    const filePath = path.join(__dirname, '../public/uploads/24_09.xls');
    await fileInput.setInputFiles(filePath);

    // Clicar em "Carregar Planilha"
    await page.click('#loadFileButton');
    await page.waitForTimeout(2000);

    // Verificar se planilha foi carregada
    const daySelector = page.locator('#daySelector');
    const selectedDay = await daySelector.inputValue();
    console.log(`✅ Planilha carregada: ${selectedDay}`);

    // Contar transações visíveis na tabela
    const initialRows = await page.locator('#table-container tbody tr').count();
    console.log(`📊 Transações iniciais: ${initialRows}`);

    console.log('\n🔍 Passo 2: Fazer conferências');

    // Conferir alguns valores (vamos pegar valores da tabela)
    const firstValue = await page.locator('#table-container tbody tr:first-child td:nth-child(3)').textContent();
    const cleanValue = firstValue.replace(/[^\d,]/g, '').replace(',', '.');

    console.log(`💰 Conferindo valor: ${cleanValue}`);
    await page.fill('#valorInput', cleanValue);
    await page.click('#checkButton');
    await page.waitForTimeout(1000);

    // Testar valor não encontrado
    console.log('❌ Testando valor não encontrado: 999.99');
    await page.fill('#valorInput', '999.99');
    await page.click('#checkButton');

    // Confirmar modal de "não encontrado"
    const notFoundModal = page.locator('#notFoundModal');
    if (await notFoundModal.isVisible()) {
      await page.click('#confirmNotFoundBtn');
      await page.waitForTimeout(1000);
    }

    console.log('\n📂 Passo 3: Recarregar mesma planilha com dados "atualizados"');

    // Recarregar mesmo arquivo (simula atualização com dados adicionais)
    await fileInput.setInputFiles(filePath);
    await page.click('#loadFileButton');
    await page.waitForTimeout(2000);

    // Verificar mensagem de atualização
    const statusMessage = await page.locator('#statusMessage').textContent();
    console.log(`📝 Status: ${statusMessage}`);

    // Contar transações após reload
    const reloadedRows = await page.locator('#table-container tbody tr').count();
    console.log(`📊 Transações após reload: ${reloadedRows}`);

    // Extrair dados do console antes do refresh
    const logsBeforeRefresh = [];
    page.on('console', msg => logsBeforeRefresh.push(msg.text()));

    console.log('\n🔄 Passo 4: Atualizar página (F5)');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verificar se dados ainda estão lá
    const dayAfterRefresh = await daySelector.inputValue();
    const rowsAfterRefresh = await page.locator('#table-container tbody tr').count();

    console.log(`\n📊 RESULTADOS:`);
    console.log(`   Dia selecionado após refresh: ${dayAfterRefresh}`);
    console.log(`   Transações antes do refresh: ${reloadedRows}`);
    console.log(`   Transações após refresh: ${rowsAfterRefresh}`);

    // Verificar valores não encontrados
    const notFoundSection = page.locator('#notFoundSection');
    const notFoundVisible = await notFoundSection.isVisible();
    console.log(`   Valores não encontrados visíveis: ${notFoundVisible}`);

    if (notFoundVisible) {
      const notFoundCount = await page.locator('#notFoundList li').count();
      console.log(`   Quantidade de valores não encontrados: ${notFoundCount}`);
    }

    // Verificar se há valores conferidos (com status matched)
    const matchedRows = await page.locator('#table-container tbody tr.bg-green-50').count();
    console.log(`   Valores conferidos (matched): ${matchedRows}`);

    // ASSERÇÕES
    expect(rowsAfterRefresh, 'As transações devem permanecer após refresh').toBeGreaterThan(0);
    expect(dayAfterRefresh, 'O dia deve estar selecionado após refresh').toBe(selectedDay);

    if (matchedRows > 0) {
      console.log(`\n✅ SUCESSO: ${matchedRows} valores conferidos foram preservados!`);
    } else {
      console.log(`\n❌ PROBLEMA: Valores conferidos foram perdidos após refresh!`);
    }
  });

  test('deve preservar dados de caixa após atualização', async ({ page }) => {
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    console.log('\n📂 Carregar e conferir valores');

    // Carregar arquivo
    const fileInput = page.locator('#fileInput');
    const filePath = path.join(__dirname, '../public/uploads/24_09.xls');
    await fileInput.setInputFiles(filePath);
    await page.click('#loadFileButton');
    await page.waitForTimeout(2000);

    // Conferir um valor
    const firstValue = await page.locator('#table-container tbody tr:first-child td:nth-child(3)').textContent();
    const cleanValue = firstValue.replace(/[^\d,]/g, '').replace(',', '.');

    await page.fill('#valorInput', cleanValue);
    await page.click('#checkButton');
    await page.waitForTimeout(1500);

    console.log('\n🏦 Verificar dados de caixa');

    // Ir para aba de Caixa
    await page.click('#navCaixa');
    await page.waitForTimeout(1000);

    // Verificar se há transações na caixa
    const caixaRows = await page.locator('#caixa-table-container tbody tr').count();
    console.log(`   Transações na caixa antes do refresh: ${caixaRows}`);

    // Recarregar página
    console.log('\n🔄 Recarregar página...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Voltar para aba de Caixa
    await page.click('#navCaixa');
    await page.waitForTimeout(1000);

    // Verificar transações após refresh
    const caixaRowsAfter = await page.locator('#caixa-table-container tbody tr').count();
    console.log(`   Transações na caixa após refresh: ${caixaRowsAfter}`);

    expect(caixaRowsAfter, 'Dados de caixa devem ser preservados').toBe(caixaRows);

    if (caixaRowsAfter === caixaRows && caixaRows > 0) {
      console.log(`\n✅ SUCESSO: Dados de caixa foram preservados!`);
    } else {
      console.log(`\n❌ PROBLEMA: Dados de caixa foram perdidos após refresh!`);
    }
  });
});