import fs from 'fs/promises'
import path from 'path'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      contratante_info,
      primeira_clausula,
      terceira_clausula,
      data_contrato,
      contratante_nome_assinatura,
    } = body || {}

    // tenta ler logo do public (opcional)
    let logoSvg = ''
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo.svg')
      logoSvg = await fs.readFile(logoPath, 'utf8')
    } catch {
      console.warn('Logo não encontrado ou não pôde ser lido')
    }

    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { font-family: Arial, sans-serif; color: #000; }
          .container { padding: 20px; font-size: 14px; line-height: 1.5; }
          h2 { text-align:center; font-size:18px; margin-bottom:10px }
          h3 { font-size: 16px; margin: 15px 0 10px 0; }
          .pre { white-space: pre-wrap; word-wrap: break-word; }
          .signature { margin-top: 40px; }
          p { margin: 10px 0; }
          ul { margin-left: 20px; }
          li { margin: 5px 0; }
          svg { max-width: 100px; height: auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>
          <div style="text-align:center">${logoSvg}</div>

          <p><strong>CONTRATANTE:</strong></p>
          <div class="pre">${escapeHtml(contratante_info || '')}</div>

          <p><strong>CONTRATADO:</strong> RECREART INDAIATUBA, inscrita no CNPJ nº 51.688.436/0001-56...</p>

          <h3>Cláusula Primeira: Objeto do contrato</h3>
          <div class="pre">${escapeHtml(primeira_clausula || '')}</div>

          <h3>Cláusula Terceira: do preço e das condições de pagamento</h3>
          <div class="pre">${escapeHtml(terceira_clausula || '')}</div>

          <div>
            <p><strong>Data do contrato:</strong></p>
            <p>${formatBrDateForPdf(data_contrato)}</p>
          </div>

          <div class="signature">
            <p>______________________________________<br/>CONTRATANTE<br/>${escapeHtml(contratante_nome_assinatura || '')}</p>
            <p>_________________________________<br/>CONTRATADO<br/>Recreart Indaiatuba</p>
          </div>
        </div>
      </body>
    </html>`

    // Chromium compatível com Vercel
   const browser = await puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath() || '/usr/bin/chromium-browser',
  headless: true,
})


    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForFunction(() => document.readyState === 'complete', { timeout: 30000 })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    })

    await browser.close()

    const outBuf = Buffer.from(pdfBuffer)
    return new Response(outBuf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Contrato_Recreart.pdf"',
        'Content-Length': String(outBuf.length),
      },
    })
  } catch (err) {
    console.error('Erro ao gerar PDF:', err)
    return new Response(JSON.stringify({ error: 'Failed to generate PDF' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      
    })
  }
}

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatBrDateForPdf(iso?: string) {
  if (!iso) return 'Indaiatuba, __ de ________ de ____'
  try {
    const d = new Date(iso)
    const formatted = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(d)
    return `Indaiatuba, ${formatted}`
  } catch {
    return 'Indaiatuba, __ de ________ de ____'
  }
}
