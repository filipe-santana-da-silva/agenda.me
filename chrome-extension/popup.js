// Configurações
const API_URL = 'http://localhost:3000/api';

let userSession = null;
let allCatalogs = [];

// Elementos do DOM
const authContainer = document.getElementById('authContainer');
const mainContainer = document.getElementById('mainContainer');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const syncBtn = document.getElementById('syncBtn');
const catalogsList = document.getElementById('catalogsList');
const authError = document.getElementById('authError');
const appointmentsBtn = document.getElementById('appointmentsBtn');
const appointmentsModal = document.getElementById('appointmentsModal');
const closeModal = document.getElementById('closeModal');
const dateInput = document.getElementById('dateInput');
const loadAppointments = document.getElementById('loadAppointments');
const appointmentsError = document.getElementById('appointmentsError');
const newAppointmentBtn = document.getElementById('newAppointmentBtn');


document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup carregado');
    checkAuth();
    setupEventListeners();
});

function setupEventListeners() {
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    syncBtn.addEventListener('click', syncCatalogs);
    appointmentsBtn.addEventListener('click', showAppointmentsModal);
    closeModal.addEventListener('click', hideAppointmentsModal);
    loadAppointments.addEventListener('click', handleLoadAppointments);
    newAppointmentBtn.addEventListener('click', showNewAppointmentModal);
    
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    // Definir data padrão como hoje
    dateInput.value = new Date().toISOString().split('T')[0];
    
    // Event delegation para botões de catálogos
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-send')) {
            const catalogId = e.target.closest('.catalog-card').dataset.catalogId;
            sendToWhatsApp(catalogId);
        }
        if (e.target.classList.contains('btn-drag')) {
            const card = e.target.closest('.catalog-card');
            const catalogId = card.dataset.catalogId;
            const catalogName = card.querySelector('h3').textContent;
            enableDragMode(catalogId, catalogName);
        }
        if (e.target.classList.contains('btn-reload')) {
            location.reload();
        }
    });
}

// Verificar autenticação
async function checkAuth() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['authToken', 'userEmail'], (data) => {
            if (data.authToken) {
                userSession = {
                    token: data.authToken,
                    email: data.userEmail
                };
                console.log('Usuário autenticado:', data.userEmail);
                showMainContainer();
                loadCatalogs();
            } else {
                console.log('Usuário não autenticado');
                showAuthContainer();
            }
            resolve();
        });
    });
}

function showAuthContainer() {
    authContainer.classList.remove('hidden');
    mainContainer.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    emailInput.focus();
}

function showMainContainer() {
    authContainer.classList.add('hidden');
    mainContainer.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
}

