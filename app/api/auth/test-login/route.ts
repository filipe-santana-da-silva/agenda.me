import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar usuário na tabela system_users
    const { data: systemUser, error: userError } = await supabase
      .from('system_users')
      .select('id, email, name, password_hash, password_plain, role, is_active')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single()

    if (userError || !systemUser) {
      console.log('Usuário não encontrado:', email)
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    console.log('Testando login para:', email)
    console.log('Senha fornecida:', password)
    console.log('Senha no banco (plain):', systemUser.password_plain)
    console.log('Hash no banco:', systemUser.password_hash)

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, systemUser.password_hash)
    console.log('Senha válida?', isValidPassword)

    if (!isValidPassword) {
      return NextResponse.json({ 
        error: 'Credenciais inválidas',
        debug: {
          providedPassword: password,
          storedPlainPassword: systemUser.password_plain,
          hashMatch: isValidPassword
        }
      }, { status: 401 })
    }

    return NextResponse.json({ 
      message: 'Login válido',
      user: {
        id: systemUser.id,
        email: systemUser.email,
        name: systemUser.name,
        role: systemUser.role
      }
    })
  } catch (error) {
    console.error('Erro no teste de login:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}