// Content Script para WhatsApp Web
let draggedCatalog = null;
let draggedElement = null;
let dragMode = false;
let currentCatalogId = null;

console.log(' Content Script carregado na página');

// Variável global para armazenar o catálogo atual
let currentCatalogForSending = null;

// Escutar mensagens do popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(' Mensagem recebida:', request);
    
    if (request.action === 'enableDragMode') {
        console.log('Ativando modo drag para catálogo:', request.catalog?.id);
        enableDragMode(request.catalog);
        sendResponse({ success: true });
    }
    
    if (request.action === 'sendCatalogMessage') {
        console.log(' Enviando mensagem do catálogo...');
        sendCatalogMessage(request.message, request.encodedMessage);
        sendResponse({ success: true });
    }
    
    if (request.action === 'confirmSendToContact') {
        console.log(' Confirmação de envio para contato');
        sendCatalogToCurrentContact(request.message);
        sendResponse({ success: true });
    }
    
    if (request.action === 'showAppointments') {
        console.log(' Mostrando agendamentos do dia:', request.date);
        showAppointmentsCard(request.appointments, request.date);
        sendResponse({ success: true });
    }
    
    if (request.action === 'showNewAppointmentForm') {
        console.log('➕ Mostrando formulário de novo agendamento');
        showNewAppointmentForm(request.formData);
        sendResponse({ success: true });
    }
});

// Função para formatar mensagem do catálogo para envio
function formatCatalogMessageForCard(catalog) {
    let message = `*${catalog.name.toUpperCase()}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    if (catalog.description) {
        message += `${catalog.description}\n\n`;
    }
    
    if (catalog.items && catalog.items.length > 0) {
        message += `*ITENS DISPONÍVEIS:*\n\n`;
        catalog.items.forEach((item, index) => {
            message += `${index + 1}. *${item.name || 'Item'}*\n`;
            if (item.description) {
                message += `   ${item.description}\n`;
            }
            if (item.price) {
                message += `   R$ ${parseFloat(item.price).toFixed(2)}\n`;
            }
            message += `\n`;
        });
    }
    
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `_Criado com Agenda.me_`;
    
    return message;
}

// Modo drag para inserir catálogo na tela
function enableDragMode(catalog) {
    if (!catalog) {
        console.error('Catálogo não fornecido');
        return;
    }
    
    console.log('Modo drag ativado para catálogo:', catalog.name);
    dragMode = true;
    currentCatalogId = catalog.id;
    
    // Criar o card IMEDIATAMENTE no centro da tela
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    console.log(' Criando card no centro:', centerX, centerY);
    createCatalogCard(catalog, centerX, centerY);
    
    // Criar overlay para instruções
    const overlay = document.createElement('div');
    overlay.id = 'catalog-drag-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(102, 126, 234, 0.05);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        z-index: 9500;
        pointer-events: none;
        padding-top: 20px;
    `;
    overlay.innerHTML = `
        <div style="
            text-align: center;
            background: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 2px solid #667eea;
            pointer-events: auto;
        ">
            <div style="font-size: 14px; color: #333; margin-bottom: 12px;">
                 Card criado! Arraste pelo cabeçalho azul para posicionar
            </div>
            <button id="close-overlay" style="
                background: #667eea;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 600;
                font-size: 12px;
            ">Fechar instrução</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Fechar overlay ao clicar no botão
    overlay.querySelector('#close-overlay').addEventListener('click', () => {
        overlay.remove();
    });
    
    // Auto-remover overlay após 5 segundos
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.remove();
        }
    }, 5000);
}

// Enviar mensagem do catálogo no WhatsApp
function sendCatalogMessage(message, encodedMessage) {
    console.log('Abrindo funcionalidade de envio no WhatsApp...');
    
    // Armazenar a mensagem para depois enviar
    currentCatalogForSending = { message, encodedMessage };
    
    // Mostrar overlay instruindo o usuário
    showContactSelectionOverlay();
}

// Mostrar overlay instruindo a escolher o contato
function showContactSelectionOverlay() {
    // Remover overlay anterior se existir
    const existingOverlay = document.getElementById('contact-selection-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    // Remover botão anterior se existir
    const existingBtn = document.getElementById('send-catalog-button');
    if (existingBtn) {
        existingBtn.remove();
    }
    
    console.log('Mostrando overlay de seleção de contato');
    
    // Criar novo overlay
    const overlay = document.createElement('div');
    overlay.id = 'contact-selection-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        pointer-events: auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    overlay.innerHTML = `
        <div style="
            background: white;
            border-radius: 12px;
            padding: 32px;
            max-width: 500px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            text-align: center;
        ">
            <div style="font-size: 24px; margin-bottom: 16px;"></div>
            <h2 style="margin: 0 0 12px 0; color: #333; font-size: 18px;">Escolha o contato</h2>
            <p style="margin: 0 0 24px 0; color: #666; font-size: 14px; line-height: 1.5;">
                Clique no contato ou grupo para o qual deseja enviar o catálogo.
            </p>
            <p style="margin: 0 0 24px 0; color: #999; font-size: 13px; line-height: 1.5;">
                Após selecionar o contato, clique no botão <strong>"📤 Enviar Catálogo"</strong> que aparecerá no canto inferior direito.
            </p>
            <button id="close-selection-overlay" style="
                background: #25d366;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
            ">Entendi! Vou escolher um contato</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.querySelector('#close-selection-overlay').addEventListener('click', () => {
        console.log('👤 Fechando overlay, mostrando botão flutuante');
        overlay.remove();
        showSendCatalogButton();
    });
    
    // Auto-remover após 15 segundos e mostrar botão
    setTimeout(() => {
        if (overlay.parentNode) {
            console.log(' Timeout do overlay, mostrando botão flutuante');
            overlay.remove();
            showSendCatalogButton();
        }
    }, 15000);
}