// Login
async function handleLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showError('Preencha email e senha');
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Entrando...';

    try {
        console.log(' Iniciando login...');
        console.log(' Email:', email);
        console.log(' API URL:', API_URL);

        // Tentar primeiro o novo endpoint
        console.log('\n1️ Tentando /auth/chrome-login...');
        let response = await fetch(`${API_URL}/auth/chrome-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        console.log('   Status:', response.status);
        console.log('   OK:', response.ok);
        console.log('   Content-Type:', response.headers.get('content-type'));

        // Se o novo endpoint não funcionar, tentar o antigo
        if (!response.ok && response.status === 404) {
            console.log('\n2️ Endpoint não encontrado, tentando /auth/login...');
            response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            console.log('   Status:', response.status);
            console.log('   OK:', response.ok);
            console.log('   Content-Type:', response.headers.get('content-type'));
        }

        // Verificar se é JSON
        const contentType = response.headers.get('content-type');
        console.log('\n Verificando Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Content-Type inválido:', contentType);
            console.error('Status:', response.status);
            const text = await response.text();
            console.error('Texto da resposta (500 primeiros chars):');
            console.error(text.substring(0, 500));
            throw new Error('Servidor retornou resposta inválida (não é JSON). Verifique os logs do console.');
        }

        console.log('Content-Type é JSON, fazendo parse...');
        const data = await response.json();
        console.log('Parse bem-sucedido');
        console.log('Dados retornados:', {
            success: data.success,
            hasToken: !!data.token,
            hasError: !!data.error,
            hasUser: !!data.user
        });

        if (!response.ok) {
            const errorMsg = data.error || data.message || 'Email ou senha inválidos';
            console.error('Servidor retornou erro:', errorMsg);
            throw new Error(errorMsg);
        }

        if (!data.token) {
            console.error('Nenhum token foi retornado pelo servidor');
            console.error('Dados:', data);
            throw new Error('Nenhum token foi retornado pelo servidor');
        }

        console.log('\n Login bem-sucedido!');
        
        // Atualizar sessão antes de armazenar
        userSession = {
            token: data.token,
            email
        };

        // Armazenar token
        await new Promise((resolve) => {
            chrome.storage.local.set({
                authToken: data.token,
                userEmail: email
            }, resolve);
        });

        console.log('✅ Token armazenado no Chrome Storage');

        clearError();
        emailInput.value = '';
        passwordInput.value = '';
        showMainContainer();
        
        // Aguardar um pouco antes de carregar catálogos
        setTimeout(() => loadCatalogs(), 500);

    } catch (error) {
        console.error('\nERRO NO LOGIN:', error.message);
        console.error('Stack:', error.stack);
        showError(error.message);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Entrar';
    }
}

// Carregar catálogos
async function loadCatalogs() {
    catalogsList.innerHTML = '<div class="loading">Carregando catálogos...</div>';

    try {
        console.log('Carregando catálogos...');
        
        // Se userSession não tem token, tentar recuperar do storage
        if (!userSession || !userSession.token) {
            console.log('⚠️ userSession vazio, recuperando do Chrome Storage...');
            const stored = await new Promise((resolve) => {
                chrome.storage.local.get(['authToken', 'userEmail'], resolve);
            });
            
            if (stored.authToken) {
                userSession = {
                    token: stored.authToken,
                    email: stored.userEmail
                };
                console.log('Token recuperado do storage:', stored.userEmail);
            } else {
                throw new Error('Token não disponível. Faça login novamente.');
            }
        }

        console.log('Token:', userSession.token ? '✅' : '❌');

        const response = await fetch(`${API_URL}/catalogs`, {
            headers: {
                'Authorization': `Bearer ${userSession.token}`
            }
        });

        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));

        if (!response.ok) {
            if (response.status === 401) {
                handleLogout();
                throw new Error('Sua sessão expirou');
            }
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText.substring(0, 200));
            throw new Error('Erro ao carregar catálogos');
        }

        const data = await response.json();
        console.log('Resposta recebida:', typeof data, data);
        
        // Se data é um objeto com propriedade 'catalogs', usar isso
        let catalogs = Array.isArray(data) ? data : (data.catalogs || data.data || []);
        
        if (!Array.isArray(catalogs)) {
            console.warn('Resposta não é um array:', data);
            catalogs = [];
        }

        // Transformar os dados para o formato esperado pela extensão
        catalogs = catalogs.map(catalog => {
            const items = (catalog.items || []).map(item => {
                // Tentar encontrar a imagem em vários lugares possíveis
                const imageUrl = item.detail?.image_url || 
                                item.detail?.imageUrl || 
                                item.image_url || 
                                item.imageUrl || 
                                item.image || 
                                null;
                
                console.log('🔍 Item mapeado:', {
                    name: item.detail?.name,
                    image_url: imageUrl,
                    detail: item.detail
                });
                
                return {
                    id: item.id,
                    name: item.detail?.name || 'Item sem nome',
                    description: item.detail?.description || '',
                    price: item.detail?.price || null,
                    image_url: imageUrl
                };
            });
            return {
                ...catalog,
                items: items
            };
        });

        console.log('Catálogos carregados:', catalogs.length);
        console.log('Primeiro catálogo:', catalogs[0]);
        
        allCatalogs = catalogs;
        renderCatalogs(catalogs);

    } catch (error) {
        console.error('Erro ao carregar catálogos:', error.message);
        catalogsList.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; color: #c33;">
                <p>${error.message}</p>
                <button class="btn-reload" style="margin-top: 12px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Tentar novamente
                </button>
            </div>
        `;
    }
}

async function syncCatalogs() {
    syncBtn.classList.add('loading');
    await loadCatalogs();
    syncBtn.classList.remove('loading');
}

