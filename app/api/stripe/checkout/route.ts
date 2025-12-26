import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
})

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId } = await request.json()

    if (!priceId || !userId) {
      return NextResponse.json({ error: 'Price ID e User ID são obrigatórios' }, { status: 400 })
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'disabled') {
      return NextResponse.json({ error: 'Stripe desabilitado. Use o plano gratuito para testar o sistema.' }, { status: 500 })
    }

    // Verificar se o preço existe, se não, criar
    let finalPriceId = priceId
    
    try {
      await stripe.prices.retrieve(priceId)
    } catch (error: Record<string, unknown>) {
      if (error.code === 'resource_missing') {
        console.log('Price not found, creating product and price...')
        
        // Criar produto
        const product = await stripe.products.create({
          name: 'Plano Completo - Agenda.me',
          description: 'Plano completo com todas as funcionalidades do sistema de agendamento',
        })
        
        // Criar preço
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 30000, // R$ 300.00 em centavos
          currency: 'brl',
          recurring: {
            interval: 'month',
          },
        })
        
        finalPriceId = price.id
        console.log('Created new price:', finalPriceId)
      } else {
        throw error
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/private/planos?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/private/planos?canceled=true`,
      metadata: {
        userId: userId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: Record<string, unknown>) {
    console.error('Stripe checkout error:', error)
    if (error.type === 'StripeAuthenticationError') {
      return NextResponse.json({ error: 'Chave do Stripe inválida. Verifique as configurações.' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Erro ao criar sessão de checkout' }, { status: 500 })
  }
}