import { jsPDF } from "jspdf"

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

    // cria documento
    const doc = new jsPDF()

    // título
    doc.setFontSize(16)
    doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS", 105, 20, { align: "center" })

    doc.setFontSize(12)
    doc.text("CONTRATANTE:", 20, 40)
    doc.text(contratante_info || "", 20, 50)

    doc.text(
      "CONTRATADO: RECREART INDAIATUBA, inscrita no CNPJ nº 51.688.436/0001-56...",
      20,
      70,
      { maxWidth: 170 }
    )

    doc.setFontSize(14)
    doc.text("Cláusula Primeira: Objeto do contrato", 20, 90)
    doc.setFontSize(12)
    doc.text(primeira_clausula || "", 20, 100, { maxWidth: 170 })

    doc.setFontSize(14)
    doc.text("Cláusula Terceira: do preço e das condições de pagamento", 20, 120)
    doc.setFontSize(12)
    doc.text(terceira_clausula || "", 20, 130, { maxWidth: 170 })

    doc.setFontSize(12)
    doc.text("Data do contrato:", 20, 150)
    doc.text(formatBrDateForPdf(data_contrato), 20, 160)

    // assinaturas
    doc.text("______________________________________", 20, 200)
    doc.text("CONTRATANTE", 20, 210)
    doc.text(contratante_nome_assinatura || "", 20, 220)

    doc.text("______________________________________", 120, 200)
    doc.text("CONTRATADO", 120, 210)
    doc.text("Recreart Indaiatuba", 120, 220)

    // gera buffer
    const pdfBuffer = doc.output("arraybuffer")
    const outBuf = Buffer.from(pdfBuffer)

    return new Response(outBuf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Contrato_Recreart.pdf"',
        "Content-Length": String(outBuf.length),
      },
    })
  } catch (err) {
    console.error("Erro ao gerar PDF:", err)
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

function formatBrDateForPdf(iso?: string) {
  if (!iso) return "Indaiatuba, __ de ________ de ____"
  try {
    const d = new Date(iso)
    const formatted = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d)
    return `Indaiatuba, ${formatted}`
  } catch {
    return "Indaiatuba, __ de ________ de ____"
  }
}
