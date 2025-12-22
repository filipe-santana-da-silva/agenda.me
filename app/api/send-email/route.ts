import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json()

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY não configurada' }, { status: 500 })
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Agenda <contato@filipedev.shop>',
        to: [to],
        subject,
        html
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('Email sent via Resend:', result.id)
      return NextResponse.json({ success: true, id: result.id })
    } else {
      const error = await response.json()
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message || 'Erro ao enviar email' }, { status: 500 })
    }
  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 })
  }
}