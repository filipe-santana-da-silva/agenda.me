import fs from 'fs/promises'
import path from 'path'
import puppeteer from 'puppeteer'

let browserInstance: any = null

async function getBrowser() {
  // Try to use chromium from @sparticuz/chromium-min if available (for serverless environments)
  try {
    const chromium = (await import('@sparticuz/chromium-min')).default
    console.log('[PDF] Using @sparticuz/chromium-min')
    const executablePath = await chromium.executablePath()
    return await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: true,
    })
  } catch (e) {
    console.log('[PDF] @sparticuz/chromium-min not available, using system chromium:', e instanceof Error ? e.message : String(e))
    // Fallback to system chromium or bundled one
    return await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      headless: true,
    })
  }
}

export async function POST(req: Request) {
  let browser: any = null
  try {
    console.log('[PDF] Starting PDF generation request...')
    const body = await req.json()
    const { contratante_info, primeira_clausula, terceira_clausula, data_contrato, contratante_nome_assinatura } = body || {}

    // read logo svg from public folder and inline it
    let logoSvg = ''
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo.svg')
      logoSvg = await fs.readFile(logoPath, 'utf8')
      console.log('[PDF] Logo loaded successfully')
    } catch (e) {
      // ignore: logo optional
      console.warn('[PDF] Logo not found or could not be read', e)
    }

    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #000; }
            .container { padding: 20px; font-size: 14px; line-height: 1.5; }
            .center { display:flex; justify-content:center; }
            h2 { text-align:center; font-size:18px; margin:0 0 10px 0 }
          .pre { white-space: pre-wrap; }
          .signature { margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>
          <div class="center">${logoSvg}</div>

          <p><strong>CONTRATANTE:</strong></p>
          <div class="pre">${escapeHtml(contratante_info || '')}</div>

          <p><strong>CONTRATADO:</strong> RECREART INDAIATUBA, inscrita no CNPJ nº 51.688.436/0001-56, com sede em Rua Octacílio Furlan, 659, Jardim Morada do Sol, CEP 13348-52, Indaiatuba, São Paulo.</p>

          <p>As partes acima identificadas têm, entre si, justo e acertado o presente contrato de prestação de serviços, que se regerá pelas cláusulas seguintes:</p>

          <h3>Cláusula Primeira: Objeto do contrato</h3>
          <div class="pre">${escapeHtml(primeira_clausula || '')}</div>

          <h3>Cláusula Segunda: Das obrigações das partes</h3>
          <p><strong>I. Das obrigações do contratante:</strong></p>
          <ul>
            <li>Fornecer ao CONTRATADO todas as informações necessárias e disponibilizar o local para a realização do serviço;</li>
            <li>Efetuar o pagamento na forma e condições estabelecidas neste contrato de prestação de serviços;</li>
            <li>Comunicar a CONTRATADO, de forma imediata e formal, qualquer irregularidade no cumprimento deste contrato;</li>
            <li>Cumprir bem e fielmente as obrigações decorrentes do presente instrumento;</li>
          </ul>

          <p><strong>II. Das obrigações do contratado:</strong></p>
          <ul>
            <li>Fornecer Nota Fiscal de Serviços, referente ao serviço prestado junto ao CONTRATANTE;</li>
            <li>Prestar os serviços com qualidade e dentro do horário contratado;</li>
            <li>Fornecer todo material necessário para execução do serviço;</li>
            <li>Informar o CONTRATANTE sobre qualquer fato que interfira na regularidade do contrato;</li>
            <li>Manter sigilo sobre dados e informações obtidas durante a execução do contrato;</li>
            <li>Coletar consentimento para uso de dados pessoais conforme a LGPD;</li>
            <li>Tratar dados pessoais com base em legítimo interesse e finalidade contratual;</li>
            <li>Cumprir bem e fielmente as obrigações contratuais.</li>
          </ul>

          <h3>Cláusula Terceira: do preço e das condições de pagamento</h3>
          <div class="pre">${escapeHtml(terceira_clausula || '')}</div>

          <h3>Cláusula Quarta: Do inadimplemento contratual</h3>
          <p>Em caso de inadimplemento por parte da CONTRATANTE, incidirá multa de 2%, juros de 1% ao mês e correção monetária.</p>
          <p>§1°. Cobrança judicial: acréscimo de 20% de honorários e custas processuais.</p>
          <p>§2°. Descumprimento contratual: multa de 10% do valor total.</p>

          <h3>Cláusula Quinta: Da rescisão contratual</h3>
          <p>Rescisão imotivada requer aviso prévio de 30 dias.</p>
          <p>§1°. Se a CONTRATANTE rescindir, o CONTRATADO retém 30% do valor.</p>
          <p>§2°. Se o CONTRATADO rescindir, devolução integral ao CONTRATANTE.</p>
          <p>§3°. Rescisão por violação contratual é imediata e pode gerar indenização.</p>
          <p>§4°. Tolerância não configura renúncia ou novação.</p>

          <h3>Cláusula Sexta: Autorização de uso de imagem</h3>
          <p>( ) AUTORIZO o uso de imagens e vídeos do serviço contratado no presente instrumento, destinado a divulgação ao público geral. A presente autorização é concedida a título gratuito, abrangendo o uso das imagens e vídeos acima mencionados em todo território nacional e no exterior, das seguintes formas: fotos, vídeos, folders de propaganda, anúncios em revistas e jornais; home page e redes sociais. Por esta ser a expressão da minha vontade declaro que autorizo o uso acima descrito sem que nada haja a reclamar.</p>
          <p>( ) NÃO AUTORIZO o uso de imagens e vídeos do serviço contratado no presente instrumento, destinado a divulgação ao público geral.</p>

          <h3>Cláusula Sétima: Do foro competente</h3>
          <p>Para dirimir quaisquer controvérsias, as partes elegem o foro da Comarca de Indaiatuba.</p>

          <p>Firmam o presente instrumento, em duas vias de igual teor.</p>

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

    const browser = await getBrowser()
    console.log('[PDF] Browser launched successfully')
    const page = await browser.newPage()
    console.log('[PDF] Page created, setting content...')
    // Use DOMContentLoaded, then wait for full load and images to finish
    try {
      await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 })
      console.log('[PDF] HTML content set, waiting for document ready...')
      // wait until the document reports complete
      await page.waitForFunction(() => document.readyState === 'complete', { timeout: 30000 })
      console.log('[PDF] Document ready, waiting for images...')
      // wait for images to load (if any)
      await page.evaluate(() => Promise.all(Array.from(document.images).map(img => img.complete ? Promise.resolve() : new Promise<void>(res => { img.onload = img.onerror = () => res(); }))))
      console.log('[PDF] Images loaded, generating PDF...')
    } catch (e) {
      console.error('[PDF] Error during page setup:', e)
      try { await browser.close() } catch (er) { /* ignore */ }
      throw e
    }

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' } })
    console.log('[PDF] PDF generated successfully, size:', pdfBuffer.length, 'bytes')
    try { await browser.close() } catch (e) { console.warn('[PDF] Error closing browser:', e) }

    const outBuf = Buffer.from(pdfBuffer)
    return new Response(outBuf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Contrato_Recreart.pdf"',
        'Content-Length': String(outBuf.length),
        'Accept-Ranges': 'bytes',
      },
    })
  } catch (err) {
    console.error('[PDF] PDF generation error:', err instanceof Error ? err.message : String(err))
    console.error('[PDF] Full error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: 'Failed to generate PDF', details: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  } finally {
    // cleanup browser
    if (browser) {
      try {
        await browser.close()
      } catch (e) {
        console.warn('[PDF] Error closing browser in finally:', e)
      }
    }
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
    const formatted = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(d)
    return `Indaiatuba, ${formatted}`
  } catch (e) {
    return 'Indaiatuba, __ de ________ de ____'
  }
}