function renderCatalogs(catalogs) {
    if (catalogs.length === 0) {
        catalogsList.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; color: #666;">
                <p>Nenhum catálogo encontrado</p>
                <p style="font-size: 12px; margin-top: 8px;">Crie catálogos no dashboard</p>
            </div>
        `;
        return;
    }

    catalogsList.innerHTML = catalogs.map((catalog, index) => {
        const imageHtml = catalog.image_url ? 
            `<img src="${catalog.image_url}" alt="${catalog.name}" class="catalog-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22sans-serif%22 font-size=%2214%22 fill=%22%23999%22%3ENão disponível%3C/text%3E%3C/svg%3E'"/>` :
            `<div class="catalog-image-placeholder">${catalog.name.charAt(0).toUpperCase()}</div>`;
        
        return `
            <div class="catalog-card" data-catalog-id="${catalog.id}" data-catalog-index="${index}">
                <div class="catalog-header">
                    ${imageHtml}
                    <div class="catalog-info">
                        <h3>${catalog.name}</h3>
                        <p>${catalog.description || 'Sem descrição'}</p>
                    </div>
                </div>
                
                ${catalog.items && catalog.items.length > 0 ? `
                    <div class="catalog-items-grid">
                        <div class="items-container">
                            ${catalog.items.map(item => `
                                <div class="catalog-item">
                                    <div class="item-image-wrapper">
                                        ${item.image_url ?
                                            `<img src="${item.image_url}" alt="${item.name}" class="item-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22%3E%3Crect fill=%22%23ddd%22 width=%2250%22 height=%2250%22/%3E%3C/svg%3E'"/>` :
                                            `<div class="item-image-placeholder">${item.name.charAt(0)}</div>`
                                        }
                                    </div>
                                    <div class="item-details">
                                        <div class="item-name">${item.name}</div>
                                        ${item.price ? `<div class="item-price">R$ ${parseFloat(item.price).toFixed(2)}</div>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : '<div style="font-size: 12px; color: #999; padding: 8px 12px;">Nenhum item</div>'}

                <div class="catalog-card-actions">
                    <button class="btn-small btn-send">
                        Enviar 
                    </button>
                    <button class="btn-small btn-drag">
                        Arrastar 
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function sendToWhatsApp(catalogId) {
    try {
        const catalog = allCatalogs.find(c => c.id === catalogId);
        if (!catalog) {
            alert('Catálogo não encontrado');
            return;
        }

        const message = formatCatalogMessage(catalog);
        const encodedMessage = encodeURIComponent(message);
        
        console.log('📱 Procurando aba do WhatsApp Web...');
        
        // Procurar aba do WhatsApp Web já aberta
        chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
            console.log('Abas encontradas:', tabs ? tabs.length : 0);
            
            if (tabs && tabs.length > 0) {
                const whatsappTab = tabs[0];
                console.log('WhatsApp Web encontrado, aba ID:', whatsappTab.id);
                
                // SEMPRE tentar injetar o content script primeiro
                console.log('🔌 Injetando content script...');
                chrome.scripting.executeScript({
                    target: { tabId: whatsappTab.id },
                    files: ['content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.warn('⚠️ Aviso ao injetar script:', chrome.runtime.lastError);
                    } else {
                        console.log('✅ Content script injetado');
                    }
                    
                    // Aguardar um pouco e enviar a mensagem
                    setTimeout(() => {
                        console.log('📤 Enviando mensagem para WhatsApp Web...');
                        
                        // Ativar a aba do WhatsApp
                        chrome.tabs.update(whatsappTab.id, { active: true, highlighted: true });
                        
                        chrome.tabs.sendMessage(whatsappTab.id, {
                            action: 'sendCatalogMessage',
                            message: message,
                            encodedMessage: encodedMessage,
                            catalog: catalog
                        }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.error('❌ Erro ao enviar para content script:', chrome.runtime.lastError.message);
                                alert('Erro: Recarregue o WhatsApp Web e tente novamente');
                            } else {
                                console.log('✅ Mensagem enviada ao content script');
                            }
                        });
                    }, 300);
                });
            } else {
                alert('⚠️ Por favor, abra o WhatsApp Web (https://web.whatsapp.com) em uma aba primeiro!');
            }
        });

    } catch (error) {
        alert('Erro: ' + error.message);
        console.error('Erro:', error);
    }
}

function enableDragMode(catalogId, catalogName) {
    console.log(' Ativando modo arrastar para catálogo:', catalogId);
    
    // Encontrar o catálogo completo nos dados
    const catalog = allCatalogs.find(c => c.id === catalogId);
    if (!catalog) {
        alert('Catálogo não encontrado');
        return;
    }
    
    console.log('📦 Catálogo encontrado:', catalog);
    console.log('📦 Items do catálogo:', catalog.items);
    console.log('📦 Primeiro item:', catalog.items && catalog.items[0]);
    
    // Primeiro, abrir WhatsApp Web se não estiver aberto
    chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
        if (tabs && tabs.length > 0) {
            // WhatsApp já está aberto
            const tabId = tabs[0].id;
            console.log('🟢 WhatsApp Web já aberto, injetando script...');
            
            // Injetar o content script
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.warn('⚠️ Aviso ao injetar:', chrome.runtime.lastError);
                }
                
                // Aguardar um pouco e enviar mensagem
                setTimeout(() => {
                    console.log('🔄 Enviando ativação de drag mode...');
                    console.log('🔄 Dados completos do catálogo:', JSON.stringify(catalog));
                    chrome.tabs.sendMessage(tabId, {
                        action: 'enableDragMode',
                        catalog: catalog
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error('❌ Erro:', chrome.runtime.lastError.message);
                            alert('Erro: Recarregue o WhatsApp Web');
                        } else {
                            console.log('✅ Modo drag ativado');
                        }
                    });
                }, 300);
            });
        } else {
            // Abrir WhatsApp Web e depois ativar drag mode
            console.log('🔵 Abrindo WhatsApp Web...');
            chrome.tabs.create({ url: 'https://web.whatsapp.com/' }, (tab) => {
                // Aguardar para o WhatsApp carregar
                setTimeout(() => {
                    console.log('⏳ Injetando content script em nova aba...');
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    }, () => {
                        if (chrome.runtime.lastError) {
                            console.warn('⚠️ Aviso ao injetar:', chrome.runtime.lastError);
                        }
                        
                        // Aguardar e enviar mensagem
                        setTimeout(() => {
                            console.log('🔄 Enviando ativação de drag mode...');
                            chrome.tabs.sendMessage(tab.id, {
                                action: 'enableDragMode',
                                catalog: catalog
                            }, (response) => {
                                if (chrome.runtime.lastError) {
                                    console.error('❌ Erro:', chrome.runtime.lastError.message);
                                    alert('Aguarde o WhatsApp Web carregar');
                                } else {
                                    console.log('✅ Modo drag ativado');
                                }
                            });
                        }, 500);
                    });
                }, 3000);
            });
        }
    });
}

function formatCatalogMessage(catalog) {
    // Formato com separador visual |
    let lines = [];
    
    lines.push(catalog.name);
    
    if (catalog.description) {
        lines.push(catalog.description);
    }

    lines.push('');

    if (catalog.items && catalog.items.length > 0) {
        catalog.items.forEach((item) => {
            lines.push(`| ${item.name || 'Item'}`);
            if (item.price) {
                lines.push(`  R$ ${parseFloat(item.price).toFixed(2)}`);
            }
            if (item.description) {
                lines.push(`  ${item.description}`);
            }
            lines.push('');
        });
    }
    
    return lines.join('\n').trim();
}

function showError(message) {
    authError.textContent = message;
    authError.classList.remove('hidden');
}

function clearError() {
    authError.classList.add('hidden');
}

function showAppointmentsModal() {
    appointmentsModal.classList.remove('hidden');
}

function hideAppointmentsModal() {
    appointmentsModal.classList.add('hidden');
    appointmentsError.classList.add('hidden');
}

async function handleLoadAppointments() {
    const selectedDate = dateInput.value;
    if (!selectedDate) {
        showAppointmentsError('Selecione uma data');
        return;
    }
    
    loadAppointments.disabled = true;
    loadAppointments.textContent = 'Carregando...';
    appointmentsError.classList.add('hidden');
    
    try {
        console.log('📅 Carregando agendamentos para:', selectedDate);
        
        const response = await fetch(`${API_URL}/clinic/appointments?date=${selectedDate}`, {
            headers: {
                'Authorization': `Bearer ${userSession.token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                handleLogout();
                throw new Error('Sua sessão expirou');
            }
            throw new Error('Erro ao carregar agendamentos');
        }
        
        const appointments = await response.json();
        console.log('✅ Agendamentos carregados:', appointments.length);
        if (appointments.length > 0) {
            console.log('📝 Primeiro agendamento:', appointments[0]);
        }
        
        // Enviar para WhatsApp Web com retry
        sendAppointmentsToWhatsApp(appointments, selectedDate, 0);
        
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        showAppointmentsError(error.message);
    } finally {
        loadAppointments.disabled = false;
        loadAppointments.textContent = 'Carregar Agendamentos';
    }
}

function sendAppointmentsToWhatsApp(appointments, selectedDate, retryCount = 0) {
    const maxRetries = 3;
    
    chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
        let targetTab = null;
        let isNewTab = false;
        
        if (tabs && tabs.length > 0) {
            targetTab = tabs[0];
            console.log('📱 Usando aba WhatsApp existente:', targetTab.id);
        }
        
        function sendMessage(tab) {
            chrome.tabs.update(tab.id, { active: true });
            console.log(`📤 [Tentativa ${retryCount + 1}/${maxRetries + 1}] Enviando agendamentos para tab ${tab.id}`);
            
            chrome.tabs.sendMessage(tab.id, {
                action: 'showAppointments',
                appointments: appointments,
                date: selectedDate
            }, (response) => {
                if (chrome.runtime.lastError) {
                    const error = chrome.runtime.lastError.message;
                    console.error('❌ Erro ao enviar mensagem:', error);
                    
                    if (retryCount < maxRetries) {
                        console.log(`🔄 Tentando novamente em 2 segundos... (${retryCount + 1}/${maxRetries})`);
                        setTimeout(() => {
                            sendAppointmentsToWhatsApp(appointments, selectedDate, retryCount + 1);
                        }, 2000);
                    } else {
                        showAppointmentsError('Erro ao conectar com WhatsApp. Certifique-se de que a página está carregada e tente novamente.');
                    }
                } else {
                    console.log('✅ Agendamentos enviados com sucesso!');
                    hideAppointmentsModal();
                }
            });
        }
        
        if (targetTab) {
            sendMessage(targetTab);
        } else {
            console.log('📱 Abrindo WhatsApp Web...');
            isNewTab = true;
            chrome.tabs.create({ url: 'https://web.whatsapp.com/' }, (tab) => {
                console.log('✨ Nova aba criada:', tab.id);
                // Esperar mais tempo para nova aba carregar
                setTimeout(() => {
                    sendMessage(tab);
                }, 4000);
            });
        }
    });
}

