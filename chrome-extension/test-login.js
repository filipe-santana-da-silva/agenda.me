// Teste do Endpoint de Login - Execute este código no console da extensão

async function testLoginEndpoint() {
    console.log('=== TESTE DO ENDPOINT DE LOGIN ===\n');
    
    const email = 'seu-email@example.com'; // MUDE AQUI
    const password = 'sua-senha'; // MUDE AQUI
    const apiUrl = 'http://localhost:3000/api';
    
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', '***');
    console.log('🔗 URL:', apiUrl);
    console.log('\n');
    
    try {
        // Teste 1: Novo endpoint
        console.log('1️⃣ Testando /auth/chrome-login...');
        let response = await fetch(`${apiUrl}/auth/chrome-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log('   Status:', response.status);
        console.log('   Headers:', {
            contentType: response.headers.get('content-type'),
            cacheControl: response.headers.get('cache-control'),
        });
        
        const text1 = await response.text();
        console.log('   Resposta (primeiros 500 caracteres):');
        console.log('   ', text1.substring(0, 500));
        console.log('\n');
        
        // Teste 2: Endpoint antigo
        console.log('2️⃣ Testando /auth/login...');
        response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log('   Status:', response.status);
        console.log('   Headers:', {
            contentType: response.headers.get('content-type'),
            cacheControl: response.headers.get('cache-control'),
        });
        
        const text2 = await response.text();
        console.log('   Resposta (primeiros 500 caracteres):');
        console.log('   ', text2.substring(0, 500));
        console.log('\n');
        
        // Teste 3: Verificar se consegue fazer parse
        try {
            const json = JSON.parse(text2);
            console.log('3️⃣ Parse bem-sucedido:');
            console.log('   ', json);
        } catch (e) {
            console.log('3️⃣ ❌ Erro ao fazer parse:', e.message);
        }
        
    } catch (error) {
        console.error('🚨 Erro na requisição:', error);
    }
}

console.log('%c🧪 FERRAMENTA DE DEBUG DE LOGIN', 'color: #667eea; font-size: 14px; font-weight: bold;');
console.log('%cExecute: testLoginEndpoint()', 'color: #25d366;');
console.log('Não esqueça de alterar email e senha no código antes de executar!\n');
