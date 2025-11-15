'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export function Content() {
  const [form, setForm] = useState({
    // Editable fields requested
    contratante_info: `CONTRATANTE: , Casada, Brasileira, RG:  CPF: . Contadora. ENDEREÇO: Rua , 366 - Lote N4. Indaiatuba - SP`,
    primeira_clausula: `O objeto desta contratação é a prestação do serviço de atividades de recreação e lazer no dia 07/12/2025 no Condomínio Maria José. O pacote adicionado tem a contratação de 01 recreador, pelo período de 03 horas de serviço, início às 14:00 horas e término às 17:00 e como brinde incluso escultura de balões e contratação do pacote adicional Recreaqua. Conforme solicitação do contratante.`,
    terceira_clausula: `Pagará a CONTRATANTE ao CONTRATADO valor em comum acordo de R$560,00 (Quinhentos e Sessenta reais), prescrito no formulário referente aos serviços efetivamente prestados. Sendo pago 30% do valor na data de 21/10/2025 e o restante a ser realizado até 07/12/2025. O pagamento poderá ser realizados das seguintes formas: Transferência bancária; Depósito bancário; Pix; Crédito com a taxa de juros proporcional.`,
  data_contrato: '',
  contratante_nome_assinatura: 'Michelle Stefany Silva Egydio',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }


  const gerarPDF = async () => {
    try {
      const res = await fetch('/api/contratos/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        // try to read json error details
        const data = await res.json().catch(() => ({}))
        const errorMsg = data?.details || data?.error || 'Erro desconhecido'
        throw new Error(`Servidor retornou erro ao gerar PDF: ${res.status} - ${errorMsg}`)
      }

      const contentType = (res.headers.get('content-type') || '').toLowerCase()
      if (contentType.includes('application/json')) {
        // server returned the HTML for client-side rendering
        const data = await res.json().catch(() => ({}))
        if (!data || !data.html) throw new Error('Resposta inválida do servidor ao gerar PDF')

        // dynamic import to avoid SSR issues
        const html2pdf: any = (await import('html2pdf.js')).default

        // create off-screen container with the HTML
        const container = document.createElement('div')
        container.style.position = 'fixed'
        container.style.left = '-9999px'
        container.style.top = '0'
        container.style.width = '800px'
        container.innerHTML = data.html
        document.body.appendChild(container)

        // Inline computed colors/styles to avoid html2canvas errors parsing modern color() functions (eg. lab())
        try {
          const inlineComputedStyles = (root: HTMLElement) => {
            const els = Array.from(root.querySelectorAll<HTMLElement>('*'))
            // include root itself
            els.unshift(root)
            for (const el of els) {
              try {
                const cs = getComputedStyle(el)
                if (cs) {
                  if (cs.color) el.style.color = cs.color
                  if (cs.backgroundColor && cs.backgroundColor !== 'transparent' && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') el.style.backgroundColor = cs.backgroundColor
                  if (cs.borderColor && cs.borderColor !== 'transparent') el.style.borderColor = cs.borderColor
                }
              } catch (e) {
                // ignore elements that throw on getComputedStyle
              }
            }
          }

          // Allow the browser to compute styles before reading them
          await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)))
          inlineComputedStyles(container)

          await html2pdf().from(container).set({ filename: 'Contrato_Recreart.pdf' }).save()
        } finally {
          document.body.removeChild(container)
        }
        return
      }

      // otherwise assume a PDF blob was returned
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Contrato_Recreart.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Erro ao gerar PDF via servidor:', err)
      alert(`Erro ao gerar o PDF no servidor: ${err instanceof Error ? err.message : String(err)}. Veja o console do navegador para detalhes.`)
    }
  }

  const formatBrDate = (iso?: string) => {
    if (!iso) return 'Indaiatuba, __ de ________ de ____'
    try {
      const d = new Date(iso)
    d.setDate(d.getDate() + 1)
      const formatted = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(d)
      // capitalise month (Intl already returns lowercase month; keep as in example)
      return `Indaiatuba, ${formatted}`
    } catch (e) {
      return 'Indaiatuba, __ de ________ de ____'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contrato de Prestação de Serviços</CardTitle>
      </CardHeader>
      <CardContent>
        <div id="contrato" className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-bold text-center">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>

          {/* centered logo from public/logo.svg */}
          <div className="flex justify-center">
            <img src="/logo.svg" alt="logo" className="h-28 object-contain" />
          </div>

          <p>
            <strong>CONTRATANTE:</strong>
            <Textarea name="contratante_info" value={form.contratante_info} onChange={handleChange} className="mt-2" />
          </p>

          <p><strong>CONTRATADO:</strong> RECREART INDAIATUBA, inscrita no CNPJ nº 51.688.436/0001-56, com sede em Rua Octacílio Furlan, 659, Jardim Morada do Sol, CEP 13348-52, Indaiatuba, São Paulo.</p>

          <p>As partes acima identificadas têm, entre si, justo e acertado o presente contrato de prestação de serviços, que se regerá pelas cláusulas seguintes:</p>

          <h3>Cláusula Primeira: Objeto do contrato</h3>
          <p>
            <Textarea name="primeira_clausula" value={form.primeira_clausula} onChange={handleChange} className="w-full" />
          </p>

          <h3>Cláusula Segunda: Das obrigações das partes</h3>
          <p><strong>I. Das obrigações do contratante:</strong></p>
          <ul className="list-disc pl-6">
            <li>Fornecer ao CONTRATADO todas as informações necessárias e disponibilizar o local para a realização do serviço;</li>
            <li>Efetuar o pagamento na forma e condições estabelecidas neste contrato de prestação de serviços;</li>
            <li>Comunicar a CONTRATADO, de forma imediata e formal, qualquer irregularidade no cumprimento deste contrato;</li>
            <li>Cumprir bem e fielmente as obrigações decorrentes do presente instrumento;</li>
          </ul>

          <p><strong>II. Das obrigações do contratado:</strong></p>
          <ul className="list-disc pl-6">
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
          <p>
            <Textarea name="terceira_clausula" value={form.terceira_clausula} onChange={handleChange} className="w-full" />
          </p>

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
          <p>
            ( ) AUTORIZO o uso de imagens e vídeos do serviço contratado no presente instrumento, destinado a divulgação ao público geral. A presente autorização é concedida a título gratuito, abrangendo o uso das imagens e vídeos acima mencionados em todo território nacional e no exterior, das seguintes formas: fotos, vídeos, folders de propaganda, anúncios em revistas e jornais; home page e redes sociais. Por esta ser a expressão da minha vontade declaro que autorizo o uso acima descrito sem que nada haja a reclamar.
          </p>
          <p>
            ( ) NÃO AUTORIZO o uso de imagens e vídeos do serviço contratado no presente instrumento, destinado a divulgação ao público geral.
          </p>

          <h3>Cláusula Sétima: Do foro competente</h3>
          <p>Para dirimir quaisquer controvérsias, as partes elegem o foro da Comarca de Indaiatuba.</p>

          <p>Firmam o presente instrumento, em duas vias de igual teor.</p>

          <div>
            <label className="block text-sm text-muted-foreground">Editar data do contrato</label>
            <Input name="data_contrato" type="date" value={form.data_contrato} onChange={handleChange} className="inline w-auto mt-1" />
          </div>
          <p className="mt-2">{formatBrDate(form.data_contrato)}</p>

          <p className="mt-8">______________________________________<br />CONTRATANTE<br />
            <Input name="contratante_nome_assinatura" value={form.contratante_nome_assinatura} onChange={handleChange} className="mt-2 w-80" />
          </p>
          <p className="mt-8">_________________________________<br />CONTRATADO<br />Recreart Indaiatuba</p>
        </div>


      </CardContent>
        <div className="px-6 pb-6">
          <Button onClick={gerarPDF}>Gerar PDF do contrato</Button>
        </div>
      </Card>
  )
}
