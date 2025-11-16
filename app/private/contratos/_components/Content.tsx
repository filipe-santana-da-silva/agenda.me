'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { jsPDF } from 'jspdf'

// utilitário para carregar imagem como base64
const loadImageAsBase64 = async (url: string) => {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}

export function Content() {
  const [form, setForm] = useState({
    contratante_info: `CONTRATANTE: , Casada, Brasileira, RG:  CPF: . Contadora. ENDEREÇO: Rua , 366 - Lote N4. Indaiatuba - SP`,
    primeira_clausula: `O objeto desta contratação é a prestação do serviço de atividades de recreação e lazer no dia 07/12/2025 no Condomínio Maria José...`,
    terceira_clausula: `Pagará a CONTRATANTE ao CONTRATADO valor em comum acordo de R$560,00...`,
    data_contrato: '',
    contratante_nome_assinatura: 'Michelle Stefany Silva Egydio',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const formatBrDate = (iso?: string) => {
    if (!iso) return 'Indaiatuba, __ de ________ de ____'
    try {
      const d = new Date(iso)
      d.setDate(d.getDate() + 1)
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

  const gerarPDF = async () => {
    const doc = new jsPDF()

    // adiciona logo (use logo.png em /public)
    try {
      const logoBase64 = await loadImageAsBase64('/logo.png')
      doc.addImage(logoBase64, 'PNG', 90, 10, 30, 30) // centralizado no topo
    } catch {
      console.warn('Logo não encontrado')
    }

    doc.setFontSize(16)
    doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', 105, 50, { align: 'center' })

    doc.setFontSize(12)
    doc.text('CONTRATANTE:', 20, 70)
    doc.text(form.contratante_info || '', 20, 80, { maxWidth: 170 })

    doc.text(
      'CONTRATADO: RECREART INDAIATUBA, inscrita no CNPJ nº 51.688.436/0001-56, com sede em Rua Octacílio Furlan, 659, Jardim Morada do Sol, CEP 13348-52, Indaiatuba, São Paulo.',
      20,
      100,
      { maxWidth: 170 }
    )

    doc.text('As partes acima identificadas têm, entre si, justo e acertado o presente contrato de prestação de serviços, que se regerá pelas cláusulas seguintes:', 20, 115, { maxWidth: 170 })

    // Cláusula Primeira
    doc.setFontSize(14)
    doc.text('Cláusula Primeira: Objeto do contrato', 20, 130)
    doc.setFontSize(12)
    doc.text(form.primeira_clausula || '', 20, 140, { maxWidth: 170 })

    // Cláusula Segunda
    doc.setFontSize(14)
    doc.text('Cláusula Segunda: Das obrigações das partes', 20, 160)
    doc.setFontSize(12)
    doc.text('I. Das obrigações do contratante:', 20, 170)
    doc.text('- Fornecer ao CONTRATADO todas as informações necessárias...', 25, 180, { maxWidth: 170 })
    doc.text('- Efetuar o pagamento na forma e condições estabelecidas...', 25, 190, { maxWidth: 170 })
    doc.text('- Comunicar ao CONTRATADO qualquer irregularidade...', 25, 200, { maxWidth: 170 })
    doc.text('- Cumprir bem e fielmente as obrigações...', 25, 210, { maxWidth: 170 })

    doc.text('II. Das obrigações do contratado:', 20, 225)
    doc.text('- Fornecer Nota Fiscal de Serviços...', 25, 235, { maxWidth: 170 })
    doc.text('- Prestar os serviços com qualidade...', 25, 245, { maxWidth: 170 })
    doc.text('- Fornecer todo material necessário...', 25, 255, { maxWidth: 170 })
    doc.text('- Informar o CONTRATANTE sobre qualquer fato...', 25, 265, { maxWidth: 170 })
    doc.text('- Manter sigilo sobre dados e informações...', 25, 275, { maxWidth: 170 })
    doc.text('- Coletar consentimento conforme LGPD...', 25, 285, { maxWidth: 170 })
    doc.text('- Tratar dados pessoais com base em legítimo interesse...', 25, 295, { maxWidth: 170 })
    doc.text('- Cumprir bem e fielmente as obrigações contratuais.', 25, 305, { maxWidth: 170 })

    // nova página
    doc.addPage()

    // Cláusula Terceira
    doc.setFontSize(14)
    doc.text('Cláusula Terceira: Do preço e das condições de pagamento', 20, 30)
    doc.setFontSize(12)
    doc.text(form.terceira_clausula || '', 20, 40, { maxWidth: 170 })

    // Cláusula Quarta
    doc.setFontSize(14)
    doc.text('Cláusula Quarta: Do inadimplemento contratual', 20, 70)
    doc.setFontSize(12)
    doc.text('Em caso de inadimplemento por parte da CONTRATANTE, incidirá multa de 2%, juros de 1% ao mês e correção monetária.', 20, 80, { maxWidth: 170 })
    doc.text('§1º. Cobrança judicial: acréscimo de 20% de honorários e custas processuais.', 20, 90, { maxWidth: 170 })
    doc.text('§2º. Descumprimento contratual: multa de 10% do valor total.', 20, 100, { maxWidth: 170 })

    // Cláusula Quinta
    doc.setFontSize(14)
    doc.text('Cláusula Quinta: Da rescisão contratual', 20, 120)
    doc.setFontSize(12)
    doc.text('Rescisão imotivada requer aviso prévio de 30 dias.', 20, 130, { maxWidth: 170 })
    doc.text('§1º. Se a CONTRATANTE rescindir, o CONTRATADO retém 30% do valor.', 20, 140, { maxWidth: 170 })
    doc.text('§2º. Se o CONTRATADO rescindir, devolução integral ao CONTRATANTE.', 20, 150, { maxWidth: 170 })
    doc.text('§3º. Rescisão por violação contratual é imediata e pode gerar indenização.', 20, 160, { maxWidth: 170 })
    doc.text('§4º. Tolerância não configura renúncia ou novação.', 20, 170, { maxWidth: 170 })

    // Cláusula Sexta
    doc.setFontSize(14)
    doc.text('Cláusula Sexta: Autorização de uso de imagem', 20, 190)
    doc.setFontSize(12)
    doc.text('( ) AUTORIZO o uso de imagens e vídeos...', 20, 200, { maxWidth: 170 })
    doc.text('( ) NÃO AUTORIZO o uso de imagens e vídeos...', 20, 210, { maxWidth: 170 })

    // Cláusula Sétima
    doc.setFontSize(14)
    doc.text('Cláusula Sétima: Do foro competente', 20, 230)
    doc.setFontSize(12)
    doc.text('Para dirimir quaisquer controvérsias, as partes elegem o foro da Comarca de Indaiatuba.', 20, 240, { maxWidth: 170 })

    doc.text('Firmam o presente instrumento, em duas vias de igual teor.', 20, 250, { maxWidth: 170 })

    // Data
    doc.text('Data do contrato:', 20, 270)
    doc.text(formatBrDate(form.data_contrato), 20, 280)

   // assinaturas
    doc.text('______________________________________', 20, 260)
    doc.text('CONTRATANTE', 20, 270)
    doc.text(form.contratante_nome_assinatura || '', 20, 280)

    doc.text('______________________________________', 120, 260)
    doc.text('CONTRATADO', 120, 270)
    doc.text('Recreart Indaiatuba', 120, 280)


    // finalize and save PDF
    doc.save('Contrato_Recreart.pdf')
  }

  return (
    <div>
      <Card>
      <CardHeader>
        <CardTitle>Contrato de Prestação de Serviços</CardTitle>
      </CardHeader>
      <CardContent>
        <div id="contrato" className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-bold text-center">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>

          <div className="flex justify-center">
            <img src="/logo.svg" alt="logo" className="h-28 object-contain" />
          </div>

          <p><strong>CONTRATANTE:</strong></p>
          <Textarea
            name="contratante_info"
            value={form.contratante_info}
            onChange={handleChange}
            className="w-full"
          />

          <p><strong>CONTRATADO:</strong> RECREART INDAIATUBA, inscrita no CNPJ nº 51.688.436/0001-56,
            com sede em Rua Octacílio Furlan, 659, Jardim Morada do Sol, CEP 13348-52, Indaiatuba, São Paulo.
          </p>

          <p>As partes acima identificadas têm, entre si, justo e acertado o presente contrato de prestação
            de serviços, que se regerá pelas cláusulas seguintes:
          </p>

          <h3>Cláusula Primeira: Objeto do contrato</h3>
          <Textarea
            name="primeira_clausula"
            value={form.primeira_clausula}
            onChange={handleChange}
            className="w-full"
          />

          <h3>Cláusula Segunda: Das obrigações das partes</h3>
          <p><strong>I. Das obrigações do contratante:</strong></p>
          <ul className="list-disc pl-6">
            <li>Fornecer ao CONTRATADO todas as informações necessárias e disponibilizar o local para a realização do serviço;</li>
            <li>Efetuar o pagamento na forma e condições estabelecidas neste contrato de prestação de serviços;</li>
            <li>Comunicar ao CONTRATADO, de forma imediata e formal, qualquer irregularidade no cumprimento deste contrato;</li>
            <li>Cumprir bem e fielmente as obrigações decorrentes do presente instrumento;</li>
          </ul>

          <p><strong>II. Das obrigações do contratado:</strong></p>
          <ul className="list-disc pl-6">
            <li>Fornecer Nota Fiscal de Serviços referente ao serviço prestado junto ao CONTRATANTE;</li>
            <li>Prestar os serviços com qualidade e dentro do horário contratado;</li>
            <li>Fornecer todo material necessário para execução do serviço;</li>
            <li>Informar o CONTRATANTE sobre qualquer fato que interfira na regularidade do contrato;</li>
            <li>Manter sigilo sobre dados e informações obtidas durante a execução do contrato;</li>
            <li>Coletar consentimento para uso de dados pessoais conforme a LGPD;</li>
            <li>Tratar dados pessoais com base em legítimo interesse e finalidade contratual;</li>
            <li>Cumprir bem e fielmente as obrigações contratuais.</li>
          </ul>

          <h3>Cláusula Terceira: Do preço e das condições de pagamento</h3>
          <Textarea
            name="terceira_clausula"
            value={form.terceira_clausula}
            onChange={handleChange}
            className="w-full"
          />

          <h3>Cláusula Quarta: Do inadimplemento contratual</h3>
          <p>Em caso de inadimplemento por parte da CONTRATANTE, incidirá multa de 2%, juros de 1% ao mês e correção monetária.</p>
          <p>§1º. Cobrança judicial: acréscimo de 20% de honorários e custas processuais.</p>
          <p>§2º. Descumprimento contratual: multa de 10% do valor total.</p>

          <h3>Cláusula Quinta: Da rescisão contratual</h3>
          <p>Rescisão imotivada requer aviso prévio de 30 dias.</p>
          <p>§1º. Se a CONTRATANTE rescindir, o CONTRATADO retém 30% do valor.</p>
          <p>§2º. Se o CONTRATADO rescindir, devolução integral ao CONTRATANTE.</p>
          <p>§3º. Rescisão por violação contratual é imediata e pode gerar indenização.</p>
          <p>§4º. Tolerância não configura renúncia ou novação.</p>

          <h3>Cláusula Sexta: Autorização de uso de imagem</h3>
          <p>( ) AUTORIZO o uso de imagens e vídeos do serviço contratado...</p>
          <p>( ) NÃO AUTORIZO o uso de imagens e vídeos do serviço contratado...</p>

          <h3>Cláusula Sétima: Do foro competente</h3>
          <p>Para dirimir quaisquer controvérsias, as partes elegem o foro da Comarca de Indaiatuba.</p>

          <p>Firmam o presente instrumento, em duas vias de igual teor.</p>

          <div>
            <label className="block text-sm text-muted-foreground">Editar data do contrato</label>
            <Input
              name="data_contrato"
              type="date"
              value={form.data_contrato}
              onChange={handleChange}
              className="inline w-auto mt-1"
            />
          </div>
          <p className="mt-2">{formatBrDate(form.data_contrato)}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div>
              <p className="mt-8">______________________________________</p>
              <p>CONTRATANTE</p>
              <Input
                name="contratante_nome_assinatura"
                value={form.contratante_nome_assinatura}
                onChange={handleChange}
                className="mt-2 w-80"
              />
            </div>
            <div>
              <p className="mt-8">_________________________________</p>
              <p>CONTRATADO</p>
              <p>Recreart Indaiatuba</p>
            </div>
          </div>
        </div>
      </CardContent>
      <div className="px-6 pb-6">
        <Button onClick={gerarPDF}>Gerar PDF do contrato</Button>
      </div>
    </Card>
    </div>
  )
}