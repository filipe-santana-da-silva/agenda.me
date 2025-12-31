// Configurações
const API_URL = 'http://localhost:3000/api';

let userSession = null;

// Elementos do DOM
const authContainer = document.getElementById('authContainer');
const mainContainer = document.getElementById('mainContainer');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const syncBtn = document.getElementById('syncBtn');
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
    
    // Event delegation para botões gerais
    document.addEventListener('click', (e) => {
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
// Funções de agendamentos
async function loadCatalogs() {
    // Função mantida vazia para compatibilidade, mas catálogos não são mais exibidos
}

// Funções de agendamentos
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
