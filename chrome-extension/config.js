// Configurações da extensão Chrome - Recreart Catálogos

// URLs da API
export const CONFIG = {
    // API Dashboard
    API_BASE_URL: 'https://recreart-agenda.vercel.app',
    API_URL: 'https://recreart-agenda.vercel.app/api',
    
    // Supabase
    SUPABASE_URL: 'https://hfggzfsvdrbzzojyjssx.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZ2d6ZnN2ZHJienpvanlzc3giLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyNTAwMDAwMDAwfQ.example',
    
    // WhatsApp Web
    WHATSAPP_WEB_URL: 'https://web.whatsapp.com',
    
    // Storage keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'authToken',
        REFRESH_TOKEN: 'refreshToken',
        USER_EMAIL: 'userEmail',
        USER_ID: 'userId',
        CATALOGS: 'catalogs',
        LAST_SYNC: 'lastSync'
    },
    
    // Timeouts
    TIMEOUTS: {
        WHATSAPP_LOAD: 3000,
        API_REQUEST: 10000
    }
};

export default CONFIG;
