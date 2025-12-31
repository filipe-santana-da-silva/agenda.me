/**
 * Exemplo de como usar Redis em APIs
 * Copie e adapte para suas rotas
 *
 * INSTRUÇÕES:
 * 1. Copie o código relevante para suas rotas API
 * 2. Substitua os imports pelos paths corretos do seu projeto
 * 3. Adapte os nomes de tabelas, campos e funções de cache
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  withCache,
  invalidateBarbershopsCache,
  CACHE_KEYS,
} from '@/lib/cache'

// TODO: Descomente e substitua pelo caminho correto da sua instância Supabase
// import { createClient } from '@/lib/supabase/server'
// Ou se usar supabase-js diretamente, use:
// import { createClient } from '@supabase/supabase-js'

// Para o exemplo funcionar, você precisa:
// 1. Importar o createClient correto para seu projeto
// 2. Adaptar os nomes de tabelas (ex: 'barbershops')
// 3. Adaptar os campos conforme seu schema

// ============================================
// GET - Com Cache (EXEMPLO)
// ============================================

export async function GET() {
  try {
    // Usar cache para buscar dados
    const barbershops = await withCache(
      CACHE_KEYS.BARBERSHOPS.key,
      async () => {
        // TODO: Descomente createClient e adapte para seu projeto
        // const supabase = await createClient()
        // Ou: const supabase = createClient(url, anonKey)
        
        // const { data, error } = await supabase
        //   .from('barbershops')
        //   .select('*')
        //   .order('created_at', { ascending: false })

        // if (error) throw error
        // return data || []

        // Retornar array vazio por enquanto:
        return []
      },
      CACHE_KEYS.BARBERSHOPS.ttl
    )

    // Retornar com headers de cache HTTP (cliente/CDN)
    const response = NextResponse.json(barbershops)

    // Headers para cache no cliente por 1 hora
    response.headers.set('Cache-Control', 'public, max-age=3600')

    return response
  } catch (error) {
    console.error('[API] Erro ao buscar barbearias:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar barbearias' },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Criar e Invalidar Cache (EXEMPLO)
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Descomente createClient e adapte para seu projeto
    // const supabase = await createClient()

    // Validação básica
    if (!body.name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    // TODO: Descomente e adapte para seu projeto
    // const { data, error } = await supabase
    //   .from('barbershops')
    //   .insert([body])
    //   .select()

    // if (error) throw error

    // ✨ IMPORTANTE: Invalidar cache após criar
    await invalidateBarbershopsCache()

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[API] Erro ao criar barbearia:', error)
    return NextResponse.json(
      { error: 'Erro ao criar barbearia' },
      { status: 500 }
    )
  }
}

// ============================================
// PUT - Atualizar e Invalidar Cache (EXEMPLO)
// ============================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    // TODO: Descomente createClient e adapte para seu projeto
    // const supabase = await createClient()

    // TODO: Descomente e adapte para seu projeto
    // const { data, error } = await supabase
    //   .from('barbershops')
    //   .update(body)
    //   .eq('id', id)
    //   .select()

    // if (error) throw error

    // ✨ IMPORTANTE: Invalidar cache após atualizar
    await invalidateBarbershopsCache()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Erro ao atualizar barbearia:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar barbearia' },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE - Deletar e Invalidar Cache (EXEMPLO)
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    // TODO: Descomente createClient e adapte para seu projeto
    // const supabase = await createClient()

    // TODO: Descomente e adapte para seu projeto
    // const { error } = await supabase
    //   .from('barbershops')
    //   .delete()
    //   .eq('id', id)

    // if (error) throw error

    // ✨ IMPORTANTE: Invalidar cache após deletar
    await invalidateBarbershopsCache()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Erro ao deletar barbearia:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar barbearia' },
      { status: 500 }
    )
  }
}
