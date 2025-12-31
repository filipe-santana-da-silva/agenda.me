// Recreart Catálogos - Background Service Worker

console.log('Background Service Worker iniciado');

// Cache para jsPDF para não recarregar a cada PDF
let jsPDFCache = null;
let jsPDFLoadPromise = null;

// Responder a eventos de instalação
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extensão instalada/atualizada');
});

// Garantir que a extensão não bloqueie outras abas
chrome.tabs.onUpdated.addListener(() => {
    // A extensão só se injeta em web.whatsapp.com via content_scripts
    // Nenhuma ação bloqueante aqui
});

// Carregar e usar jsPDF do arquivo local
async function loadjsPDFLibrary() {
    if (jsPDFCache) {
        return Promise.resolve(jsPDFCache);
    }
    
    if (jsPDFLoadPromise) {
        return jsPDFLoadPromise;
    }
    
    jsPDFLoadPromise = new Promise(async (resolve, reject) => {
        try {
            console.log('📥 Carregando jsPDF do arquivo...');
            const url = chrome.runtime.getURL('jspdf.min.js');
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro ao buscar jsPDF: ${response.status}`);
            }
            
            const scriptText = await response.text();
            console.log('📖 Arquivo carregado:', scriptText.length, 'bytes');
            
            // Executar o script em um novo escopo que retorna jsPDF
            const scriptFunc = new Function('return (' + scriptText + ')');
            const jsPDFModule = scriptFunc();
            
            if (jsPDFModule && jsPDFModule.jsPDF) {
                console.log('✅ jsPDF carregado com sucesso');
                jsPDFCache = jsPDFModule.jsPDF;
                jsPDFLoadPromise = null;
                resolve(jsPDFCache);
            } else {
                throw new Error('jsPDF não encontrado no módulo');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar jsPDF:', error);
            jsPDFLoadPromise = null;
            reject(error);
        }
    });
    
    return jsPDFLoadPromise;
}

// Gerar PDF usando jsPDF
async function generatePDFWithjsPDF(catalog) {
    try {
        console.log('📄 Gerando PDF com jsPDF...');
        
        const jsPDFLib = await loadjsPDFLibrary();
        
        const doc = new jsPDFLib({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        let yPos = margin + 10;
        
        // Título
        doc.setFontSize(20);
        doc.setTextColor(102, 126, 234);
        doc.text(catalog.name || 'Catálogo', margin, yPos);
        yPos += 12;
        
        // Descrição
        if (catalog.description) {
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            const lines = doc.splitTextToSize(catalog.description, pageWidth - (2 * margin));
            doc.text(lines, margin, yPos);
            yPos += lines.length * 4 + 5;
        }
        
        // Linha separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;
        
        // Itens
        if (catalog.items && catalog.items.length > 0) {
            for (let i = 0; i < catalog.items.length; i++) {
                const item = catalog.items[i];
                
                if (yPos > pageHeight - 20) {
                    doc.addPage();
                    yPos = margin;
                }
                
                // Nome
                doc.setFontSize(12);
                doc.setTextColor(50, 50, 50);
                doc.text(`${i + 1}. ${item.name || 'Item'}`, margin, yPos);
                yPos += 6;
                
                // Preço
                if (item.price) {
                    doc.setFontSize(11);
                    doc.setTextColor(102, 126, 234);
                    doc.text(`R$ ${parseFloat(item.price).toFixed(2)}`, margin + 5, yPos);
                    yPos += 5;
                }
                
                // Descrição
                if (item.description) {
                    doc.setFontSize(9);
                    doc.setTextColor(120, 120, 120);
                    const itemLines = doc.splitTextToSize(item.description.substring(0, 100), pageWidth - (2 * margin) - 10);
                    doc.text(itemLines, margin + 5, yPos);
                    yPos += itemLines.length * 3 + 3;
                }
                
                yPos += 3;
            }
        }
        
        // Gerar como data URL
        const pdfDataUrl = doc.output('dataurlstring');
        console.log('✅ PDF gerado com sucesso');
        return pdfDataUrl;
        
    } catch (error) {
        console.error('❌ Erro ao gerar PDF com jsPDF:', error);
        throw error;
    }
}

// Gerar um PDF simples como fallback
function generateSimplePDF(catalog) {
    try {
        console.log('📄 Gerando PDF simples como fallback...');
        
        let streamContent = 'BT\n/F1 20 Tf\n50 750 Td\n';
        streamContent += `(${escapeString(catalog.name)}) Tj\n`;
        streamContent += 'ET\n\n';
        
        let yPos = 720;
        
        if (catalog.description && yPos > 100) {
            streamContent += 'BT\n/F1 10 Tf\n50 ' + yPos + ' Td\n';
            streamContent += `(${escapeString(catalog.description.substring(0, 70))}) Tj\n`;
            streamContent += 'ET\n\n';
            yPos -= 20;
        }
        
        if (catalog.items && catalog.items.length > 0) {
            for (let i = 0; i < Math.min(catalog.items.length, 10) && yPos > 100; i++) {
                const item = catalog.items[i];
                
                streamContent += 'BT\n/F1 11 Tf\n50 ' + yPos + ' Td\n';
                streamContent += `(${i + 1}. ${escapeString(item.name || 'Item')}) Tj\n`;
                streamContent += 'ET\n';
                yPos -= 15;
                
                if (item.price && yPos > 100) {
                    streamContent += 'BT\n/F1 10 Tf\n70 ' + yPos + ' Td\n';
                    streamContent += `(R$ ${parseFloat(item.price).toFixed(2)}) Tj\n`;
                    streamContent += 'ET\n';
                    yPos -= 12;
                }
            }
        }
        
        const pdf = createValidPDF(streamContent);
        return pdf;
    } catch (error) {
        console.error('❌ Erro ao gerar PDF simples:', error);
        throw error;
    }
}

function escapeString(str) {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/[\r\n]/g, ' ')
        .substring(0, 80);
}

function createValidPDF(streamContent) {
    const parts = [];
    const offsets = [];
    
    const header = '%PDF-1.4\n';
    parts.push(header);
    
    offsets[1] = parts.join('').length;
    parts.push('1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n');
    
    offsets[2] = parts.join('').length;
    parts.push('2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n');
    
    offsets[3] = parts.join('').length;
    parts.push('3 0 obj\n<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>>>\nendobj\n');
    
    offsets[4] = parts.join('').length;
    parts.push(`4 0 obj\n<</Length ${streamContent.length}>>\nstream\n${streamContent}\nendstream\nendobj\n`);
    
    offsets[5] = parts.join('').length;
    parts.push('5 0 obj\n<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>\nendobj\n');
    
    const xrefOffset = parts.join('').length;
    let xref = 'xref\n0 6\n0000000000 65535 f \n';
    for (let i = 1; i <= 5; i++) {
        xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    }
    parts.push(xref);
    
    parts.push(`trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF`);
    
    return parts.join('');
}

// Listener para mensagens do content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'generatePDF') {
        console.log('📨 Recebido pedido de geração PDF para:', request.catalog.name);
        
        // Tentar primeiro com jsPDF (melhor qualidade)
        generatePDFWithjsPDF(request.catalog)
            .then(async (pdfDataUrl) => {
                console.log('✅ PDF gerado com sucesso (jsPDF)');
                sendResponse({ success: true, pdfDataUrl });
            })
            .catch(async () => {
                console.warn('⚠️ jsPDF falhou, usando fallback simples');
                try {
                    const pdfBlob = generateSimplePDF(request.catalog);
                    const reader = new FileReader();
                    reader.onload = () => {
                        console.log('✅ PDF fallback gerado');
                        sendResponse({ success: true, pdfDataUrl: reader.result });
                    };
                    reader.readAsDataURL(pdfBlob);
                } catch (fallbackError) {
                    console.error('❌ Erro no fallback:', fallbackError);
                    sendResponse({ success: false, error: fallbackError.message });
                }
            });
        
        return true; // Manter o canal aberto para resposta assíncrona
    }
});

