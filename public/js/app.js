document.addEventListener('DOMContentLoaded', () => {
    
    // Navegação
    const navBancaria = document.getElementById('navBancaria');
    const navCaixa = document.getElementById('navCaixa');
    const sistemaBancaria = document.getElementById('sistema-bancaria');
    const sistemaCaixa = document.getElementById('sistema-caixa');
    const pageSubtitle = document.getElementById('page-subtitle');
    
    // Elementos da Conferência de Caixa
    const caixaDaySelector = document.getElementById('caixaDaySelector');
    const caixaControls = document.getElementById('caixaControls');
    const caixaStatusText = document.getElementById('caixaStatusText');
    const caixaTableContainer = document.getElementById('caixa-table-container');
    const caixaInitialMessage = document.getElementById('caixaInitialMessage');
    const finalizarCaixaButton = document.getElementById('finalizarCaixaButton');
    const exportarCaixaButton = document.getElementById('exportarCaixaButton');
    
    navBancaria.addEventListener('click', () => {
        sistemaBancaria.classList.remove('hidden');
        sistemaCaixa.classList.add('hidden');
        navBancaria.classList.add('active');
        navCaixa.classList.remove('active');
        pageSubtitle.textContent = 'Sistema de Conferência Bancária';
    });
    
    navCaixa.addEventListener('click', () => {
        sistemaBancaria.classList.add('hidden');
        sistemaCaixa.classList.remove('hidden');
        navBancaria.classList.remove('active');
        navCaixa.classList.add('active');
        pageSubtitle.textContent = 'Sistema de Conferência de Caixa';
        
        // Atualizar dados da caixa imediatamente
        updateCaixaDaySelector();
        
        // Se há dados de caixa, selecionar o dia mais recente automaticamente
        const pendingDays = Object.keys(appData.caixaData.pending).sort().reverse();
        const completedDays = Object.keys(appData.caixaData.completed).sort().reverse();
        const allCaixaDays = [...pendingDays, ...completedDays];
        
        if (allCaixaDays.length > 0) {
            caixaDaySelector.value = allCaixaDays[0];
        }
        
        renderCaixaTable();
    });

    // Elementos da Conferência Bancária
    const fileInput = document.getElementById('fileInput');
    const loadFileButton = document.getElementById('loadFileButton');
    const clearFileButton = document.getElementById('clearFileButton');
    const valorInput = document.getElementById('valorInput');
    const checkButton = document.getElementById('checkButton');
    const resetButton = document.getElementById('resetButton');
    const daySelector = document.getElementById('daySelector');
    const clearHistoryButton = document.getElementById('clearHistoryButton');
    const tableContainer = document.getElementById('table-container');
    const initialMessage = document.getElementById('initialMessage');
    const statusMessage = document.getElementById('statusMessage');
    const notFoundSection = document.getElementById('notFoundSection');
    const notFoundList = document.getElementById('notFoundList');
    const notificationPopup = document.getElementById('notificationPopup');
    
    // Elementos do Passo 2: Opções de seleção
    const autoSelectButton = document.getElementById('autoSelectButton');
    const manualSelectButton = document.getElementById('manualSelectButton');
    const dateFilterSection = document.getElementById('dateFilterSection');
    const manualSelectSection = document.getElementById('manualSelectSection');
    const step2DateFilter = document.getElementById('step2DateFilter');
    const step2FilterButton = document.getElementById('step2FilterButton');
    
    // Elementos do Histórico de Valores Não Encontrados
    const toggleHistoricoButton = document.getElementById('toggleHistoricoButton');
    const toggleText = document.getElementById('toggleText');
    const toggleIcon = document.getElementById('toggleIcon');
    const historicoValores = document.getElementById('historicoValores');
    const searchValorInput = document.getElementById('searchValorInput');
    const exportHistoricoButton = document.getElementById('exportHistoricoButton');
    const clearHistoricoButton = document.getElementById('clearHistoricoButton');
    const historicoContainer = document.getElementById('historicoContainer');
    const noHistoricoMessage = document.getElementById('noHistoricoMessage');
    
    // Elementos do Passo 4: Filtrar por Data
    const dateFilter = document.getElementById('dateFilter');
    const filterByDateButton = document.getElementById('filterByDateButton');
    
    const notFoundModal = document.getElementById('notFoundModal');
    const notFoundValueText = document.getElementById('notFoundValueText');
    const confirmNotFoundBtn = document.getElementById('confirmNotFoundBtn');
    const cancelNotFoundBtn = document.getElementById('cancelNotFoundBtn');
    
    const backupDetails = document.getElementById('backupDetails');
    const backupSummary = document.getElementById('backupSummary');
    const passwordModal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const submitPasswordBtn = document.getElementById('submitPasswordBtn');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    const passwordError = document.getElementById('passwordError');
    
    const disambiguationModal = document.getElementById('disambiguationModal');
    const disambiguationInput = document.getElementById('disambiguationInput');
    const confirmDisambiguationBtn = document.getElementById('confirmDisambiguationBtn');
    const decideLaterBtn = document.getElementById('decideLaterBtn');

    const clearHistoryModal = document.getElementById('clearHistoryModal');
    const confirmClearHistoryBtn = document.getElementById('confirmClearHistoryBtn');
    const cancelClearHistoryBtn = document.getElementById('cancelClearHistoryBtn');

    const createInternalBackupBtn = document.getElementById('createInternalBackupBtn');
    const restoreInternalBackupBtn = document.getElementById('restoreInternalBackupBtn');
    const restoreModal = document.getElementById('restoreModal');
    const backupListContainer = document.getElementById('backupListContainer');
    const noBackupsMessage = document.getElementById('noBackupsMessage');
    const confirmRestoreBtn = document.getElementById('confirmRestoreBtn');
    const cancelRestoreBtn = document.getElementById('cancelRestoreBtn');

    const restoreConfirmModal = document.getElementById('restoreConfirmModal');
    const confirmRestoreFinalBtn = document.getElementById('confirmRestoreFinalBtn');
    const cancelRestoreFinalBtn = document.getElementById('cancelRestoreFinalBtn');

    const resetConfirmModal = document.getElementById('resetConfirmModal');
    const confirmResetFinalBtn = document.getElementById('confirmResetFinalBtn');
    const cancelResetFinalBtn = document.getElementById('cancelResetFinalBtn');

    const undoConfirmModal = document.getElementById('undoConfirmModal');
    const confirmUndoFinalBtn = document.getElementById('confirmUndoFinalBtn');
    const cancelUndoFinalBtn = document.getElementById('cancelUndoFinalBtn');

    let appData = {
        historyData: { pending: {}, completed: {} },
        caixaData: { pending: {}, completed: {} },
        valoresNaoEncontrados: [], // Lista global de valores não encontrados
        backups: []
    };
    let currentDayKey = null;
    let ambiguousMatches = [];
    let valueToConfirmNotFound = null;
    let passwordPurpose = null;
    let selectedBackupIndex = null;
    let rowIdToUndo = null;

    // Inicialização
    async function init() {
        await loadDataFromServer();
        updateDaySelector();

        // Selecionar automaticamente o dia mais recente se houver dados
        const allDays = [...Object.keys(appData.historyData.pending), ...Object.keys(appData.historyData.completed)]
            .sort().reverse();

        if (allDays.length > 0) {
            currentDayKey = allDays[0];
            daySelector.value = currentDayKey;
            renderTable();

            if (appData.historyData.pending[currentDayKey]) {
                activateControls();
            } else {
                deactivateControls(true);
            }
        }

        checkDataPresence();
    }

    // Comunicação com servidor
    async function loadDataFromServer() {
        try {
            const response = await fetch('/api/data');
            const result = await response.json();

            if (result.success) {
                console.log('📥 Dados carregados do servidor:', {
                    historyDays: Object.keys(result.data.historyData.pending || {}).concat(Object.keys(result.data.historyData.completed || {})),
                    caixaDays: Object.keys(result.data.caixaData?.pending || {}).concat(Object.keys(result.data.caixaData?.completed || {})),
                    valoresNaoEncontrados: result.data.valoresNaoEncontrados?.length || 0
                });

                appData = result.data;
                // Garantir que estruturas existem (compatibilidade com dados antigos)
                if (!appData.caixaData) {
                    appData.caixaData = { pending: {}, completed: {} };
                }
                if (!appData.valoresNaoEncontrados) {
                    appData.valoresNaoEncontrados = [];
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    async function saveDataToServer() {
        try {
            console.log('💾 Salvando dados no servidor...', {
                historyDays: Object.keys(appData.historyData.pending).concat(Object.keys(appData.historyData.completed)),
                caixaDays: Object.keys(appData.caixaData.pending).concat(Object.keys(appData.caixaData.completed)),
                valoresNaoEncontrados: appData.valoresNaoEncontrados.length
            });

            const response = await fetch('/api/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appData)
            });

            const result = await response.json();

            if (!result.success) {
                console.error('❌ Erro ao salvar dados:', result.message);
                showStatus('Erro ao salvar dados', 'red');
            } else {
                console.log('✅ Dados salvos com sucesso!');
            }

        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
            showStatus('Erro de conexão', 'red');
        }

        checkDataPresence();
    }

    async function uploadFile(file) {
        const formData = new FormData();
        formData.append('planilha', file);
        
        try {
            const response = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                return result.data.transactions;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            throw new Error(`Erro no upload: ${error.message}`);
        }
    }

    async function createBackupOnServer(isAutomatic = false) {
        try {
            const response = await fetch('/api/data/backup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isAutomatic })
            });
            
            const result = await response.json();
            
            if (result.success) {
                await loadDataFromServer(); // Recarregar dados atualizados
                const message = isAutomatic ? 'Backup automático criado!' : 'Ponto de restauração criado!';
                showStatus(message, 'green');
            } else {
                showStatus('Erro ao criar backup', 'red');
            }
        } catch (error) {
            console.error('Erro ao criar backup:', error);
            showStatus('Erro de conexão', 'red');
        }
    }

    function checkDataPresence() {
        const hasData = Object.keys(appData.historyData.pending).length > 0 || 
                       Object.keys(appData.historyData.completed).length > 0;
        const hasCurrentDayData = currentDayKey && (appData.historyData.pending[currentDayKey] || appData.historyData.completed[currentDayKey]);
        
        createInternalBackupBtn.disabled = !hasData;
        restoreInternalBackupBtn.disabled = appData.backups.length === 0;
        clearHistoryButton.disabled = !hasData;
        clearFileButton.disabled = !hasCurrentDayData;
        
        // Passo 2: Controles de seleção de dia
        const hasAnyData = Object.keys(appData.historyData.pending).length > 0 || Object.keys(appData.historyData.completed).length > 0;
        autoSelectButton.disabled = !hasAnyData;
        step2FilterButton.disabled = !step2DateFilter.value;
        
        // Passo 4: Controles de filtro por data
        if (filterByDateButton) filterByDateButton.disabled = !dateFilter.value;
    }

    function showNotificationPopup(message, type) {
        const popup = notificationPopup;
        popup.classList.remove('bg-green-600/90', 'bg-red-600/90', 'bg-yellow-500/90');
        let iconHTML = '', bgColor = '';
        switch (type) {
            case 'success':
                bgColor = 'bg-green-600/90';
                iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`;
                break;
            case 'warning':
                bgColor = 'bg-yellow-500/90';
                iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.636-1.226 2.85-1.226 3.486 0l5.58 10.796c.636 1.226-.474 2.605-1.743 2.605H4.42c-1.269 0-2.379-1.379-1.743-2.605l5.58-10.796zM10 14a1 1 0 100-2 1 1 0 000 2zm-1-3a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>`;
                break;
        }
        popup.classList.add(bgColor);
        popup.innerHTML = `${iconHTML} <span>${message}</span>`;
        popup.classList.add('show');
        setTimeout(() => popup.classList.remove('show'), 900);
    }

    // Event listeners
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        loadFileButton.disabled = !file;
    });

    loadFileButton.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) return;

        try {
            showStatus('Processando arquivo...', 'blue');
            const newTransactions = await uploadFile(file);
            
            if (newTransactions.length === 0) {
                showStatus('Nenhuma transação válida encontrada no arquivo.', 'red');
                return;
            }

            const dayKey = newTransactions[0].data;
            const existingData = appData.historyData.pending[dayKey] || appData.historyData.completed[dayKey];
            
            if (existingData) {
                const matchedFromOld = new Set(existingData.transactions
                    .filter(t => t.status === 'matched')
                    .map(t => `${t.historico}_${t.valor}_${t.cpfCnpj}`)
                );
                
                newTransactions.forEach(t => {
                    if (matchedFromOld.has(`${t.historico}_${t.valor}_${t.cpfCnpj}`)) {
                        t.status = 'matched';
                    }
                });
                
                appData.historyData.pending[dayKey] = {
                    transactions: newTransactions,
                    notFound: existingData.notFound || []
                };
                
                if (appData.historyData.completed[dayKey]) {
                    delete appData.historyData.completed[dayKey];
                }
                
                showStatus('Planilha atualizada!', 'blue');
            } else {
                appData.historyData.pending[dayKey] = {
                    transactions: newTransactions,
                    notFound: []
                };
            }

            currentDayKey = dayKey;
            await saveDataToServer();
            updateDaySelector();
            daySelector.value = currentDayKey;
            resetConferenceUI();
            renderTable();
            activateControls();
            
        } catch (error) {
            showStatus(error.message, 'red');
        }
    });

    clearFileButton.addEventListener('click', async () => {
        if (!currentDayKey) return;
        
        // Remover dados do dia atual
        if (appData.historyData.pending[currentDayKey]) {
            delete appData.historyData.pending[currentDayKey];
        }
        if (appData.historyData.completed[currentDayKey]) {
            delete appData.historyData.completed[currentDayKey];
        }
        
        // Limpar input de arquivo
        fileInput.value = '';
        loadFileButton.disabled = true;
        
        // Resetar estado
        currentDayKey = null;
        await saveDataToServer();
        updateDaySelector();
        resetConferenceUI();
        renderTable();
        deactivateControls(false);
        
        showStatus('Dados do dia removidos com sucesso.', 'green');
    });

    // Event listeners do Passo 2: Opções de seleção
    autoSelectButton.addEventListener('click', () => {
        // Selecionar automaticamente o dia mais recente
        const allDays = [...Object.keys(appData.historyData.pending), ...Object.keys(appData.historyData.completed)]
            .sort().reverse();
        
        if (allDays.length > 0) {
            currentDayKey = allDays[0];
            daySelector.value = currentDayKey;
            resetConferenceUI();
            renderTable();
            
            if (appData.historyData.pending[currentDayKey]) {
                activateControls();
            } else {
                deactivateControls(true);
            }
            
            checkDataPresence();
            showStatus(`Dia mais recente selecionado: ${currentDayKey}`, 'green');
        }
    });
    
    manualSelectButton.addEventListener('click', () => {
        // Alternar entre modo manual e filtro por data
        const isFilterMode = !dateFilterSection.classList.contains('hidden');
        
        if (isFilterMode) {
            // Mudar para seleção manual
            dateFilterSection.classList.add('hidden');
            manualSelectSection.classList.remove('hidden');
            manualSelectButton.textContent = 'Filtrar por Data';
            manualSelectButton.classList.remove('btn-primary');
            manualSelectButton.classList.add('btn-secondary');
        } else {
            // Mudar para filtro por data
            dateFilterSection.classList.remove('hidden');
            manualSelectSection.classList.add('hidden');
            manualSelectButton.textContent = 'Selecionar Manualmente';
            manualSelectButton.classList.remove('btn-secondary');
            manualSelectButton.classList.add('btn-primary');
        }
    });
    
    step2DateFilter.addEventListener('change', () => {
        step2FilterButton.disabled = !step2DateFilter.value;
    });
    
    step2FilterButton.addEventListener('click', () => {
        const selectedDate = step2DateFilter.value;
        if (!selectedDate) return;
        
        // Converter data selecionada para o formato usado no sistema (dd/mm/yyyy)
        const [year, month, day] = selectedDate.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        
        // Verificar se existe um dia com essa data
        const allDays = [...Object.keys(appData.historyData.pending), ...Object.keys(appData.historyData.completed)];
        const foundDay = allDays.find(dayKey => dayKey === formattedDate);
        
        if (foundDay) {
            // Selecionar o dia encontrado
            currentDayKey = foundDay;
            daySelector.value = foundDay;
            resetConferenceUI();
            renderTable();
            
            if (appData.historyData.pending[foundDay]) {
                activateControls();
            } else {
                deactivateControls(true);
            }
            
            checkDataPresence();
            showStatus(`Dia ${formattedDate} localizado e selecionado!`, 'green');
        } else {
            showStatus(`Nenhum processamento encontrado para ${formattedDate}`, 'red');
        }
    });
    
    // Event listeners do Passo 4: Filtrar por Data
    if (dateFilter && filterByDateButton) {
        dateFilter.addEventListener('change', () => {
            filterByDateButton.disabled = !dateFilter.value;
        });
    }

    if (filterByDateButton) {
        filterByDateButton.addEventListener('click', () => {
            const selectedDate = dateFilter.value;
            if (!selectedDate) return;
            
            // Converter data selecionada para o formato usado no sistema (dd/mm/yyyy)
            const [year, month, day] = selectedDate.split('-');
            const formattedDate = `${day}/${month}/${year}`;
            
            // Verificar se existe um dia com essa data
            const allDays = [...Object.keys(appData.historyData.pending), ...Object.keys(appData.historyData.completed)];
            const foundDay = allDays.find(dayKey => dayKey === formattedDate);
            
            if (foundDay) {
                // Selecionar o dia encontrado
                currentDayKey = foundDay;
                daySelector.value = foundDay;
                resetConferenceUI();
                renderTable();
                
                if (appData.historyData.pending[foundDay]) {
                    activateControls();
                } else {
                    deactivateControls(true);
                }
                
                checkDataPresence();
                showStatus(`Dia ${formattedDate} localizado e selecionado!`, 'green');
            } else {
                showStatus(`Nenhum processamento encontrado para ${formattedDate}`, 'red');
            }
        });
    }

    function getCurrentDayData() {
        return currentDayKey ? 
            (appData.historyData.pending[currentDayKey] || appData.historyData.completed[currentDayKey]) 
            : null;
    }

    function renderTable() {
        const dayData = getCurrentDayData();
        if (!dayData) {
            tableContainer.innerHTML = '';
            initialMessage.style.display = 'block';
            return;
        }
        
        initialMessage.style.display = 'none';
        let total = 0, totalConferido = 0, pagamentosConferidos = 0;
        
        let contentHTML = dayData.transactions.map(row => {
            total += row.valor;
            let rowClass = 'bg-white border-b border-gray-200 group';
            let valueClass = 'font-semibold text-gray-800';
            let actionButtonHTML = '';
            
            if (row.status === 'matched' || row.status === 'needs-review') {
                actionButtonHTML = `
                    <button class="undo-btn p-1.5 bg-gray-200 text-gray-600 hover:bg-gray-300 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 ml-4" data-id="${row.id}" title="Desfazer">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>`;
            }

            if (row.status === 'matched') {
                rowClass += ' bg-green-50 text-gray-400 line-through';
                valueClass = 'text-gray-400';
                pagamentosConferidos++;
                totalConferido += row.valor;
            } else if (row.status === 'needs-review') {
                rowClass += ' bg-yellow-100';
                valueClass = 'text-yellow-700 font-bold';
            }
            
            return `<tr id="row-${row.id}" class="${rowClass}">
                        <td class="px-6 py-3 font-medium whitespace-nowrap">${row.data}</td>
                        <td class="px-6 py-3">${row.historico}</td>
                        <td class="px-6 py-3 text-right ${valueClass} flex justify-end items-center">
                            <span>${row.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            ${actionButtonHTML}
                        </td>
                    </tr>`;
        }).join('');

        tableContainer.innerHTML = `
            <table class="w-full text-sm text-left text-gray-600">
                <thead class="bg-gray-100 text-xs text-gray-700 uppercase tracking-wider">
                    <tr>
                        <th class="px-6 py-3">Data</th>
                        <th class="px-6 py-3">Histórico</th>
                        <th class="px-6 py-3 text-right">Valor</th>
                    </tr>
                </thead>
                <tbody>${contentHTML}</tbody>
                <tfoot class="bg-gray-200 font-semibold text-gray-800">
                    <tr class="border-t-2 border-gray-300">
                        <td class="px-6 py-4 text-left text-base">
                            Pagamentos: <strong>${dayData.transactions.length}</strong><br>
                            Conferidos: <strong class="text-green-600">${pagamentosConferidos}</strong>
                        </td>
                        <td class="px-6 py-4 text-right text-base">
                            Total Geral<br>
                            Total Conferido
                        </td>
                        <td class="px-6 py-4 text-right text-base">
                            <strong class="text-[--m-primary]">${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong><br>
                            <strong class="text-green-600">${totalConferido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                        </td>
                    </tr>
                </tfoot>
            </table>`;
        renderNotFoundList();
    }

    function updateDaySelector() {
        const pendingDays = Object.keys(appData.historyData.pending).sort().reverse();
        const completedDays = Object.keys(appData.historyData.completed).sort().reverse();
        
        daySelector.innerHTML = '';
        
        if (pendingDays.length === 0 && completedDays.length === 0) {
            daySelector.innerHTML = '<option>Nenhum histórico</option>';
            daySelector.disabled = true;
            return;
        }
        
        if (pendingDays.length > 0) {
            const group = document.createElement('optgroup');
            group.label = 'Pendentes';
            pendingDays.forEach(day => group.appendChild(new Option(day, day)));
            daySelector.appendChild(group);
        }
        
        if (completedDays.length > 0) {
            const group = document.createElement('optgroup');
            group.label = 'Concluídas';
            completedDays.forEach(day => group.appendChild(new Option(day, day)));
            daySelector.appendChild(group);
        }
        
        daySelector.disabled = false;
    }
    
    function renderNotFoundList() {
        const dayData = getCurrentDayData();
        if (dayData && dayData.notFound && dayData.notFound.length > 0) {
            notFoundSection.style.display = 'block';
            notFoundList.innerHTML = [...new Set(dayData.notFound)]
                .map(val => `<li>${val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>`)
                .join('');
        } else {
            notFoundSection.style.display = 'none';
        }
    }

    async function handleCheck() {
        if (!currentDayKey || appData.historyData.completed[currentDayKey]) return;
        await checkValue();
    }

    checkButton.addEventListener('click', handleCheck);
    valorInput.addEventListener('keyup', e => e.key === 'Enter' && handleCheck());

    async function checkForCompletion(dayKey) {
        const dayData = appData.historyData.pending[dayKey];
        if (dayData && dayData.transactions.every(t => t.status === 'matched')) {
            appData.historyData.completed[dayKey] = dayData;
            delete appData.historyData.pending[dayKey];
            showStatus('Planilha concluída e arquivada!', 'blue');
            await saveDataToServer();
            updateDaySelector();
            daySelector.value = dayKey;
        }
    }

    async function checkValue() {
        const value = parseFloat(valorInput.value.replace(',', '.'));
        if (isNaN(value)) return;
        
        const dayData = getCurrentDayData();
        
        // Reset any previous needs-review status
        dayData.transactions.forEach(t => {
            if (t.status === 'needs-review') t.status = 'unmatched';
        });
        
        const matches = dayData.transactions.filter(t => t.valor === value && t.status === 'unmatched');
        
        if (matches.length === 1) {
            const matchedTransaction = matches[0];
            matchedTransaction.status = 'matched';
            
            // Transferir para conferência de caixa IMEDIATAMENTE
            await transferToCaixa(matchedTransaction, currentDayKey);
            
            // Salvar dados imediatamente após transferência
            await saveDataToServer();
            
            // Atualizar interface da caixa se estiver na aba ativa
            if (!sistemaCaixa.classList.contains('hidden')) {
                updateCaixaDaySelector();
                renderCaixaTable();
            }
            
            console.log('✅ FLUXO: Valor conferido e transferido para caixa!');
            showNotificationPopup('Valor Conferido e Transferido para Caixa!', 'success');
            await checkForCompletion(currentDayKey);
        } else if (matches.length > 1) {
            matches.forEach(m => m.status = 'needs-review');
            ambiguousMatches = matches;
            
            // Mostrar as opções de CPF/CNPJ disponíveis
            const cpfOptions = matches.map(m => m.cpfCnpj).filter((v, i, a) => a.indexOf(v) === i);
            let optionsHTML = '';
            
            if (cpfOptions.length > 0) {
                optionsHTML = '<div class="mt-3 p-3 bg-gray-100 rounded-lg text-left"><p class="text-sm font-semibold mb-2">Clique numa opção para selecionar:</p><ul class="text-sm space-y-1">';
                matches.forEach(m => {
                    optionsHTML += `<li class="flex justify-between items-center p-2 hover:bg-blue-100 rounded cursor-pointer border border-transparent hover:border-blue-300 transition-all duration-200 clickable-option" data-cpf="${m.cpfCnpj}">
                        <span class="text-gray-600">${m.historico.substring(0, 30)}...</span>
                        <span class="font-mono font-semibold text-blue-600">${m.cpfCnpj}</span>
                    </li>`;
                });
                optionsHTML += '</ul></div>';
            }
            
            // Adicionar as opções ao modal
            const modalContent = disambiguationModal.querySelector('.bg-white');
            const existingOptions = modalContent.querySelector('.options-list');
            if (existingOptions) {
                existingOptions.remove();
            }
            
            const inputContainer = disambiguationInput.parentElement;
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options-list';
            optionsDiv.innerHTML = optionsHTML;
            inputContainer.appendChild(optionsDiv);
            
            // Adicionar event listeners para clique nas opções de CPF/CNPJ
            const clickableOptions = optionsDiv.querySelectorAll('.clickable-option');
            clickableOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const cpfValue = option.getAttribute('data-cpf');
                    disambiguationInput.value = cpfValue;
                    handleDisambiguation();
                });
            });
            
            disambiguationModal.classList.remove('hidden');
            disambiguationInput.value = '';
            disambiguationInput.focus();
        } else {
            valueToConfirmNotFound = value;
            notFoundValueText.textContent = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            notFoundModal.classList.remove('hidden');
            valorInput.disabled = true;
        }
        
        renderTable();
        await saveDataToServer();
        valorInput.value = '';
    }

    confirmNotFoundBtn.addEventListener('click', async () => {
        const dayData = getCurrentDayData();
        if (dayData && valueToConfirmNotFound !== null) {
            // Adicionar à lista do dia
            dayData.notFound.push(valueToConfirmNotFound);
            
            // Adicionar à lista global de valores não encontrados
            const valorNaoEncontrado = {
                valor: valueToConfirmNotFound,
                dia: currentDayKey,
                dataHora: new Date().toISOString(),
                tentativas: 1
            };
            
            // Verificar se já existe na lista global
            const existeGlobal = appData.valoresNaoEncontrados.find(v => 
                v.valor === valueToConfirmNotFound && v.dia === currentDayKey
            );
            
            if (existeGlobal) {
                existeGlobal.tentativas++;
                existeGlobal.dataHora = new Date().toISOString();
            } else {
                appData.valoresNaoEncontrados.push(valorNaoEncontrado);
            }
            
            console.log('💾 Valor não encontrado salvo para consulta:', valorNaoEncontrado);
        }
        await saveDataToServer();
        renderNotFoundList();
        closeNotFoundModal();
    });

    cancelNotFoundBtn.addEventListener('click', closeNotFoundModal);
    
    function closeNotFoundModal() {
        notFoundModal.classList.add('hidden');
        valorInput.disabled = false;
        valorInput.value = '';
        valorInput.focus();
        valueToConfirmNotFound = null;
    }

    // Função para transferir transação conferida para caixa
    async function transferToCaixa(transaction, dayKey) {
        console.log('Transferindo para caixa:', transaction, dayKey);
        
        // Garantir que caixaData existe
        if (!appData.caixaData) {
            appData.caixaData = { pending: {}, completed: {} };
        }
        
        // Criar entrada na conferência de caixa se não existir
        if (!appData.caixaData.pending[dayKey]) {
            appData.caixaData.pending[dayKey] = {
                transactions: [],
                totalConferido: 0
            };
        }
        
        // Verificar se já não foi transferida (evitar duplicação)
        const jaExiste = appData.caixaData.pending[dayKey].transactions.find(t => t.id === transaction.id);
        if (jaExiste) {
            console.log('Transação já transferida:', transaction.id);
            return;
        }
        
        // Adicionar transação à conferência de caixa
        const caixaTransaction = {
            ...transaction,
            transferredAt: new Date().toISOString(),
            originalStatus: 'matched'
        };
        
        appData.caixaData.pending[dayKey].transactions.push(caixaTransaction);
        appData.caixaData.pending[dayKey].totalConferido += transaction.valor;
        
        console.log('Transferida com sucesso! Total na caixa:', appData.caixaData.pending[dayKey].transactions.length);
    }

    async function handleDisambiguation() {
        const cpfPart = disambiguationInput.value.trim();
        if (!cpfPart) return;
        
        const finalMatches = ambiguousMatches.filter(t => t.cpfCnpj.includes(cpfPart));
        const dayData = getCurrentDayData();
        
        if (finalMatches.length === 1) {
            const idToMatch = finalMatches[0].id;
            const matchedTransaction = dayData.transactions.find(t => t.id === idToMatch);
            matchedTransaction.status = 'matched';
            
            ambiguousMatches.forEach(t => {
                if (t.id !== idToMatch) {
                    dayData.transactions.find(ot => ot.id === t.id).status = 'unmatched';
                }
            });
            
            // Transferir para conferência de caixa IMEDIATAMENTE
            await transferToCaixa(matchedTransaction, currentDayKey);
            
            // Salvar dados imediatamente após transferência
            await saveDataToServer();
            
            // Atualizar interface da caixa se estiver na aba ativa
            if (!sistemaCaixa.classList.contains('hidden')) {
                updateCaixaDaySelector();
                renderCaixaTable();
            }
            
            console.log('✅ FLUXO: Valor desambiguado conferido e transferido para caixa!');
            showNotificationPopup('Conferido e Transferido para Caixa!', 'success');
            await checkForCompletion(currentDayKey);
            renderTable();
            
            // Limpar opções mostradas
            const existingOptions = disambiguationModal.querySelector('.options-list');
            if (existingOptions) {
                existingOptions.remove();
            }
            
            disambiguationModal.classList.add('hidden');
            valorInput.focus();
        } else {
            const modalBox = disambiguationModal.querySelector('div');
            modalBox.classList.add('animate-shake');
            setTimeout(() => modalBox.classList.remove('animate-shake'), 500);
            disambiguationInput.value = '';
            disambiguationInput.focus();
        }
    }

    confirmDisambiguationBtn.addEventListener('click', handleDisambiguation);
    disambiguationInput.addEventListener('keyup', e => e.key === 'Enter' && handleDisambiguation());
    
    decideLaterBtn.addEventListener('click', () => {
        // Limpar opções mostradas
        const existingOptions = disambiguationModal.querySelector('.options-list');
        if (existingOptions) {
            existingOptions.remove();
        }
        disambiguationModal.classList.add('hidden');
        valorInput.focus();
    });
    
    daySelector.addEventListener('change', (e) => {
        currentDayKey = e.target.value;
        resetConferenceUI();
        renderTable();
        if (appData.historyData.pending[currentDayKey]) {
            activateControls();
        } else {
            deactivateControls(true);
        }
        checkDataPresence();
    });
    
    resetButton.addEventListener('click', () => {
        if (!currentDayKey) return;
        resetConfirmModal.classList.remove('hidden');
    });

    confirmResetFinalBtn.addEventListener('click', async () => {
        if (appData.historyData.completed[currentDayKey]) {
            appData.historyData.pending[currentDayKey] = appData.historyData.completed[currentDayKey];
            delete appData.historyData.completed[currentDayKey];
        }
        const dayData = getCurrentDayData();
        dayData.transactions.forEach(t => t.status = 'unmatched');
        dayData.notFound = [];
        await saveDataToServer();
        updateDaySelector();
        daySelector.value = currentDayKey;
        resetConferenceUI();
        renderTable();
        activateControls();
        showStatus('Conferência do dia reiniciada.', 'blue');
        resetConfirmModal.classList.add('hidden');
    });

    cancelResetFinalBtn.addEventListener('click', () => {
        resetConfirmModal.classList.add('hidden');
    });

    // Lógica de Backup
    createInternalBackupBtn.addEventListener('click', () => createBackupOnServer(false));

    restoreInternalBackupBtn.addEventListener('click', () => {
        populateBackupList();
        restoreModal.classList.remove('hidden');
    });
    
    function populateBackupList() {
        backupListContainer.innerHTML = '';
        selectedBackupIndex = null;
        confirmRestoreBtn.disabled = true;

        if (appData.backups.length === 0) {
            noBackupsMessage.classList.remove('hidden');
            backupListContainer.classList.add('hidden');
        } else {
            noBackupsMessage.classList.add('hidden');
            backupListContainer.classList.remove('hidden');
            appData.backups.forEach((backup, index) => {
                const date = new Date(backup.timestamp);
                const formattedDate = `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR')}`;
                const label = backup.isAuto ? ' (Automático)' : '';
                const backupItem = document.createElement('div');
                backupItem.className = 'p-3 border-b cursor-pointer hover:bg-gray-100 rounded-md';
                backupItem.textContent = `Salvo em: ${formattedDate}${label}`;
                backupItem.dataset.index = index;
                backupItem.addEventListener('click', () => {
                    document.querySelectorAll('#backupListContainer > div').forEach(el => 
                        el.classList.remove('bg-blue-100', 'font-semibold')
                    );
                    backupItem.classList.add('bg-blue-100', 'font-semibold');
                    selectedBackupIndex = index;
                    confirmRestoreBtn.disabled = false;
                });
                backupListContainer.appendChild(backupItem);
            });
        }
    }
    
    confirmRestoreBtn.addEventListener('click', () => {
        if (selectedBackupIndex !== null) {
            restoreModal.classList.add('hidden');
            restoreConfirmModal.classList.remove('hidden');
        }
    });

    confirmRestoreFinalBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/data/restore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ backupIndex: selectedBackupIndex })
            });
            
            const result = await response.json();
            
            if (result.success) {
                appData = result.data;
                updateDaySelector();
                
                const allDays = [...Object.keys(appData.historyData.pending), ...Object.keys(appData.historyData.completed)]
                    .sort().reverse();
                currentDayKey = allDays.length > 0 ? allDays[0] : null;
                
                if (currentDayKey) {
                    daySelector.value = currentDayKey;
                }

                resetConferenceUI();
                renderTable();

                if (currentDayKey && appData.historyData.pending[currentDayKey]) {
                    activateControls();
                } else {
                    deactivateControls(!!currentDayKey);
                }
                
                showStatus('Ponto de restauração aplicado!', 'green');
            } else {
                showStatus('Erro ao restaurar backup', 'red');
            }
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            showStatus('Erro de conexão', 'red');
        }
        
        restoreConfirmModal.classList.add('hidden');
    });

    cancelRestoreFinalBtn.addEventListener('click', () => {
        restoreConfirmModal.classList.add('hidden');
    });

    cancelRestoreBtn.addEventListener('click', () => {
        restoreModal.classList.add('hidden');
    });

    backupSummary.addEventListener('click', (event) => {
        event.preventDefault(); 
        if (backupDetails.open) {
            backupDetails.open = false;
        } else {
            passwordPurpose = 'open_details';
            passwordInput.value = '';
            passwordError.textContent = '';
            passwordModal.classList.remove('hidden');
            passwordInput.focus();
        }
    });
    
    clearHistoryButton.addEventListener('click', () => {
        passwordPurpose = 'clear_history';
        passwordInput.value = '';
        passwordError.textContent = '';
        passwordModal.classList.remove('hidden');
        passwordInput.focus();
    });

    function handlePasswordSubmit() {
        if (passwordInput.value === "manipularium") {
            passwordModal.classList.add('hidden');
            if (passwordPurpose === 'open_details') {
                backupDetails.open = true;
            } else if (passwordPurpose === 'clear_history') {
                clearHistoryModal.classList.remove('hidden');
            }
        } else {
            passwordError.textContent = 'Senha incorreta!';
            const modalBox = passwordModal.querySelector('div');
            modalBox.classList.add('animate-shake');
            setTimeout(() => modalBox.classList.remove('animate-shake'), 500);
        }
    }

    submitPasswordBtn.addEventListener('click', handlePasswordSubmit);
    passwordInput.addEventListener('keyup', e => { if (e.key === 'Enter') handlePasswordSubmit(); });
    cancelPasswordBtn.addEventListener('click', () => passwordModal.classList.add('hidden'));

    confirmClearHistoryBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/data', { method: 'DELETE' });
            const result = await response.json();
            
            if (result.success) {
                appData = { historyData: { pending: {}, completed: {} }, backups: [] };
                currentDayKey = null;
                updateDaySelector();
                resetConferenceUI();
                renderTable();
                deactivateControls(false);
                backupDetails.open = false;
                showStatus('Histórico apagado com sucesso.', 'green');
            } else {
                showStatus('Erro ao apagar histórico', 'red');
            }
        } catch (error) {
            console.error('Erro ao limpar histórico:', error);
            showStatus('Erro de conexão', 'red');
        }
        
        clearHistoryModal.classList.add('hidden');
    });

    cancelClearHistoryBtn.addEventListener('click', () => {
        clearHistoryModal.classList.add('hidden');
    });

    function resetConferenceUI() {
        ambiguousMatches = [];
        valorInput.placeholder = 'Digite o valor...';
        notFoundSection.style.display = 'none';
    }

    function showStatus(message, color, autoClear = true) {
        statusMessage.textContent = message;
        statusMessage.className = `mt-4 text-center font-semibold text-${color}-600`;
        if (autoClear) {
            setTimeout(() => { statusMessage.textContent = '' }, 3000);
        }
    }

    function activateControls() {
        valorInput.disabled = false;
        checkButton.disabled = false;
        resetButton.disabled = false;
        valorInput.placeholder = 'Digite o valor...';
        valorInput.focus();
    }

    function deactivateControls(isCompleted) {
        valorInput.disabled = true;
        checkButton.disabled = true;
        resetButton.disabled = !!isCompleted;
        valorInput.placeholder = isCompleted ? 'Planilha concluída' : 'Selecione um dia...';
    }
    
    tableContainer.addEventListener('click', (event) => {
        const undoButton = event.target.closest('.undo-btn');
        if (undoButton) {
            rowIdToUndo = parseInt(undoButton.dataset.id, 10);
            undoConfirmModal.classList.remove('hidden');
        }
    });

    confirmUndoFinalBtn.addEventListener('click', async () => {
        if (rowIdToUndo !== null) {
            await handleUndo(rowIdToUndo);
        }
        undoConfirmModal.classList.add('hidden');
        rowIdToUndo = null;
    });
    
    cancelUndoFinalBtn.addEventListener('click', () => {
        undoConfirmModal.classList.add('hidden');
        rowIdToUndo = null;
    });

    async function handleUndo(rowId) {
        const dayData = getCurrentDayData();
        if (!dayData) return;

        const transaction = dayData.transactions.find(t => t.id === rowId);
        if (transaction) {
            transaction.status = 'unmatched';
            
            if (appData.historyData.completed[currentDayKey]) {
                appData.historyData.pending[currentDayKey] = appData.historyData.completed[currentDayKey];
                delete appData.historyData.completed[currentDayKey];
                updateDaySelector();
                daySelector.value = currentDayKey;
                activateControls();
            }
            
            await saveDataToServer();
            renderTable();
            showStatus('Ação desfeita.', 'blue');
        }
    }

    // Funções da Conferência de Caixa
    function updateCaixaDaySelector() {
        const pendingDays = Object.keys(appData.caixaData.pending).sort().reverse();
        const completedDays = Object.keys(appData.caixaData.completed).sort().reverse();
        
        caixaDaySelector.innerHTML = '';
        
        if (pendingDays.length === 0 && completedDays.length === 0) {
            caixaDaySelector.innerHTML = '<option>Nenhum dia com valores conferidos</option>';
            caixaDaySelector.disabled = true;
            caixaControls.classList.add('hidden');
            return;
        }
        
        if (pendingDays.length > 0) {
            const group = document.createElement('optgroup');
            group.label = 'Pendentes';
            pendingDays.forEach(day => group.appendChild(new Option(day, day)));
            caixaDaySelector.appendChild(group);
        }
        
        if (completedDays.length > 0) {
            const group = document.createElement('optgroup');
            group.label = 'Finalizadas';
            completedDays.forEach(day => group.appendChild(new Option(day, day)));
            caixaDaySelector.appendChild(group);
        }
        
        caixaDaySelector.disabled = false;
        caixaControls.classList.remove('hidden');
    }

    function renderCaixaTable() {
        const selectedDay = caixaDaySelector.value;
        const dayData = appData.caixaData.pending[selectedDay] || appData.caixaData.completed[selectedDay];
        
        if (!dayData || !dayData.transactions || dayData.transactions.length === 0) {
            caixaTableContainer.innerHTML = '';
            caixaInitialMessage.style.display = 'block';
            caixaStatusText.textContent = 'Nenhum valor transferido ainda para este dia';
            return;
        }
        
        caixaInitialMessage.style.display = 'none';
        let total = 0;
        
        let contentHTML = dayData.transactions.map(transaction => {
            total += transaction.valor;
            const transferTime = new Date(transaction.transferredAt).toLocaleString('pt-BR');
            
            return `<tr class="bg-green-50 border-b border-gray-200">
                        <td class="px-6 py-3 font-medium whitespace-nowrap">${transaction.data}</td>
                        <td class="px-6 py-3">${transaction.historico}</td>
                        <td class="px-6 py-3 text-right font-semibold text-green-700">
                            ${transaction.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td class="px-6 py-3 text-xs text-gray-500">${transferTime}</td>
                    </tr>`;
        }).join('');

        caixaTableContainer.innerHTML = `
            <table class="w-full text-sm text-left text-gray-600">
                <thead class="bg-green-100 text-xs text-gray-700 uppercase tracking-wider">
                    <tr>
                        <th class="px-6 py-3">Data</th>
                        <th class="px-6 py-3">Histórico</th>
                        <th class="px-6 py-3 text-right">Valor</th>
                        <th class="px-6 py-3">Transferido em</th>
                    </tr>
                </thead>
                <tbody>${contentHTML}</tbody>
                <tfoot class="bg-green-200 font-semibold text-gray-800">
                    <tr class="border-t-2 border-green-300">
                        <td class="px-6 py-4 text-left text-base">
                            Valores Conferidos: <strong class="text-green-600">${dayData.transactions.length}</strong>
                        </td>
                        <td class="px-6 py-4 text-right text-base" colspan="2">
                            Total Conferido
                        </td>
                        <td class="px-6 py-4 text-right text-base">
                            <strong class="text-green-600">${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                        </td>
                    </tr>
                </tfoot>
            </table>`;
        
        const isCompleted = appData.caixaData.completed[selectedDay];
        caixaStatusText.textContent = isCompleted 
            ? `Conferência finalizada - ${dayData.transactions.length} valores processados`
            : `${dayData.transactions.length} valores aguardando finalização`;
        
        finalizarCaixaButton.disabled = isCompleted;
        finalizarCaixaButton.textContent = isCompleted ? 'Já Finalizada' : 'Finalizar Conferência';
    }

    // Event listeners da Conferência de Caixa
    caixaDaySelector.addEventListener('change', renderCaixaTable);
    
    finalizarCaixaButton.addEventListener('click', async () => {
        const selectedDay = caixaDaySelector.value;
        if (!selectedDay || !appData.caixaData.pending[selectedDay]) return;
        
        // Mover de pending para completed
        appData.caixaData.completed[selectedDay] = appData.caixaData.pending[selectedDay];
        delete appData.caixaData.pending[selectedDay];
        
        await saveDataToServer();
        updateCaixaDaySelector();
        caixaDaySelector.value = selectedDay;
        renderCaixaTable();
        
        showStatus('Conferência de caixa finalizada!', 'green');
    });
    
    exportarCaixaButton.addEventListener('click', () => {
        const selectedDay = caixaDaySelector.value;
        const dayData = appData.caixaData.pending[selectedDay] || appData.caixaData.completed[selectedDay];
        
        if (!dayData) return;
        
        const exportData = {
            dia: selectedDay,
            totalConferido: dayData.totalConferido,
            quantidadeItens: dayData.transactions.length,
            transacoes: dayData.transactions,
            exportadoEm: new Date().toISOString()
        };
        
        const dataBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `conferencia-caixa-${selectedDay.replace(/\//g, '-')}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        showStatus('Arquivo exportado com sucesso!', 'green');
    });

    // Funções do Histórico de Valores Não Encontrados
    function renderHistoricoValores() {
        const searchTerm = searchValorInput.value.toLowerCase();

        // Se não há dados, mostrar mensagem apropriada
        if (appData.valoresNaoEncontrados.length === 0) {
            historicoContainer.innerHTML = '<div class="p-4 text-center text-gray-500 text-sm">Nenhum valor não encontrado registrado</div>';
            noHistoricoMessage.classList.remove('hidden');
            historicoContainer.classList.add('hidden');
            return;
        }

        // Filtrar valores
        const filteredValues = appData.valoresNaoEncontrados.filter(item =>
            item.valor.toString().includes(searchTerm) ||
            item.dia.toLowerCase().includes(searchTerm)
        ).sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

        // Se a busca não encontrou resultados
        if (filteredValues.length === 0) {
            historicoContainer.innerHTML = '<div class="p-4 text-center text-gray-500 text-sm">Nenhum valor encontrado para a busca</div>';
            noHistoricoMessage.classList.add('hidden');
            historicoContainer.classList.remove('hidden');
            return;
        }

        // Mostrar container e ocultar mensagem de vazio
        noHistoricoMessage.classList.add('hidden');
        historicoContainer.classList.remove('hidden');
        
        const contentHTML = filteredValues.map(item => {
            const dataFormatada = new Date(item.dataHora).toLocaleString('pt-BR');
            const valorFormatado = typeof item.valor === 'number' 
                ? item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : item.valor;
            
            return `<div class="p-3 border-b border-gray-200 hover:bg-gray-50">
                        <div class="flex justify-between items-center">
                            <div>
                                <div class="font-semibold text-red-600">${valorFormatado}</div>
                                <div class="text-sm text-gray-600">Dia: ${item.dia}</div>
                                <div class="text-xs text-gray-500">${dataFormatada}</div>
                            </div>
                            <div class="text-xs text-orange-600 font-semibold">
                                ${item.tentativas} tentativa${item.tentativas > 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>`;
        }).join('');
        
        historicoContainer.innerHTML = contentHTML;
    }
    
    // Event listeners do Histórico
    toggleHistoricoButton.addEventListener('click', () => {
        const isHidden = historicoValores.classList.contains('hidden');
        
        if (isHidden) {
            historicoValores.classList.remove('hidden');
            toggleText.textContent = 'Ocultar';
            toggleIcon.setAttribute('d', 'M5 15l7-7 7 7');
            renderHistoricoValores();
        } else {
            historicoValores.classList.add('hidden');
            toggleText.textContent = 'Mostrar';
            toggleIcon.setAttribute('d', 'M19 9l-7 7-7-7');
        }
    });
    
    searchValorInput.addEventListener('input', renderHistoricoValores);
    
    exportHistoricoButton.addEventListener('click', () => {
        if (appData.valoresNaoEncontrados.length === 0) {
            showStatus('Nenhum valor para exportar', 'red');
            return;
        }
        
        const exportData = {
            valoresNaoEncontrados: appData.valoresNaoEncontrados,
            totalItens: appData.valoresNaoEncontrados.length,
            exportadoEm: new Date().toISOString()
        };
        
        const dataBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `valores-nao-encontrados-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        showStatus('Histórico exportado com sucesso!', 'green');
    });
    
    clearHistoricoButton.addEventListener('click', async () => {
        console.log('🖱️ [DEBUG] Botão limpar clicado! Itens atuais:', appData.valoresNaoEncontrados.length);

        if (appData.valoresNaoEncontrados.length === 0) {
            console.log('⚠️ [DEBUG] Histórico já está vazio');
            showStatus('Histórico já está vazio', 'blue');
            return;
        }

        console.log('❓ [DEBUG] Abrindo confirm dialog...');
        let confirmResult;
        try {
            confirmResult = confirm('Tem certeza que deseja limpar todo o histórico de valores não encontrados? Esta ação não pode ser desfeita.');
            console.log('✓ [DEBUG] Confirm result:', confirmResult);
        } catch (error) {
            console.error('❌ [DEBUG] Erro no confirm:', error);
            confirmResult = false;
        }

        if (confirmResult) {
            console.log('🗑️ Limpando histórico de valores não encontrados...', appData.valoresNaoEncontrados.length, 'itens');
            appData.valoresNaoEncontrados = [];
            await saveDataToServer();
            console.log('✅ Histórico limpo! Array agora tem:', appData.valoresNaoEncontrados.length, 'itens');
            renderHistoricoValores();
            showStatus('Histórico limpo com sucesso!', 'green');
        } else {
            console.log('❌ [DEBUG] Usuário cancelou a limpeza');
            showStatus('Limpeza cancelada', 'blue');
        }
    });

    // Inicializar aplicação
    init();
});