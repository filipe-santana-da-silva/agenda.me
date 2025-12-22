// Recreart Catálogos - Background Service Worker

console.log('Background Service Worker iniciado');

// Responder a eventos de instalação
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extensão instalada/atualizada');
});
