const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Teste de limpar histórico de valores não encontrados', () => {

  test('deve limpar histórico de valores não encontrados corretamente', async ({ page }) => {
    // Configurar logs do console e errors
    const consoleMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      console.log(`[BROWSER] ${msg.type()}: ${text}`);
    });

    page.on('pageerror', error => {
      console.log(`[BROWSER ERROR] ${error.message}`);
      console.log(`[BROWSER ERROR] ${error.stack}`);
    });

    // Acessar aplicação
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    console.log('\n📂 Passo 1: Carregar planilha');

    // Carregar arquivo
    const fileInput = page.locator('#fileInput');
    const filePath = path.join(__dirname, '../public/uploads/24_09.xls');
    await fileInput.setInputFiles(filePath);

    // Clicar em "Carregar Planilha"
    await page.click('#loadFileButton');
    await page.waitForTimeout(2000);

    console.log('\n❌ Passo 2: Testar valor não encontrado');

    // Digitar um valor que não existe
    await page.fill('#valorInput', '999.99');
    await page.click('#checkButton');
    await page.waitForTimeout(500);

    // Confirmar no modal de "não encontrado"
    const notFoundModal = page.locator('#notFoundModal');
    await notFoundModal.waitFor({ state: 'visible', timeout: 5000 });
    await page.click('#confirmNotFoundBtn');
    await page.waitForTimeout(1000);

    console.log('\n❌ Passo 3: Adicionar mais valores não encontrados');

    // Adicionar mais alguns valores
    await page.fill('#valorInput', '888.88');
    await page.click('#checkButton');
    await page.waitForTimeout(500);
    await page.click('#confirmNotFoundBtn');
    await page.waitForTimeout(1000);

    await page.fill('#valorInput', '777.77');
    await page.click('#checkButton');
    await page.waitForTimeout(500);
    await page.click('#confirmNotFoundBtn');
    await page.waitForTimeout(1000);

    console.log('\n📊 Passo 4: Verificar histórico de valores não encontrados');

    // Clicar no botão para mostrar histórico
    await page.click('#toggleHistoricoButton');
    await page.waitForTimeout(1000);

    // Contar itens no histórico
    const historicoItems = await page.locator('#historicoContainer > div').count();
    console.log(`   Itens no histórico: ${historicoItems}`);

    expect(historicoItems, 'Deve ter 3 valores não encontrados').toBeGreaterThanOrEqual(3);

    console.log('\n🗑️ Passo 5: Limpar histórico');

    // Limpar logs anteriores
    consoleMessages.length = 0;

    // Tirar screenshot antes de clicar
    await page.screenshot({ path: 'test-results/before-clear.png', fullPage: true });
    console.log('   📸 Screenshot salvo: test-results/before-clear.png');

    // Verificar se o botão existe e tem event listener
    const buttonInfo = await page.evaluate(() => {
      const btn = document.getElementById('clearHistoricoButton');
      return {
        exists: !!btn,
        visible: btn ? btn.offsetParent !== null : false,
        disabled: btn ? btn.disabled : null,
        innerHTML: btn ? btn.innerHTML : null
      };
    });
    console.log('   📍 Info do botão:', buttonInfo);

    // Scroll até o botão
    await page.locator('#clearHistoricoButton').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Tentar clicar diretamente via JavaScript
    console.log('   🖱️ Tentando clicar via JavaScript...');
    const clickResult = await page.evaluate(() => {
      const btn = document.getElementById('clearHistoricoButton');
      if (btn) {
        btn.click();
        return 'clicked';
      }
      return 'button not found';
    });
    console.log('   Result:', clickResult);

    await page.waitForTimeout(3000);

    // Tirar screenshot depois de clicar
    await page.screenshot({ path: 'test-results/after-clear.png', fullPage: true });
    console.log('   📸 Screenshot salvo: test-results/after-clear.png');

    // Verificar logs do console
    console.log('\n📝 Logs capturados após limpar:');
    const relevantLogs = consoleMessages.filter(msg =>
      msg.includes('Limpando histórico') ||
      msg.includes('Histórico limpo') ||
      msg.includes('Salvando dados') ||
      msg.includes('Dados salvos')
    );
    relevantLogs.forEach(log => console.log(`   ${log}`));

    console.log('\n🔍 Passo 6: Verificar se histórico foi limpo na UI');

    // Verificar se o container está vazio ou mostra mensagem apropriada
    const historicoContainerVisible = await page.locator('#historicoContainer').isVisible();
    const noHistoricoMessageVisible = await page.locator('#noHistoricoMessage').isVisible();

    console.log(`   historicoContainer visível: ${historicoContainerVisible}`);
    console.log(`   noHistoricoMessage visível: ${noHistoricoMessageVisible}`);

    // Verificar conteúdo do historicoContainer
    const historicoContent = await page.locator('#historicoContainer').textContent();
    console.log(`   Conteúdo do historicoContainer: "${historicoContent}"`);

    // Contar itens após limpar
    const historicoItemsAfter = await page.locator('#historicoContainer > div.p-3').count();
    console.log(`   Itens no histórico após limpar: ${historicoItemsAfter}`);

    console.log('\n🔄 Passo 7: Recarregar página e verificar persistência');

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Abrir histórico novamente
    await page.click('#toggleHistoricoButton');
    await page.waitForTimeout(1000);

    // Verificar se ainda está vazio
    const historicoItemsAfterReload = await page.locator('#historicoContainer > div.p-3').count();
    const historicoContentAfterReload = await page.locator('#historicoContainer').textContent();

    console.log(`   Itens após reload: ${historicoItemsAfterReload}`);
    console.log(`   Conteúdo após reload: "${historicoContentAfterReload}"`);

    console.log('\n📊 RESULTADOS:');
    console.log(`   ✓ Itens antes de limpar: ${historicoItems}`);
    console.log(`   ${historicoItemsAfter === 0 ? '✓' : '✗'} Itens após limpar: ${historicoItemsAfter} (esperado: 0)`);
    console.log(`   ${historicoItemsAfterReload === 0 ? '✓' : '✗'} Itens após reload: ${historicoItemsAfterReload} (esperado: 0)`);

    // Verificar se os logs de limpeza foram executados
    const hasCleanupLog = consoleMessages.some(msg => msg.includes('Limpando histórico'));
    const hasSuccessLog = consoleMessages.some(msg => msg.includes('Histórico limpo'));

    console.log(`   ${hasCleanupLog ? '✓' : '✗'} Log de limpeza encontrado: ${hasCleanupLog}`);
    console.log(`   ${hasSuccessLog ? '✓' : '✗'} Log de sucesso encontrado: ${hasSuccessLog}`);

    // ASSERÇÕES
    expect(historicoItemsAfter, 'Histórico deve estar vazio após limpar').toBe(0);
    expect(historicoItemsAfterReload, 'Histórico deve permanecer vazio após reload').toBe(0);
    expect(hasCleanupLog, 'Deve ter executado a limpeza').toBe(true);
    expect(hasSuccessLog, 'Deve ter confirmado a limpeza').toBe(true);

    if (historicoItemsAfter === 0 && historicoItemsAfterReload === 0) {
      console.log('\n✅ TESTE PASSOU: Histórico foi limpo corretamente!');
    } else {
      console.log('\n❌ TESTE FALHOU: Histórico não foi limpo corretamente!');
      console.log('\n🔍 Debug info:');
      console.log('   Todos os logs do console:');
      consoleMessages.forEach(log => console.log(`   ${log}`));
    }
  });

  test('deve verificar se dados persistem no servidor após limpar', async ({ page }) => {
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    console.log('\n📡 Verificando dados no servidor via API...');

    // Fazer requisição direta para a API
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/data');
      const data = await res.json();
      return data;
    });

    console.log('\n📊 Dados do servidor:');
    console.log(`   valoresNaoEncontrados: ${response.data.valoresNaoEncontrados?.length || 0} itens`);

    if (response.data.valoresNaoEncontrados && response.data.valoresNaoEncontrados.length > 0) {
      console.log('   Primeiros itens:');
      response.data.valoresNaoEncontrados.slice(0, 3).forEach(item => {
        console.log(`     - Valor: ${item.valor}, Dia: ${item.dia}, Tentativas: ${item.tentativas}`);
      });
    }
  });
});