// Recreart Catálogos - Background Service Worker

console.log('Background Service Worker iniciado');

// Responder a eventos de instalação
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extensão instalada/atualizada');
});

// Garantir que a extensão não bloqueie outras abas
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // A extensão só se injeta em web.whatsapp.com via content_scripts
    // Nenhuma ação bloqueante aqui
});
