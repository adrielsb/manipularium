document.addEventListener('DOMContentLoaded', () => {
    // Sistema de Login
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    const loginForm = document.getElementById('loginForm');
    const loginUser = document.getElementById('loginUser');
    const loginPassword = document.getElementById('loginPassword');
    const loginError = document.getElementById('loginError');
    
    // Verificar se já está logado
    const isAuthenticated = sessionStorage.getItem('manipularium_auth') === 'true';
    
    if (isAuthenticated) {
        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
    }
    
    // Gerenciar submit do formulário de login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = loginUser.value.trim();
        const password = loginPassword.value.trim();
        
        // Validar credenciais: admin / manipularium
        if (username === 'admin' && password === 'manipularium') {
            // Login bem-sucedido
            sessionStorage.setItem('manipularium_auth', 'true');
            loginError.classList.add('hidden');
            
            // Animação de transição
            loginScreen.style.transition = 'opacity 0.5s ease-out';
            loginScreen.style.opacity = '0';
            
            setTimeout(() => {
                loginScreen.classList.add('hidden');
                mainApp.classList.remove('hidden');
                loginScreen.style.opacity = '1';
            }, 500);
        } else {
            // Login falhou
            loginError.textContent = 'Usuário ou senha incorretos!';
            loginError.classList.remove('hidden');
            
            // Adicionar animação de erro
            const loginCard = loginScreen.querySelector('.login-card');
            loginCard.style.animation = 'shake 0.5s ease-in-out';
            
            setTimeout(() => {
                loginCard.style.animation = '';
            }, 500);
            
            // Limpar campos
            loginPassword.value = '';
            loginPassword.focus();
        }
    });
    
    // Adicionar animação de shake ao CSS dinamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 20%, 40%, 60%, 80% { transform: translateX(0); }
            10%, 30%, 50%, 70% { transform: translateX(-10px); }
            90% { transform: translateX(10px); }
            100% { transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);
    
    // Função de Logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('manipularium_auth');
            
            // Animação de transição
            mainApp.style.transition = 'opacity 0.3s ease-out';
            mainApp.style.opacity = '0';
            
            setTimeout(() => {
                mainApp.classList.add('hidden');
                loginScreen.classList.remove('hidden');
                mainApp.style.opacity = '1';
                
                // Limpar campos de login
                loginUser.value = '';
                loginPassword.value = '';
                loginError.classList.add('hidden');
                loginUser.focus();
            }, 300);
        });
    }
    
    // Navegação
    const navBancaria = document.getElementById('navBancaria');
    const navCaixa = document.getElementById('navCaixa');
    const sistemaBancaria = document.getElementById('sistema-bancaria');
    const sistemaCaixa = document.getElementById('sistema-caixa');
    const pageSubtitle = document.getElementById('page-subtitle');
    
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
    });

    // Elementos da Conferência Bancária
    const fileInput = document.getElementById('fileInput');
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
        checkDataPresence();
    }

    // Comunicação com servidor
    async function loadDataFromServer() {
        try {
            const response = await fetch('/api/data');
            const result = await response.json();
            
            if (result.success) {
                appData = result.data;
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    async function saveDataToServer() {
        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appData)
            });
            
            const result = await response.json();
            
            if (!result.success) {
                console.error('Erro ao salvar dados:', result.message);
                showStatus('Erro ao salvar dados', 'red');
            }
            
            checkDataPresence();
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            showStatus('Erro de conexão', 'red');
        }
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
        createInternalBackupBtn.disabled = !hasData;
        restoreInternalBackupBtn.disabled = appData.backups.length === 0;
        clearHistoryButton.disabled = !hasData;
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
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
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
            matches[0].status = 'matched';
            showNotificationPopup('Valor Conferido!', 'success');
            await checkForCompletion(currentDayKey);
        } else if (matches.length > 1) {
            matches.forEach(m => m.status = 'needs-review');
            ambiguousMatches = matches;
            
            // Mostrar as opções de CPF/CNPJ disponíveis
            const cpfOptions = matches.map(m => m.cpfCnpj).filter((v, i, a) => a.indexOf(v) === i);
            let optionsHTML = '';
            
            if (cpfOptions.length > 0) {
                optionsHTML = '<div class="mt-3 p-3 bg-gray-100 rounded-lg text-left"><p class="text-sm font-semibold mb-2">Opções encontradas:</p><ul class="text-sm space-y-1">';
                matches.forEach(m => {
                    optionsHTML += `<li class="flex justify-between"><span class="text-gray-600">${m.historico.substring(0, 30)}...</span><span class="font-mono font-semibold">${m.cpfCnpj}</span></li>`;
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
            
            disambiguationModal.classList.remove('hidden');
            disambiguationInput.value = '';
            disambiguationInput.focus();
        } else {
            valueToConfirmNotFound = value;
            notFoundValueText.textContent = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            notFoundModal.classList.remove('hidden');
            valorInput.disabled = true;
        }
        
        await saveDataToServer();
        renderTable();
        valorInput.value = '';
    }

    confirmNotFoundBtn.addEventListener('click', async () => {
        const dayData = getCurrentDayData();
        if (dayData && valueToConfirmNotFound !== null) {
            dayData.notFound.push(valueToConfirmNotFound);
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

    async function handleDisambiguation() {
        const cpfPart = disambiguationInput.value.trim();
        if (!cpfPart) return;
        
        const finalMatches = ambiguousMatches.filter(t => t.cpfCnpj.includes(cpfPart));
        const dayData = getCurrentDayData();
        
        if (finalMatches.length === 1) {
            const idToMatch = finalMatches[0].id;
            dayData.transactions.find(t => t.id === idToMatch).status = 'matched';
            ambiguousMatches.forEach(t => {
                if (t.id !== idToMatch) {
                    dayData.transactions.find(ot => ot.id === t.id).status = 'unmatched';
                }
            });
            showNotificationPopup('Conferido!', 'success');
            await checkForCompletion(currentDayKey);
            await saveDataToServer();
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

    // Inicializar aplicação
    init();
});