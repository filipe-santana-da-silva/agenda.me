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

    console.log('Tentativa de login:', email, password)

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

    console.log('Usuário encontrado:', systemUser.email)
    console.log('Senha fornecida:', password)
    console.log('Password_plain no banco:', systemUser.password_plain)
    console.log('Password_hash no banco:', systemUser.password_hash)

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, systemUser.password_hash)
    console.log('Senha válida?', isValidPassword)

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    // Atualizar password_plain se não existir ou estiver diferente
    if (!systemUser.password_plain || systemUser.password_plain !== password) {
      console.log('Atualizando password_plain para:', password)
      await supabase
        .from('system_users')
        .update({ password_plain: password })
        .eq('id', systemUser.id)
    }

    // Retornar dados do usuário (sem a senha)
    const userData = {
      id: systemUser.id,
      email: systemUser.email,
      name: systemUser.name,
      role: systemUser.role
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}