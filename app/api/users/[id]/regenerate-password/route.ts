import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Gerar nova senha numérica de 6 dígitos
    const newPassword = Math.floor(100000 + Math.random() * 900000).toString()
    const passwordHash = await bcrypt.hash(newPassword, 10)

    console.log('Regenerando senha para usuário:', id)
    console.log('Nova senha:', newPassword)
    console.log('Novo hash:', passwordHash)
    console.log('Hash length:', passwordHash.length)
    
    // Testar se o hash funciona imediatamente
    const testHash = await bcrypt.compare(newPassword, passwordHash)
    console.log('Teste do hash recém-criado:', testHash)

    const { data: updatedUser, error } = await supabase
      .from('system_users')
      .update({
        password_hash: passwordHash,
        password_plain: newPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, email, name, role, is_active, password_plain')
      .single()

    if (error) {
      console.error('Erro ao regenerar senha:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Senha regenerada com sucesso para:', updatedUser?.email)
    
    // Verificar se foi salvo corretamente
    const { data: verifyUser } = await supabase
      .from('system_users')
      .select('password_hash, password_plain')
      .eq('id', id)
      .single()
    
    console.log('Verificação pós-update:')
    console.log('Password_plain salvo:', verifyUser?.password_plain)
    console.log('Password_hash salvo:', verifyUser?.password_hash)
    
    // Testar hash salvo
    if (verifyUser?.password_hash) {
      const testSavedHash = await bcrypt.compare(newPassword, verifyUser.password_hash)
      console.log('Teste do hash salvo no banco:', testSavedHash)
    }

    return NextResponse.json({ 
      message: 'Senha regenerada com sucesso',
      newPassword: newPassword,
      user: updatedUser
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}