// Mostrar botão flutuante para enviar catálogo
function showSendCatalogButton() {
    console.log('🔵 Tentando mostrar botão flutuante');
    
    // Verificar se já existe botão
    if (document.getElementById('send-catalog-button')) {
        console.log(' Botão já existe, não criando novo');
        return;
    }
    
    console.log(' Criando novo botão flutuante');
    
    const button = document.createElement('button');
    button.id = 'send-catalog-button';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 16px 24px;
        border-radius: 50px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        z-index: 9999;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    button.innerHTML = '📤 Enviar Catálogo';
    
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.05)';
        button.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.6)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
    });
    
    button.addEventListener('click', () => {
        console.log('🖱️ Clicado botão flutuante');
        console.log('currentCatalogForSending:', currentCatalogForSending);
        
        if (currentCatalogForSending && currentCatalogForSending.message) {
            console.log('✅ Enviando para contato...');
            sendCatalogToCurrentContact(currentCatalogForSending.message);
            button.remove();
            console.log('✅ Botão removido');
        } else {
            console.error('❌ Nenhum catálogo armazenado');
            alert(' Erro: Nenhum catálogo para enviar. Por favor, tente novamente.');
        }
    });
    
    document.body.appendChild(button);
    console.log(' Botão flutuante adicionado ao DOM');
}

// Função auxiliar para aguardar o input de mensagem aparecer
function waitForMessageInput(timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        function checkForInput() {
            const selectors = [
                'div[contenteditable="true"][data-tab="10"]',
                'div[contenteditable="true"][role="textbox"]',
                '[data-testid="conversation-compose-box-input"]',
                'div[contenteditable="true"][spellcheck="true"]',
                'footer div[contenteditable="true"]',
                'div[contenteditable="true"].selectable-text'
            ];
            
            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    const rect = element.getBoundingClientRect();
                    const isVisible = rect.width > 0 && rect.height > 0;
                    const isInBottomHalf = rect.bottom > window.innerHeight / 2;
                    
                    if (isVisible && isInBottomHalf) {
                        const ariaLabel = element.getAttribute('aria-label') || '';
                        const isSearchInput = ariaLabel.toLowerCase().includes('pesquis') || 
                                            ariaLabel.toLowerCase().includes('search');
                        
                        if (!isSearchInput) {
                            console.log(`Input encontrado com seletor: ${selector}`);
                            resolve(element);
                            return;
                        }
                    }
                }
            }
            
            // Se não encontrou e ainda tem tempo, tentar novamente
            if (Date.now() - startTime < timeout) {
                setTimeout(checkForInput, 100);
            } else {
                reject(new Error('Input não encontrado dentro do tempo limite'));
            }
        }
        
        checkForInput();
    });
}

