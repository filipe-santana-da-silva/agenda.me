// Script de teste para a API de login
// Abra o console (F12) e execute este código para testar a conexão

async function testLogin() {
    console.log('🔍 Testando endpoint de login...');
    
    try {
        const response = await fetch('https://recreart-agenda.vercel.app/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'seu-email@example.com',
                password: 'sua-senha'
            })
        });

        console.log('📡 Status:', response.status);
        console.log('📋 Headers:', {
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length')
        });

        const text = await response.text();
        console.log('📝 Resposta (texto):', text);

        try {
            const json = JSON.parse(text);
            console.log('✅ Resposta (JSON):', json);
        } catch (e) {
            console.error('❌ Não é um JSON válido');
        }

    } catch (error) {
        console.error('🚨 Erro na requisição:', error);
    }
}

async function testCatalogs(token) {
    console.log('🔍 Testando endpoint de catálogos...');
    
    try {
        const response = await fetch('https://recreart-agenda.vercel.app/api/catalogs', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📡 Status:', response.status);
        console.log('📋 Headers:', {
            contentType: response.headers.get('content-type'),
        });

        const text = await response.text();
        console.log('📝 Resposta (texto):', text.substring(0, 200));

        try {
            const json = JSON.parse(text);
            console.log('✅ Catálogos:', json);
        } catch (e) {
            console.error('❌ Não é um JSON válido');
        }

    } catch (error) {
        console.error('🚨 Erro na requisição:', error);
    }
}

console.log('%c Ferramentas de Debug Carregadas', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('%ctestLogin() - Testa o endpoint de login', 'color: #25d366;');
console.log('%ctestCatalogs(token) - Testa o endpoint de catálogos', 'color: #25d366;');
console.log('%cExemplo: testLogin()', 'color: #999;');
