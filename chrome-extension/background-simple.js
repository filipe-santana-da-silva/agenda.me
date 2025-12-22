// Recreart Catálogos - Background Service Worker

console.log('Background Service Worker iniciado');

// Ouvir mensagens
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Mensagem recebida:', message);
    sendResponse({ received: true });
});

// Responder a eventos de instalação
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extensão instalada/atualizada');
});