// Enviar catálogo para o contato selecionado
function sendCatalogToCurrentContact(message) {
    if (!currentCatalogForSending) {
        console.error('❌ Nenhum catálogo para enviar');
        return;
    }
    
    console.log('Carregando catálogo no input de mensagem...');
    console.log('📝 Mensagem a carregar:', message.substring(0, 50) + '...');
    
    let messageInput = null;
    
    // Usar a função auxiliar para aguardar o input
    waitForMessageInput()
        .then(messageInput => {
            // Input já foi encontrado pela função waitForMessageInput
            try {
                console.log('📍 Elemento encontrado');
                console.log('📍 Tipo:', messageInput.tagName);
                console.log('📍 Classes:', messageInput.className);
                console.log('📍 Aria-label:', messageInput.getAttribute('aria-label'));
                console.log('📍 Data-tab:', messageInput.getAttribute('data-tab'));
                
                // Scroll para o input se necessário
                messageInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Aguardar um pouco após o scroll
                setTimeout(() => {
                    // Focar no input
                    messageInput.focus();
                    messageInput.click();
                    console.log(' Input com foco');
                    
                    // Aguardar um pouco para o foco
                    setTimeout(() => {
                        // Limpar conteúdo anterior usando diferentes métodos
                        messageInput.innerHTML = '';
                        messageInput.textContent = '';
                        messageInput.innerText = '';
                        
                        // Simular Ctrl+A e Delete para limpar
                        const selectAllEvent = new KeyboardEvent('keydown', {
                            key: 'a',
                            code: 'KeyA',
                            ctrlKey: true,
                            bubbles: true
                        });
                        messageInput.dispatchEvent(selectAllEvent);
                        
                        const deleteEvent = new KeyboardEvent('keydown', {
                            key: 'Delete',
                            code: 'Delete',
                            bubbles: true
                        });
                        messageInput.dispatchEvent(deleteEvent);
                        
                        console.log(' Input limpo');
                        
                        // Aguardar um pouco após limpar
                        setTimeout(() => {
                            // Tentar método direto primeiro (mais rápido)
                            function insertTextDirect() {
                                try {
                                    // Método 1: Usar execCommand (funciona em muitos casos)
                                    if (document.execCommand) {
                                        messageInput.focus();
                                        document.execCommand('insertText', false, message);
                                        console.log(' Texto inserido via execCommand');
                                        
                                        // Disparar eventos
                                        const inputEvent = new Event('input', { bubbles: true });
                                        messageInput.dispatchEvent(inputEvent);
                                        
                                        return true;
                                    }
                                } catch (e) {
                                    console.log(' execCommand falhou, tentando método alternativo');
                                }
                                
                                // Método 2: Inserção direta com eventos
                                try {
                                    messageInput.textContent = message;
                                    messageInput.innerText = message;
                                    
                                    // Posicionar cursor no final
                                    const range = document.createRange();
                                    const selection = window.getSelection();
                                    range.selectNodeContents(messageInput);
                                    range.collapse(false);
                                    selection.removeAllRanges();
                                    selection.addRange(range);
                                    
                                    // Disparar eventos essenciais
                                    const events = [
                                        new Event('input', { bubbles: true }),
                                        new Event('change', { bubbles: true }),
                                        new KeyboardEvent('keyup', { bubbles: true }),
                                        new CompositionEvent('compositionend', { data: message, bubbles: true })
                                    ];
                                    
                                    events.forEach(event => messageInput.dispatchEvent(event));
                                    
                                    console.log('Texto inserido via método direto');
                                    return true;
                                } catch (e) {
                                    console.log(' Método direto falhou, usando simulação de digitação');
                                    return false;
                                }
                            }
                            
                            // Tentar inserção direta primeiro
                            if (insertTextDirect()) {
                                console.log(' SUCESSO! Mensagem carregada no input!');
                                return;
                            }
                            
                            // Se falhou, usar simulação de digitação como fallback
                            console.log('Iniciando simulação de digitação como fallback...');
                            
                            let currentText = '';
                            const chars = message.split('');
                            
                            function typeNextChar(index) {
                                if (index >= chars.length) {
                                    console.log(' SUCESSO! Mensagem carregada no input via simulação!');
                                    
                                    // Disparar eventos finais
                                    const finalInputEvent = new Event('input', { bubbles: true });
                                    messageInput.dispatchEvent(finalInputEvent);
                                    
                                    const compositionEndEvent = new CompositionEvent('compositionend', {
                                        data: message,
                                        bubbles: true
                                    });
                                    messageInput.dispatchEvent(compositionEndEvent);
                                    
                                    return;
                                }
                                
                                const char = chars[index];
                                currentText += char;
                                
                                // Atualizar o conteúdo
                                messageInput.textContent = currentText;
                                messageInput.innerText = currentText;
                                
                                // Posicionar cursor no final
                                try {
                                    const range = document.createRange();
                                    const selection = window.getSelection();
                                    range.selectNodeContents(messageInput);
                                    range.collapse(false);
                                    selection.removeAllRanges();
                                    selection.addRange(range);
                                } catch (e) {
                                    // Ignorar erros de cursor
                                }
                                
                                // Disparar eventos de digitação
                                const inputEvent = new Event('input', { bubbles: true });
                                messageInput.dispatchEvent(inputEvent);
                                
                                // Continuar com o próximo caractere
                                setTimeout(() => typeNextChar(index + 1), 5);
                            }
                            
                            typeNextChar(0);
                            
                        }, 50);
                    }, 100);
                }, 200);
                
            } catch (error) {
                console.error(' Erro ao carregar mensagem:', error.message);
                alert(' Erro ao carregar mensagem: ' + error.message);
            }
            
        })
        .catch(error => {
            console.error(' Erro ao encontrar input:', error.message);
            
            // Mostrar informações de debug
            const allContentEditable = document.querySelectorAll('[contenteditable="true"]');
            console.log(' Debug - Todos os elementos contenteditable encontrados:');
            allContentEditable.forEach((el, i) => {
                const rect = el.getBoundingClientRect();
                console.log(`${i}: ${el.tagName} - Classes: ${el.className} - Posição: ${rect.bottom} - Visível: ${rect.width > 0 && rect.height > 0}`);
            });
            
            alert('Erro: Não foi possível encontrar o campo de mensagem do WhatsApp.\n\nDicas:\n1. Certifique-se de ter selecionado um contato\n2. Verifique se a conversa está aberta\n3. Aguarde a página carregar completamente\n4. Tente recarregar a página do WhatsApp');
        });
}