function showAppointmentsError(message) {
    appointmentsError.textContent = message;
    appointmentsError.classList.remove('hidden');
}

async function showNewAppointmentModal() {
    try {
        console.log('➕ Carregando dados do banco...');
        
        const [customersRes, servicesRes, employeesRes] = await Promise.all([
            fetch(`${API_URL}/customers`, {
                headers: { 'Authorization': `Bearer ${userSession.token}` }
            }),
            fetch(`${API_URL}/services`, {
                headers: { 'Authorization': `Bearer ${userSession.token}` }
            }),
            fetch(`${API_URL}/employees`, {
                headers: { 'Authorization': `Bearer ${userSession.token}` }
            })
        ]);
        
        const customers = customersRes.ok ? await customersRes.json() : [];
        const services = servicesRes.ok ? await servicesRes.json() : [];
        const professionals = employeesRes.ok ? await employeesRes.json() : [];
        
        const formData = {
            customers,
            services,
            professionals,
            token: userSession.token
        };
        
        console.log(' Dados carregados:', { 
            customers: customers.length, 
            services: services.length, 
            professionals: professionals.length 
        });
        
        // Enviar para WhatsApp Web
        chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
            if (tabs && tabs.length > 0) {
                chrome.tabs.update(tabs[0].id, { active: true });
                setTimeout(() => {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'showNewAppointmentForm',
                        formData: formData,
                        apiUrl: API_URL
                    });
                }, 500);
            } else {
                chrome.tabs.create({ url: 'https://web.whatsapp.com/' }, (tab) => {
                    setTimeout(() => {
                        chrome.tabs.sendMessage(tab.id, {
                            action: 'showNewAppointmentForm',
                            formData: formData,
                            apiUrl: API_URL
                        });
                    }, 2000);
                });
            }
        });
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados do formulário');
    }
}





function handleLogout() {
    chrome.storage.local.remove(['authToken', 'userEmail'], () => {
        userSession = null;
        allCatalogs = [];
        catalogsList.innerHTML = '';
        showAuthContainer();
        clearError();
        hideAppointmentsModal();

    });
}
