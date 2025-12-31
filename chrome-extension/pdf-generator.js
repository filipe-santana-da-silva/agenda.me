/**
 * PDF Generator para Catálogos - Usando jsPDF via CDN
 * Carrega jsPDF dinamicamente do CDN e gera PDFs reais
 */

// Função para carregar jsPDF dinamicamente do CDN
function loadjsPDFFromCDN() {
    return new Promise((resolve, reject) => {
        // Se jsPDF já está carregado, retorna imediatamente
        if (window.jsPDF) {
            console.log('✅ jsPDF já está carregado');
            resolve(window.jsPDF);
            return;
        }

        console.log('📥 Carregando jsPDF do CDN...');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.async = true;
        
        script.onload = () => {
            console.log('✅ jsPDF carregado do CDN com sucesso');
            if (window.jsPDF) {
                resolve(window.jsPDF);
            } else {
                // Às vezes o jsPDF fica em window.jspdf (minúsculo)
                setTimeout(() => {
                    if (window.jsPDF || window.jspdf) {
                        resolve(window.jsPDF || window.jspdf);
                    } else {
                        reject(new Error('jsPDF não foi definido após carregamento'));
                    }
                }, 500);
            }
        };
        
        script.onerror = (error) => {
            console.error('❌ Erro ao carregar jsPDF do CDN:', error);
            reject(new Error('Falha ao carregar jsPDF: ' + (error?.message || 'Erro desconhecido')));
        };
        
        document.head.appendChild(script);
    });
}

// Função para gerar PDF do catálogo com jsPDF
async function generateCatalogPDF(catalog) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('📄 Iniciando geração do PDF para catálogo:', catalog.name);
            
            // Carregar jsPDF do CDN
            const jsPDFModule = await loadjsPDFFromCDN();
            
            // Extrair o construtor jsPDF
            const jsPDFConstructor = jsPDFModule.jsPDF || jsPDFModule;
            
            console.log('✅ jsPDF carregado e pronto para uso');
            
            // Criar instância do jsPDF
            const doc = new jsPDFConstructor({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            console.log('✅ Documento PDF criado');
            
            // Configurações
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            let yPosition = margin;
            
            // Titulo do catálogo
            doc.setFontSize(24);
            doc.setTextColor(102, 126, 234); // Azul #667eea
            doc.text(catalog.name, margin, yPosition);
            yPosition += 12;
            
            // Descrição
            if (catalog.description) {
                doc.setFontSize(11);
                doc.setTextColor(100, 100, 100);
                const descLines = doc.splitTextToSize(catalog.description, pageWidth - (2 * margin));
                doc.text(descLines, margin, yPosition);
                yPosition += (descLines.length * 5) + 5;
            }
            
            // Linha divisória
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;
            
            // Itens do catálogo
            if (catalog.items && catalog.items.length > 0) {
                console.log('📦 Adicionando ' + catalog.items.length + ' items ao PDF');
                
                for (let i = 0; i < catalog.items.length; i++) {
                    const item = catalog.items[i];
                    
                    // Verificar se precisa de nova página
                    if (yPosition > pageHeight - 20) {
                        console.log('📄 Criando nova página');
                        doc.addPage();
                        yPosition = margin;
                    }
                    
                    // Nome do item
                    doc.setFontSize(13);
                    doc.setTextColor(50, 50, 50);
                    doc.text((i + 1) + '. ' + (item.name || 'Item sem nome'), margin, yPosition);
                    yPosition += 7;
                    
                    // Preço
                    if (item.price) {
                        doc.setFontSize(14);
                        doc.setTextColor(102, 126, 234); // Azul
                        doc.text('R$ ' + parseFloat(item.price).toFixed(2), margin + 5, yPosition);
                        yPosition += 7;
                    }
                    
                    // Descrição
                    if (item.description) {
                        doc.setFontSize(10);
                        doc.setTextColor(120, 120, 120);
                        const itemLines = doc.splitTextToSize(item.description, pageWidth - (2 * margin) - 10);
                        doc.text(itemLines, margin + 5, yPosition);
                        yPosition += (itemLines.length * 4) + 3;
                    }
                    
                    yPosition += 5;
                    
                    // Linha separadora
                    doc.setDrawColor(240, 240, 240);
                    doc.line(margin, yPosition, pageWidth - margin, yPosition);
                    yPosition += 5;
                }
            }
            
            // Rodapé com data
            const totalPages = doc.internal.pages.length - 1;
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(9);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    `Página ${i} de ${totalPages} | Catálogo gerado em: ${new Date().toLocaleString('pt-BR')}`,
                    margin,
                    pageHeight - 10
                );
            }
            
            // Gerar blob do PDF
            const pdfBlob = doc.output('blob');
            console.log('✅ PDF gerado com sucesso:', pdfBlob.size, 'bytes');
            resolve(pdfBlob);
            
        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
            reject(error);
        }
    });
}

// Função para enviar PDF via WhatsApp
async function sendPDFToWhatsApp(pdfBlob, catalogName) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('📤 Preparando envio de PDF...');
            
            // Aguardar o input de mensagem estar pronto
            let messageInput = null;
            try {
                messageInput = await waitForMessageInput();
            } catch (e) {
                console.log('⚠️ Input de mensagem não encontrado, continuando com envio de arquivo');
            }
            
            // Procurar pelo botão de attachment
            console.log('🔍 Procurando botão de attachment...');
            let attachmentButton = findAttachmentButton();
            
            if (!attachmentButton) {
                console.log('⚠️ Botão de attachment não encontrado, tentando abrir dialog de arquivo...');
                // Fallback: Tentar clicar em qualquer botão que pareça ser de anexo
                attachmentButton = document.querySelector('[aria-label*="Attach"]') || 
                                  document.querySelector('[aria-label*="anexar"]') ||
                                  document.querySelector('button[data-testid*="attach"]');
            }
            
            if (attachmentButton) {
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
                
            } else {
                console.warn('⚠️ Nenhum botão de attachment encontrado');
                reject(new Error('Não foi possível encontrar o botão de anexo do WhatsApp'));
            }
            
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