// Criar card do catálogo
function createCatalogCard(catalog, x, y) {
    if (!catalog) {
        console.error('Catálogo não fornecido');
        return;
    }
    
    // Criar container do card
    const card = document.createElement('div');
    const cardId = `catalog-card-${Date.now()}`;
    card.id = cardId;
    card.style.cssText = `
        position: fixed;
        left: ${x - 150}px;
        top: ${y - 50}px;
        background: white;
        padding: 0;
        border-radius: 12px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        min-width: 320px;
        max-width: 500px;
        user-select: none;
        border: 2px solid #667eea;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        overflow: hidden;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
    `;
    
    const items = catalog.items || [];
    console.log(' Items do catálogo:', items);
    console.log(' Estrutura do item:', items[0]);
    
    const itemsHTML = items.length > 0 ? `
        <div style="flex: 1; overflow-y: auto; padding: 0 16px;">
            <div style="margin: 12px 0; border-bottom: 1px solid #f0f0f0;">
                <h4 style="margin: 0 0 12px 0; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">Itens do Catálogo (${items.length}):</h4>
                <div style="padding-bottom: 12px;">
                    ${items.map((item, idx) => {
                        const itemName = item.name || item.title || item.product_name || 'Item sem nome';
                        const itemDesc = item.description || item.desc || '';
                        const itemPrice = item.price || item.valor || item.cost || '';
                        console.log(`Item ${idx}:`, item);
                        return `
                            <div style="
                                margin-bottom: 10px;
                                padding: 10px;
                                background: #f9f9f9;
                                border-radius: 6px;
                                border-left: 3px solid #667eea;
                            ">
                                <div style="font-weight: 600; color: #333; font-size: 13px; margin-bottom: 4px;">
                                    ${idx + 1}. ${itemName}
                                </div>
                                ${itemDesc ? `<div style="color: #666; font-size: 12px; margin-bottom: 4px;">${itemDesc}</div>` : ''}
                                ${itemPrice ? `<div style="color: #25d366; font-weight: 600; font-size: 13px;">R$ ${parseFloat(itemPrice).toFixed(2)}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    ` : `
        <div style="padding: 16px; color: #999; text-align: center; font-size: 13px;">
            Nenhum item neste catálogo
        </div>
    `;
    
    card.innerHTML = `
        <div class="card-header" style="
            background: linear-gradient(135deg, #667eea 0%, #5568d3 100%);
            padding: 16px;
            cursor: grab;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
            color: white;
            flex-shrink: 0;
        ">
            <div>
                <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: white;">
                    ${catalog.name}
                </h3>
                ${catalog.description ? `<p style="margin: 0; font-size: 12px; opacity: 0.9; max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${catalog.description}</p>` : ''}
            </div>
            <button class="close-btn" 
                    style="background: none; border: none; font-size: 20px; cursor: pointer; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
                ✕
            </button>
        </div>
        ${itemsHTML}
        <div style="
            padding: 12px 16px;
            background: #f9f9f9;
            border-top: 1px solid #e0e0e0;
            flex-shrink: 0;
        ">
            <button class="send-btn" style="
                background: linear-gradient(135deg, #25d366 0%, #20ba5a 100%);
                color: white;
                border: none;
                padding: 12px 16px;
                border-radius: 6px;
                cursor: pointer;
                width: 100%;
                font-weight: 600;
                font-size: 14px;
                transition: opacity 0.2s;
            ">
                Enviar pelo WhatsApp 
            </button>
        </div>
    `;
    
    // Adicionar event listeners aos botões
    const closeBtn = card.querySelector('.close-btn');
    const sendBtn = card.querySelector('.send-btn');
    const header = card.querySelector('.card-header');
    
    closeBtn.addEventListener('click', () => {
        card.remove();
    });
    
    sendBtn.addEventListener('mouseenter', () => {
        sendBtn.style.opacity = '0.9';
    });
    
    sendBtn.addEventListener('mouseleave', () => {
        sendBtn.style.opacity = '1';
    });
    
    sendBtn.addEventListener('click', () => {
        // Usar o mesmo fluxo do "Enviar 📱"
        console.log('📱 Enviando catálogo para WhatsApp:', catalog.name);
        
        // Armazenar o catálogo para envio
        currentCatalogForSending = {
            message: formatCatalogMessageForCard(catalog),
            encodedMessage: encodeURIComponent(formatCatalogMessageForCard(catalog))
        };
        
        // Mostrar o overlay e botão flutuante
        showContactSelectionOverlay();
    });
    
    // Fazer card arrastável APENAS pelo header
    makeDraggable(card, header);
    
    document.body.appendChild(card);
}

// Mostrar card com agendamentos do dia
function showAppointmentsCard(appointments, selectedDate) {
    // Remover card anterior se existir
    const existingCard = document.getElementById('appointments-card');
    if (existingCard) {
        existingCard.remove();
    }
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const card = document.createElement('div');
    card.id = 'appointments-card';
    card.style.cssText = `
        position: fixed;
        left: ${centerX - 200}px;
        top: ${centerY - 150}px;
        background: white;
        padding: 0;
        border-radius: 12px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        min-width: 400px;
        max-width: 500px;
        user-select: none;
        border: 2px solid #25d366;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
    `;
    
    const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const appointmentsHTML = appointments.length > 0 ? `
        <div style="flex: 1; overflow-y: auto; padding: 0 16px;">
            <div style="margin: 12px 0;">
                ${appointments.map((apt, idx) => {
                    const time = apt.appointment_time?.substring(0, 5) || 'Sem horário';
                    const customerName = apt.customer?.name || apt.customer_name || apt.name || 'Cliente não informado';
                    const serviceName = apt.service?.name || apt.service_name || 'Serviço não informado';
                    const status = apt.status || 'pending';
                    
                    const statusColor = {
                        'confirmed': '#25d366',
                        'completed': '#0084ff',
                        'cancelled': '#ff4757',
                        'pending': '#ffa502'
                    }[status] || '#ffa502';
                    
                    const statusText = {
                        'confirmed': 'Confirmado',
                        'completed': 'Concluído',
                        'cancelled': 'Cancelado',
                        'pending': 'Pendente'
                    }[status] || 'Pendente';
                    
                    return `
                        <div style="
                            margin-bottom: 12px;
                            padding: 12px;
                            background: #f9f9f9;
                            border-radius: 8px;
                            border-left: 4px solid ${statusColor};
                        ">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                <div style="font-weight: 700; color: #333; font-size: 14px;">
                                    ${time}
                                </div>
                                <div style="font-size: 11px; color: ${statusColor}; font-weight: 600;">
                                    ${statusText}
                                </div>
                            </div>
                            <div style="font-weight: 600; color: #333; font-size: 13px; margin-bottom: 4px;">
                                👤 ${customerName}
                            </div>
                            <div style="color: #666; font-size: 12px; margin-bottom: 8px;">
                                ✂️ ${serviceName}
                            </div>
                            <button class="send-apt-btn" data-apt-index="${idx}" style="
                                background: linear-gradient(135deg, #25d366 0%, #20ba5a 100%);
                                color: white;
                                border: none;
                                padding: 6px 12px;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 11px;
                                font-weight: 600;
                                width: 100%;
                                transition: opacity 0.2s;
                            ">
                                Enviar pelo WhatsApp 
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    ` : `
        <div style="padding: 32px; color: #999; text-align: center; font-size: 14px;">
             Nenhum agendamento para este dia
        </div>
    `;
    
    card.innerHTML = `
        <div class="card-header" style="
            background: linear-gradient(135deg, #25d366 0%, #20ba5a 100%);
            padding: 16px;
            cursor: grab;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
            color: white;
            flex-shrink: 0;
        ">
            <div>
                <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: white;">
                     Agendamentos
                </h3>
                <p style="margin: 0; font-size: 12px; opacity: 0.9; text-transform: capitalize;">
                    ${formattedDate}
                </p>
            </div>
            <button class="close-btn" 
                    style="background: none; border: none; font-size: 20px; cursor: pointer; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
                ✕
            </button>
        </div>
        ${appointmentsHTML}
        ${appointments.length > 0 ? `
            <div style="
                padding: 12px 16px;
                background: #f9f9f9;
                border-top: 1px solid #e0e0e0;
                flex-shrink: 0;
                text-align: center;
            ">
                <div style="color: #666; font-size: 12px;">
                    Total: ${appointments.length} agendamento${appointments.length > 1 ? 's' : ''}
                </div>
            </div>
        ` : ''}
    `;
    
    // Event listeners
    const closeBtn = card.querySelector('.close-btn');
    const header = card.querySelector('.card-header');
    const sendBtns = card.querySelectorAll('.send-apt-btn');
    
    closeBtn.addEventListener('click', () => {
        card.remove();
    });
    
    sendBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.opacity = '0.9';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.opacity = '1';
        });
        btn.addEventListener('click', () => {
            const aptIndex = parseInt(btn.getAttribute('data-apt-index'));
            const apt = appointments[aptIndex];
            
            const time = apt.appointment_time?.substring(0, 5) || 'Sem horário';
            const customerName = apt.customer?.name || apt.customer_name || apt.name || 'Cliente não informado';
            const serviceName = apt.service?.name || apt.service_name || 'Serviço não informado';
            const customerPhone = apt.customer?.phone || apt.phone || '';
            const status = apt.status || 'pending';
            
            const statusText = {
                'confirmed': 'Confirmado',
                'completed': 'Concluído',
                'cancelled': 'Cancelado',
                'pending': 'Pendente'
            }[status] || 'Pendente';
            
            const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            let message = `*AGENDAMENTO*\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            message += `*Data:* ${formattedDate}\n`;
            message += `*Horário:* ${time}\n\n`;
            message += `*Cliente:* ${customerName}\n`;
            if (customerPhone) {
                message += `*Telefone:* ${customerPhone}\n`;
            }
            message += `*Serviço:* ${serviceName}\n`;
            message += `*Status:* ${statusText}\n\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;
            message += `_Criado com Agenda.me_`;
            
            currentCatalogForSending = {
                message: message,
                encodedMessage: encodeURIComponent(message)
            };
            
            showContactSelectionOverlay();
        });
    });
    
    // Fazer card arrastável
    makeDraggable(card, header);
    
    document.body.appendChild(card);
}

// Mostrar formulário de novo agendamento
function showNewAppointmentForm(formData) {
    // Remover formulário anterior se existir
    const existingForm = document.getElementById('new-appointment-form');
    if (existingForm) {
        existingForm.remove();
    }
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const form = document.createElement('div');
    form.id = 'new-appointment-form';
    form.style.cssText = `
        position: fixed;
        left: ${centerX - 200}px;
        top: ${centerY - 200}px;
        background: white;
        padding: 0;
        border-radius: 12px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        width: 400px;
        user-select: none;
        border: 2px solid #667eea;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
    `;
    
    const timeOptions = Array.from({ length: 23 }, (_, i) => {
        const hour = 8 + Math.floor(i / 2);
        const minute = i % 2 === 0 ? '00' : '30';
        return `${String(hour).padStart(2, '0')}:${minute}`;
    });
    
    form.innerHTML = `
        <div class="form-header" style="
            background: linear-gradient(135deg, #667eea 0%, #5568d3 100%);
            padding: 16px;
            cursor: grab;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
            color: white;
            flex-shrink: 0;
        ">
            <div>
                <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: white;">
                    ➕ Novo Agendamento
                </h3>
                <p style="margin: 0; font-size: 12px; opacity: 0.9;">Preencha os dados abaixo</p>
            </div>
            <button class="close-btn" 
                    style="background: none; border: none; font-size: 20px; cursor: pointer; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
                ✕
            </button>
        </div>
        <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <div style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #333; font-size: 12px;">Data *</label>
                <input type="date" id="form-date" value="${new Date().toISOString().split('T')[0]}" style="
                    width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;
                " />
            </div>
            <div style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #333; font-size: 12px;">Horário *</label>
                <select id="form-time" style="
                    width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;
                ">
                    <option value="">Selecione um horário</option>
                    ${timeOptions.map(time => `<option value="${time}">${time}</option>`).join('')}
                </select>
            </div>
            <div style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #333; font-size: 12px;">Cliente *</label>
                <select id="form-customer" style="
                    width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;
                ">
                    <option value="">Selecione um cliente</option>
                    ${(formData.customers || []).map(customer => 
                        `<option value="${customer.id}">${customer.name} - ${customer.phone}</option>`
                    ).join('')}
                </select>
            </div>
            <div style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #333; font-size: 12px;">Serviço</label>
                <select id="form-service" style="
                    width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;
                ">
                    <option value="">Selecione um serviço</option>
                    ${(formData.services || []).map(service => 
                        `<option value="${service.id}">${service.name} - ${service.duration}min</option>`
                    ).join('')}
                </select>
            </div>
            <div style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #333; font-size: 12px;">Profissional</label>
                <select id="form-professional" style="
                    width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;
                ">
                    <option value="">Selecione um profissional</option>
                    ${(formData.professionals || []).map(professional => 
                        `<option value="${professional.id}">${professional.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #333; font-size: 12px;">Status</label>
                <select id="form-status" style="
                    width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;
                ">
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                </select>
            </div>
        </div>
        <div style="
            padding: 12px 16px;
            background: #f9f9f9;
            border-top: 1px solid #e0e0e0;
            flex-shrink: 0;
        ">
            <button class="create-btn" style="
                background: linear-gradient(135deg, #25d366 0%, #20ba5a 100%);
                color: white;
                border: none;
                padding: 12px 16px;
                border-radius: 6px;
                cursor: pointer;
                width: 100%;
                font-weight: 600;
                font-size: 14px;
                transition: opacity 0.2s;
            ">
                Criar Agendamento
            </button>
            <div id="form-error" style="
                margin-top: 8px;
                padding: 8px;
                background: #fee;
                color: #c33;
                border-radius: 4px;
                font-size: 12px;
                display: none;
            "></div>
        </div>
    `;
    
    // Event listeners
    const closeBtn = form.querySelector('.close-btn');
    const createBtn = form.querySelector('.create-btn');
    const header = form.querySelector('.form-header');
    const errorDiv = form.querySelector('#form-error');
    
    closeBtn.addEventListener('click', () => {
        form.remove();
    });
    
    createBtn.addEventListener('click', async () => {
        const appointmentData = {
            appointment_date: form.querySelector('#form-date').value,
            appointment_time: form.querySelector('#form-time').value,
            customer_id: form.querySelector('#form-customer').value,
            service_id: form.querySelector('#form-service').value || null,
            professional_id: form.querySelector('#form-professional').value || null,
            status: form.querySelector('#form-status').value
        };
        
        console.log('Dados do formulário antes da validação:', appointmentData);
        
        if (!appointmentData.appointment_date || !appointmentData.appointment_time || !appointmentData.customer_id) {
            errorDiv.textContent = 'Data, horário e cliente são obrigatórios';
            errorDiv.style.display = 'block';
            return;
        }
        
        createBtn.disabled = true;
        createBtn.textContent = 'Criando...';
        errorDiv.style.display = 'none';
        
        try {
            console.log('Criando agendamento:', appointmentData);
            
            // Buscar token do storage
            const storage = await new Promise((resolve) => {
                chrome.storage.local.get(['authToken'], resolve);
            });
            
            if (!storage.authToken) {
                throw new Error('Token não encontrado. Faça login novamente.');
            }
            
            // Criar agendamento via API
            const response = await fetch('http://localhost:3000/api/clinic/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storage.authToken}`
                },
                body: JSON.stringify(appointmentData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao criar agendamento');
            }
            
            const result = await response.json();
            console.log('Agendamento criado:', result);
            
            form.remove();
            
            // Mostrar confirmação
            const successDiv = document.createElement('div');
            successDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #25d366;
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                font-weight: 600;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
            `;
            successDiv.textContent = '✅ Agendamento criado com sucesso!';
            document.body.appendChild(successDiv);
            
            setTimeout(() => {
                successDiv.remove();
            }, 3000);
            
        } catch (error) {
            console.error('Erro ao criar agendamento:', error);
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        } finally {
            createBtn.disabled = false;
            createBtn.textContent = 'Criar Agendamento';
        }
    });
    
    // Fazer formulário arrastável
    makeDraggable(form, header);
    
    document.body.appendChild(form);
}

// Função para tornar elemento arrastável
function makeDraggable(element, handle = null) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    
    // Se handle foi especificado, usar apenas ele; caso contrário usar todo o elemento
    const dragHandle = handle || element;
    
    dragHandle.addEventListener('mousedown', dragMouseDown);
    dragHandle.style.cursor = 'grab';
    dragHandle.addEventListener('mouseover', () => {
        if (!isDragging) dragHandle.style.cursor = 'grab';
    });
    dragHandle.addEventListener('mouseout', () => {
        if (!isDragging) dragHandle.style.cursor = 'default';
    });
    
    function dragMouseDown(e) {
        // Ignorar cliques em buttons dentro do handle
        if (e.target.tagName === 'BUTTON') {
            return;
        }
        
        console.log('🖱️ Iniciando drag do card');
        e.preventDefault();
        isDragging = true;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.cursor = 'grabbing';
        dragHandle.style.cursor = 'grabbing';
        element.style.zIndex = '10001'; // Trazer para frente
        
        // Adicionar sombra durante drag
        element.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.3)';
        
        document.addEventListener('mousemove', elementDrag, { passive: false });
        document.addEventListener('mouseup', closeDragElement);
    }
    
    function elementDrag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        // Calcular a diferença
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        
        // Atualizar posição anterior
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Mover o elemento
        const newTop = element.offsetTop - pos2;
        const newLeft = element.offsetLeft - pos1;
        
        element.style.top = newTop + "px";
        element.style.left = newLeft + "px";
    }
    
    function closeDragElement() {
        if (!isDragging) return;
        
        isDragging = false;
        element.style.cursor = 'move';
        dragHandle.style.cursor = 'grab';
        element.style.zIndex = '9999'; // Voltar z-index normal
        
        // Remover sombra extra
        element.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
        
        console.log('Drag finalizado');
        
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('mouseup', closeDragElement);
    }
}
