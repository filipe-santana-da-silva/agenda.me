import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import bcrypt from 'bcryptjs'
import { withCache, invalidateMultipleCache, getCacheKey } from '@/lib/cache'

const USERS_CACHE_KEY = 'system_users:all'
const USERS_CACHE_TTL = 1800 // 30 minutos

export async function GET() {
  try {
    const users = await withCache(
      USERS_CACHE_KEY,
      async () => {
        const supabase = await createClient()

        // Temporariamente desabilitar RLS para debug
        const { data: users, error } = await supabase
          .from('system_users')
          .select('id, email, name, role, is_active, created_at, updated_at, password_plain')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erro ao buscar usuários:', error)
          throw error
        }

        console.log('Usuários encontrados:', users?.length)
        console.log('Dados dos usuários:', users?.map(u => ({ email: u.email, password_plain: u.password_plain })))

        return users || []
      },
      USERS_CACHE_TTL
    )

    const response = NextResponse.json(users)
    response.headers.set('Cache-Control', 'public, max-age=1800')
    return response
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { name, email, password, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    // Validar senha numérica de 6 dígitos
    if (!/^\d{6}$/.test(password)) {
      return NextResponse.json({ error: 'A senha deve conter exatamente 6 dígitos numéricos' }, { status: 400 })
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10)

    // Criar usuário (sem verificação de auth por enquanto)
    const { data: newUser, error } = await supabase
      .from('system_users')
      .insert({
        name,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        password_plain: password,
        role
      })
      .select('id, email, name, role, is_active, created_at')
      .single()

    if (error) {
      console.error('Erro ao criar usuário:', error)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Email já está em uso' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}