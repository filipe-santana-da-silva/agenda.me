
console.log('✅ Content Script carregado na página');

// ===== FUNÇÕES PARA ENVIO DE PDF =====
// Listar PDFs salvos no Chrome Storage
function getAvailablePDFs() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['savedPDFs'], (result) => {
            if (chrome.runtime.lastError) {
                console.error('Erro ao acessar Chrome Storage:', chrome.runtime.lastError);
                resolve([]);
                return;
            }
            
            const savedPDFs = result.savedPDFs || {};
            const pdfs = Object.entries(savedPDFs).map(([catalogId, pdfInfo]) => ({
                catalogId,
                pdfData: pdfInfo.data,
                name: pdfInfo.name,
                timestamp: pdfInfo.timestamp
            }));
            
            console.log('📋 PDFs encontrados no Chrome Storage:', pdfs.length);
            resolve(pdfs);
        });
    });
}

// Enviar PDF para WhatsApp
async function sendPDFToWhatsApp(pdfDataUrl, catalogName) {
    console.log('📤 Enviando PDF para WhatsApp:', catalogName);
    
    try {
        // Converter data URL para Blob
        const response = await fetch(pdfDataUrl);
        const blob = await response.blob();
        
        console.log('✅ PDF blob criado:', blob.size, 'bytes');
        
        // Encontrar input file do WhatsApp
        const fileInput = findFileInput();
        if (!fileInput) {
            throw new Error('Não foi possível encontrar o campo de arquivo do WhatsApp');
        }
        
        // Criar DataTransfer com o arquivo PDF
        const dataTransfer = new DataTransfer();
        const file = new File([blob], `${catalogName}.pdf`, { type: 'application/pdf' });
        dataTransfer.items.add(file);
        
        // Definir files do input
        fileInput.files = dataTransfer.files;
        
        // Disparar eventos
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        fileInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        console.log('✅ Arquivo PDF adicionado ao WhatsApp');
        
        // Aguardar um pouco antes de clicar em enviar
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Clicar no botão enviar
        const sendButton = findAndClickSendButton();
        if (!sendButton) {
            console.warn('⚠️ Não foi encontrado botão de envio, tente manualmente');
            showSuccessMessage('✅ PDF pronto! Clique no botão de envio no WhatsApp');
        } else {
            showSuccessMessage('✅ PDF enviado com sucesso!');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao enviar PDF:', error);
        showErrorMessage('❌ Erro ao enviar PDF: ' + error.message);
        return false;
    }
}

// Encontrar o input de arquivo do WhatsApp
function findFileInput() {
    // Tentativa 1: Encontrar por type="file"
    let input = document.querySelector('input[type="file"]');
    if (input) return input;
    
    // Tentativa 2: Procurar em divs que contenha input file
    const fileInputs = document.querySelectorAll('input[type="file"]');
    if (fileInputs.length > 0) return fileInputs[fileInputs.length - 1];
    
    return null;
}

// Encontrar e clicar no botão de envio
function findAndClickSendButton() {
    // Estratégia 1: Procurar por aria-label
    let sendBtn = document.querySelector('[aria-label*="Enviar"]') || 
                  document.querySelector('[aria-label*="enviar"]') ||
                  document.querySelector('[title*="Enviar"]') ||
                  document.querySelector('[title*="enviar"]');
    
    // Estratégia 2: Procurar por data-testid
    if (!sendBtn) {
        sendBtn = document.querySelector('[data-testid="send"]');
    }
    
    // Estratégia 3: Procurar por classe comum do WhatsApp
    if (!sendBtn) {
        const buttons = document.querySelectorAll('button');
        for (let btn of buttons) {
            if (btn.innerHTML.includes('svg') && btn.getAttribute('aria-label')?.toLowerCase().includes('enviar')) {
                sendBtn = btn;
                break;
            }
        }
    }
    
    if (sendBtn) {
        console.log('✅ Botão de envio encontrado');
        sendBtn.click();
        return sendBtn;
    }
    
    console.warn('⚠️ Botão de envio não encontrado');
    return null;
}

// Mostrar mensagem de sucesso
function showSuccessMessage(message) {
    const existing = document.getElementById('pdf-success-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'pdf-success-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 999999;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Mostrar mensagem de erro
function showErrorMessage(message) {
    const existing = document.getElementById('pdf-error-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'pdf-error-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 999999;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ===== FIM FUNÇÕES PARA ENVIO DE PDF =====

// Escutar mensagens do popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Mensagem recebida:', request);
    
    try {
        // Nova ação: enviar PDF pré-gerado
        if (request.action === 'sendPDF') {
            console.log('📄 Enviando PDF do catálogo:', request.catalogName);
            sendPDFToWhatsApp(request.pdfDataUrl, request.catalogName)
                .then(result => {
                    sendResponse({ success: result });
                })
                .catch(error => {
                    sendResponse({ success: false, error: error.message });
                });
            return true;
        }
        
        // Nova ação: listar PDFs disponíveis
        if (request.action === 'getPDFList') {
            console.log('📋 Listando PDFs disponíveis');
            getAvailablePDFs().then(pdfs => {
                sendResponse({ success: true, pdfs });
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true;
        }
        
        if (request.action === 'showAppointments') {
            console.log('📅 Mostrando agendamentos do dia:', request.date);
            console.log('📊 Total de agendamentos:', request.appointments?.length || 0);
            if (request.appointments && request.appointments.length > 0) {
                console.log('📝 Primeiro agendamento:', request.appointments[0]);
            }
            showAppointmentsCard(request.appointments, request.date);
            sendResponse({ success: true, message: 'Agendamentos carregados com sucesso' });
            return true;
        }
        
        if (request.action === 'showNewAppointmentForm') {
            console.log('➕ Mostrando formulário de novo agendamento');
            showNewAppointmentForm(request.formData);
            sendResponse({ success: true });
            return true;
        }
    } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
        sendResponse({ success: false, error: error.message });
        return true;
    }
});

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


// Função para mostrar indicador de carregamento
function showPDFLoadingIndicator() {
    const loader = document.createElement('div');
    loader.id = 'pdf-loading-indicator';
    loader.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        text-align: center;
        font-family: Arial, sans-serif;
    `;
    
    loader.innerHTML = `
        <div style="margin-bottom: 12px; font-size: 24px;">⏳</div>
        <div style="color: #333; font-weight: bold; margin-bottom: 4px;">Gerando PDF...</div>
        <div style="color: #666; font-size: 12px;">Por favor, aguarde...</div>
    `;
    
    document.body.appendChild(loader);
}

// Função para esconder indicador de carregamento
function hidePDFLoadingIndicator() {
    const loader = document.getElementById('pdf-loading-indicator');
    if (loader) {
        loader.remove();
    }
}

// Função para mostrar mensagem de sucesso
function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 10002;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Função para fazer download do PDF como fallback
function downloadPDF(pdfBlob, filename) {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Função para enviar PDF via WhatsApp
async function sendPDFToWhatsApp(pdfBlob, catalogName) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('📤 Preparando envio de PDF...');
            
            // Procurar pelo botão de attachment
            console.log('🔍 Procurando botão de attachment...');
            let attachmentButton = findAttachmentButton();
            
            if (!attachmentButton) {
                console.log('⚠️ Botão de attachment não encontrado');
                reject(new Error('Não foi possível encontrar o botão de anexo do WhatsApp'));
                return;
            }
            
            console.log('✅ Botão de attachment encontrado');
            attachmentButton.click();
            
            // Aguardar e procurar pelo input de arquivo
            setTimeout(() => {
                let fileInput = findFileInput();
                
                if (fileInput) {
                    console.log('✅ Input de arquivo encontrado');
                    
                    try {
                        // Criar objeto File a partir do blob
                        const file = new File(
                            [pdfBlob], 
                            `${catalogName}.pdf`, 
                            { type: 'application/pdf' }
                        );
                        
                        console.log('📝 Arquivo criado:', file.name, file.size, 'bytes, tipo:', file.type);
                        
                        // Tentar usar DataTransfer (método moderno)
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        fileInput.files = dataTransfer.files;
                        
                        console.log('📤 Arquivo atribuído ao input');
                        
                        // Disparar eventos
                        const events = [
                            new Event('change', { bubbles: true }),
                            new Event('input', { bubbles: true }),
                            new DragEvent('drop', { 
                                bubbles: true,
                                dataTransfer: dataTransfer
                            })
                        ];
                        
                        events.forEach(event => {
                            try {
                                fileInput.dispatchEvent(event);
                            } catch (e) {
                                console.warn('⚠️ Aviso ao disparar evento:', e.message);
                            }
                        });
                        
                        console.log('✅ Eventos disparados, PDF em processamento...');
                        
                        // Dar tempo para o WhatsApp processar o arquivo
                        setTimeout(() => {
                            // Procurar pelo botão de envio que deve aparecer
                            findAndClickSendButton();
                            resolve(true);
                        }, 2000);
                        
                    } catch (e) {
                        console.error('❌ Erro ao manipular arquivo:', e);
                        reject(new Error('Erro ao processar arquivo: ' + e.message));
                    }
                } else {
                    console.warn('⚠️ Input de arquivo não encontrado');
                    reject(new Error('Não foi possível encontrar o campo de arquivo do WhatsApp'));
                }
            }, 500);
            
        } catch (error) {
            console.error('❌ Erro ao enviar PDF:', error);
            reject(error);
        }
    });
}

// Encontrar e clicar no botão de envio
function findAndClickSendButton() {
    console.log('🔍 Procurando botão de envio...');
    
    const sendSelectors = [
        '[aria-label*="Enviar"]',
        '[aria-label*="Send"]',
        'button[data-testid*="send"]',
        'button[title*="Enviar"]'
    ];
    
    for (const selector of sendSelectors) {
        const buttons = document.querySelectorAll(selector);
        for (const button of buttons) {
            const rect = button.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                console.log('✅ Botão de envio encontrado');
                button.click();
                return;
            }
        }
    }
    
    // Fallback: Procurar por qualquer botão próximo ao input
    const allButtons = document.querySelectorAll('button');
    for (const button of allButtons) {
        const ariaLabel = button.getAttribute('aria-label') || '';
        if (ariaLabel.includes('Enviar') || ariaLabel.includes('Send')) {
            const rect = button.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                console.log('✅ Botão de envio encontrado (fallback)');
                button.click();
                return;
            }
        }
    }
    
    console.warn('⚠️ Botão de envio não encontrado automaticamente');
}

// Encontrar botão de attachment no WhatsApp
function findAttachmentButton() {
    const selectors = [
        'button[aria-label*="Anexar"]',
        'button[aria-label*="anexar"]',
        'button[aria-label*="Attach"]',
        'button[aria-label*="attachment"]',
        '[data-testid="chat-compose-attachment-button"]',
        '[data-testid="attach-button"]'
    ];
    
    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
            const rect = element.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                console.log('✅ Attachment button encontrado com seletor:', selector);
                return element;
            }
        }
    }
    
    // Fallback: Procurar por ícone de clip/paperclip próximo ao input
    const allButtons = document.querySelectorAll('button');
    for (const button of allButtons) {
        const svg = button.querySelector('svg');
        if (svg) {
            const ariaLabel = button.getAttribute('aria-label') || '';
            if (ariaLabel.toLowerCase().includes('anexar') || 
                ariaLabel.toLowerCase().includes('attach') ||
                ariaLabel.toLowerCase().includes('file')) {
                const rect = button.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    console.log('✅ Attachment button encontrado (fallback)');
                    return button;
                }
            }
        }
    }
    
    return null;
}

// Encontrar input de arquivo no WhatsApp
function findFileInput() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    for (const input of fileInputs) {
        // File input pode ser hidden, então não verificamos visibilidade
        if (input.parentElement) {
            return input;
        }
    }
    return document.querySelector('input[type="file"]');
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
            
            const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            let lines = [];
            lines.push('Agendamento                             .');
            lines.push(`Data: ${formattedDate}                                               .`);
            lines.push(`Horário: ${time}                                       .`);
            lines.push('');
            lines.push(`| ${customerName}`);
            if (customerPhone) {
                lines.push(`  ${customerPhone}`);
            }
            lines.push('');
            lines.push(`|                                        ${serviceName}`);
            
            const message = lines.join('\n').trim();
            
            currentCatalogForSending = {
                message: message,
                encodedMessage: encodeURIComponent(message)
            };
        });
    });
    
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
    
    document.body.appendChild(form);
}
